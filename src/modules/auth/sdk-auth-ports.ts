/**
 * BE-specific port implementations for the SDK auth module.
 *
 * These ports are BE-ONLY. Microservices do NOT implement UserResolverPort
 * or RoleMappingPort — they use GATEWAY-RESOLVED mode where the BE already
 * resolved the user and forwards the full AuthUser in headers.
 *
 * - BeAuthConfigPort: loads auth config from `config_entries` table
 * - BeUserResolverPort: resolves IDP sub to internal UUID via `user_profiles` (JIT provisioning)
 * - BeRoleMappingPort: loads role-to-permission mappings from `role_mappings` table
 * - BeApiKeyPort: looks up API keys by hash from `api_keys` table
 */

import { logger } from "@primebrick/sdk";
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
import { field, Filter, Project } from "@primebrick/dal-pg";
import { initDal } from "../../db/dal-gateway.js";
import { ApiKeyEntity } from "./api_key_entity.js";

// ─── Cache keys + TTLs (BE custom logic — not entity-level @Cached) ──────────

const ROLE_MAPPINGS_CACHE_KEY = "be:role_mappings:all";
const ROLE_MAPPINGS_TTL_MS = 5 * 60 * 1000; // 5 min



// ─── AuthConfigPort ───────────────────────────────────────────────────────────

export class BeAuthConfigPort implements AuthConfigPort {
  async load(): Promise<AuthConfig> {
    const db = await loadAuthConfigFromDb();
    return {
      mode: db.auth_mode as AuthMode,
      roles_path: db.auth_roles_path!,
      oidc: {
        issuer_url: db.oidc_issuer_url,
        client_id: db.oidc_client_id,
        client_secret: db.oidc_client_secret,
        audience: db.oidc_audience,
        idp_type: db.idp_type,
      },
      gateway: {
        secret: db.service_client_shield_secret,
        secret_header_name: db.service_client_shield_secret_header,
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
      idp_endpoint: db.idp_endpoint,
      idp_organization: db.idp_organization,
      enable_email_verification_check: db.enable_email_verification_check,
      enable_webauthn: db.enable_webauthn,
      passkey_required: db.passkey_required,
      enable_mfa: db.enable_mfa,
      redis_url: db.redis_url,
    };
  }
}

// ─── UserResolverPort ─────────────────────────────────────────────────────────

export class BeUserResolverPort implements UserResolverPort {
  async resolveInternalUuid(input: ResolveInput): Promise<string> {
    return resolveInternalUuid(input);
  }
}

// ─── RoleMappingPort ──────────────────────────────────────────────────────────

export class BeRoleMappingPort implements RoleMappingPort {
  private repo = new RoleMappingRepo();

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
        logger.warn(`role_mappings get failed: ${e}`, { tags: ["auth"] });
      }
    }
    // Cache miss or disabled — load from DB
    const raw = await this.repo.loadAllMappings();
    if (port) {
      try {
        const serialized = [...raw.entries()].map(([role, entry]) => ({ role, entry }));
        await port.set(ROLE_MAPPINGS_CACHE_KEY, serialized, ROLE_MAPPINGS_TTL_MS);
      } catch (e) {
        logger.warn(`role_mappings set failed: ${e}`, { tags: ["auth"] });
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

/**
 * DB resolver for `api_keys` — BE owns `public.api_keys`, so this is the
 * only implementation allowed to read the table. Caching is NOT inside this
 * class: callers compose `new CachingApiKeyPort(new BeApiKeyPort(), cache)`
 * from the SDK (single cached implementation, platform-shared key).
 */
export class BeApiKeyPort implements ApiKeyPort {
  async findByHash(hash: string): Promise<ApiKeyRecord | null> {
    const row = await initDal().find<ApiKeyEntity, {
      uuid: string;
      name: string;
      permissions: string[] | null;
      is_system: boolean | null;
      is_active: boolean | null;
      expires_at: Date | null;
    }>(
      ApiKeyEntity,
      [
        Project.field(field(ApiKeyEntity, "uuid")),
        Project.field(field(ApiKeyEntity, "name")),
        Project.field(field(ApiKeyEntity, "permissions")),
        Project.field(field(ApiKeyEntity, "is_system")),
        Project.field(field(ApiKeyEntity, "is_active")),
        Project.field(field(ApiKeyEntity, "expires_at")),
      ],
      {
        filters: [Filter.fieldValue(field(ApiKeyEntity, "key_hash"), "=", hash)],
        throwIfNotFound: false,
      },
    );
    if (!row) return null;
    const record: ApiKeyRecord = {
      uuid: row.uuid,
      name: row.name,
      permissions: row.permissions || [],
      is_system: row.is_system || false,
      is_active: row.is_active !== false,
      expires_at: row.expires_at ? new Date(row.expires_at) : null,
    };
    return record;
  }
}
