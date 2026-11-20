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
import { randomBytes } from "node:crypto";
import {
  entityDateToApiIso,
  type Repository,
  field, Filter, Join,
  buildAuditableJoins,
  type WithAuditableDisplayNames,
  newUuidV7,
} from "@primebrick/dal-pg";

import { DomainService } from "../../../db/domain-service.js";
import { getCachePort } from "../../../cache/cache-port-holder.js";
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

const USER_PROFILE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

function idpCodeCacheKey(idpCode: string): string {
  return `be:user_profiles:idp_code:${idpCode}`;
}

// ─── Types ───────────────────────────────────────────────────────────────────

/** Writable profile columns accepted by the internal update paths
 *  (API update, session sync, dedicated actions). Renamed `idp_*` mirrors
 *  stay out of user-supplied updates — dedicated write paths set them. */
export type UserProfileWriteBody = {
  display_name?: string;
  email?: string;
  avatar_color?: string;
  avatar_initials?: string;
  idp_is_admin?: boolean;
  idp_is_verified?: boolean;
  idp_email_verified?: boolean;
  idp_issuer?: string;
  roles?: string[];
  last_synced_at?: Date;
  idp_code?: string;
  auth_method_enforcer_dismissed?: boolean;
  onboarding_completed?: boolean;
  suspended_at?: Date | null;
  suspended_by?: string | null;
  version?: number;
};

