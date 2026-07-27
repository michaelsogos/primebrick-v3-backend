/**
 * DAL for `user_invitations` — invitation tokens for the user onboarding flow.
 *
 * Wraps the `Repository` from `@primebrick/dal-pg`. Uses parameterized filters
 * (no raw SQL strings). The actor for audit fields comes from `requireActor()`.
 */

import type { Pool } from "pg";
import { Repository, field, Filter } from "@primebrick/dal-pg";
import { requireActor } from "@primebrick/sdk";
import { UserInvitationEntity, type InvitationStatus } from "./user_invitation_entity.js";

export class UserInvitationsDal {
  private repo: Repository;

  constructor(pool: Pool) {
    this.repo = new Repository(pool);
  }

  /**
   * Insert a new invitation row.
   * The token_hash is already SHA-256 hashed by the caller — the raw token
   * is NEVER stored in the DB.
   */
  async create(data: {
    user_profile_id: bigint;
    token_hash: string;
    email: string;
    expires_at: Date;
  }): Promise<string> {
    const actor = requireActor();
    const row = await this.repo.add<UserInvitationEntity>(
      UserInvitationEntity,
      {
        user_profile_id: data.user_profile_id,
        token_hash: data.token_hash,
        status: "PENDING" as InvitationStatus,
        email: data.email,
        expires_at: data.expires_at,
        otp_attempts: 0,
        created_by: actor,
        updated_by: actor,
      },
      { actor },
    );
    return row.uuid;
  }

  /**
   * Find an invitation by its token hash.
   * Returns null if not found.
   */
  async findByTokenHash(tokenHash: string): Promise<UserInvitationEntity | null> {
    return this.repo.find<UserInvitationEntity, UserInvitationEntity>(
      UserInvitationEntity,
      null,
      {
        filters: [
          Filter.fieldValue(field(UserInvitationEntity, "token_hash" as any), "=", tokenHash),
        ],
        throwIfNotFound: false,
      },
    );
  }

  /**
   * Find an invitation by UUID.
   * Returns null if not found.
   */
  async findByUuid(uuid: string): Promise<UserInvitationEntity | null> {
    return this.repo.find<UserInvitationEntity, UserInvitationEntity>(
      UserInvitationEntity,
      null,
      {
        filters: [
          Filter.fieldValue(field(UserInvitationEntity, "uuid" as any), "=", uuid),
        ],
        throwIfNotFound: false,
      },
    );
  }

  /**
   * Find all invitations for a user profile (by user_profile_id).
   * Ordered by created_at descending (most recent first).
   */
  async findByUserProfileId(userProfileId: bigint): Promise<UserInvitationEntity[]> {
    const rows = await this.repo.findAll<UserInvitationEntity, UserInvitationEntity>(
      UserInvitationEntity,
      null,
      {
        filters: [
          Filter.fieldValue(field(UserInvitationEntity, "user_profile_id" as any), "=", userProfileId),
        ],
      },
    );
    return rows as UserInvitationEntity[];
  }

  /**
   * Update the status of an invitation.
   * Also updates the updated_at/updated_by audit fields.
   */
  async updateStatus(uuid: string, status: InvitationStatus, extra?: {
    completed_at?: Date;
    otp_hash?: string;
    otp_expires_at?: Date;
    otp_attempts?: number;
    otp_verified_at?: Date;
  }): Promise<void> {
    const actor = requireActor();
    await this.repo.update(
      UserInvitationEntity,
      {
        uuid,
        status,
        ...extra,
        updated_by: actor,
      },
      { actor },
    );
  }

  /**
   * Increment the OTP attempt counter.
   * Used when an OTP verification fails — the caller checks the count
   * to decide if max attempts has been reached.
   */
  async incrementOtpAttempts(uuid: string): Promise<void> {
    const actor = requireActor();
    const existing = await this.findByUuid(uuid);
    if (!existing) return;
    await this.repo.update(
      UserInvitationEntity,
      {
        uuid,
        otp_attempts: existing.otp_attempts + 1,
        updated_by: actor,
      },
      { actor },
    );
  }

  /**
   * Set the OTP hash and expiry (when sending a new OTP).
   * Resets the attempt counter to 0.
   */
  async setOtp(uuid: string, otpHash: string, otpExpiresAt: Date): Promise<void> {
    const actor = requireActor();
    await this.repo.update(
      UserInvitationEntity,
      {
        uuid,
        otp_hash: otpHash,
        otp_expires_at: otpExpiresAt,
        otp_attempts: 0,
        status: "OTP_SENT" as InvitationStatus,
        updated_by: actor,
      },
      { actor },
    );
  }

  /**
   * Mark the OTP as verified (sets otp_verified_at).
   */
  async markOtpVerified(uuid: string): Promise<void> {
    const actor = requireActor();
    await this.repo.update(
      UserInvitationEntity,
      {
        uuid,
        otp_verified_at: new Date(),
        updated_by: actor,
      },
      { actor },
    );
  }

  /**
   * Mark the invitation as completed (sets completed_at + status).
   */
  async markCompleted(uuid: string): Promise<void> {
    const actor = requireActor();
    await this.repo.update(
      UserInvitationEntity,
      {
        uuid,
        status: "COMPLETED" as InvitationStatus,
        completed_at: new Date(),
        updated_by: actor,
      },
      { actor },
    );
  }
}
