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
  private cache: Map<string, RoleMappingEntry> | null = null;
  private repo: RoleMappingRepo;

  constructor(pool: Pool) {
    this.repo = new RoleMappingRepo(pool);
  }

  async loadAllMappings(): Promise<Map<string, RoleMappingEntry>> {
    const raw = await this.repo.loadAllMappings();
    this.cache = new Map();
    for (const [role, entry] of raw) {
      this.cache.set(role, {
        permissions: entry.permissions,
        is_admin: entry.is_admin,
        label_key: entry.label_key,
      });
    }
    return this.cache;
  }

  async getRoleMapping(role: string): Promise<RoleMappingEntry | null> {
    if (!this.cache) {
      await this.loadAllMappings();
    }
    return this.cache?.get(role) ?? null;
  }
}

// ─── ApiKeyPort ───────────────────────────────────────────────────────────────

export class BeApiKeyPort implements ApiKeyPort {
  constructor(private pool: Pool) {}

  async findByHash(hash: string): Promise<ApiKeyRecord | null> {
    const result = await this.pool.query(
      `SELECT uuid, name, permissions, is_system, is_active, expires_at
       FROM public.api_keys
       WHERE key_hash = $1`,
      [hash],
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      uuid: row.uuid,
      name: row.name,
      permissions: row.permissions || [],
      is_system: row.is_system || false,
      is_active: row.is_active !== false,
      expires_at: row.expires_at ? new Date(row.expires_at) : null,
    };
  }
}
