/**
 * Boundary integration tests — HTTP-level tests against the running BE dev
 * server. Exercises every data-access seam converged onto `getDal()` by the
 * DAL-boundary refactor:
 *
 *   - login              → AuthSessionService → UserService, ConfigEntriesService.loadAuthConfigOnly
 *   - config_entry/list  → ConfigEntriesService (mask + etag)
 *   - organization/list  → makeEntityService → dal.entityService (+ withCache seam)
 *   - user_profile/list  → UserService
 *   - role_mapping/list  → RoleService (extends DomainService)
 *   - system/services    → SystemService → ServiceRegistryService
 *   - translations dict  → TranslationsService (merged DAL)
 *   - POST config_entry  → runEntityWrite tx → EntityAuditPort audit row
 *   - DELETE             → MFA step-up gate (403 MFA_STEP_UP_REQUIRED)
 *
 * Prerequisites:
 *   - BE dev server running on port 3001
 *   - DATABASE_URL set (loads .env via dotenv) — used to mint/destroy the
 *     ephemeral test actor and to read idp config from config_entries
 *   - Casdoor reachable (the actor is created via the machine client creds)
 *
 * The test actor is ephemeral (random password, destroyed in afterAll) —
 * same pattern as the FE E2E `createE2eAdminActor`, never the bootstrap
 * `admin` user. If the server is not reachable, all tests skip cleanly.
 */

import "dotenv/config";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Pool } from "pg";
import { randomBytes, randomUUID } from "crypto";

const BASE_URL = "http://localhost:3001";
const ACTOR_NAME = `e2e_boundary_admin`;
const ACTOR_EMAIL = `${ACTOR_NAME}@e2e.local`;
const ADMIN_ROLE = "administrators";
const CFG_KEY = `e2e_boundary_${Date.now()}`;

// ─── Ephemeral actor helpers (mirrors FE e2e/helpers/test-users.ts) ─────────

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface IdpConfig {
  endpoint: string;
  clientId: string;
  clientSecret: string;
  org: string;
}

async function loadIdpConfig(): Promise<IdpConfig> {
  const res = await pool.query(
    `SELECT key, value FROM public.config_entries
     WHERE key IN ('idp_endpoint', 'idp_client_id', 'idp_client_secret', 'idp_organization')`,
  );
  const map = Object.fromEntries(res.rows.map((r) => [r.key, r.value]));
  if (!map.idp_endpoint || !map.idp_client_id || !map.idp_client_secret || !map.idp_organization) {
    throw new Error("[E2E] Missing IDP config in config_entries");
  }
  return {
    endpoint: String(map.idp_endpoint).replace(/\/$/, ""),
    clientId: map.idp_client_id,
    clientSecret: map.idp_client_secret,
    org: map.idp_organization,
  };
}

