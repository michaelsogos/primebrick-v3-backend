/**
 * `AuthEventsService` — the worker service that owns `auth_events`.
 *
 * `auth_events` is the BE-internal authentication audit log (`public`
 * schema): it is written ONLY by the internal auth flow and read through
 * the MCP `entity_list` tool (`list` + `aggregate` ops — see
 * `mcp/tools/entity-registry.ts`). It is NOT auditable (it IS an audit
 * log): no `version`/`deleted_*` columns, records are immutable, writes
 * carry no actor and no audit trail.
 *
 * Absorbs the former `auth-event-logger.ts` helper: `insertEvent` keeps
 * the exact best-effort contract — a failed insert is logged, never
 * thrown, so it cannot break the auth flow.
 *
 * Layer contract: `CONTROLLER → WORKER SERVICE → DAL lib → DB`. The MCP
 * dispatcher calls this service; nothing transports-side touches the
 * Dal for this entity.
 */

import {
  field,
  Filter,
  Project,
  quoteIdent,
  Sort,
  type FieldProjector,
  type FilterExpr,
  type SortingExpr,
} from "@primebrick/dal-pg";
import { logger } from "@primebrick/sdk";

import { DomainService } from "../../../db/domain-service.js";
import { AuthEventEntity } from "../auth_event_entity.js";
import type { AuthEventDto } from "../dto.js";

/** Request context forwarded from the controller (IP + User-Agent). */
export interface AuthRequestContext {
  ip_address?: string;
  user_agent?: string;
}

/** Event types recorded in auth_events.event_type. */
export type AuthEventType =
  | "login"
  | "login_failed"
  | "mfa_verify"
  | "passkey_signin";

/** Parameters for inserting an auth event. */
export interface InsertAuthEventParams {
  event_type: AuthEventType;
  success: boolean;
  /** User UUID — required for SUCCESS events, omitted for failed login. */
  user_profile_uuid?: string;
  /** Username attempted — mainly for failed login (no resolvable UUID). */
  attempted_username?: string;
  /** Reason for failure (NULL on success). */
  failure_reason?: string;
  /** Request context (IP + User-Agent) from the controller. */
  request_ctx?: AuthRequestContext;
}

/** Aggregate spec accepted by `aggregateEvents` (MCP payload shape). */
export interface AuthEventAggregateSpec {
  type: "count" | "sum" | "avg" | "min" | "max";
  /** Field to aggregate (required for sum/avg/min/max; ignored for count). */
  field?: string;
  /** GROUP BY fields. If empty, a single aggregate row is returned. */
  group_by?: string[];
}

export class AuthEventsService extends DomainService<AuthEventDto> {
  constructor() {
    super({
      entity: AuthEventEntity,
      list: {
        searchableKeys: ["attempted_username"],
        filterableKeys: new Set([
          "event_type",
          "success",
          "user_profile_uuid",
          "attempted_username",
          "ip_address",
        ]),
        defaultSort: { key: "event_at", dir: "desc" },
      },
    });
  }

