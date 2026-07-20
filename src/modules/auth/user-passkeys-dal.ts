/**
 * DAL for `user_passkeys` — passkey credentials tracked in PG.
 *
 * Wraps the `Repository` from `@primebrick/dal-pg`. Uses parameterized filters
 * (no raw SQL strings). The actor for audit fields comes from `requireActor()`.
 */

import type { Pool } from "pg";
import { Repository, field, Filter } from "@primebrick/dal-pg";
import { requireActor } from "@primebrick/sdk";
import { UserPasskeyEntity } from "./user_passkey_entity.js";

export class UserPasskeysDal {
  private repo: Repository;
  private pool: Pool;

  constructor(pool: Pool) {
    this.repo = new Repository(pool);
    this.pool = pool;
  }

  /**
   * Insert a new passkey row after successful WebAuthn enrollment.
   */
  async create(data: {
    user_profile_id: bigint;
    credential_id: string;
    aaguid?: string;
    transports?: string[];
    label?: string;
  }): Promise<string> {
    const actor = requireActor();
    const row = await this.repo.add<UserPasskeyEntity>(
      UserPasskeyEntity,
      {
        user_profile_id: data.user_profile_id,
        credential_id: data.credential_id,
        aaguid: data.aaguid,
        transports: data.transports,
        label: data.label,
        created_by: actor,
        updated_by: actor,
      },
      { actor },
    );
    return row.uuid;
  }

  /**
   * Find a passkey by its credential ID.
   * Returns null if not found.
   */
  async findByCredentialId(credentialId: string): Promise<UserPasskeyEntity | null> {
    return this.repo.find<UserPasskeyEntity, UserPasskeyEntity>(
      UserPasskeyEntity,
      null,
      {
        filters: [
          Filter.fieldValue(field(UserPasskeyEntity, "credential_id" as any), "=", credentialId),
        ],
        throwIfNotFound: false,
      },
    );
  }

  /**
   * Find all passkeys for a user profile (by user_profile_id).
   */
  async findByUserProfileId(userProfileId: bigint): Promise<UserPasskeyEntity[]> {
    const rows = await this.repo.findAll<UserPasskeyEntity, UserPasskeyEntity>(
      UserPasskeyEntity,
      null,
      {
        filters: [
          Filter.fieldValue(field(UserPasskeyEntity, "user_profile_id" as any), "=", userProfileId),
        ],
      },
    );
    return rows as UserPasskeyEntity[];
  }

  /**
   * Find passkeys by user profile UUID.
   * Uses a raw SQL query to join user_passkeys with user_profiles on
   * user_profile_id = user_profiles.id WHERE user_profiles.uuid = $1.
   */
  async findByUserProfileUuid(userProfileUuid: string): Promise<UserPasskeyEntity[]> {
    const result = await this.pool.query(
      `SELECT up.* FROM user_passkeys up
       INNER JOIN user_profiles upl ON up.user_profile_id = upl.id
       WHERE upl.uuid = $1 AND upl.deleted_at IS NULL`,
      [userProfileUuid],
    );
    return result.rows as UserPasskeyEntity[];
  }

  /**
   * Count passkeys for a user profile.
   * Used by the passkey prompt logic (has_passkey = count > 0).
   */
  async countByUserProfileId(userProfileId: bigint): Promise<number> {
    const rows = await this.findByUserProfileId(userProfileId);
    return rows.length;
  }

  /**
   * Delete a passkey by UUID.
   * The user_passkeys table has no soft-delete columns, so this physically
   * removes the row.
   */
  async deleteByUuid(uuid: string): Promise<void> {
    const existing = await this.repo.find<UserPasskeyEntity, UserPasskeyEntity>(
      UserPasskeyEntity,
      null,
      {
        filters: [
          Filter.fieldValue(field(UserPasskeyEntity, "uuid" as any), "=", uuid),
        ],
        throwIfNotFound: false,
      },
    );
    if (existing) {
      await this.repo.delete(UserPasskeyEntity, { id: existing.id }, { actor: requireActor() });
    }
  }

  /**
   * Delete a passkey by credential ID.
   * Used when the WebAuthn credential is deleted from Casdoor.
   */
  async deleteByCredentialId(credentialId: string): Promise<void> {
    const existing = await this.findByCredentialId(credentialId);
    if (existing) {
      await this.repo.delete(UserPasskeyEntity, { id: existing.id }, { actor: requireActor() });
    }
  }

  /**
   * Update the label of a passkey.
   */
  async updateLabel(uuid: string, label: string): Promise<void> {
    const actor = requireActor();
    await this.repo.update(
      UserPasskeyEntity,
      {
        uuid,
        label,
        updated_by: actor,
      },
      { actor },
    );
  }
}