export type UserProfileDetailRow = WithAuditableDisplayNames<{
  uuid: string;
  idp_code: string;
  email?: string;
  display_name?: string;
  avatar_color?: string;
  avatar_initials?: string;
  idp_is_admin: boolean;
  idp_is_verified: boolean;
  idp_email_verified: boolean;
  idp_issuer?: string;
  suspended_at?: Date;
  suspended_by?: string;
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
        meta: userProfileMeta,
        defaultSort: { key: "created_at", dir: "desc" },
      },
    });
  }

  // --- Profile reads ---------------------------------------------------------

  private toDto(r: UserProfileDetailRow): UserProfileDetailDto {
    // `dal.find*` reads return DB rows (timestamptz → Date); `svc.*`
    // writes return WIRE rows — the entity-service DTO step already
    // serialized dates to ISO. Normalize both; the row spread above can
    // carry either shape.
    const iso = (v: unknown): string | undefined =>
      v instanceof Date ? entityDateToApiIso(v) : typeof v === "string" ? v : undefined;
    return {
      ...r,
      created_at: iso(r.created_at)!,
      updated_at: iso(r.updated_at)!,
      deleted_at: iso(r.deleted_at),
    };
  }

  async getByUuid(uuid: string): Promise<UserProfileDetailDto | null> {
    const row = await this.svc.get(uuid, { throwIfNotFound: false });
    return row ? this.toDto(row as never) : null;
  }

  /**
   * Light existence check — sibling services (MFA, sessions, invitations,
   * webauthn) verify the profile exists before child-table writes.
   * Boolean probe — `SELECT EXISTS(SELECT 1 …)`, no row materialized.
   */
  async assertExistsByUuid(uuid: string): Promise<boolean> {
    return this.svc.exists({
      filters: [Filter.fieldValue(field(UserProfileEntity, "uuid" as any), "=", uuid)] as any,
    });
  }

  /** Casdoor identity triplet — MFA owner/name resolution. */
  async getIdpIdentityByUuid(
    uuid: string,
  ): Promise<{ idp_org?: string; idp_username?: string; idp_code?: string } | null> {
    const row = await this.svc.get(uuid, {
      deletedRecords: "INCLUDED",
      throwIfNotFound: false,
    });
    return row
      ? { idp_org: row.idp_org as string | undefined, idp_username: row.idp_username as string | undefined, idp_code: row.idp_code as string | undefined }
      : null;
  }

  /** Session bootstrap pair — profile uuid + auth-method-enforcer flag. */
  async getSessionStateByUuid(
    uuid: string,
  ): Promise<{ uuid: string; auth_method_enforcer_dismissed: boolean } | null> {
    const row = await this.svc.get(uuid, {
      deletedRecords: "INCLUDED",
      throwIfNotFound: false,
    });
    return row
      ? { uuid: row.uuid as string, auth_method_enforcer_dismissed: (row as Record<string, unknown>).auth_method_enforcer_dismissed as boolean }
      : null;
  }

  async getByIdpCode(idpCode: string): Promise<UserProfileDetailDto | null> {
    const row = await this.svc.find<any>(
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
    const row = await this.svc.find<any>(
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
    idp_is_admin: boolean;
    idp_is_verified: boolean;
    idp_email_verified: boolean;
    idp_issuer?: string | null;
    roles?: string[] | null;
    last_synced_at?: Date;
  }): Promise<void> {
    await this.svc.create({
      uuid: data.uuid,
      idp_code: data.idp_code,
      email: data.email,
      display_name: data.display_name,
      idp_org: data.idp_org,
      idp_username: data.idp_username,
      avatar_color: data.avatar_color,
      avatar_initials: data.avatar_initials,
      idp_is_admin: data.idp_is_admin,
      idp_is_verified: data.idp_is_verified,
      idp_email_verified: data.idp_email_verified,
      idp_issuer: data.idp_issuer,
      roles: data.roles,
      last_synced_at: data.last_synced_at,
    });
  }

  async updateProfile(
    uuid: string,
    body: UserProfileWriteBody,
    tx?: Repository
  ): Promise<UserProfileDetailDto> {
    // API path: `body.version` is the caller-observed version. If absent the
    // update's version guard throws ERR02 — we NEVER manufacture a
    // version by re-reading the row (that would elide the concurrency check).
    const row = await this.svc.update(
      uuid, { ...body } as Record<string, unknown> & { version: number }, tx,
    );
    return this.toDto(row as never);
  }

  /**
   * INTERNAL write path — session/Casdoor sync stamps that do not carry a
   * caller-observed version. Reads the current row version DB-first, then
   * updates. NEVER call this from an API route.
   */
  async updateProfileInternal(
    uuid: string,
    body: UserProfileWriteBody,
    tx?: Repository
  ): Promise<UserProfileDetailDto> {
    const version = (await this.freshRowByUuid(uuid, tx)).version;
    const row = await this.svc.update(
      uuid, { ...body, version } as Record<string, unknown> & { version: number }, tx,
    );
    return this.toDto(row as never);
  }

  /**
   * Update a user profile by its uuid. Used by flows that have the profile
   * uuid from a foreign key (e.g. `invitation.user_profile_uuid`).
   */
  async updateProfileByUuid(
    uuid: string,
    body: UserProfileWriteBody
  ): Promise<UserProfileDetailDto> {
    // Internal FK-driven write — the read below is the observation step of this
    // unit of work (the caller legitimately has `uuid`, not a prior version).
    const version = body.version ?? (await this.freshRowByUuid(uuid)).version;
    const row = await this.svc.update(
      uuid, { ...body, version } as Record<string, unknown> & { version: number },
    );
    return this.toDto(row as never);
  }

  // DB-first read — `findByUUID`/`findById` may serve a stale cached row
  // (@Cached entities) whose `version` would trip the optimistic-concurrency
  // guard (ERR01) on the write that follows.
  private async freshRowByUuid(uuid: string, tx?: Repository): Promise<UserProfileEntity> {
    // Inside a tx the version read MUST run on the tx client (read-your-writes);
    // outside, svc.query wraps the default repo. `find`'s throwIfNotFound default
    // used to throw on a missing row — preserve it or callers lose the guard.
    const row = tx
      ? await tx.find<UserProfileEntity, UserProfileEntity>(UserProfileEntity, null, {
          filters: [Filter.fieldValue(field(UserProfileEntity, "uuid" as any), "=", uuid)] as any,
          deletedRecords: "INCLUDED",
        })
      : await this.svc.get(uuid, { deletedRecords: "INCLUDED" });
    return row as UserProfileEntity;
  }

  async softDeleteProfile(uuid: string, version: number): Promise<UserProfileDetailDto> {
    const row = await this.svc.delete(uuid, version);
    return this.toDto(row as unknown as UserProfileDetailRow);
  }

  /**
   * Restore a soft-deleted profile. Overrides `svc.restore` — same signature —
   * returning the joined + DTO-mapped row (audit display names, ISO dates).
   */
  override async restore(uuid: string, version?: number): Promise<UserProfileDetailDto> {
    const row = await this.svc.restore(uuid, version);
    return this.toDto(row as unknown as UserProfileDetailRow);
  }

  // --- Audit -----------------------------------------------------------------

  async getUserProfileAudit(uuid: string, page: number, limit: number) {
    const result = (await this.svc.audit(uuid, page, limit)) as {
      data: { uuid: string; entity_uuid: string; action: string; changed_at: unknown; changed_by: string | null; changed_by_display_name?: string | null; version: number; delta: unknown }[];
      pagination: unknown;
    };

    return {
      data: result.data.map((row) => ({
        uuid: row.uuid,
        entity_uuid: row.entity_uuid,
        action: row.action,
        changed_at: row.changed_at,
        changed_by: row.changed_by,
        changed_by_name: row.changed_by_display_name,
        version: row.version,
        delta: row.delta as Record<string, any>,
      })),
      pagination: result.pagination,
    };
  }

  // --- Admin list -------------------------------------------------------------

  async listUsers(query: UserListQuery): Promise<UserListResponse> {
    // The hand-rolled translation this replaced answered to the SAME served
    // contract svc.list runs: identical wire sets (deriveListWireSets over
    // userProfileMeta + unique/audit extras), same display joins, same
    // deleted_records semantics. Divergences: sort_key is now validated
    // (invalid → ValidationError, previously silent) and every unique
    // column is wire-filterable (email — superset of the old allowlist).
    const result = await this.svc.list({ ...query, sort_key: query.sort_key ?? undefined });
    return {
      rows: result.rows.map((r) => this.toDto(r as never)),
      page: result.page,
      page_size: result.page_size,
      total: result.total,
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
    const row = await this.svc.find<{ uuid: string; idp_org?: string; idp_username?: string; version?: number }>(
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
        // Self-attribution: the sync write stamps the profile's own uuid
        // (no user session exists yet on the JIT path).
        await this.runAs(row.uuid, () =>
          this.svc.update(row.uuid, updates as Record<string, unknown> & { version: number }),
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
    const newUuid = newUuidV7();

    // find→NULL above proved absence → this is a pure INSERT. A concurrent
    // first-login for the same idp_code loses the race with a unique violation —
    // visible failure, correct per the optimistic-concurrency contract.
    // Self-attribution: the just-provisioned profile stamps its own uuid.
    const inserted = await this.runAs(newUuid, () =>
      this.svc.create({
        uuid: newUuid,
        idp_code: input.idp_code,
        email: input.email,
        display_name: input.display_name,
        idp_org: input.idp_org,
        idp_username: input.idp_username,
      }),
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
    const { username, password, display_name, email, roles, avatar_initials, avatar_color, idp_org, idp_is_admin, idp_is_verified, idp_email_verified, send_invitation } = input;

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
        // New users are never suspended/deleted at birth → isForbidden false.
        isForbidden: false,
        isAdmin: idp_is_admin,
        isVerified: idp_is_verified,
        emailVerified: idp_email_verified,
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
    const newUuid = newUuidV7();
    const idp_issuer = cfg.idp_endpoint || null;

    await this.createProfile({
      uuid: newUuid,
      idp_code: idpCode,
      email,
      display_name,
      idp_org: idpOrg,
      idp_username: idpUsername,
      avatar_color: defaultColor,
      avatar_initials: calculatedInitials,
      idp_is_admin,
      idp_is_verified,
      idp_email_verified,
      idp_issuer,
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
      const invitationService = new InvitationService(this.casdoor);
      const result = await invitationService.createInvitation(
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

    const deleted = await this.softDeleteProfile(uuid, version);
    await this.bumpUserAuthEpoch(uuid);
    return deleted;
  }

  // --- Suspend / reactivate -------------------------------------------------

  /**
   * Suspend a user: the record STAYS live (survives retention purge) but auth
   * resolution fails closed (`AUTH_RESOLVE_USER_SUBJECT` → null) and the IDP
   * identity is forbidden. `isForbidden` derives as `suspended ∨ deleted` —
   * suspending an already-deleted user is refused (deleted wins).
   */
  async suspendUser(uuid: string, version: number): Promise<UserProfileDetailDto> {
    const existing = await this.getByUuid(uuid);
    if (!existing) {
      throw new NotFoundError("User profile not found in database", { internal_code: "USER_NOT_FOUND" });
    }
    if (existing.suspended_at) {
      return existing; // idempotent
    }

    // Disable the IdP user FIRST (fail-closed ordering, same as deleteUser).
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
          "Failed to disable user in Casdoor™ — suspend NOT performed",
          { instance: "/api/v1/auth/users/:uuid/suspend", internal_code: "CASDOOR_SYNC_FAILED", severity: "HIGH" },
        );
      }
    }

    const updated = await this.updateProfile(uuid, {
      suspended_at: new Date(),
      suspended_by: requireActor(),
      version,
    });
    await this.bumpUserAuthEpoch(uuid);
    return updated;
  }

  /**
   * Reactivate a suspended user: clears the audit pair and re-enables the
   * IDP identity — unless the record is also deleted (deleted wins: a
   * suspended+deleted user stays forbidden, only `restore` re-enables).
   */
  async reactivateUser(uuid: string, version: number): Promise<UserProfileDetailDto> {
    const existing = await this.getByUuid(uuid);
    if (!existing) {
      throw new NotFoundError("User profile not found in database", { internal_code: "USER_NOT_FOUND" });
    }
    if (!existing.suspended_at) {
      return existing; // idempotent
    }

    const updated = await this.updateProfile(uuid, {
      suspended_at: null,
      suspended_by: null,
      version,
    });

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
          "Suspension cleared locally but Casdoor™ re-enable failed — user remains forbidden at the IdP; retry reactivate",
          { instance: "/api/v1/auth/users/:uuid/reactivate", internal_code: "CASDOOR_SYNC_FAILED", severity: "HIGH" },
        );
      }
    }
    return updated;
  }

  // --- Restore (un-soft-delete) --------------------------------------------

  private async getByUuidIncludingDeleted(uuid: string): Promise<UserProfileDetailDto | null> {
    const row = await this.svc.get(uuid, {
      deletedRecords: "INCLUDED",
      throwIfNotFound: false,
    });
    return row ? this.toDto(row as never) : null;
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

    // isForbidden = suspended ∨ deleted — restoring a SUSPENDED user must
    // NOT re-enable the IDP identity (it stays forbidden until reactivate).
    if (existing.suspended_at) {
      return restored;
    }

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

    await this.bumpUserAuthEpoch(uuid);
    return restored;
  }

  // --- Entity CRUD (admin surface) -----------------------------------------

  async getUserByUuid(uuid: string): Promise<UserProfileDetailDto> {
    // Read surface includes tombstoned rows: a soft-deleted profile is still a
    // record the admin can open — `deleted_at`/`deleted_by` ride the DTO and
    // the FE renders the deleted lifecycle state. Writes keep `getByUuid`
    // (EXCLUDED) — you cannot mutate a deleted record.
    const user = await this.getByUuidIncludingDeleted(uuid);
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
  /** Best-effort per-user auth epoch bump — direct user/grant writes stale any cached AuthUser snapshot for that uuid. */
  private async bumpUserAuthEpoch(uuid: string): Promise<void> {
    const port = getCachePort();
    if (!port) return;
    try {
      await port.set(`auth:user_epoch:${uuid}`, Date.now(), 30 * 24 * 60 * 60 * 1000);
    } catch (e) {
      logger.warn(`auth user_epoch set failed: ${e}`, { tags: ["auth"] });
    }
  }

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
        ...(body.idp_is_admin !== undefined && { isAdmin: body.idp_is_admin }),
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
    if (body.idp_is_admin !== undefined) updateBody.idp_is_admin = body.idp_is_admin;
    if (body.auth_method_enforcer_dismissed !== undefined) updateBody.auth_method_enforcer_dismissed = body.auth_method_enforcer_dismissed;
    // Casdoor-compatible column format (roles stored as stringified JSON —
    // extJson is byte-identical here and bigint-safe should one slip in).
    if (body.roles !== undefined) updateBody.roles = extJsonStringify(body.roles);

    // The write response IS the new observation — no follow-up GET.
    const updated = await this.updateProfile(uuid, updateBody as any, tx);
    await this.bumpUserAuthEpoch(uuid);
    return updated;
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
          language_iso: "en-US",
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
          language_iso: "en-US",
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