  /**
   * Insert an auth event record.
   *
   * Non-blocking: errors are caught and logged, never thrown. Auth event
   * logging is best-effort — a failed insert must NOT break the auth flow.
   *
   * `auth_events` is non-auditable → WriteOptions (no actor required).
   */
  async insertEvent(params: InsertAuthEventParams): Promise<void> {
    const {
      event_type,
      success,
      user_profile_uuid,
      attempted_username,
      failure_reason,
      request_ctx,
    } = params;

    const record = {
      user_profile_uuid: user_profile_uuid ?? null,
      attempted_username: attempted_username ?? null,
      event_type,
      event_at: new Date(),
      ip_address: request_ctx?.ip_address ?? null,
      user_agent: request_ctx?.user_agent ?? null,
      success,
      failure_reason: failure_reason ?? null,
    };

    try {
      await this.dal.add(AuthEventEntity, record, {});
    } catch (err) {
      // Best-effort — never break the auth flow over an audit log failure.
      logger.error("Failed to insert auth event:", {
        tags: ["auth"],
        event_type,
        success,
        user_profile_uuid,
        attempted_username,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  /**
   * Grouped aggregate over `auth_events` (MCP `entity_list` aggregate path).
   *
   * Runs through the DAL DSL — `field()` resolves columns via entity meta
   * (unknown keys throw UNKNOWN_COLUMN instead of a PG error) and every
   * value is a bound parameter. The aggregate expression itself is built
   * from a strict allowlist (`count|sum|avg|min|max`) + `quoteIdent`, so
   * no injection surface exists.
   *
   * Returns: { results: [{ group: {...}, value: bigint }], total: bigint }
   */
  async aggregateEvents(params: {
    aggregate: AuthEventAggregateSpec;
    filters?: Record<string, unknown>;
    sort_key?: string;
    sort_dir?: "asc" | "desc";
    page?: number;
    page_size?: number;
  }): Promise<{
    results: Array<{ group: Record<string, unknown>; value: bigint }>;
    total: bigint;
  }> {
    const { aggregate, filters, sort_key, sort_dir, page, page_size } = params;

    const aggExpr =
      aggregate.type === "count"
        ? "COUNT(*)"
        : `${aggregate.type.toUpperCase()}(${quoteIdent(aggregate.field!)})`;

    const groupBy = aggregate.group_by ?? [];

    // Filters — the MCP payload shapes: scalar equality, array → IN,
    // `{op:"BETWEEN", value:[a,b]}` → two range predicates.
    const filterExprs: FilterExpr[] = [];
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value === null || value === undefined) continue;
        const ref = field(AuthEventEntity, key as never);

        if (
          typeof value === "object" &&
          !Array.isArray(value) &&
          "op" in (value as Record<string, unknown>)
        ) {
          const v = value as { op: string; value: unknown[] };
          if (v.op === "BETWEEN" && Array.isArray(v.value) && v.value.length === 2) {
            filterExprs.push(
              Filter.fieldValue(ref, ">=", v.value[0]),
              Filter.fieldValue(ref, "<=", v.value[1]),
            );
            continue;
          }
        }
        if (Array.isArray(value)) {
          filterExprs.push(Filter.fieldValue(ref, "IN", value));
          continue;
        }
        filterExprs.push(Filter.fieldValue(ref, "=", value));
      }
    }

    const fields: FieldProjector[] = [
      ...groupBy.map((f) => Project.field(field(AuthEventEntity, f as never))),
      Project.expr(aggExpr, "agg_value"),
    ];

    // sort_key can be a group_by field or "agg_value" (the aggregate result)
    const sorting: SortingExpr[] = [];
    const sortDir = (sort_dir ?? "desc").toUpperCase() === "ASC" ? "ASC" : "DESC";
    if (sort_key) {
      sorting.push(
        sort_key === "count" || sort_key === aggregate.type
          ? Sort.byAlias("agg_value", sortDir)
          : Sort.by(field(AuthEventEntity, sort_key as never), sortDir),
      );
    }

    const pageNum = Math.max(1, page ?? 1);
    const pageSize = Math.min(page_size ?? 25, 100);
    // `findByPage` computes `total_records` via COUNT(*) OVER() — over a
    // GROUP BY result that counts the number of groups (same semantic as
    // the removed `COUNT(*) FROM (… GROUP BY)` count query).
    const page_ = await this.dal.findByPage<
      AuthEventEntity,
      Record<string, unknown> & { agg_value: unknown }
    >(AuthEventEntity, pageNum, pageSize, fields, {
      filters: filterExprs,
      groupBy: groupBy.map((f) => field(AuthEventEntity, f as never)),
      sorting,
    });

    const results = page_.entities.map((row) => {
      const group: Record<string, unknown> = {};
      for (const f of groupBy) {
        group[f] = row[f];
      }
      return {
        group,
        value:
          typeof row.agg_value === "bigint"
            ? row.agg_value
            : BigInt((row.agg_value as number) ?? 0),
      };
    });

    return { results, total: page_.total_records };
  }
}

let instance: AuthEventsService | undefined;

/**
 * Lazy singleton accessor — the first call happens inside request handling,
 * always post-bootstrap, so `getDal()` is already initialized. A module-level
 * `new` would crash the import graph before `initDal()` runs.
 */
export function getAuthEventsService(): AuthEventsService {
  return (instance ??= new AuthEventsService());
}