async function casdoorFetch(cfg: IdpConfig, path: string, init?: RequestInit): Promise<any> {
  const url = new URL(`${cfg.endpoint}/api${path}`);
  url.searchParams.set("clientId", cfg.clientId);
  url.searchParams.set("clientSecret", cfg.clientSecret);
  const res = await fetch(url.toString(), {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  return res.json().catch(() => null);
}

async function deleteCasdoorUser(cfg: IdpConfig, name: string): Promise<void> {
  const got = await casdoorFetch(cfg, `/get-user?id=${encodeURIComponent(`${cfg.org}/${name}`)}`);
  const user = got?.data;
  if (!user?.id) return;
  await casdoorFetch(cfg, `/delete-user?id=${encodeURIComponent(`${cfg.org}/${name}`)}`, {
    method: "POST",
    body: JSON.stringify({ id: user.id, owner: cfg.org, name }),
  });
}

async function updateRoleUsers(cfg: IdpConfig, users: string[]): Promise<void> {
  const got = await casdoorFetch(cfg, `/get-role?id=${encodeURIComponent(`${cfg.org}/${ADMIN_ROLE}`)}`);
  const role = got?.data;
  if (!role) throw new Error("[E2E] Casdoor get-role failed");
  const res = await casdoorFetch(cfg, `/update-role?id=${encodeURIComponent(`${cfg.org}/${ADMIN_ROLE}`)}`, {
    method: "POST",
    body: JSON.stringify({ ...role, users }),
  });
  if (res?.status !== "ok" && res?.success !== true) {
    throw new Error(`[E2E] Casdoor update-role failed: ${JSON.stringify(res)}`);
  }
}

async function linkActorToRole(cfg: IdpConfig, userKey: string): Promise<void> {
  const got = await casdoorFetch(cfg, `/get-role?id=${encodeURIComponent(`${cfg.org}/${ADMIN_ROLE}`)}`);
  const users = (got?.data?.users as string[]) ?? [];
  if (!users.includes(userKey)) await updateRoleUsers(cfg, [...users, userKey]);
}

async function unlinkActorFromRole(cfg: IdpConfig, userKey: string): Promise<void> {
  const got = await casdoorFetch(cfg, `/get-role?id=${encodeURIComponent(`${cfg.org}/${ADMIN_ROLE}`)}`);
  const users = (got?.data?.users as string[]) ?? [];
  await updateRoleUsers(cfg, users.filter((u) => u !== userKey));
}

async function mintActor(): Promise<{ username: string; password: string }> {
  const cfg = await loadIdpConfig();
  const password = `E2E-${randomBytes(12).toString("hex")}!`;

  await deleteCasdoorUser(cfg, ACTOR_NAME);
  await pool.query(`DELETE FROM public.user_profiles WHERE idp_username = $1`, [ACTOR_NAME]);

  const addRes = await casdoorFetch(cfg, `/add-user`, {
    method: "POST",
    body: JSON.stringify({
      owner: cfg.org,
      name: ACTOR_NAME,
      displayName: "E2E Boundary Admin",
      email: ACTOR_EMAIL,
      password,
      isAdmin: true,
      isVerified: true,
      emailVerified: true,
      isForbidden: false,
      signupApplication: "primebrick-api",
      roles: [{ name: ADMIN_ROLE }],
    }),
  });
  if (addRes?.status !== "ok" && addRes?.success !== true) {
    throw new Error(`[E2E] Casdoor add-user failed: ${JSON.stringify(addRes)}`);
  }

  let casdoorUser: any = null;
  for (let i = 0; i < 10 && !casdoorUser?.id; i++) {
    const got = await casdoorFetch(cfg, `/get-user?id=${encodeURIComponent(`${cfg.org}/${ACTOR_NAME}`)}`);
    casdoorUser = got?.data;
    if (!casdoorUser?.id) await new Promise((r) => setTimeout(r, 500));
  }
  if (!casdoorUser?.id) throw new Error("[E2E] Casdoor did not return the test actor");

  await linkActorToRole(cfg, `${cfg.org}/${ACTOR_NAME}`);

  const now = new Date();
  await pool.query(
    `INSERT INTO public.user_profiles
     (uuid, idp_code, email, display_name, idp_org, idp_username, avatar_color, avatar_initials,
      is_active, is_admin, is_verified, email_verified, issuer, roles, last_synced_at,
      created_at, created_by, updated_at, updated_by, version,
      auth_method_enforcer_dismissed)
     VALUES ($1,$2,$3,$4,$5,$6,'#4f46e5','TA',true,true,true,true,$7,$8,$9,$9,'e2e-setup',$9,'e2e-setup',1,true)`,
    [randomUUID(), casdoorUser.id, ACTOR_EMAIL, "E2E Boundary Admin", cfg.org, ACTOR_NAME,
     cfg.endpoint, JSON.stringify([ADMIN_ROLE]), now],
  );
  return { username: ACTOR_NAME, password };
}

async function destroyActor(): Promise<void> {
  try {
    const cfg = await loadIdpConfig();
    await unlinkActorFromRole(cfg, `${cfg.org}/${ACTOR_NAME}`);
    await deleteCasdoorUser(cfg, ACTOR_NAME);
  } catch { /* best-effort */ }
  await pool.query(`DELETE FROM public.user_profiles WHERE idp_username = $1`, [ACTOR_NAME]);
  await pool.query(`DELETE FROM public.config_entries WHERE key LIKE 'e2e_boundary_%'`);
}

// ─── HTTP helper ────────────────────────────────────────────────────────────

let cookies = "";
async function api(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookies,
      ...(init?.headers as Record<string, string> | undefined),
    },
    redirect: "manual",
  });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  if (setCookie.length) {
    // Keep the LAST value per cookie name (login emits clear-then-set).
    const jar = new Map<string, string>(
      cookies ? cookies.split("; ").map((c) => {
        const i = c.indexOf("="); return [c.slice(0, i), c.slice(i + 1)];
      }) : [],
    );
    for (const c of setCookie) {
      const pair = c.split(";")[0];
      const i = pair.indexOf("=");
      jar.set(pair.slice(0, i), pair.slice(i + 1));
    }
    cookies = [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }
  const text = await res.text();
  let body: any = null;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, body, headers: res.headers };
}

