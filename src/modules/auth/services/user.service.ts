/**
 * UserService — the worker service that owns `user_profiles`.
 *
 * Owns ALL domain operations on the entity: admin CRUD (create / update /
 * delete / restore flows that coordinate Casdoor + the local table), JIT
 * provisioning (`resolveInternalUuid`), profile lookups, session-state reads
 * and the user audit surface. Absorbs the former `user-profiles-dal.ts` +
 * `user-profile-repo.ts` wrappers — the class IS the service layer:
 * CONTROLLER → WORKER SERVICE → DAL lib → DB.
 *
 * The service is request-context-free: it takes plain parameters and reads
 * the actor from ALS (`requireActor()`) when it needs the authenticated user
 * for audit columns. It never touches `req`/`res`.
 *
 * Errors are thrown as `ApiError` subclasses so the centralized `errorHandler`
 * can convert them to RFC 7807 JSON. This removes the dozens of inline
 * `res.status(...).json({...})` blocks that used to live in the router.
 */

import { extJsonStringify, logger } from "@primebrick/sdk";
import { randomUUID, randomBytes } from "node:crypto";
import {
  entityDateToApiIso,
  type Repository,
  field, Filter, Sort, Join,
  buildAuditableJoins,
  Project,
  translateFilterConditions,
  type FilterExpr,
  type WithAuditableDisplayNames,
} from "@primebrick/dal-pg";

import { DomainService } from "../../../db/domain-service.js";
import { EntityAuditPort } from "../../../db/entity-audit-port.js";
import { findAuditPage } from "../../../db/audit-query-helper.js";
import { getCachePort } from "../../../cache/cache-port-holder.js";
import { deriveSearchableKeys } from "../../../lib/search-keys.js";
import { UserProfileEntity } from "../user_profile_entity.js";
import { userProfileMeta } from "../user-profiles.meta.js";
import { CasdoorService } from "./casdoor.service.js";
import { InvitationService } from "./invitation.service.js";
import { sendEmail } from "./email-sender.js";
import { getAuthConfig } from "../config.js";
import { getConfigEntriesService } from "./config-entries.service.js";
import { parsePasswordPolicy, type PasswordPolicy } from "../password-policy.js";
import { requireActor } from "@primebrick/sdk";
import { ApiError, NotFoundError, ValidationError } from "../../../http/api-errors.js";
import type { CreateUserBody, UserUpdateBody } from "../dto.js";

const DEFAULT_SEARCH_KEYS = deriveSearchableKeys(userProfileMeta, UserProfileEntity);
const SEARCH_IN_ALLOWED = new Set([...DEFAULT_SEARCH_KEYS, "uuid"]);
const USER_PROFILE_FILTERABLE_FIELDS = new Set(["display_name", "email", "idp_code", "idp_username", "idp_org", "is_active", "is_admin", "is_verified"]);

const USER_PROFILE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

