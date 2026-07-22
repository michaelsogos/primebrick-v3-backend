/**
 * BE-specific port implementations for the SDK auth module.
 *
 * These ports are BE-ONLY. Microservices do NOT implement UserResolverPort
 * or RoleMappingPort — they use GATEWAY-RESOLVED mode where the BE already
 * resolved the user and forwards the full AuthUser in headers.
 *
 * - BeAuthConfigPort: loads auth config from `auth_configurations` table
 * - BeUserResolverPort: resolves IDP sub to internal UUID via `user_profiles` (JIT provisioning)
 * - BeRoleMappingPort: loads role-to-permission mappings from `role_mappings` table
 * - BeApiKeyPort: looks up API keys by hash from `api_keys` table
 */

import type { Pool } from "pg";
import {
  type AuthConfig,
  type AuthConfigPort,
  type UserResolverPort,
  type RoleMappingPort,
  type RoleMappingEntry,
  type ApiKeyPort,
  type ApiKeyRecord,
  type ResolveInput,
  AuthMode,
} from "@primebrick/sdk";
import { loadAuthConfigFromDb } from "./config-repo.js";
import { resolveInternalUuid } from "./user-profile-repo.js";
import { RoleMappingRepo } from "./role-mapping-repo.js";
import { getCachePort } from "../../cache/cache-port-holder.js";

// ─── Cache keys + TTLs (BE custom logic — not entity-level @Cached) ──────────

const ROLE_MAPPINGS_CACHE_KEY = "be:role_mappings:all";
const ROLE_MAPPINGS_TTL_MS = 5 * 60 * 1000; // 5 min

const API_KEY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

// ─── AuthConfigPort ───────────────────────────────────────────────────────────

export class BeAuthConfigPort implements AuthConfigPort {
  constructor(private pool: Pool) {}

  async load(): Promise<AuthConfig> {
    const db = await loadAuthConfigFromDb(this.pool);
    return {
      mode: db.auth_mode as AuthMode,
      roles_path: db.auth_roles_path!,
      oidc: {
        issuer_url: db.oidc_issuer_url,
        client_id: db.oidc_client_id,
        client_secret: db.oidc_client_secret,
        audience: db.oidc_audience,
        issuer_type: db.oidc_issuer_type,
      },
      gateway: {
        secret: db.gateway_secret,
        secret_header_name: db.gateway_secret_header,
        public_secret: db.gateway_public_secret,
        public_secret_header_name: db.gateway_public_secret_header,
        headers: {
          user_id: db.gateway_header_user_id,
          email: db.gateway_header_email,
          name: db.gateway_header_name,
          roles: db.gateway_header_roles,
          idp_code: db.gateway_header_idp_code,
          idp_org: db.gateway_header_idp_org,
          idp_username: db.gateway_header_idp_username,
        },
      },
      casdoor_endpoint: db.casdoor_endpoint,
      casdoor_organization: db.casdoor_organization,
      enable_email_verification_check: db.enable_email_verification_check,
      enable_webauthn: db.enable_webauthn,
      enable_formauth: db.enable_formauth,
      passkey_required: db.passkey_required,
      enable_mfa: db.enable_mfa,
      redis_url: db.redis_url,
    };
  }
}

// ─── UserResolverPort ─────────────────────────────────────────────────────────

export class BeUserResolverPort implements UserResolverPort {
  constructor(private pool: Pool) {}

  async resolveInternalUuid(input: ResolveInput): Promise<string> {
    return resolveInternalUuid(input, this.pool);
  }
}

// ─── RoleMappingPort ──────────────────────────────────────────────────────────

export class BeRoleMappingPort implements RoleMappingPort {
  private repo: RoleMappingRepo;

  constructor(pool: Pool) {
    this.repo = new RoleMappingRepo(pool);
  }

  async loadAllMappings(): Promise<Map<string, RoleMappingEntry>> {
    const port = getCachePort();
    if (port) {
      try {
        const cached = await port.get<{ role: string; entry: RoleMappingEntry }[]>(
          ROLE_MAPPINGS_CACHE_KEY,
        );
        if (cached) {
          return new Map(cached.map(({ role, entry }) => [role, entry]));
        }
      } catch (e) {
        console.warn(`[cache] role_mappings get failed: ${e}`);
      }
    }
    // Cache miss or disabled — load from DB
    const raw = await this.repo.loadAllMappings();
    if (port) {
      try {
        const serialized = [...raw.entries()].map(([role, entry]) => ({ role, entry }));
        await port.set(ROLE_MAPPINGS_CACHE_KEY, serialized, ROLE_MAPPINGS_TTL_MS);
      } catch (e) {
        console.warn(`[cache] role_mappings set failed: ${e}`);
      }
    }
    return raw;
  }

  async getRoleMapping(role: string): Promise<RoleMappingEntry | null> {
    const all = await this.loadAllMappings();
    return all.get(role) ?? null;
  }
}

// ─── ApiKeyPort ───────────────────────────────────────────────────────────────

export class BeApiKeyPort implements ApiKeyPort {
  constructor(private pool: Pool) {}

  async findByHash(hash: string): Promise<ApiKeyRecord | null> {
    const cacheKey = `be:api_keys:hash:${hash}`;
    const port = getCachePort();
    if (port) {
      try {
        const cached = await port.get<ApiKeyRecord>(cacheKey);
        if (cached) return cached;
      } catch (e) {
        console.warn(`[cache] api_keys get failed: ${e}`);
      }
    }
    const result = await this.pool.query(
      `SELECT uuid, name, permissions, is_system, is_active, expires_at
       FROM public.api_keys
       WHERE key_hash = $1`,
      [hash],
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    const record: ApiKeyRecord = {
      uuid: row.uuid,
      name: row.name,
      permissions: row.permissions || [],
      is_system: row.is_system || false,
      is_active: row.is_active !== false,
      expires_at: row.expires_at ? new Date(row.expires_at) : null,
    };
    if (port) {
      try {
        await port.set(cacheKey, record, API_KEY_CACHE_TTL_MS);
      } catch (e) {
        console.warn(`[cache] api_keys set failed: ${e}`);
      }
    }
    return record;
  }
}
