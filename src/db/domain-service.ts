/**
 * `DomainService<TEntity>` — the base class every BE worker service that
 * owns one entity extends:
 *
 *   class UserService extends DomainService<UserProfileEntity> { … }
 *
 * It binds the dal-pg `DomainService` base (imported here under the private
 * `DalDomainService` alias — consumers only ever see THIS `DomainService`)
 * to the BE-specific dependencies the library cannot own (mirrors
 * `http/entity-service.ts` — the SAME wiring, expressed as inheritance):
 *
 * It injects the BE-specific dependencies the library cannot own (mirrors
 * `http/entity-service.ts` — the SAME wiring, expressed as inheritance):
 *
 *   - `dal`        — the BE gateway singleton (via `DomainService`'s ctor);
 *                    its internal repo is already `withCache`-decorated
 *   - `auditPort`  — `EntityAuditPort`: `{table}_audit` writer PLUS the
 *                    entity-changed markers (Redis presence + NATS publish)
 *   - `actor`      — ALS `requireActor`
 *   - `userEntity` — `UserProfileEntity` for `created_by_name` etc. joins
 *   - `debugCode`  — `PB_<CODE>_FORCE_EMPTY`/`FORCE_ERROR` dev toggles on
 *                    `list` (BE-only: the library bans env reads)
 *
 * Custom queries live as methods on the subclass using `this.dal.*` —
 * never in a `*Dal`/`*Repo` wrapper class, never via a second `getDal()`.
 */

import {
  DomainService as DalDomainService,
  type EntityServiceConfig as DalEntityServiceConfig,
  type EntityListQuery,
  type EntityListResult,
} from "@primebrick/dal-pg";
import { requireActor } from "@primebrick/sdk";

import { UserProfileEntity } from "../modules/auth/user_profile_entity.js";
import { EntityAuditPort } from "./entity-audit-port.js";
import { NotFoundError } from "../http/api-errors.js";

/**
 * Worker-service config — the dal-pg `EntityServiceConfig` minus the
 * dependencies this base injects (`repo`, `auditPort`, `actor`,
 * `userEntity`), plus the BE-only `debugCode` dev toggle.
 */
export type DomainServiceConfig<TEntity> = Omit<
  DalEntityServiceConfig<TEntity>,
  "repo" | "auditPort" | "actor" | "userEntity"
> & {
  /**
   * Entity code for list debug toggles: `PB_<CODE>_FORCE_EMPTY=1` /
   * `PB_<CODE>_FORCE_ERROR=1` short-circuit the list (dev-only).
   */
  debugCode?: string;
};

export abstract class DomainService<
  TEntity extends Record<string, unknown>,
> extends DalDomainService<TEntity> {
  private readonly debugCode?: string;
  private _auditPort?: EntityAuditPort;

  protected constructor(cfg: DomainServiceConfig<TEntity>) {
    const { debugCode, ...rest } = cfg;
    super(rest);
    this.debugCode = debugCode;
  }

  /**
   * Audit port bound to the non-tx gateway repo — for direct `this.dal.*`
   * writes in custom methods (`{ actor, audit: this.auditPort }`). Tx-scoped
   * writes MUST bind a fresh `new EntityAuditPort(tx)` instead so audit rows
   * land inside the same transaction.
   */
  protected get auditPort(): EntityAuditPort {
    return (this._auditPort ??= new EntityAuditPort(this.dal));
  }

  /**
   * BE binding — injects auditPort/actor/userEntity into the composed
   * service. Runs lazily inside `svc` resolution, so `this.dal` is valid
   * here (post-bootstrap) and the constructor stays I/O-free.
   */
  protected override buildConfig(): DalEntityServiceConfig<TEntity> {
    return {
      ...this.cfg,
      auditPort: new EntityAuditPort(this.dal),
      actor: requireActor,
      userEntity: UserProfileEntity,
    };
  }

  override list(q: EntityListQuery): Promise<EntityListResult<TEntity>> {
    const code = this.debugCode;
    if (code) {
      if (process.env[`PB_${code}_FORCE_EMPTY`] === "1") {
        const p = Math.max(1, Number(q.page) || 1);
        const ps = Math.min(100, Math.max(1, Number(q.page_size) || 25));
        return Promise.resolve({ rows: [], page: p, page_size: ps, total: 0n });
      }
      if (process.env[`PB_${code}_FORCE_ERROR`] === "1") {
        throw new NotFoundError(`[${code}] forced list error`, {
          internal_code: "FORCED_ERROR",
        });
      }
    }
    return super.list(q);
  }
}
