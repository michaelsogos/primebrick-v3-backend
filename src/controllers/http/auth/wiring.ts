/**
 * wiring.ts — composition root for the auth controllers.
 *
 * Controllers never instantiate DAL/repo classes. Dependency assembly
 * (pool → dal → external services → domain services) is centralized here so
 * routers stay transport-only and the construction recipe lives in ONE place
 * (previously duplicated as `makeUserService()` in three routers).
 */

import { getPool } from "../../../db/pool.js";
import { UserProfilesDal } from "../../../modules/auth/user-profiles-dal.js";
import { CasdoorService } from "../../../modules/auth/services/casdoor.service.js";
import { UserService } from "../../../modules/auth/services/user.service.js";
import { AuthSessionService } from "../../../modules/auth/services/auth-session.service.js";
import { InvitationService } from "../../../modules/auth/services/invitation.service.js";
import { MfaService } from "../../../modules/auth/services/mfa.service.js";
import { WebauthnService } from "../../../modules/auth/services/webauthn.service.js";

export function makeUserService(): UserService {
  const pool = getPool();
  return new UserService(pool, new UserProfilesDal(pool), new CasdoorService(pool));
}

export function makeAuthSessionService(): AuthSessionService {
  const pool = getPool();
  return new AuthSessionService(pool, new UserProfilesDal(pool), new CasdoorService(pool));
}

export function makeInvitationService(): InvitationService {
  const pool = getPool();
  return new InvitationService(pool, new CasdoorService(pool));
}

export function makeMfaService(): MfaService {
  const pool = getPool();
  return new MfaService(pool, new CasdoorService(pool));
}

export function makeWebauthnService(): WebauthnService {
  const pool = getPool();
  return new WebauthnService(pool, new CasdoorService(pool));
}