function idpCodeCacheKey(idpCode: string): string {
  return `be:user_profiles:idp_code:${idpCode}`;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type UserProfileDetailRow = WithAuditableDisplayNames<{
  uuid: string;
  idp_code: string;
  email?: string;
  display_name?: string;
  avatar_color?: string;
  avatar_initials?: string;
  is_active: boolean;
  is_admin: boolean;
  is_verified: boolean;
  email_verified: boolean;
  issuer?: string;
  roles?: string[];
  last_synced_at?: Date;
  idp_org?: string;
  idp_username?: string;
  created_at: Date;
  created_by: string;
  updated_at: Date;
  updated_by: string;
  version: number;
  deleted_at?: Date;
  deleted_by?: string;
}>;

export type UserProfileDetailDto = Omit<
  UserProfileDetailRow,
  "created_at" | "updated_at" | "deleted_at"
> & {
  created_at: string;
  updated_at: string;
  deleted_at?: string;
};

export type UserListQuery = {
  search?: string;
  search_in?: string[];
  sort_key?: string | null;
  sort_dir?: "asc" | "desc";
  page?: number;
  page_size?: number;
  filters?: Array<{ field: string; op: string; value: unknown; connector?: "AND" | "OR" }>;
  connector?: "AND" | "OR";
  deleted_records?: "EXCLUDED" | "ONLY" | "INCLUDED";
};

export type UserListResponse = {
  rows: UserProfileDetailDto[];
  page: number;
  page_size: number;
  total: bigint;
};

/** Input for JIT provisioning (`resolveInternalUuid`). */
export interface ResolveInput {
  idp_code: string;
  email: string | null;
  display_name: string | null;
  idp_org?: string | null;
  idp_username?: string | null;
}

/**
 * Result of a user creation: the local profile DTO plus the resolved IDP
 * identifiers (useful for logging / debugging on the controller side).
 */
export interface CreateUserResult {
  profile: UserProfileDetailDto;
  invitation_uuid?: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export class UserService extends DomainService<UserProfileDetailDto> {
  constructor(private casdoor: CasdoorService) {
    super({
      entity: UserProfileEntity,
      list: {
        searchableKeys: [...DEFAULT_SEARCH_KEYS],
        filterableKeys: USER_PROFILE_FILTERABLE_FIELDS,
        defaultSort: { key: "created_at", dir: "desc" },
      },
    });
  }

  // --- Profile reads ---------------------------------------------------------

  private toDto(r: UserProfileDetailRow): UserProfileDetailDto {
    return {
      ...r,
      created_at: entityDateToApiIso(r.created_at),
      updated_at: entityDateToApiIso(r.updated_at),
      deleted_at: r.deleted_at ? entityDateToApiIso(r.deleted_at) : undefined,
    };
  }

  async getByUuid(uuid: string): Promise<UserProfileDetailDto | null> {
    const row = await this.dal.find<any, any>(
      UserProfileEntity,
      null,
      {
        filters: [Filter.fieldValue(field(UserProfileEntity, "uuid" as any), "=", uuid)] as any,
        joins: buildAuditableJoins(UserProfileEntity, UserProfileEntity),
        throwIfNotFound: false,
      }
    );
    return row ? this.toDto(row) : null;
  }

  /**
   * Light internal-PK lookup — sibling services (MFA, sessions, invitations,
   * webauthn) need the bigint `id` for child-table FK writes; the DTO never
   * exposes it. Returns null when the profile does not exist.
   */
  async getIdByUuid(uuid: string): Promise<bigint | null> {
    const row = await this.dal.find<any, { id: bigint }>(
      UserProfileEntity,
      [Project.field(field(UserProfileEntity, "id"))],
      {
        filters: [Filter.fieldValue(field(UserProfileEntity, "uuid" as any), "=", uuid)] as any,
        throwIfNotFound: false,
      },
    );
    return row?.id ?? null;
  }

  /** Reverse lookup for invitations — internal bigint id → profile uuid. */
  async getUuidById(id: bigint): Promise<string | null> {
    const row = await this.dal.find<any, { uuid: string }>(
      UserProfileEntity,
      [Project.field(field(UserProfileEntity, "uuid" as any))],
      {
        filters: [Filter.fieldValue(field(UserProfileEntity, "id"), "=", id)] as any,
        deletedRecords: "INCLUDED",
        throwIfNotFound: false,
      },
    );
    return row?.uuid ?? null;
  }

  /** Casdoor identity triplet — MFA owner/name resolution. */
  async getIdpIdentityByUuid(
    uuid: string,
  ): Promise<{ idp_org?: string; idp_username?: string; idp_code?: string } | null> {
    return (await this.dal.find<any, { idp_org?: string; idp_username?: string; idp_code?: string }>(
      UserProfileEntity,
      [
        Project.field(field(UserProfileEntity, "idp_org" as any)),
        Project.field(field(UserProfileEntity, "idp_username" as any)),
        Project.field(field(UserProfileEntity, "idp_code" as any)),
      ],
      {
        filters: [Filter.fieldValue(field(UserProfileEntity, "uuid" as any), "=", uuid)] as any,
        deletedRecords: "INCLUDED",
        throwIfNotFound: false,
      },
    )) ?? null;
  }

  /** Session bootstrap pair — internal id + auth-method-enforcer flag. */
  async getSessionStateByUuid(
    uuid: string,
  ): Promise<{ id: bigint; auth_method_enforcer_dismissed: boolean } | null> {
    return (await this.dal.find<any, { id: bigint; auth_method_enforcer_dismissed: boolean }>(
      UserProfileEntity,
      [
        Project.field(field(UserProfileEntity, "id")),
        Project.field(field(UserProfileEntity, "auth_method_enforcer_dismissed" as any)),
      ],
      {
        filters: [Filter.fieldValue(field(UserProfileEntity, "uuid" as any), "=", uuid)] as any,
        deletedRecords: "INCLUDED",
        throwIfNotFound: false,
      },
    )) ?? null;
  }

  async getByIdpCode(idpCode: string): Promise<UserProfileDetailDto | null> {
    const row = await this.dal.find<any, any>(
      UserProfileEntity,
      null,
      {
        filters: [Filter.fieldValue(field(UserProfileEntity, "idp_code" as any), "=", idpCode)] as any,
        joins: [
          Join.on(
            field(UserProfileEntity, "uuid" as any),
            field(UserProfileEntity, "created_by" as any),
            "LEFT",
            { castRightTo: "text", castLeftTo: "text", alias: "creator" }
          ),
          Join.on(
            field(UserProfileEntity, "uuid" as any),
            field(UserProfileEntity, "updated_by" as any),
            "LEFT",
            { castRightTo: "text", castLeftTo: "text", alias: "updater" }
          ),
          Join.on(
            field(UserProfileEntity, "uuid" as any),
            field(UserProfileEntity, "deleted_by" as any),
            "LEFT",
            { castRightTo: "text", castLeftTo: "text", alias: "deleter" }
          ),
        ],
        throwIfNotFound: false,
      }
    );
    return row ? this.toDto(row) : null;
  }

  async getByEmail(email: string): Promise<UserProfileDetailDto | null> {
    const row = await this.dal.find<any, any>(
      UserProfileEntity,
      null,
      {
        filters: [Filter.fieldValue(field(UserProfileEntity, "email" as any), "=", email)] as any,
        joins: [
          Join.on(
            field(UserProfileEntity, "uuid" as any),
            field(UserProfileEntity, "created_by" as any),
            "LEFT",
            { castRightTo: "text", castLeftTo: "text", alias: "creator" }
          ),
          Join.on(
            field(UserProfileEntity, "uuid" as any),
            field(UserProfileEntity, "updated_by" as any),
            "LEFT",
            { castRightTo: "text", castLeftTo: "text", alias: "updater" }
          ),
          Join.on(
            field(UserProfileEntity, "uuid" as any),
            field(UserProfileEntity, "deleted_by" as any),
            "LEFT",
            { castRightTo: "text", castLeftTo: "text", alias: "deleter" }
          ),
        ],
        throwIfNotFound: false,
      }
    );
    return row ? this.toDto(row) : null;
  }

  // --- Profile writes --------------------------------------------------------

  async createProfile(data: {
    uuid: string;
    idp_code: string | null;
    email?: string | null;
    display_name?: string | null;
    idp_org?: string | null;
    idp_username?: string | null;
    avatar_color?: string;
    avatar_initials?: string;
    is_active: boolean;
    is_admin: boolean;
    is_verified: boolean;
    email_verified: boolean;
    issuer?: string | null;
    roles?: string[] | null;
    last_synced_at?: Date;
  }): Promise<void> {
    const actor = requireActor();
    await this.dal.add(
      UserProfileEntity,
      {
        uuid: data.uuid,
        idp_code: data.idp_code,
        email: data.email,
        display_name: data.display_name,
        idp_org: data.idp_org,
        idp_username: data.idp_username,
        avatar_color: data.avatar_color,
        avatar_initials: data.avatar_initials,
        is_active: data.is_active,
        is_admin: data.is_admin,
        is_verified: data.is_verified,
        email_verified: data.email_verified,
        issuer: data.issuer,
        roles: data.roles,
        last_synced_at: data.last_synced_at,
      },
      { actor, audit: this.auditPort }
    );
  }

  async updateProfile(
    uuid: string,
    body: { display_name?: string; email?: string; avatar_color?: string; is_active?: boolean; is_admin?: boolean; is_verified?: boolean; email_verified?: boolean; issuer?: string; roles?: string[]; last_synced_at?: Date; idp_code?: string; auth_method_enforcer_dismissed?: boolean; onboarding_completed?: boolean; version?: number },
    tx?: Repository
  ): Promise<UserProfileDetailDto> {
    const repo = tx ?? this.dal;
    // API path: `body.version` is the caller-observed version. If absent the
    // Repository.update() version guard throws ERR02 — we NEVER manufacture a
    // version by re-reading the row (that would elide the concurrency check).
    const row = await repo.update<UserProfileEntity, UserProfileDetailRow>(
      UserProfileEntity, { ...body, uuid },
      { actor: requireActor(), audit: new EntityAuditPort(repo) }
    );
    return this.toDto(row);
  }

  /**
   * INTERNAL write path — session/Casdoor sync stamps that do not carry a
   * caller-observed version. Reads the current row version DB-first, then
   * updates. NEVER call this from an API route.
   */
  async updateProfileInternal(
    uuid: string,
    body: { display_name?: string; email?: string; avatar_color?: string; is_active?: boolean; is_admin?: boolean; is_verified?: boolean; email_verified?: boolean; issuer?: string; roles?: string[]; last_synced_at?: Date; idp_code?: string; auth_method_enforcer_dismissed?: boolean; onboarding_completed?: boolean },
    tx?: Repository
  ): Promise<UserProfileDetailDto> {
    const repo = tx ?? this.dal;
    const version = (await this.freshRowByUuid(uuid, repo))!.version;
    const row = await repo.update<UserProfileEntity, UserProfileDetailRow>(
      UserProfileEntity, { ...body, uuid, version },
      { actor: requireActor(), audit: new EntityAuditPort(repo) }
    );
    return this.toDto(row);
  }

  /**
   * Update a user profile by its numeric id (alternative to `updateProfile` which
   * uses uuid). Used by flows that have the `id` from a foreign key (e.g.
   * `invitation.user_profile_id`).
   */
  async updateProfileById(
    id: bigint | number,
    body: { display_name?: string; email?: string; avatar_color?: string; is_active?: boolean; is_admin?: boolean; is_verified?: boolean; email_verified?: boolean; issuer?: string; roles?: string[]; last_synced_at?: Date; idp_code?: string; auth_method_enforcer_dismissed?: boolean; onboarding_completed?: boolean; version?: number }
  ): Promise<UserProfileDetailDto> {
    // Internal FK-driven write — the read below is the observation step of this
    // unit of work (the caller legitimately has `id`, not a prior version).
    const version = body.version ?? (await this.dal.find<UserProfileEntity, UserProfileEntity>(
      UserProfileEntity,
      null,
      { filters: [Filter.fieldValue(field(UserProfileEntity, "id" as any), "=", typeof id === "number" ? BigInt(id) : id)] as any, deletedRecords: "INCLUDED" }
    ))!.version;
    const row = await this.dal.update<UserProfileEntity, UserProfileDetailRow>(
      UserProfileEntity, { ...body, id, version }, { actor: requireActor(), audit: this.auditPort }
    );
    return this.toDto(row);
  }

  // DB-first read — `findByUUID`/`findById` may serve a stale cached row
  // (@Cached entities) whose `version` would trip the optimistic-concurrency
  // guard (ERR01) on the write that follows.
  private async freshRowByUuid(uuid: string, repo?: Pick<Repository, "find">): Promise<UserProfileEntity> {
    return (await (repo ?? this.dal).find<UserProfileEntity, UserProfileEntity>(UserProfileEntity, null, {
      filters: [Filter.fieldValue(field(UserProfileEntity, "uuid" as any), "=", uuid)] as any,
      deletedRecords: "INCLUDED",
    }))!;
  }

  async softDeleteProfile(uuid: string, version: number): Promise<UserProfileDetailDto> {
    const row = await this.dal.delete<UserProfileEntity, UserProfileDetailRow>(
      UserProfileEntity, { uuid, version }, { actor: requireActor(), audit: this.auditPort }
    );
    return this.toDto(row);
  }

  /**
   * Restore a soft-deleted profile. Overrides `svc.restore` — same signature —
   * returning the joined + DTO-mapped row (audit display names, ISO dates).
   */
  override async restore(uuid: string, version: number): Promise<UserProfileDetailDto> {
    const row = await this.dal.restore<UserProfileEntity, UserProfileDetailRow>(
      UserProfileEntity, { uuid, version }, { actor: requireActor(), audit: this.auditPort }
    );
    return this.toDto(row);
  }

  // --- Audit -----------------------------------------------------------------

  private enrichAuditDeltaWithDisplayNames(
    delta: Record<string, any>,
    changedByName: string | null
  ): Record<string, any> {
    const enriched = { ...delta };
    const auditFields = ['created_by', 'updated_by', 'deleted_by'];

    for (const f of auditFields) {
      if (f in enriched) {
        const change = enriched[f];

        // Add display_name alongside GUID if available
        if (changedByName && this.isUuid(change.new)) {
          change.new_display_name = changedByName;
        }
        if (changedByName && this.isUuid(change.old)) {
          change.old_display_name = changedByName;
        }
      }
    }

    return enriched;
  }

  private isUuid(value: any): boolean {
    return typeof value === 'string' && /^[0-9a-fA-F-]{36}$/.test(value);
  }

  async getUserProfileAudit(uuid: string, page: number, limit: number) {
    const result = await findAuditPage(this.dal, {
      tableName: "user_profiles_audit",
      entityUuid: uuid,
      page,
      limit,
    });

    return {
      data: result.data.map((row) => ({
        id: row.id.toString(),
        entity_uuid: row.entity_uuid,
        action: row.action,
        changed_at: row.changed_at,
        changed_by: row.changed_by,
        changed_by_name: row.changed_by_display_name,
        version: row.version,
        delta: this.enrichAuditDeltaWithDisplayNames(row.delta as Record<string, any>, row.changed_by_display_name),
      })),
      pagination: result.pagination,
    };
  }

  // --- Admin list -------------------------------------------------------------

  async listUsers(query: UserListQuery): Promise<UserListResponse> {
    const {
      search,
      search_in,
      sort_key,
      sort_dir = "asc",
      page = 1,
      page_size = 25,
      filters,
      connector = "AND",
      deleted_records = "EXCLUDED",
    } = query;

    // Build base filters
    const baseFilters: FilterExpr[] = [];

    // Deletion filter
    if (deleted_records === "ONLY") {
      baseFilters.push(Filter.fieldValue(field(UserProfileEntity, "deleted_at" as any), "IS NOT", null));
    } else if (deleted_records === "EXCLUDED") {
      baseFilters.push(Filter.fieldValue(field(UserProfileEntity, "deleted_at" as any), "IS", null));
    }

    // Search filter
    if (search && search.trim()) {
      const searchFields =
        search_in && search_in.length > 0
          ? search_in.filter((f) => SEARCH_IN_ALLOWED.has(f))
          : DEFAULT_SEARCH_KEYS;
      const searchFilters = searchFields.map((f) =>
        Filter.fieldValue(field(UserProfileEntity, f as any), "ILIKE", `%${search}%`)
      );
      // A `search_in` scope that survives the allowlist as empty must not
      // render an empty OR group — it would produce `()` in SQL (500).
      if (searchFilters.length > 0) {
        baseFilters.push(Filter.group(searchFilters, "OR"));
      }
    }

    // Custom filters
    if (filters && filters.length > 0) {
      const translatedFilters = translateFilterConditions(UserProfileEntity, filters, { allowedFields: USER_PROFILE_FILTERABLE_FIELDS, connector });
      if (translatedFilters) {
        baseFilters.push(...translatedFilters);
      }
    }

    const sort_key_final = (sort_key ?? "created_at") as keyof UserProfileDetailRow & string;
    const sort_dir_final = (sort_dir ?? "desc").toUpperCase() === "ASC" ? "ASC" : "DESC";
    const sorting = [Sort.by(field(UserProfileEntity, sort_key_final as any), sort_dir_final as any)];

    const result = await this.dal.findByPage<UserProfileDetailRow, UserProfileDetailRow>(
      UserProfileEntity,
      page,
      page_size,
      null,
      {
        filters: baseFilters.length > 0 ? baseFilters : undefined,
        sorting,
        deletedRecords: deleted_records as any,
        joins: buildAuditableJoins(UserProfileEntity, UserProfileEntity),
      }
    );

    return {
      rows: result.entities.map((r) => this.toDto(r)),
      page,
      page_size,
      total: result.total_records,
    };
  }

  // --- JIT provisioning -------------------------------------------------------

  /**
   * Return the internal Primebrick UUID for the given IDP subject, creating a
   * `user_profiles` row on first encounter.
   *
   * The auth middleware calls this on every authenticated request to map the
   * IDP `sub` to our internal Primebrick UUID. The first time a user appears
   * we INSERT a new row; subsequent calls hit the Redis cache and never touch
   * the DB.
   *
   * The cache only stores the `idp_code → uuid` mapping (never claims), so
   * stale values are not a security risk. TTL is 5 minutes — we want changes
   * to email / display_name on the IDP side to propagate within a few minutes.
   *
   * If Redis is disabled (redis_url empty or unreachable), every call hits
   * the DB — best-effort, the system is fully valid without Redis.
   *
   * Concurrency:
   *   The INSERT is a pure INSERT (find→NULL above proved absence). A
   *   concurrent first-login for the same idp_code loses the race with a
   *   unique violation — visible failure, correct per the optimistic-
   *   concurrency contract.
   */
  async resolveInternalUuid(input: ResolveInput): Promise<string> {
    // 1. Check Redis cache
    const port = getCachePort();
    if (port) {
      try {
        const cached = await port.get<string>(idpCodeCacheKey(input.idp_code));
        if (cached) return cached;
      } catch (e) {
        logger.warn(`user_profiles get failed: ${e}`, { tags: ["auth"] });
      }
    }

    // 2. Try a fast SELECT first — most requests hit existing users.
    const row = await this.dal.find<UserProfileEntity, { uuid: string; idp_org?: string; idp_username?: string; version?: number }>(
      UserProfileEntity,
      [
        { kind: "field", field: field(UserProfileEntity, "uuid" as any) },
        { kind: "field", field: field(UserProfileEntity, "idp_org" as any) },
        { kind: "field", field: field(UserProfileEntity, "idp_username" as any) },
        { kind: "field", field: field(UserProfileEntity, "version" as any) },
      ],
      {
        filters: [Filter.fieldValue(field(UserProfileEntity, "idp_code" as any), "=", input.idp_code)],
        throwIfNotFound: false,
      }
    );

    if (row) {
      // Sync idp_org and idp_username if they differ from input (keeps Casdoor sync reliable)
      const needsUpdate =
        (input.idp_org !== undefined && input.idp_org !== null && row.idp_org !== input.idp_org) ||
        (input.idp_username !== undefined && input.idp_username !== null && row.idp_username !== input.idp_username);
      if (needsUpdate) {
        const updates: Record<string, unknown> = { idp_code: input.idp_code, version: row.version };
        if (input.idp_org !== undefined && input.idp_org !== null) {
          updates.idp_org = input.idp_org;
        }
        if (input.idp_username !== undefined && input.idp_username !== null) {
          updates.idp_username = input.idp_username;
        }
        await this.dal.update(
          UserProfileEntity,
          updates,
          { actor: row.uuid, matchBy: "idp_code", audit: this.auditPort }
        );
      }
      // 3. Cache the result in Redis
      if (port) {
        try {
          await port.set(idpCodeCacheKey(input.idp_code), row.uuid, USER_PROFILE_CACHE_TTL_MS);
        } catch (e) {
          logger.warn(`user_profiles set failed: ${e}`, { tags: ["auth"] });
        }
      }
      return row.uuid;
    }

    // 4. Not found → just-in-time provisioning. The user that performs the very
    // first auth bootstraps their own profile, hence `actor = newUuid`.
    const newUuid = randomUUID();

    // find→NULL above proved absence → this is a pure INSERT. A concurrent
    // first-login for the same idp_code loses the race with a unique violation —
    // visible failure, correct per the optimistic-concurrency contract.
    const inserted = await this.dal.add(
      UserProfileEntity,
      {
        uuid: newUuid,
        idp_code: input.idp_code,
        email: input.email,
        display_name: input.display_name,
        idp_org: input.idp_org,
        idp_username: input.idp_username,
      },
      { actor: newUuid, audit: this.auditPort }
    );

    const uuid = (inserted as any)?.uuid ?? newUuid;
    // 5. Cache the result in Redis
    if (port) {
      try {
        await port.set(idpCodeCacheKey(input.idp_code), uuid, USER_PROFILE_CACHE_TTL_MS);
      } catch (e) {
        logger.warn(`user_profiles set failed: ${e}`, { tags: ["auth"] });
      }
    }
    return uuid;
  }

  // --- Create ---------------------------------------------------------------

  /**
   * Active password policy loaded from auth config — used by controllers to
   * build dynamic validation schemas (no direct config access in
   * controllers).
   */
  async getPasswordPolicy(): Promise<PasswordPolicy> {
    const cfg = await getConfigEntriesService().loadAuthConfigOnly();
    return parsePasswordPolicy(cfg.password_policy!);
  }

  async createUser(input: CreateUserBody): Promise<CreateUserResult> {
    const actor = requireActor();
    const { username, password, display_name, email, roles, avatar_initials, avatar_color, idp_org, is_active, is_admin, is_verified, email_verified, send_invitation } = input;

    const calculatedInitials = avatar_initials || computeInitials(display_name);
    const defaultColor = avatar_color || avatarPaletteHex(calculatedInitials);

    // 1. Create in Casdoor (if configured)
    const cdClient = await this.casdoor.getClient();
    const cfg = await getAuthConfig();
    let casdoorUserId: string | null = null;
    let idpOrg = idp_org || cfg.idp_organization!;
    let idpUsername = username;

    if (cdClient) {
      const { generateHexagonAvatarSvg } = await import("../avatar-svg-generator.js");
      const svgDataUri = generateHexagonAvatarSvg(calculatedInitials, defaultColor);

      const newUser = await cdClient.addUser({
        owner: idpOrg,
        name: username,
        displayName: display_name,
        email,
        // When send_invitation is true, password is optional — Casdoor will
        // create the user without a password, and the user will set it via
        // the welcome page. We pass a random placeholder if no password is
        // provided, because Casdoor requires a non-empty password field.
        password: password || (send_invitation ? randomBytes(16).toString("hex") : undefined),
        roles: (roles || []).map((r) => ({ name: r })),
        customFields: {
          app_avatar_color: defaultColor,
          app_avatar_shape: "hexagon",
          app_avatar_letters: calculatedInitials,
        },
        avatar: svgDataUri,
        isForbidden: !is_active,
        isAdmin: is_admin,
        isVerified: is_verified,
        emailVerified: email_verified,
      });
      if (!newUser || !newUser.id) {
        throw new ApiError(
          "/errors/internal-error",
          "Failed to create user",
          500,
          "Casdoor™ user creation did not return a UUID",
          { internal_code: "USER_CREATE_FAILED", severity: "HIGH" },
        );
      }
      casdoorUserId = newUser.id;
      idpOrg = newUser.owner || cfg.idp_organization!;
      idpUsername = newUser.name || username;

      // Link the user into each assigned role's `users` list — Casdoor only
      // emits the JWT `roles` claim for users present there. The `roles`
      // field on the user object alone leaves the token role-less and the
      // login fails with user_no_permission.
      const userKey = `${idpOrg}/${idpUsername}`;
      for (const roleName of roles ?? []) {
        const linked = await cdClient.addUserToRole(userKey, roleName, idpOrg);
        if (!linked) {
          throw new ApiError(
            "/errors/internal-error",
            "Failed to create user",
            500,
            `Casdoor™ role assignment failed for role "${roleName}"`,
            { internal_code: "USER_ROLE_ASSIGN_FAILED", severity: "HIGH" },
          );
        }
      }
    }

    // 2. Create local profile via DAL (repo.add — no manual audit field setting)
    const idpCode = casdoorUserId;
    const newUuid = randomUUID();
    const issuer = cfg.idp_endpoint || null;

    await this.createProfile({
      uuid: newUuid,
      idp_code: idpCode,
      email,
      display_name,
      idp_org: idpOrg,
      idp_username: idpUsername,
      avatar_color: defaultColor,
      avatar_initials: calculatedInitials,
      is_active,
      is_admin,
      is_verified,
      email_verified,
      issuer,
      roles: roles ?? null,
      last_synced_at: new Date(),
    });

    const profile = await this.getByUuid(newUuid);
    if (!profile) {
      // Should never happen — we just inserted it.
      throw new ApiError(
        "/errors/internal-error",
        "Failed to create user",
        500,
        "Local profile was not found after insert",
        { internal_code: "USER_CREATE_FAILED", severity: "HIGH" },
      );
    }

    // 3. Create invitation if send_invitation is true
    let invitation_uuid: string | undefined;
    if (send_invitation) {
      // Get the internal bigint id of the profile (not exposed in the DTO)
      const profileId = await this.getIdByUuid(newUuid);
      if (!profileId) {
        throw new ApiError(
          "/errors/internal-error",
          "Failed to create invitation",
          500,
          "Could not resolve user profile id after insert",
          { internal_code: "INVITATION_CREATE_FAILED", severity: "HIGH" },
        );
      }

      const invitationService = new InvitationService(this.casdoor);
      const result = await invitationService.createInvitation(
        BigInt(profileId),
        profile.uuid,
        email,
        display_name,
      );
      invitation_uuid = result.invitation_uuid;
    }

    return { profile, invitation_uuid };
  }

  // --- Delete (soft) --------------------------------------------------------

  async deleteUser(uuid: string, version: number): Promise<UserProfileDetailDto> {
    const existing = await this.getByUuid(uuid);
    if (!existing) {
      throw new NotFoundError("User profile not found in database", { internal_code: "USER_NOT_FOUND" });
    }

    // CRITICAL ordering (fail-closed): disable the IdP user FIRST.
    // If Casdoor fails → nothing changed locally, the operation errors out.
    // If the local soft-delete then fails (ERR01/ERR03) → the IdP user stays
    // disabled while the profile is still alive: locked out, but no security
    // hole — and a retry of the delete is idempotent.
    const cdClient = await this.casdoor.getClient();
    if (cdClient) {
      try {
        await cdClient.updateUser({
          id: existing.idp_code,
          owner: existing.idp_org || undefined,
          name: existing.idp_username || undefined,
          isForbidden: true,
        } as any);
      } catch (syncError) {
        throw new ApiError(
          "/errors/internal-error",
          "Casdoor™ sync failed",
          502,
          "Failed to disable user in Casdoor™ — local delete NOT performed",
          {
            instance: "/api/v1/auth/users/:uuid",
            internal_code: "CASDOOR_SYNC_FAILED",
            severity: "HIGH",
            extra: { casdoor_user_id: existing.idp_code, cause: String(syncError) },
          },
        );
      }
    }

    return await this.softDeleteProfile(uuid, version);
  }

  // --- Restore (un-soft-delete) --------------------------------------------

  private async getByUuidIncludingDeleted(uuid: string): Promise<UserProfileDetailDto | null> {
    const row = await this.dal.find<any, any>(
      UserProfileEntity,
      null,
      {
        filters: [Filter.fieldValue(field(UserProfileEntity, "uuid" as any), "=", uuid)] as any,
        joins: buildAuditableJoins(UserProfileEntity, UserProfileEntity),
        deletedRecords: "INCLUDED",
        throwIfNotFound: false,
      }
    );
    return row ? this.toDto(row) : null;
  }

  async restoreUser(uuid: string, version: number): Promise<UserProfileDetailDto> {
    // The record being restored IS soft-deleted — the lookup must include
    // tombstoned rows or the existence check 404s on every restore.
    const existing = await this.getByUuidIncludingDeleted(uuid);
    if (!existing) {
      throw new NotFoundError("User profile not found in database", { internal_code: "USER_NOT_FOUND" });
    }

    // CRITICAL ordering (fail-closed): restore locally FIRST, then re-enable
    // the IdP user. If Casdoor re-enable fails → the profile is restored but
    // the IdP user stays forbidden (locked out, no security hole) and the
    // caller sees the failure — a retry re-attempts the re-enable.
    const restored = await this.restore(uuid, version);

    const cdClient = await this.casdoor.getClient();
    if (cdClient) {
      try {
        await cdClient.updateUser({
          id: existing.idp_code,
          owner: existing.idp_org || undefined,
          name: existing.idp_username || undefined,
          isForbidden: false,
        } as any);
      } catch (syncError) {
        throw new ApiError(
          "/errors/internal-error",
          "Casdoor™ sync failed",
          502,
          "Profile restored locally but Casdoor™ re-enable failed — user remains forbidden at the IdP; retry the restore",
          {
            instance: "/api/v1/auth/users/:uuid/restore",
            internal_code: "CASDOOR_SYNC_FAILED",
            severity: "HIGH",
            extra: { casdoor_user_id: existing.idp_code, cause: String(syncError) },
          },
        );
      }
    }

    return restored;
  }

  // --- Entity CRUD (admin surface) -----------------------------------------

  async getUserByUuid(uuid: string): Promise<UserProfileDetailDto> {
    const user = await this.getByUuid(uuid);
    if (!user) {
      throw new NotFoundError("User profile not found in database", { internal_code: "USER_NOT_FOUND" });
    }
    return user;
  }

  /**
   * Admin-side profile update (`PUT /api/v1/entities/user_profile/:uuid`).
   * Syncs display_name / email / avatar / roles to Casdoor first (non-best-
   * effort), then updates the local DB.
   */
  async updateUserProfile(uuid: string, body: UserUpdateBody, tx?: Repository): Promise<UserProfileDetailDto> {
    const profile = await this.getByUuid(uuid);
    if (!profile) {
      throw new NotFoundError("User profile not found in database", { internal_code: "USER_NOT_FOUND" });
    }

    const cdClient = await this.casdoor.getClient();
    const syncTimestamp = new Date();
    if (cdClient) {
      let svgDataUri: string | undefined;
      if (body.avatar_color && body.avatar_initials) {
        const { generateHexagonAvatarSvg } = await import("../avatar-svg-generator.js");
        svgDataUri = generateHexagonAvatarSvg(body.avatar_initials, body.avatar_color);
      }

      const syncSuccess = await cdClient.updateUser({
        id: profile.idp_code,
        owner: profile.idp_org || undefined,
        name: profile.idp_username || undefined,
        displayName: body.display_name || profile.display_name,
        email: body.email || profile.email,
        customFields: {
          app_avatar_color: body.avatar_color || profile.avatar_color,
          app_avatar_shape: "hexagon",
          app_avatar_letters: body.avatar_initials || profile.avatar_initials,
        },
        ...(svgDataUri && { avatar: svgDataUri }),
      } as any);

      if (!syncSuccess) {
        throw new ApiError(
          "/errors/internal-error",
          "Casdoor™ sync failed",
          502,
          "Failed to sync profile to Casdoor™",
          {
            instance: "/api/v1/entities/user_profile/:uuid",
            internal_code: "CASDOOR_SYNC_FAILED",
            severity: "HIGH",
          },
        );
      }
    }

    // Caller-observed version forwarded as-is — the DAL enforces ERR02/ERR01.
    const updateBody: Record<string, unknown> = { last_synced_at: syncTimestamp, version: body.version };
    if (body.display_name !== undefined) updateBody.display_name = body.display_name;
    if (body.email !== undefined) updateBody.email = body.email || undefined;
    if (body.avatar_color !== undefined) updateBody.avatar_color = body.avatar_color;
    if (body.avatar_initials !== undefined) updateBody.avatar_initials = body.avatar_initials;
    // Casdoor-compatible column format (roles stored as stringified JSON —
    // extJson is byte-identical here and bigint-safe should one slip in).
    if (body.roles !== undefined) updateBody.roles = extJsonStringify(body.roles);

    // The write response IS the new observation — no follow-up GET.
    return await this.updateProfile(uuid, updateBody as any, tx);
  }

  // --- Password change ------------------------------------------------------

  /**
   * Change a user's password in Casdoor.
   * Returns the raw Casdoor response so the router can check `status === "ok"`.
   * Throws ApiError if the user is not found or Casdoor is unreachable.
   */
  async changePassword(uuid: string, newPassword: string): Promise<{ status: string; success?: boolean; msg?: string }> {
    const existing = await this.getByUuid(uuid);
    if (!existing) {
      throw new NotFoundError("User profile not found in database", { internal_code: "USER_NOT_FOUND" });
    }

    const cdClient = await this.casdoor.getClient();
    if (!cdClient) {
      throw new ApiError(
        "/errors/internal-error",
        "Casdoor™ client unavailable",
        502,
        "Cannot change password: Casdoor™ is not configured or unreachable",
        { internal_code: "CASDOOR_UNAVAILABLE", severity: "HIGH" },
      );
    }

    const result = await cdClient.changePassword(
      { id: existing.idp_code, owner: existing.idp_org || undefined, name: existing.idp_username || undefined },
      newPassword,
    );

    if (result.status !== "ok") {
      throw new ApiError(
        "/errors/internal-error",
        "Casdoor™ password change failed",
        502,
        result.msg || "Casdoor™ returned an error",
        { internal_code: "CASDOOR_PASSWORD_CHANGE_FAILED", severity: "HIGH" },
      );
    }

    // Send password_changed notification email (best-effort)
    if (existing.email) {
      try {
        const invitationService = new InvitationService(this.casdoor);
        const alertLink = await invitationService.generateAlertLink(existing.uuid, "password-change");
        const adminMailto = await invitationService.generateAdminMailto(
          existing.display_name ?? "",
          existing.email ?? "",
        );
        await sendEmail({
          template_code: "password_changed",
          language_iso: "en",
          to: [existing.email],
          variables: {
            display_name: existing.display_name ?? "",
            alert_link: alertLink,
            admin_mailto: adminMailto,
          },
        });
      } catch (emailErr) {
        logger.error("Failed to send password_changed email:", { tags: ["auth"], error: emailErr });
      }
    }

    return result;
  }

  /**
   * Self-service password change for the authenticated user.
   * Verifies the current password against Casdoor before allowing the change.
   * Sends a `password_changed` notification email on success.
   */
  async changeOwnPassword(
    userProfileUuid: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ status: string; success?: boolean; msg?: string }> {
    const existing = await this.getByUuid(userProfileUuid);
    if (!existing) {
      throw new NotFoundError("User profile not found in database", { internal_code: "USER_NOT_FOUND" });
    }

    const cdClient = await this.casdoor.getClient();
    if (!cdClient) {
      throw new ApiError(
        "/errors/internal-error",
        "Casdoor™ client unavailable",
        502,
        "Cannot change password: Casdoor™ is not configured or unreachable",
        { internal_code: "CASDOOR_UNAVAILABLE", severity: "HIGH" },
      );
    }

    // Step 1: verify current password
    const checkResult = await cdClient.checkUserPassword(
      { id: existing.idp_code, owner: existing.idp_org || undefined, name: existing.idp_username || undefined },
      currentPassword,
    );

    if (checkResult.status !== "ok") {
      throw new ApiError(
        "/errors/wrong-password",
        "Current password is incorrect",
        400,
        "The current password verification failed",
        { internal_code: "WRONG_PASSWORD", severity: "LOW" },
      );
    }

    // Step 2: change the password
    const result = await cdClient.changePassword(
      { id: existing.idp_code, owner: existing.idp_org || undefined, name: existing.idp_username || undefined },
      newPassword,
    );

    if (result.status !== "ok") {
      throw new ApiError(
        "/errors/internal-error",
        "Casdoor™ password change failed",
        502,
        result.msg || "Casdoor™ returned an error",
        { internal_code: "CASDOOR_PASSWORD_CHANGE_FAILED", severity: "HIGH" },
      );
    }

    // Step 3: send notification email (best-effort)
    if (existing.email) {
      try {
        const invitationService = new InvitationService(this.casdoor);
        const alertLink = await invitationService.generateAlertLink(existing.uuid, "password-change");
        const adminMailto = await invitationService.generateAdminMailto(
          existing.display_name ?? "",
          existing.email ?? "",
        );
        await sendEmail({
          template_code: "password_changed",
          language_iso: "en",
          to: [existing.email],
          variables: {
            display_name: existing.display_name ?? "",
            alert_link: alertLink,
            admin_mailto: adminMailto,
          },
        });
      } catch (emailErr) {
        logger.error("Failed to send password_changed email:", { tags: ["auth"], error: emailErr });
      }
    }

    return result;
  }

  // --- Availability checks --------------------------------------------------

  /**
   * Check whether an email is already in use. Returns the existing user's UUID
   * when taken, or `null` when available.
   */
  async checkEmailAvailability(email: string): Promise<{ available: boolean; existingUuid?: string }> {
    const existing = await this.getByEmail(email);
    if (existing) {
      return { available: false, existingUuid: existing.uuid };
    }
    return { available: true };
  }

  /**
   * Check whether a username is already taken within an org (org-scoped
   * uniqueness, matching Casdoor's idp_owner/idp_name model). Also checks
   * Casdoor directly to catch users synced from Casdoor but not yet in the
   * local DB.
   */
  async checkUsernameAvailability(
    username: string,
    idpOrg: string,
  ): Promise<{ available: boolean; existingUuid?: string; existsInCasdoor?: boolean }> {
    const result = await this.listUsers({
      filters: [
        { field: "idp_username", op: "=", value: username },
        { field: "idp_org", op: "=", value: idpOrg },
      ],
      connector: "AND",
      page: 1,
      page_size: 1,
      deleted_records: "EXCLUDED",
    });

    if (result.rows.length > 0) {
      return { available: false, existingUuid: result.rows[0]!.uuid };
    }

    // Check Casdoor for users not yet provisioned locally.
    const cdClient = await this.casdoor.getClient();
    if (cdClient) {
      const casdoorQueryId = `${idpOrg}/${username}`;
      const casdoorUser = await cdClient.getUser(casdoorQueryId);
      if (casdoorUser) {
        return { available: false, existsInCasdoor: true };
      }
    }

    return { available: true };
  }
}

// --- helpers ---------------------------------------------------------------

// Avatar fallback palette — MUST mirror the FE palette in
// primebrick-fe-v3/src/lib/avatar-chrome-palette.ts (same 10 hexes, same
// index hashing) so server-defaulted colors match client-rendered ones.
const AVATAR_PALETTE_HEXES = [
  "#0284c7", "#059669", "#7c3aed", "#e11d48", "#4f46e5",
  "#0e7490", "#c026d3", "#0d9488", "#1d4ed8", "#ea580c",
] as const;

/** Deterministic palette color for a seed (avatar_initials). Same hash as
 * the FE `hashSeedToIndex` — a user keeps the same color everywhere. */
export function avatarPaletteHex(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return AVATAR_PALETTE_HEXES[(h >>> 0) % AVATAR_PALETTE_HEXES.length]!;
}

/** Compute 1-2 letter initials from a display name. Pure function, no I/O. */
export function computeInitials(displayName?: string): string {
  if (!displayName) return "??";
  const words = displayName.trim().split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 0) return "??";
  const firstLetter = words[0]![0]!.toUpperCase();
  if (words.length > 1) {
    const lastLetter = words[words.length - 1]![0]!.toUpperCase();
    return firstLetter + lastLetter;
  }
  return words[0]!.slice(0, 2).toUpperCase() || firstLetter;
}

// ─── Singleton ──────────────────────────────────────────────────────────────

let instance: UserService | undefined;

/**
 * Lazy singleton accessor — the first call happens inside request handling,
 * always post-bootstrap, so `getDal()` is already initialized. A module-level
 * `new` would crash the import graph before `initDal()` runs.
 *
 * Callers that arrive through `wiring.ts` may inject their own instance;
 * cross-module consumers (dispatch, ports, sibling services) use this.
 */
export function getUserService(): UserService {
  return (instance ??= new UserService(new CasdoorService()));
}

/** Test helper: clear the user profile cache. With Redis, this is a no-op
 * (tests should use a FakeCachePort or mock). Kept for backward compat. */
export function resetUserProfileCacheForTest(): void {
  // No-op — the in-memory Map is gone. Tests that need cache isolation should
  // either disable Redis (no redis_url) or use a FakeCachePort.
}
