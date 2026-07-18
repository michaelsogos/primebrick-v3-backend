/**
 * WebauthnService — business logic for WebAuthn / passkey authentication.
 *
 * Owns:
 *   - Casdoor WebAuthn endpoint proxying (signin + signup begin/finish)
 *   - Casdoor session-cookie relay between begin → finish (Casdoor stores the
 *     WebAuthn challenge server-side, so the BE must replay the session cookie
 *     it received on the `begin` call when calling `finish`)
 *   - OAuth authorization-code exchange after a successful passkey signin
 *     (Casdoor's `signin/finish` returns a code when called with
 *     `responseType=code&clientId=...`; the BE exchanges it for tokens, exactly
 *     like a standard OAuth code flow)
 *   - Passkey list / delete (via Casdoor's user API)
 *
 * The service is request-context-free. It returns plain result objects; the
 * controller is responsible for setting cookies on `res` and shaping the JSON
 * response. Errors are thrown as `ApiError` subclasses.
 *
 * Cookie policy:
 *   The service returns the raw tokens (`access_token`, `refresh_token`,
 *   `expires_in`) in the result. The controller's `setAuthCookies` helper
 *   writes them as httpOnly cookies. This keeps `res` out of the service.
 *
 * Session relay:
 *   Casdoor's WebAuthn begin/finish endpoints store the ceremony challenge in
 *   the Beego server-side session, keyed by a session cookie. The BE captures
 *   the `Set-Cookie` header from the `begin` response, stashes it in an
 *   in-memory map keyed by a random nonce, and replays it as the `Cookie`
 *   header on the `finish` call. The nonce is returned to the FE, which sends
 *   it back on `finish`. Entries expire after 5 minutes.
 *
 *   NOTE: This in-memory map is single-instance only. For multi-instance BE
 *   deployments, replace it with a shared store (Redis). Flagged in the plan.
 */

import type { Pool } from "pg";
import type { Response } from "express";
import { randomUUID } from "crypto";
import { request as httpRequest } from "http";
import { request as httpsRequest } from "https";

import { getAuthConfig } from "../config.js";
import { CasdoorService } from "./casdoor.service.js";
import { InvitationService } from "./invitation.service.js";
import { UserPasskeysDal } from "../user-passkeys-dal.js";
import { UserProfilesDal } from "../user-profiles-dal.js";
import { sendEmail } from "./email-sender.js";
import { requireActor } from "@primebrick/sdk";
import {
  setAuthCookies,
  buildUserFromClaims,
  type TokenSet,
} from "./auth-session.service.js";
import {
  ApiError,
  UnauthorizedError,
  NotFoundError,
} from "../../../http/api-errors.js";

// --- fetchWithHost --------------------------------------------------------
/**
 * fetch-like wrapper that uses Node's `http.request` / `https.request` so we
 * can set the `Host` header explicitly (undici's `fetch` silently drops it).
 *
 * Casdoor derives the WebAuthn RPOrigin from the request's `Host` header when
 * `origin` is empty in `app.conf`. The BE must send `Host: <browser-host>`
 * so Casdoor computes an RPOrigin that matches the browser's origin.
 */
interface FetchLikeResponse {
  ok: boolean;
  status: number;
  text(): Promise<string>;
  json(): Promise<unknown>;
  headers: { get(name: string): string | null };
}

function fetchWithHost(
  url: string,
  init: { method?: string; headers?: Record<string, string>; body?: string } & { hostOverride: string },
): Promise<FetchLikeResponse> {
  // eslint-disable-next-line no-console
  console.log(`[fetchWithHost] url=${url} hostOverride=${init.hostOverride}`);
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const isTls = parsed.protocol === "https:";
    const lib = isTls ? httpsRequest : httpRequest;
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (isTls ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: init.method || "GET",
      headers: { ...init.headers, Host: init.hostOverride },
    };
    const req = lib(options, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => {
        const body = Buffer.concat(chunks).toString("utf-8");
        const headers = res.headers as Record<string, string | string[] | undefined>;
        resolve({
          ok: res.statusCode! >= 200 && res.statusCode! < 300,
          status: res.statusCode!,
          text: async () => body,
          json: async () => JSON.parse(body),
          headers: {
            get(name: string): string | null {
              const val = headers[name.toLowerCase()];
              return Array.isArray(val) ? val.join(", ") : (val ?? null);
            },
          },
        });
      });
    });
    req.on("error", reject);
    if (init.body) req.write(init.body);
    req.end();
  });
}

