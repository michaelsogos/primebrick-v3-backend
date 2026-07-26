/**
 * DAL for `user_mfa_factors` — MFA factors tracked in PG.
 *
 * Wraps the `Repository` from `@primebrick/dal-pg`. Uses parameterized filters
 * (no raw SQL strings). The actor for audit fields comes from `requireActor()`.
 */

import type { Pool } from "pg";
import { Repository, field, Filter } from "@primebrick/dal-pg";
import { requireActor } from "@primebrick/sdk";
import { UserMfaFactorEntity, MfaFactorType } from "./user_mfa_factor_entity.js";

export class UserMfaFactorsDal {
  private repo: Repository;
  private pool: Pool;

  constructor(pool: Pool) {
    this.repo = new Repository(pool);
    this.pool = pool;
  }

  /**
   * Insert a new MFA factor row after successful enrollment.
   */
  async create(data: {
    user_profile_id: bigint;
    factor_type: MfaFactorType;
    casdoor_mfa_type?: string;
    totp_secret_encrypted: string;
    label?: string;
    is_enabled: boolean;
    is_preferred: boolean;
  }): Promise<string> {
    const actor = requireActor();
    const row = await this.repo.add<UserMfaFactorEntity>(
      UserMfaFactorEntity,
      {
        user_profile_id: data.user_profile_id,
        factor_type: data.factor_type,
        casdoor_mfa_type: data.casdoor_mfa_type,
        totp_secret_encrypted: data.totp_secret_encrypted,
        label: data.label,
        is_enabled: data.is_enabled,
        is_preferred: data.is_preferred,
        created_by: actor,
        updated_by: actor,
      },
      { actor },
    );
    return row.uuid;
  }

  /**
   * Find a factor by UUID.
   * Returns null if not found.
   */
  async findByUuid(uuid: string): Promise<UserMfaFactorEntity | null> {
    return this.repo.find<UserMfaFactorEntity, UserMfaFactorEntity>(
      UserMfaFactorEntity,
      null,
      {
        filters: [
          Filter.fieldValue(field(UserMfaFactorEntity, "uuid" as any), "=", uuid),
        ],
        throwIfNotFound: false,
      },
    );
  }

  /**
   * Find all factors for a user profile (by user_profile_id).
   */
  async findByUserProfileId(userProfileId: bigint): Promise<UserMfaFactorEntity[]> {
    const rows = await this.repo.findAll<UserMfaFactorEntity, UserMfaFactorEntity>(
      UserMfaFactorEntity,
      null,
      {
        filters: [
          Filter.fieldValue(field(UserMfaFactorEntity, "user_profile_id" as any), "=", userProfileId),
        ],
      },
    );
    return rows as UserMfaFactorEntity[];
  }

  /**
   * Find enabled factors for a user profile (by user_profile_id).
   * Used by login MFA and step-up MFA to determine available challenges.
   */
  async findEnabledByUserProfileId(userProfileId: bigint): Promise<UserMfaFactorEntity[]> {
    const rows = await this.repo.findAll<UserMfaFactorEntity, UserMfaFactorEntity>(
      UserMfaFactorEntity,
      null,
      {
        filters: [
          Filter.fieldValue(field(UserMfaFactorEntity, "user_profile_id" as any), "=", userProfileId),
          Filter.fieldValue(field(UserMfaFactorEntity, "is_enabled" as any), "=", true),
        ],
      },
    );
    return rows as UserMfaFactorEntity[];
  }

  /**
   * Count enabled factors for a user profile.
   * Used by the has_mfa flag in GET /api/v1/auth/me.
   */
  async countEnabledByUserProfileId(userProfileId: bigint): Promise<number> {
    const rows = await this.findEnabledByUserProfileId(userProfileId);
    return rows.length;
  }

  /**
   * Update a factor (e.g. set last_used_at, is_preferred, is_enabled).
   */
  async update(uuid: string, data: Partial<Pick<UserMfaFactorEntity, "label" | "is_enabled" | "is_preferred" | "last_used_at">>): Promise<void> {
    const actor = requireActor();
    await this.repo.update(
      UserMfaFactorEntity,
      {
        uuid,
        ...data,
      },
      { actor, matchBy: "uuid" },
    );
  }

  /**
   * Clear the preferred flag for all factors of a user.
   * Used before setting a new preferred factor.
   */
  async clearPreferredForUser(userProfileId: bigint): Promise<void> {
    const factors = await this.findByUserProfileId(userProfileId);
    const actor = requireActor();
    for (const f of factors) {
      if (f.is_preferred) {
        await this.repo.update(
          UserMfaFactorEntity,
          {
            uuid: f.uuid,
            is_preferred: false,
          },
          { actor, matchBy: "uuid" },
        );
      }
    }
  }

  /**
   * Delete a factor by UUID.
   * Uses hardDelete (physical DELETE) because user_mfa_factors has no soft-delete
   * column (no @DeletableField). MFA factors are removed completely when deleted.
   */
  async deleteByUuid(uuid: string): Promise<void> {
    const existing = await this.findByUuid(uuid);
    if (existing) {
      await this.repo.hardDelete(UserMfaFactorEntity, { id: existing.id }, { actor: requireActor() });
    }
  }
}
