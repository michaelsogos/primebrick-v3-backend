/**
 * makeEntityService — the BE binding of the ONE generic CRUD service.
 *
 * The generic implementation lives in `@primebrick/dal-pg`
 * (`entity/entity-service.ts`) and is shared verbatim with every
 * microservice — this module exists only to inject the BE-specific
 * dependencies that the library cannot own:
 *
 *   - `dal`        — the BE gateway (`getDal()`), lazily initialized; its
 *                    internal repo is already `withCache`-decorated
 *                    (`repoDecorator` in `dal-gateway`), so `@Cached`
 *                    entities are cached uniformly with no extra wiring
 *   - `auditPort`  — `EntityAuditPort`: `{table}_audit` writer PLUS the
 *                    entity-changed markers (Redis presence + NATS publish)
 *                    that drive SSE invalidation on other BE instances
 *   - `actor`      — ALS `requireActor`
 *   - `userEntity` — `UserProfileEntity` for `created_by_name` etc. joins
 *   - `debugCode`  — `PB_<CODE>_FORCE_EMPTY`/`FORCE_ERROR` dev toggles on
 *                    `list` (BE-only: the library bans env reads)
 *
 * Guarantees that are structural (not conventions):
 * - every write returns the row produced by `RETURNING` — there is no code
 *   path that can return `{uuid}` or `{success: true}`;
 * - `version` is always the caller-observed value (optimistic lock);
 * - audit trail, actor stamping (ALS), tx propagation and cache-port wiring
 *   are identical for every entity;
 * - per-entity variation lives ONLY in `EntityServiceConfig` (searchable /
 *   filterable keys, default sort, aggregates, hooks) — never in a
 *   copied dal.
 *
 * Entities with non-standard identity or external orchestration (e.g.
 * role_mapping's Casdoor sync) keep a custom service and use router-level
 * `handlers`/`extraRoutes` overrides — the contract type still forces
 * their handlers to return the entity.
 */

import {
  type EntityService,
  type EntityServiceConfig as DalEntityServiceConfig,
} from "@primebrick/dal-pg";
import { requireActor } from "@primebrick/sdk";

import { UserProfileEntity } from "../modules/auth/user_profile_entity.js";
import { EntityAuditPort } from "../db/entity-audit-port.js";
import {getDal} from "../db/dal-gateway.js";
import { NotFoundError } from "./api-errors.js";

export type {
  EntityAction,
  EntityListQuery,
  EntityListResult,
  BulkItem,
  DuplicateResult,
  AggregateDecl,
  EntityService,
} from "@primebrick/dal-pg";

/**
 * BE entity-service config — the dal-pg `EntityServiceConfig` minus the
 * dependencies this module injects (`auditPort`, `actor`, `userEntity`)
 * and minus `repo` (the gateway's decorated repo is the only legal one),
 * plus the BE-only `debugCode` dev toggle.
 */
export type EntityServiceConfig<TEntity> = Omit<
  DalEntityServiceConfig<TEntity>,
  "repo" | "auditPort" | "actor" | "userEntity"
> & {
  /**
   * Entity code for list debug toggles: `PB_<CODE>_FORCE_EMPTY=1` /
   * `PB_<CODE>_FORCE_ERROR=1` short-circuit the list (dev-only).
   */
  debugCode?: string;
};

export function makeEntityService<TEntity extends Record<string, unknown>>(
  cfg: EntityServiceConfig<TEntity>,
): EntityService<TEntity> {
  // Lazy resolution: routers instantiate services at mount time, BEFORE
  // runStartupTasks() calls initDal() — the port binds first so /health stays
  // answerable when Postgres is down. Calling getDal() here would throw at
  // mount; defer to the first method call (same deferred fail-fast semantics
  // as DomainService).
  let inner: EntityService<TEntity> | undefined;
  const resolve = (): EntityService<TEntity> => {
    if (!inner) {
      const dal = getDal();
      inner = dal.entityService<TEntity>({
        ...cfg,
        auditPort: new EntityAuditPort(dal),
        actor: requireActor,
        userEntity: UserProfileEntity,
      });
    }
    return inner;
  };
  const code = cfg.debugCode;
  return {
    async list(q) {
      if (code && process.env[`PB_${code}_FORCE_EMPTY`] === "1") {
        const p = Math.max(1, Number(q.page) || 1);
        const ps = Math.min(100, Math.max(1, Number(q.page_size) || 25));
        return { rows: [], page: p, page_size: ps, total: 0n };
      }
      if (code && process.env[`PB_${code}_FORCE_ERROR`] === "1") {
        throw new NotFoundError(`[${code}] forced list error`, {
          internal_code: "FORCED_ERROR",
        });
      }
      return resolve().list(q);
    },
    get: (uuid) => resolve().get(uuid),
    create: (body, tx) => resolve().create(body, tx),
    update: (uuid, body, tx) => resolve().update(uuid, body, tx),
    delete: (uuid, version) => resolve().delete(uuid, version),
    restore: (uuid, version) => resolve().restore(uuid, version),
    purge: (uuid, version) => resolve().purge(uuid, version),
    duplicate: (uuids) => resolve().duplicate(uuids),
    bulkDelete: (items) => resolve().bulkDelete(items),
    bulkRestore: (items) => resolve().bulkRestore(items),
    audit: (uuid, page, limit) => resolve().audit(uuid, page, limit),
    stream: (query) => resolve().stream(query),
  };
}
