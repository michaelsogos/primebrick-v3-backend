/**
 * `auth_events` — audit log of authentication events.
 *
 * Records login, logout, mfa_verify, passkey_signin, and login_failed events.
 * Written exclusively by the internal auth flow:
 *   - SUCCESS events: written with `requireActor(userUuid)` (created_by = user UUID)
 *   - FAILED login: written with `runAsSystem()` (no user UUID available)
 *
 * This entity is NOT auditable (it IS itself an audit log). It has no
 * `deleted_at`/`deleted_by`/`version` columns — records are immutable.
 *
 * Exposed via MCP as an entity with `supported_operations: ["list", "aggregate"]`.
 * No create/update/delete/restore via MCP — events are written only by the
 * internal auth flow.
 */
import {
  Column,
  Entity,
  PublicEntity,
  Index,
  Key,
  Unique,
  type UUID,
} from "@primebrick/dal-pg";

@PublicEntity("auth_events")
// "latest auth events of X" — filter key + event_at DESC on each surface.
@Index({ name: "auth_events_user_profile_uuid_event_at_idx", columns: ["user_profile_uuid", { name: "event_at", sort: "desc" }] })
@Index({ name: "auth_events_event_type_event_at_idx", columns: ["event_type", { name: "event_at", sort: "desc" }] })
@Index({ name: "auth_events_attempted_username_event_at_idx", columns: ["attempted_username", { name: "event_at", sort: "desc" }] })
export class AuthEventEntity {
  @Key()
  @Column({ pgType: "uuid" })
  uuid!: UUID;

  /** FK to user_profiles.uuid. NULL for failed login (no resolvable user). */
  @Column({ pgType: "uuid", nullable: true })
  user_profile_uuid?: UUID;

  /** Username that was attempted (mainly for failed login). */
  @Column({ nullable: true })
  attempted_username?: string;

  /** Event type: "login" | "logout" | "mfa_verify" | "passkey_signin" | "login_failed". */
  @Column({ nullable: false })
  event_type: string;

  /** When the event occurred. */
  @Column({ nullable: false, jsType: "instant", defaultSql: "clock_timestamp()" })
  event_at: Date;

  /** Client IP address. */
  @Column({ pgType: "inet", nullable: true })
  ip_address?: string;

  /** User-Agent header from the client. */
  @Column({ nullable: true })
  user_agent?: string;

  /** Whether the auth attempt succeeded. */
  @Column({ pgType: "boolean", nullable: false })
  success: boolean;

  /** Reason for failure (NULL on success). */
  @Column({ nullable: true })
  failure_reason?: string;
}
