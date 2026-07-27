/**
 * DAL for `mfa_action_authorizations` — single-use action authorization tokens.
 *
 * Wraps the `Repository` from `@primebrick/dal-pg`. Uses parameterized filters
 * (no raw SQL strings). The actor for audit fields comes from `requireActor()`.
 */

import type { Pool } from "pg";
import { Repository, field, Filter } from "@primebrick/dal-pg";
import { requireActor } from "@primebrick/sdk";
import { MfaActionAuthorizationEntity } from "./mfa_action_authorization_entity.js";

export class MfaActionAuthorizationsDal {
  private repo: Repository;
  private pool: Pool;

  constructor(pool: Pool) {
    this.repo = new Repository(pool);
    this.pool = pool;
  }

  /**
   * Create a new action authorization record.
   * Called when the user completes step-up MFA verification.
   */
  async create(data: {
    jti: string;
    user_profile_id: bigint;
    action: string;
    target_resource: string;
    token_hash: string;
    expires_at: Date;
  }): Promise<void> {
    const actor = requireActor();
    await this.repo.add<MfaActionAuthorizationEntity>(
      MfaActionAuthorizationEntity,
      {
        jti: data.jti,
        user_profile_id: data.user_profile_id,
        action: data.action,
        target_resource: data.target_resource,
        token_hash: data.token_hash,
        expires_at: data.expires_at,
        created_by: actor,
        updated_by: actor,
      },
      { actor },
    );
  }

  /**
   * Find an action authorization by its JWT jti.
   * Returns null if not found.
   */
  async findByJti(jti: string): Promise<MfaActionAuthorizationEntity | null> {
    return this.repo.find<MfaActionAuthorizationEntity, MfaActionAuthorizationEntity>(
      MfaActionAuthorizationEntity,
      null,
      {
        filters: [
          Filter.fieldValue(field(MfaActionAuthorizationEntity, "jti" as any), "=", jti),
        ],
        throwIfNotFound: false,
      },
    );
  }

  /**
   * Mark an action authorization as used (consumed by the middleware).
   * Sets `used_at` to now(). This enforces single-use — replay attempts
   * will find `used_at !== null` and be rejected.
   */
  async markUsed(jti: string): Promise<void> {
    const actor = requireActor();
    await this.repo.update(
      MfaActionAuthorizationEntity,
      {
        jti,
        used_at: new Date(),
      },
      { actor, matchBy: "jti" },
    );
  }

  /**
   * Delete expired action authorization records.
   * Called periodically for cleanup (same pattern as sessionRelay cleanup).
   */
  async deleteExpired(): Promise<number> {
    const result = await this.pool.query(
      `DELETE FROM mfa_action_authorizations WHERE expires_at < now() - interval '1 hour'`,
    );
    return result.rowCount ?? 0;
  }
}
