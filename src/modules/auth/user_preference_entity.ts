/**
 * `user_preferences` — per-user key/value preference store (`public` schema).
 *
 * Why this table exists:
 *   - Users accumulate small, self-service UI/domain preferences that must
 *     survive sessions and devices: favorite pages (`favorite_pages`,
 *     `string[]` of FE routes), saved filters, preferred locale, …
 *   - A single generic KV row set keeps the surface adaptable — new
 *     preference families land as new `key` values, never as schema churn.
 *
 * Contract:
 *   - One row per (`user_uuid`, `key`) — composite unique enforces it;
 *     `value` is free-shape `jsonb` owned by the key's consumer contract.
 *   - `user_uuid` references `user_profiles.uuid` (the internal, IDP-agnostic
 *     user id surfaced as `req.user.id`) — no FK by convention (same as
 *     audit columns), the service layer guarantees it.
 *   - Self-service only: reads/writes are scoped to the caller's `user_uuid`
 *     (`AUTHENTICATED_USER`); there is no admin surface by design.
 *   - Hard delete — `Auditable` base gives audit columns but no soft-delete,
 *     so re-creating a deleted key never collides with the composite unique.
 */

import type { UUID } from "@primebrick/dal-pg";
import {
  Column,
  Entity,
  Key,
  Unique,
  EntityBase,
  Auditable,
} from "@primebrick/dal-pg";
import { Cached } from "@primebrick/sdk";

@Entity("user_preferences")
@Cached(300_000) // 5 min TTL — mutations write through the DAL cache
export class UserPreferenceEntity extends Auditable(EntityBase) {
  @Key()
  id: bigint;

  @Unique()
  uuid: UUID;

  /** Owner — `user_profiles.uuid` of the authenticated caller. */
  @Unique("user_preferences_user_key_uidx", 0)
  @Column({ nullable: false })
  user_uuid: UUID;

  /** Preference family key (e.g. `favorite_pages`) — snake_case, per-user. */
  @Unique("user_preferences_user_key_uidx", 1)
  @Column({ length: 128, nullable: false })
  key: string;

  /** Free-shape JSON owned by the key's consumer contract. */
  @Column({ nullable: false, pgType: "jsonb" })
  value: unknown;
}
