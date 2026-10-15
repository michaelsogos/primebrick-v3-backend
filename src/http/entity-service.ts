/**
 * makeEntityService — the BE binding of the ONE generic CRUD service.
 *
 * The generic implementation lives in `@primebrick/dal-pg`
 * (`entity/entity-service.ts`) and is shared verbatim with every
 * microservice — this module exists only to inject the BE-specific
 * dependencies that the library cannot own:
 *
 *   - `dal`        — the BE gateway (`initDal()`), lazily initialized; its
 *                    internal repo is already `withCache`-decorated
 *                    (`repoDecorator` in `dal-gateway`), so `@Cached`
 *                    entities are cached uniformly with no extra wiring
 *   - `auditPort`  — `BeAuditPortAdapter`: `{table}_audit` writer PLUS the
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
import { BeAuditPortAdapter } from "../db/audit-port-adapter.js";
import { initDal } from "../db/dal-gateway.js";
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
  const dal = initDal();
  const inner = dal.entityService<TEntity>({
    ...cfg,
    auditPort: new BeAuditPortAdapter(dal),
    actor: requireActor,
    userEntity: UserProfileEntity,
  });
  if (!cfg.debugCode) return inner;
  const code = cfg.debugCode;
  return {
    ...inner,
    async list(q) {
      if (process.env[`PB_${code}_FORCE_EMPTY`] === "1") {
        const p = Math.max(1, Number(q.page) || 1);
        const ps = Math.min(100, Math.max(1, Number(q.page_size) || 25));
        return { rows: [], page: p, page_size: ps, total: 0n };
      }
      if (process.env[`PB_${code}_FORCE_ERROR`] === "1") {
        throw new NotFoundError(`[${code}] forced list error`, {
          internal_code: "FORCED_ERROR",
        });
      }
      return inner.list(q);
    },
  };
}