// --- Result types ---------------------------------------------------------

export interface WebauthnBeginResult {
  nonce: string;
  options: unknown;
}

export interface WebauthnSigninFinishResult {
  success: true;
  user: ReturnType<typeof buildUserFromClaims>;
}

export interface WebauthnCredentialInfo {
  id: string;
  aaguid?: string;
  transports?: string[];
  created_at?: string;
  label?: string | null;
}

// --- Session relay (in-memory, single-instance) ---------------------------

interface RelayEntry {
  cookie: string;
  expires_at: number;
}

const SESSION_RELAY_TTL_MS = 5 * 60 * 1000; // 5 minutes
const sessionRelay = new Map<string, RelayEntry>();

function stashCasdoorSession(cookie: string): string {
  const nonce = randomUUID();
  sessionRelay.set(nonce, { cookie, expires_at: Date.now() + SESSION_RELAY_TTL_MS });
  return nonce;
}

function popCasdoorSession(nonce: string): string | null {
  const entry = sessionRelay.get(nonce);
  if (!entry) return null;
  sessionRelay.delete(nonce);
  if (Date.now() > entry.expires_at) return null;
  return entry.cookie;
}

// Periodic cleanup of expired entries (every 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of sessionRelay) {
    if (now > entry.expires_at) sessionRelay.delete(key);
  }
}, 10 * 60 * 1000).unref();

// --- Service --------------------------------------------------------------

export class WebauthnService {
  constructor(
    private pool: Pool,
    private casdoor: CasdoorService,
  ) {}

  // --- Signin --------------------------------------------------------------

  /**
   * Begin a WebAuthn signin ceremony. If `username` is omitted/empty, Casdoor
   * performs a discoverable login (passkey-only — no username needed).
   *
   * The BE forwards the browser's `origin` so Casdoor computes the correct
   * `rpId` (WebAuthn Relying Party ID must match the FE origin).
   */
  async signinBegin(
    username: string | undefined,
    origin: string,
  ): Promise<WebauthnBeginResult> {
    const cfg = await this.requireWebauthnEnabled();
    const params = new URLSearchParams();
    params.set("owner", cfg.casdoor_organization!);
    if (username) params.set("name", username);

    const url = `${cfg.casdoor_endpoint}/api/webauthn/signin/begin?${params}`;
    // Send the browser's Host header so Casdoor derives the correct WebAuthn
    // RPOrigin from the request Host (Casdoor's `origin` config is empty —
    // it derives RP origin from the Host header per-request).
    const browserHost = new URL(origin).host;
    const response = await fetchWithHost(url, {
      method: "GET",
      headers: { Origin: origin, Accept: "application/json" },
      hostOverride: browserHost,
    });

    if (!response.ok) {
      throw this.casdoorWebauthnError(
        await response.text(),
        response.status,
        "/api/v1/auth/webauthn/signin/begin",
      );
    }

    const cookie = response.headers.get("set-cookie") ?? "";
    const options = await response.json();
    const nonce = stashCasdoorSession(cookie);
    return { nonce, options };
  }