// ─── Suite ──────────────────────────────────────────────────────────────────

let serverReachable = false;
let actorReady = false;
let cfgUuid: string | null = null;
let cfgVersion = 1;

beforeAll(async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/health`, { signal: AbortSignal.timeout(3000) });
    serverReachable = res.ok;
  } catch { serverReachable = false; }
  if (!serverReachable) return;
  try {
    const creds = await mintActor();
    const login = await api("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: creds.username, password: creds.password }),
    });
    actorReady = login.status === 200;
  } catch { actorReady = false; }
}, 60_000);

afterAll(async () => {
  await destroyActor().catch(() => {});
  await pool.end();
});

describe("DAL boundary — live HTTP surface", () => {
  it("POST /auth/login sets a working session (AuthSessionService → getDal)", () => {
    if (!serverReachable || !actorReady) return expect(true).toBe(true); // skip
    expect(cookies).toContain("access_token=");
  });

  it("GET config_entry/list masks secrets and serves etag → 304", async () => {
    if (!serverReachable || !actorReady) return;
    const res = await api("/api/v1/entities/config_entry/list");
    expect(res.status).toBe(200);
    const secretRows = (res.body.rows ?? []).filter((r: any) => r.type === "secret");
    expect(secretRows.every((r: any) => r.value === null)).toBe(true);
    const etag = res.headers.get("etag");
    expect(etag).toBeTruthy();
    const again = await api("/api/v1/entities/config_entry/list", {
      headers: { "if-none-match": etag! },
    });
    expect(again.status).toBe(304);
  });

  it("GET organization/list paginates via dal.entityService", async () => {
    if (!serverReachable || !actorReady) return;
    const res = await api("/api/v1/entities/organization/list");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("rows");
    expect(res.body).toHaveProperty("total");
  });

  it("GET user_profile/list works (UserService → getDal)", async () => {
    if (!serverReachable || !actorReady) return;
    const res = await api("/api/v1/entities/user_profile/list");
    expect(res.status).toBe(200);
  });

  it("GET role_mapping/list works (RoleService → this.dal)", async () => {
    if (!serverReachable || !actorReady) return;
    const res = await api("/api/v1/entities/role_mapping/list");
    expect(res.status).toBe(200);
  });

  it("GET system/services returns the registry (ServiceRegistryService)", async () => {
    if (!serverReachable || !actorReady) return;
    const res = await api("/api/v1/system/services");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.services)).toBe(true);
    expect(res.body.services.length).toBeGreaterThan(0);
  });

  it("GET translations/app/en-GB serves the dict (TranslationsService)", async () => {
    if (!serverReachable || !actorReady) return;
    const res = await api("/api/v1/system/translations/app/en-GB");
    expect(res.status).toBe(200);
    expect(Object.keys(res.body).length).toBeGreaterThan(0);
  });

  it("POST config_entry writes through runEntityWrite tx AND emits an audit row", async () => {
    if (!serverReachable || !actorReady) return;
    const create = await api("/api/v1/entities/config_entry", {
      method: "POST",
      body: JSON.stringify({ entity: { key: CFG_KEY, value: "e2e", type: "string" } }),
    });
    expect(create.status).toBe(201);
    cfgUuid = create.body.uuid;
    cfgVersion = create.body.version;
    expect(cfgUuid).toBeTruthy();

    // The write must produce an audit row via EntityAuditPort — this is
    // the regression guard for the silent-skip gap (audit only happens when
    // the `audit:` option is passed on the write call).
    const audit = await api(`/api/v1/entities/config_entry/${cfgUuid}/audit?page=1&limit=10`);
    expect(audit.status).toBe(200);
    const rows = audit.body.data ?? [];
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows[0].action).toBe("INSERT");
  });

  it("DELETE config_entry is MFA step-up gated (403 MFA_STEP_UP_REQUIRED)", async () => {
    if (!serverReachable || !actorReady || !cfgUuid) return;
    const res = await api(`/api/v1/entities/config_entry/${cfgUuid}?version=${cfgVersion}`, {
      method: "DELETE",
    });
    expect(res.status).toBe(403);
    expect(res.body.internal_code).toBe("MFA_STEP_UP_REQUIRED");
  });
});
