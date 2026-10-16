/**
 * wiring.ts — composition root for the auth controllers.
 *
 * Controllers never instantiate DAL/repo classes. Dependency assembly
 * (external services → domain services) is centralized here so routers stay
 * transport-only and the construction recipe lives in ONE place (previously
 * duplicated as `makeUserService()` in three routers). Data access is the
 * inherited `this.dal` inside the domain services — no pool plumbing.
 */

import { CasdoorService } from "../../../modules/auth/services/casdoor.service.js";
import { getUserService, UserService } from "../../../modules/auth/services/user.service.js";
import { AuthSessionService } from "../../../modules/auth/services/auth-session.service.js";
import { InvitationService } from "../../../modules/auth/services/invitation.service.js";
import { MfaService } from "../../../modules/auth/services/mfa.service.js";
import { WebauthnService } from "../../../modules/auth/services/webauthn.service.js";

export function makeUserService(): UserService {
  return getUserService();
}

export function makeAuthSessionService(): AuthSessionService {
  return new AuthSessionService(getUserService(), new CasdoorService());
}

export function makeInvitationService(): InvitationService {
  return new InvitationService(new CasdoorService());
}

export function makeMfaService(): MfaService {
  return new MfaService(new CasdoorService());
}

export function makeWebauthnService(): WebauthnService {
  return new WebauthnService(new CasdoorService());
}