  /**
   * Finish a WebAuthn signin ceremony. Replays the Casdoor session cookie
   * captured during `signinBegin`, then exchanges the returned OAuth code for
   * tokens. Sets httpOnly cookies via the controller helper.
   *
   * `credential` is the serialized `PublicKeyCredential` from
   * `navigator.credentials.get()`, as JSON (base64url-encoded fields).
   */
  async signinFinish(
    nonce: string,
    credential: unknown,
    origin: string,
    res: Response,
  ): Promise<WebauthnSigninFinishResult> {
    const cfg = await this.requireWebauthnEnabled();
    const cookie = popCasdoorSession(nonce);
    if (!cookie) {
      throw new UnauthorizedError("WebAuthn session expired or not found", {
        internal_code: "webauthn_session_expired",
      });
    }

    const params = new URLSearchParams({
      responseType: "code",
      clientId: cfg.oidc.client_id!,
      redirectUri: `${origin}/callback`,
    });
    const url = `${cfg.casdoor_endpoint}/api/webauthn/signin/finish?${params}`;
    const browserHost = new URL(origin).host;
    const response = await fetchWithHost(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
        Origin: origin,
        Accept: "application/json",
      },
      body: JSON.stringify(credential),
      hostOverride: browserHost,
    });

    if (!response.ok) {
      throw this.casdoorWebauthnError(
        await response.text(),
        response.status,
        "/api/v1/auth/webauthn/signin/finish",
      );
    }

    const data = (await response.json()) as {
      status: string;
      data?: string | { required?: boolean };
      msg?: string;
    };

    // Casdoor returns {status:"error", msg:"..."} on failure even with HTTP 200
    if (data.status !== "ok") {
      throw new UnauthorizedError(data.msg || "WebAuthn signin failed", {
        internal_code: "webauthn_ceremony_failed",
      });
    }

    // Consent-required case: Casdoor returns {data:{required:true}} instead of
    // a code. This happens when the application requires consent and the user
    // hasn't granted it. For passkey signin (no browser redirect), we treat
    // this as an error — the FE should fall back to password login.
    if (typeof data.data === "object" && data.data?.required) {
      throw new ApiError(
        "/errors/webauthn-consent-required",
        "WebAuthn signin requires consent",
        403,
        "This application requires explicit consent. Please sign in with password first.",
        {
          internal_code: "webauthn_consent_required",
          severity: "MEDIUM",
        },
      );
    }

    const code = data.data as string;
    if (!code || typeof code !== "string") {
      throw new ApiError(
        "/errors/webauthn-no-code",
        "WebAuthn signin succeeded but no authorization code was returned",
        502,
        "Casdoor did not return an authorization code after WebAuthn signin",
        {
          internal_code: "webauthn_no_code",
          severity: "HIGH",
        },
      );
    }

    // Exchange the code for tokens (authorization_code grant).
    // The code was generated by Casdoor during signin/finish, where we sent
    // `Host: localhost:5173` so the WebAuthn RPOrigin matches the browser.
    // Casdoor's generateJwtToken uses the same Host to derive the JWT `iss`,
    // so the access_token will have `iss = http://localhost:5173` — which
    // doesn't match the BE's configured `oidc_issuer_url` (http://localhost:8000).
    //
    // Fix: after exchanging the code, immediately refresh the token using the
    // standard token endpoint (default Host: localhost:8000). Casdoor's
    // RefreshToken calls generateJwtToken with the refresh request's Host,
    // producing a new JWT with the correct `iss`.
    let tokens = await this.exchangeCode(code, cfg, `${origin}/callback`);
    let claims = this.decodeJwtPayload(tokens.access_token);
    const expectedIssuer = cfg.oidc.issuer_url;
    if (expectedIssuer && (claims as any).iss && (claims as any).iss !== expectedIssuer) {
      if (!tokens.refresh_token) {
        throw new ApiError(
          "/errors/webauthn-issuer-mismatch",
          "WebAuthn token issuer mismatch",
          502,
          `JWT issuer "${(claims as any).iss}" != expected "${expectedIssuer}" and no refresh_token to re-issue`,
          { internal_code: "webauthn_issuer_mismatch", severity: "HIGH" },
        );
      }
      tokens = await this.refreshToken(tokens.refresh_token, cfg);
      claims = this.decodeJwtPayload(tokens.access_token);
    }

    // Same guards as password login: email-verified check + roles check
    if (cfg.enable_email_verification_check && (claims as any).emailVerified === false) {
      throw new UnauthorizedError("The user email isn't verified yet", {
        internal_code: "email_not_verified",
      });
    }
    const roles = this.extractRoles(claims);
    if (!roles || roles.length === 0) {
      throw new ApiError(
        "/errors/forbidden",
        "User doesn't have permission",
        403,
        "User doesn't have permission",
        { internal_code: "user_no_permission", severity: "HIGH" },
      );
    }

    setAuthCookies(res, tokens);

    // Best-effort: sync passkeys from Casdoor to PG so has_passkey is correct.
    // Non-blocking — if this fails, the signin still succeeded.
    const casdoorUserId = (claims as any).Id || (claims as any).sub;
    if (casdoorUserId) {
      this.syncPasskeys(casdoorUserId, undefined, undefined).catch((err) => {
        console.error("[webauthn] Post-signin passkey sync failed (non-critical):", err);
      });
    }

    return { success: true, user: buildUserFromClaims(claims) };
  }

  // --- Signup (enrollment) -------------------------------------------------

  /**
   * Begin a WebAuthn signup (passkey enrollment) ceremony. The user must be
   * authenticated — Casdoor's `getCurrentUser()` reads from the Beego session.
   *
   * The BE forwards the user's Casdoor `access_token` as a cookie so Casdoor's
   * `ApiFilter` can resolve `getCurrentUser()` via the session. If Casdoor
   * requires a full Beego session (not just an access token), this will fail
   * and the spike (step 0) will need to establish one.
   */
  async signupBegin(
    accessToken: string,
    origin: string,
  ): Promise<WebauthnBeginResult> {
    const cfg = await this.requireWebauthnEnabled();
    const url = `${cfg.casdoor_endpoint}/api/webauthn/signup/begin`;
    // Send the browser's Host header so Casdoor derives the correct WebAuthn
    // RPOrigin from the request Host (Casdoor's `origin` config is empty —
    // it derives RP origin from the Host header per-request).
    const browserHost = new URL(origin).host;
    const response = await fetchWithHost(url, {
      method: "GET",
      headers: {
        Origin: origin,
        Accept: "application/json",
        // Forward the access token so Casdoor's getCurrentUser() can resolve
        // the user. Casdoor's ApiFilter checks the session first, then falls
        // back to clientId/secret — the access token alone may not establish
        // a full session. This is the main risk flagged in the plan (step 0).
        Authorization: `Bearer ${accessToken}`,
      },
      hostOverride: browserHost,
    });

    if (!response.ok) {
      throw this.casdoorWebauthnError(
        await response.text(),
        response.status,
        "/api/v1/auth/webauthn/signup/begin",
      );
    }

    const cookie = response.headers.get("set-cookie") ?? "";
    const options = await response.json();
    const nonce = stashCasdoorSession(cookie);
    return { nonce, options };
  }

  /**
   * Finish a WebAuthn signup (passkey enrollment) ceremony. Replays the Casdoor
   * session cookie and forwards the access token.
   */
  async signupFinish(
    nonce: string,
    credential: unknown,
    accessToken: string,
    origin: string,
  ): Promise<{ success: true }> {
    const cfg = await this.requireWebauthnEnabled();
    const cookie = popCasdoorSession(nonce);
    if (!cookie) {
      throw new UnauthorizedError("WebAuthn session expired or not found", {
        internal_code: "webauthn_session_expired",
      });
    }

    const url = `${cfg.casdoor_endpoint}/api/webauthn/signup/finish`;
    // Send the browser's Host header so Casdoor derives the correct WebAuthn
    // RPOrigin from the request Host (matches the browser origin in the
    // attestation). Casdoor's `origin` config is empty — it derives RP origin
    // from the Host header per-request.
    const browserHost = new URL(origin).host;
    const response = await fetchWithHost(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
        Origin: origin,
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(credential),
      hostOverride: browserHost,
    });

    if (!response.ok) {
      throw this.casdoorWebauthnError(
        await response.text(),
        response.status,
        "/api/v1/auth/webauthn/signup/finish",
      );
    }

    const data = (await response.json()) as { status: string; msg?: string };
    if (data.status !== "ok") {
      throw new ApiError(
        "/errors/webauthn-enrollment-failed",
        "Passkey enrollment failed",
        400,
        data.msg || "Casdoor rejected the passkey attestation",
        {
          internal_code: "webauthn_ceremony_failed",
          severity: "HIGH",
        },
      );
    }

    // Track the new passkey in PG + send notification email.
    // The credential object from the browser contains id (base64url), aaguid, transports.
    // We extract these and store them in user_passkeys for the passkey prompt logic
    // and notification emails. Best-effort: if PG tracking fails, the passkey is
    // still enrolled in Casdoor — we log the error but don't fail the ceremony.
    try {
      const cred = credential as { id?: string; response?: { attestationObject?: string } };
      const credentialId = cred?.id;
      if (credentialId) {
        // Get the user profile from the access token to find user_profile_id
        const profilesDal = new UserProfilesDal(this.pool);
        // We need the user's idp_code to look up the profile — extract from the
        // access token claims. For now, we use the Casdoor session to get the user.
        // The signupFinish is called with an accessToken, so we can decode it.
        // Actually, the router passes the actor's idpCode via requireActor().
        // Let's use requireActor() to get the actor UUID, then look up the profile.
        const actor = requireActor();
        const profile = await profilesDal.getByUuid(actor);
        if (profile) {
          const idResult = await this.pool.query(
            `SELECT id FROM user_profiles WHERE uuid = $1`,
            [actor],
          );
          const profileId = idResult.rows[0]?.id;
          if (profileId) {
            const passkeysDal = new UserPasskeysDal(this.pool);
            // Check if this credential is already tracked (idempotent)
            const existing = await passkeysDal.findByCredentialId(credentialId);
            if (!existing) {
              await passkeysDal.create({
                user_profile_id: BigInt(profileId),
                credential_id: credentialId,
                // aaguid and transports are inside the attestationObject which is
                // CBOR-encoded — extracting them requires a CBOR decoder. For now,
                // we store what we can (credential_id) and leave aaguid/transports
                // as undefined. The Casdoor user API has the full credential info.
                aaguid: undefined,
                transports: undefined,
              });
            }

            // Send passkey activated notification email
            const invitationService = new InvitationService(this.pool, this.casdoor);
            const alertLink = await invitationService.generateAlertLink(profile.uuid, "passkey-activated");
            const adminMailto = await invitationService.generateAdminMailto(
              profile.display_name ?? "",
              profile.email ?? "",
            );
            await sendEmail({
              template_code: "passkey_activated",
              language_iso: "en",
              to: [profile.email ?? ""].filter((e) => e.length > 0),
              variables: {
                display_name: profile.display_name ?? "",
                passkey_label: "",
                alert_link: alertLink,
                admin_mailto: adminMailto,
              },
            });
          }
        }
      }
    } catch (trackingErr) {
      // Best-effort: log but don't fail the ceremony
      console.error("[webauthn] Failed to track passkey in PG:", trackingErr);
    }

    return { success: true };
  }

  // --- Passkey management --------------------------------------------------

  /**
   * List the enrolled WebAuthn credentials for a user. Reads from Casdoor's
   * user API (`/api/get-user`) and extracts the `webauthnCredentials` array.
   */
  async listCredentials(
    idpCode: string,
    idpOrg: string | undefined,
    idpUsername: string | undefined,
  ): Promise<WebauthnCredentialInfo[]> {
    const cdClient = await this.casdoor.getClient();
    if (!cdClient) {
      throw new ApiError(
        "/errors/webauthn-not-configured",
        "Casdoor is not configured",
        503,
        "Casdoor admin client is not configured; cannot list passkeys",
        { internal_code: "webauthn_not_configured", severity: "HIGH" },
      );
    }

    const casdoorUserId = idpCode || `${idpOrg}/${idpUsername}`;
    const user = await cdClient.getUser(casdoorUserId, idpOrg, idpUsername);
    if (!user) {
      throw new NotFoundError("Casdoor user not found", {
        internal_code: "CASDOOR_USER_NOT_FOUND",
      });
    }

    const creds = (user as any).webauthnCredentials as
      | Array<{
          id: string;
          aaguid?: string;
          transports?: string[];
          // go-webauthn Credential has more fields; we only expose the safe ones
        }>
      | undefined;

    if (!creds || creds.length === 0) return [];

    // Merge with PG passkey labels (best-effort — if PG lookup fails, return
    // Casdoor data without labels)
    let pgLabels: Map<string, { label: string | null; created_at?: string }> = new Map();
    try {
      const passkeysDal = new UserPasskeysDal(this.pool);
      const profilesDal = new UserProfilesDal(this.pool);
      const profile = idpCode
        ? await profilesDal.getByIdpCode(idpCode)
        : await profilesDal.getByIdpCode(`${idpOrg}/${idpUsername}`);
      if (profile) {
        const pgPasskeys = await passkeysDal.findByUserProfileUuid(profile.uuid);
        for (const pk of pgPasskeys) {
          pgLabels.set(pk.credential_id, { label: pk.label ?? null, created_at: pk.created_at?.toISOString() });
        }
      }
    } catch (pgErr) {
      console.error("[webauthn] Failed to load PG passkey labels:", pgErr);
    }

    return creds.map((c) => ({
      id: c.id,
      aaguid: c.aaguid,
      transports: c.transports,
      label: pgLabels.get(c.id)?.label ?? null,
      created_at: pgLabels.get(c.id)?.created_at,
    }));
  }

  /**
   * Reconcile Casdoor's WebAuthn credentials with PG's `user_passkeys` table.
   *
   * For each credential in Casdoor that is NOT tracked in PG, insert a row.
   * For each PG row whose credential_id is NOT in Casdoor, delete it (stale).
   *
   * This fixes incoherence where:
   * - A passkey was enrolled directly in Casdoor (not via our signupFinish)
   * - The browser threw InvalidStateError before signupFinish reached PG
   * - A passkey was deleted in Casdoor but PG still tracks it
   *
   * Returns the number of passkeys inserted and deleted.
   */
  async syncPasskeys(
    idpCode: string,
    idpOrg: string | undefined,
    idpUsername: string | undefined,
  ): Promise<{ inserted: number; deleted: number; total: number }> {
    const cdClient = await this.casdoor.getClient();
    if (!cdClient) {
      throw new ApiError(
        "/errors/webauthn-not-configured",
        "Casdoor is not configured",
        503,
        "Casdoor admin client is not configured; cannot sync passkeys",
        { internal_code: "webauthn_not_configured", severity: "HIGH" },
      );
    }

    const casdoorUserId = idpCode || `${idpOrg}/${idpUsername}`;
    const user = await cdClient.getUser(casdoorUserId, idpOrg, idpUsername);
    if (!user) {
      throw new NotFoundError("Casdoor user not found", {
        internal_code: "CASDOOR_USER_NOT_FOUND",
      });
    }

    const casdoorCreds = ((user as any).webauthnCredentials as
      | Array<{ id: string; aaguid?: string; transports?: string[] }>
      | undefined) ?? [];
    const casdoorCredIds = new Set(casdoorCreds.map((c) => c.id));

    // Look up the user profile in PG
    const profilesDal = new UserProfilesDal(this.pool);
    const profile = idpCode
      ? await profilesDal.getByIdpCode(idpCode)
      : await profilesDal.getByIdpCode(`${idpOrg}/${idpUsername}`);
    if (!profile) {
      throw new NotFoundError("User profile not found in PG", {
        internal_code: "USER_PROFILE_NOT_FOUND",
      });
    }

    const passkeysDal = new UserPasskeysDal(this.pool);
    const pgPasskeys = await passkeysDal.findByUserProfileUuid(profile.uuid);
    const pgCredIds = new Set(pgPasskeys.map((p) => p.credential_id));

    // Get the numeric profile ID for insertion
    const idResult = await this.pool.query(
      "SELECT id FROM user_profiles WHERE uuid = $1",
      [profile.uuid],
    );
    const profileId = idResult.rows[0]?.id;
    if (!profileId) {
      throw new NotFoundError("User profile ID not found", {
        internal_code: "USER_PROFILE_NOT_FOUND",
      });
    }

    let inserted = 0;
    let deleted = 0;

    // Insert Casdoor credentials not yet in PG
    for (const cred of casdoorCreds) {
      if (!pgCredIds.has(cred.id)) {
        await passkeysDal.create({
          user_profile_id: BigInt(profileId),
          credential_id: cred.id,
          aaguid: cred.aaguid,
          transports: cred.transports,
        });
        inserted++;
      }
    }

    // Delete PG rows no longer in Casdoor (stale)
    for (const pgPasskey of pgPasskeys) {
      if (!casdoorCredIds.has(pgPasskey.credential_id)) {
        await passkeysDal.deleteByUuid(pgPasskey.uuid);
        deleted++;
      }
    }

    return { inserted, deleted, total: casdoorCreds.length };
  }

  /**
   * Delete an enrolled WebAuthn credential. Casdoor does not expose a dedicated
   * "delete credential" endpoint — the BE updates the user, removing the
   * credential from the `webauthnCredentials` array via `/api/update-user`.
   *
   * NOTE: Casdoor's `/api/update-user` replaces the entire user object. The BE
   * reads the current user, filters out the credential by id, and writes back.
   * This is a best-effort approach — if Casdoor adds a dedicated endpoint, this
   * should be migrated to it.
   */
  async deleteCredential(
    credentialId: string,
    idpCode: string,
    idpOrg: string | undefined,
    idpUsername: string | undefined,
  ): Promise<{ success: true }> {
    const cdClient = await this.casdoor.getClient();
    if (!cdClient) {
      throw new ApiError(
        "/errors/webauthn-not-configured",
        "Casdoor is not configured",
        503,
        "Casdoor admin client is not configured; cannot delete passkey",
        { internal_code: "webauthn_not_configured", severity: "HIGH" },
      );
    }

    const casdoorUserId = idpCode || `${idpOrg}/${idpUsername}`;
    const user = await cdClient.getUser(casdoorUserId, idpOrg, idpUsername);
    if (!user) {
      throw new NotFoundError("Casdoor user not found", {
        internal_code: "CASDOOR_USER_NOT_FOUND",
      });
    }

    const creds = ((user as any).webauthnCredentials || []) as Array<{
      id: string;
    }>;
    const filtered = creds.filter((c) => c.id !== credentialId);
    if (filtered.length === creds.length) {
      throw new NotFoundError("Passkey not found", {
        internal_code: "WEBAUTHN_CREDENTIAL_NOT_FOUND",
      });
    }

    // Update the user with the filtered credentials array.
    // Casdoor's update-user accepts the full user object; we only override
    // the webauthnCredentials field. Spread `user` first so our explicit
    // id/owner/name/webauthnCredentials overrides take precedence.
    const updated = await cdClient.updateUser({
      ...user,
      id: casdoorUserId,
      owner: idpOrg,
      name: idpUsername,
      webauthnCredentials: filtered,
    } as any);

    if (!updated) {
      throw new ApiError(
        "/errors/webauthn-delete-failed",
        "Failed to delete passkey",
        502,
        "Casdoor API returned non-success status when updating user credentials",
        { internal_code: "webauthn_delete_failed", severity: "HIGH" },
      );
    }

    // Remove the passkey from PG + send notification email.
    // Best-effort: if PG deletion fails, the passkey is still deleted from Casdoor.
    try {
      const passkeysDal = new UserPasskeysDal(this.pool);
      await passkeysDal.deleteByCredentialId(credentialId);

      // Send passkey removed notification email
      const actor = requireActor();
      const profilesDal = new UserProfilesDal(this.pool);
      const profile = await profilesDal.getByUuid(actor);
      if (profile && profile.email) {
        const invitationService = new InvitationService(this.pool, this.casdoor);
        const alertLink = await invitationService.generateAlertLink(profile.uuid, "passkey-removed");
        const adminMailto = await invitationService.generateAdminMailto(
          profile.display_name ?? "",
          profile.email ?? "",
        );
        await sendEmail({
          template_code: "passkey_removed",
          language_iso: "en",
          to: [profile.email],
          variables: {
            display_name: profile.display_name ?? "",
            passkey_label: "",
            alert_link: alertLink,
            admin_mailto: adminMailto,
          },
        });
      }
    } catch (trackingErr) {
      // Best-effort: log but don't fail the deletion
      console.error("[webauthn] Failed to remove passkey from PG:", trackingErr);
    }

    return { success: true };
  }

  // --- Internal helpers ----------------------------------------------------

  /**
   * Throw 503 if WebAuthn is not enabled in the auth config.
   */
  private async requireWebauthnEnabled() {
    const cfg = await getAuthConfig();
    if (!cfg.enable_webauthn) {
      throw new ApiError(
        "/errors/webauthn-not-configured",
        "WebAuthn is not enabled",
        503,
        "WebAuthn / passkey authentication is not enabled on this server",
        { internal_code: "webauthn_not_configured", severity: "MEDIUM" },
      );
    }
    if (!cfg.casdoor_endpoint || !cfg.casdoor_organization) {
      throw new ApiError(
        "/errors/webauthn-not-configured",
        "Casdoor is not configured",
        503,
        "Casdoor endpoint or organization is missing in auth config",
        { internal_code: "webauthn_not_configured", severity: "HIGH" },
      );
    }
    return cfg;
  }

  /**
   * Exchange an OAuth authorization code for tokens. Uses Casdoor's token
   * endpoint with `grant_type=authorization_code` — the same endpoint used by
   * the password grant, just a different grant type.
   */
  private async exchangeCode(
    code: string,
    cfg: Awaited<ReturnType<typeof getAuthConfig>>,
    redirectUri: string,
  ): Promise<TokenSet> {
    const tokenUrl = `${cfg.casdoor_endpoint}/api/login/oauth/access_token`;
    const formData = new URLSearchParams();
    formData.append("grant_type", "authorization_code");
    formData.append("client_id", cfg.oidc.client_id!);
    formData.append("client_secret", cfg.oidc.client_secret!);
    formData.append("code", code);
    // redirect_uri must match the one sent to signin/finish (Casdoor stores
    // it on the code). Casdoor doesn't validate it on token exchange, but
    // we send it for consistency with the OAuth spec.
    formData.append("redirect_uri", redirectUri);

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(
        "/errors/webauthn-token-exchange-failed",
        "Token exchange failed",
        502,
        `Failed to exchange WebAuthn code for tokens: ${errorText}`,
        {
          internal_code: "webauthn_token_exchange_failed",
          severity: "HIGH",
        },
      );
    }

    const data = (await response.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      error?: string;
      error_description?: string;
    };

    // Casdoor may return 200 with an error body for invalid codes
    if (data.error || !data.access_token) {
      throw new ApiError(
        "/errors/webauthn-token-exchange-failed",
        "Token exchange failed",
        502,
        data.error_description || data.error || "No access_token in response",
        {
          internal_code: "webauthn_token_exchange_failed",
          severity: "HIGH",
        },
      );
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    };
  }

  /**
   * Refresh an access token using the refresh_token grant.
   * Called with the default Host (no override) so Casdoor derives the JWT
   * issuer from the BE's Casdoor endpoint, producing a token with the
   * correct `iss` claim.
   */
  private async refreshToken(
    refreshToken: string,
    cfg: Awaited<ReturnType<typeof getAuthConfig>>,
  ): Promise<TokenSet> {
    const tokenUrl = `${cfg.casdoor_endpoint}/api/login/oauth/access_token`;
    const formData = new URLSearchParams();
    formData.append("grant_type", "refresh_token");
    formData.append("client_id", cfg.oidc.client_id!);
    formData.append("client_secret", cfg.oidc.client_secret!);
    formData.append("refresh_token", refreshToken);
    formData.append("scope", "openid profile email");
    formData.append("organization", cfg.casdoor_organization!);

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(
        "/errors/webauthn-refresh-failed",
        "Token refresh failed after WebAuthn signin",
        502,
        `Failed to refresh token: ${errorText}`,
        {
          internal_code: "webauthn_refresh_failed",
          severity: "HIGH",
        },
      );
    }

    const data = (await response.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      error?: string;
      error_description?: string;
    };

    if (data.error || !data.access_token) {
      throw new ApiError(
        "/errors/webauthn-refresh-failed",
        "Token refresh failed after WebAuthn signin",
        502,
        data.error_description || data.error || "No access_token in refresh response",
        {
          internal_code: "webauthn_refresh_failed",
          severity: "HIGH",
        },
      );
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    };
  }

  private decodeJwtPayload(token: string): Record<string, any> {
    const parts = token.split(".");
    const encodedPayload = parts[1];
    const rawPayload = Buffer.from(encodedPayload, "base64").toString("utf-8");
    return JSON.parse(rawPayload);
  }

  private extractRoles(claims: Record<string, any>): Array<{ name: string }> {
    return (claims.roles || [])
      .filter((role: any) => role.isEnabled !== false)
      .map((role: any) => ({ name: role.name }));
  }

  /**
   * Build an `ApiError` from a Casdoor WebAuthn error response.
   * Casdoor returns `{status:"error", msg:"..."}` with HTTP 200, or a plain
   * string / JSON error with non-200 status.
   */
  private casdoorWebauthnError(
    errorText: string,
    httpStatus: number,
    instance: string,
  ): ApiError {
    let detail = "WebAuthn ceremony failed";
    let code = "webauthn_ceremony_failed";

    try {
      const json = JSON.parse(errorText);
      detail = json.msg || json.error || json.error_description || detail;
      // Detect "no credentials" case (signin begin for a user with no passkey)
      if (
        typeof detail === "string" &&
        detail.toLowerCase().includes("found no credentials")
      ) {
        code = "webauthn_no_credentials";
      }
    } catch {
      detail = errorText || detail;
    }

    return new ApiError(
      "/errors/webauthn-ceremony-failed",
      "WebAuthn ceremony failed",
      httpStatus >= 400 && httpStatus < 500 ? httpStatus : 401,
      detail,
      { instance, internal_code: code, severity: "HIGH" },
    );
  }
}
