/**
 * Auth event logger — inserts audit records into the `auth_events` table.
 *
 * Auth events are written exclusively by the internal auth flow:
 *   - SUCCESS events (login, mfa_verify, passkey_signin): `user_profile_uuid`
 *     is set to the authenticated user's UUID.
 *   - FAILED login: `user_profile_uuid` is NULL (no resolvable user), and
 *     `attempted_username` captures the username that was tried.
 *
 * Uses the standard DAL `Repository.add()` with `AuthEventEntity` — no raw SQL.
 * The `auth_events` table is non-auditable (it IS itself an audit log), so no
 * actor context is required and no `created_by`/`created_at` columns exist.
 */
import type { Pool } from "pg";
import { createRepository } from "../../db/repository-factory.js";
import { AuthEventEntity } from "./auth_event_entity.js";

/** Request context forwarded from the controller (IP + User-Agent). */
export interface AuthRequestContext {
  ip_address?: string;
  user_agent?: string;
}

/** Event types recorded in auth_events.event_type. */
export type AuthEventType =
  | "login"
  | "login_failed"
  | "mfa_verify"
  | "passkey_signin";

/** Parameters for inserting an auth event. */
export interface InsertAuthEventParams {
  pool: Pool;
  event_type: AuthEventType;
  success: boolean;
  /** User UUID — required for SUCCESS events, omitted for failed login. */
  user_profile_uuid?: string;
  /** Username attempted — mainly for failed login (no resolvable UUID). */
  attempted_username?: string;
  /** Reason for failure (NULL on success). */
  failure_reason?: string;
  /** Request context (IP + User-Agent) from the controller. */
  request_ctx?: AuthRequestContext;
}

/**
 * Insert an auth event record using the standard DAL repository.
 *
 * Non-blocking: errors are caught and logged, never thrown. Auth event
 * logging is best-effort — a failed insert must NOT break the auth flow.
 */
export async function insertAuthEvent(params: InsertAuthEventParams): Promise<void> {
  const {
    pool,
    event_type,
    success,
    user_profile_uuid,
    attempted_username,
    failure_reason,
    request_ctx,
  } = params;

  const repo = createRepository(pool);

  const record = {
    user_profile_uuid: user_profile_uuid ?? null,
    attempted_username: attempted_username ?? null,
    event_type,
    event_at: new Date(),
    ip_address: request_ctx?.ip_address ?? null,
    user_agent: request_ctx?.user_agent ?? null,
    success,
    failure_reason: failure_reason ?? null,
  };

  try {
    // auth_events is non-auditable → WriteOptions (no actor required).
    await repo.add(AuthEventEntity, record, {});
  } catch (err) {
    // Best-effort — never break the auth flow over an audit log failure.
    console.error("[auth-event-logger] Failed to insert auth event:", {
      event_type,
      success,
      user_profile_uuid,
      attempted_username,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
