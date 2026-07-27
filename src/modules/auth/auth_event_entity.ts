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
  Key,
} from "@primebrick/dal-pg";

@Entity("auth_events")
export class AuthEventEntity {
  @Key()
  id: bigint;

  /** FK to user_profiles.uuid. NULL for failed login (no resolvable user). */
  @Column({ nullable: true })
  user_profile_uuid?: string;

  /** Username that was attempted (mainly for failed login). */
  @Column({ nullable: true })
  attempted_username?: string;

  /** Event type: "login" | "logout" | "mfa_verify" | "passkey_signin" | "login_failed". */
  @Column({ nullable: false })
  event_type: string;

  /** When the event occurred. */
  @Column({ nullable: false })
  event_at: Date;

  /** Client IP address. */
  @Column({ nullable: true })
  ip_address?: string;

  /** User-Agent header from the client. */
  @Column({ nullable: true })
  user_agent?: string;

  /** Whether the auth attempt succeeded. */
  @Column({ nullable: false })
  success: boolean;

  /** Reason for failure (NULL on success). */
  @Column({ nullable: true })
  failure_reason?: string;
}
