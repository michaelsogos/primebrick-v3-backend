/**
 * DAL for `ai_models` — catalog of WebLLM models.
 *
 * Wraps the `Repository` from `@primebrick/dal-pg`. Exposes standard CRUD
 * methods plus a Redis-cached `findAllWithCache()` (with ETag support) for
 * the list endpoint. Cache is invalidated on every write.
 *
 * Mirrors the `ConfigEntriesDal` Redis pattern and the `CustomersDal`
 * CRUD/audit pattern.
 */
import { randomUUID } from "node:crypto";

import type { Pool, PoolClient } from "pg";

import {
  entityDateToApiIso,
  Repository,
  field, Filter, Sort, Project,
  buildAuditableJoins,
  type FieldProjector,
} from "@primebrick/dal-pg";

import { AiModelEntity } from "./ai_model_entity.js";
import { UserProfileEntity } from "../auth/user_profile_entity.js";
import type { AiModelCreateBody, AiModelUpdateBody, AiModelListQuery } from "./dto.js";
import { AI_MODEL_FILTERABLE_KEYS, AI_MODEL_SEARCHABLE_KEYS, AI_MODEL_SORT_KEYS } from "./list-config.js";
import { requireActor, type CacheEntry, wrapCacheEntry } from "@primebrick/sdk";
import { createRepository } from "../../db/repository-factory.js";
import { BeAuditPortAdapter } from "../../db/audit-port-adapter.js";
import { findAuditPage } from "../../db/audit-query-helper.js";
import { getCachePort } from "../../cache/cache-port-holder.js";

const LIST_CACHE_KEY = "dal:ai_models:list";
const LIST_CACHE_TTL = 300_000; // 5 min — same as entity TTL

export type AiModelDetailRow = {
  uuid: string;
  model_id: string;
  name: string;
  label_key?: string;
  description_key?: string;
  power_level: number;
  rank: number;
  test_scores?: Record<string, any>;
  is_enabled: boolean;
  enable_thinking: boolean;
  temperature: number;
  top_p: number;
  max_tokens: number;
  repetition_penalty: number;
  sort_order: number;
  download_size_mb?: number;
  vram_mb?: number;
  compatibility_status: string;
  dtype?: string;
  engine_type?: string;
  execution_config?: Record<string, any>;
  created_at: Date;
  created_by: string;
  updated_at: Date;
  updated_by: string;
  version: number;
  deleted_at?: Date;
  deleted_by?: string;
};

export type AiModelDetailDto = Omit<
  AiModelDetailRow,
  "created_at" | "updated_at" | "deleted_at"
> & {
  created_at: string;
  updated_at: string;
  deleted_at?: string;
};

function projectAllExceptId(): FieldProjector[] {
  const keys = [
    "uuid",
    "model_id",
    "name",
    "label_key",
    "description_key",
    "power_level",
    "rank",
    "test_scores",
    "is_enabled",
    "enable_thinking",
    "temperature",
    "top_p",
    "max_tokens",
    "repetition_penalty",
    "sort_order",
    "download_size_mb",
    "vram_mb",
    "compatibility_status",
    "dtype",
    "engine_type",
    "execution_config",
    "created_at",
    "created_by",
    "updated_at",
    "updated_by",
    "version",
    "deleted_at",
    "deleted_by",
  ] as const;
  return keys.map((k) => ({ kind: "field" as const, field: field(AiModelEntity, k) }));
}

export class AiModelsDal {
  private repo: Repository;
  private pool: Pool;
  private auditPort: BeAuditPortAdapter;

  constructor(pool: Pool) {
    this.repo = createRepository(pool);
    this.pool = pool;
    this.auditPort = new BeAuditPortAdapter(this.repo);
  }

  /**
   * Load all ai_model rows (excluding soft-deleted), sorted by sort_order ASC.
   * Uses a manual list cache (Redis) with ETag support.
   */
  async findAll(): Promise<AiModelEntity[]> {
    const entry = await this.findAllWithCache();
    return entry.data;
  }

  /**
   * Same as `findAll` but returns the full `CacheEntry` (data + etag).
   * Used by the ETag middleware to answer conditional GET requests.
   */
  async findAllWithCache(): Promise<CacheEntry<AiModelEntity[]>> {
    const port = getCachePort();
    if (port) {
      try {
        const cached = await port.get<CacheEntry<AiModelEntity[]>>(LIST_CACHE_KEY);
        if (cached && typeof cached === "object" && "data" in cached && "etag" in cached) {
          return cached;
        }
      } catch { /* best-effort — fall through to DB */ }
    }

    const rows = await this.repo.findAll<AiModelEntity, AiModelEntity>(
      AiModelEntity,
      null,
      {
        deletedRecords: "EXCLUDED",
        sorting: [Sort.by(field(AiModelEntity, "sort_order" as any), "ASC")],
      }
    );
    const result = rows as AiModelEntity[];
    const entry = wrapCacheEntry(result);
    if (port) {
      try {
        await port.set(LIST_CACHE_KEY, entry, LIST_CACHE_TTL);
      } catch { /* best-effort */ }
    }
    return entry;
  }

  /**
   * Invalidate the list cache. Called after every write operation.
   */
  async invalidateCache(): Promise<void> {
    const port = getCachePort();
    if (port) {
      try { await port.del(LIST_CACHE_KEY); } catch { /* best-effort */ }
    }
  }

  async findByUuid(uuid: string): Promise<AiModelDetailDto | null> {
    const row = await this.repo.find<AiModelDetailRow, AiModelDetailRow>(
      AiModelEntity,
      projectAllExceptId(),
      {
        filters: [Filter.fieldValue(field(AiModelEntity, "uuid"), "=", uuid)] as any,
        joins: buildAuditableJoins(AiModelEntity, UserProfileEntity),
        deletedRecords: "EXCLUDED",
        throwIfNotFound: false,
      }
    );
    return row ? this.toDto(row) : null;
  }

  async findByModelId(model_id: string): Promise<AiModelDetailDto | null> {
    const row = await this.repo.find<AiModelDetailRow, AiModelDetailRow>(
      AiModelEntity,
      projectAllExceptId(),
      {
        filters: [Filter.fieldValue(field(AiModelEntity, "model_id"), "=", model_id)] as any,
        joins: buildAuditableJoins(AiModelEntity, UserProfileEntity),
        deletedRecords: "EXCLUDED",
        throwIfNotFound: false,
      }
    );
    return row ? this.toDto(row) : null;
  }

  async listAiModels(q: AiModelListQuery) {
    const page = q.page ?? 1;
    const page_size = q.page_size ?? 25;

    const filters: ReturnType<typeof Filter.group>[] = [];

    // Pre-filter: only return COMPATIBLE models unless the caller explicitly
    // requests a different compatibility_status via the `filters` array.
    // This keeps NOT_COMPATIBLE models out of the FE catalog by default.
    const hasCompatFilter = q.filters?.some(
      (f) => f.field === "compatibility_status",
    );
    if (!hasCompatFilter) {
      filters.push(
        Filter.group(
          [
            Filter.fieldValue(
              field(AiModelEntity, "compatibility_status" as any),
              "=",
              "COMPATIBLE",
              "AND",
            ),
          ],
          "AND",
        ),
      );
    }

    if (q.search && q.search.trim()) {
      const raw = q.search.trim();
      const escaped = raw.replace(/[%_#]/g, (c) => "#" + c);
      const needle = "%" + escaped + "%";
      const fields = (q.search_in?.length ? q.search_in : AI_MODEL_SEARCHABLE_KEYS) as string[];
      const allowed = new Set([...AI_MODEL_SEARCHABLE_KEYS, "uuid"]);
      const ors = fields
        .filter((f) => allowed.has(f))
        .map((f) => Filter.fieldValue(field(AiModelEntity, f as any), "ILIKE", needle, "OR"));
      if (ors.length) filters.push(Filter.group(ors, "OR"));
    }

    if (q.filters && q.filters.length > 0) {
      const validOps = new Set([
        "=", "!=", "<>", "<", "<=", ">", ">=", "ILIKE", "LIKE",
        "IN", "NOT IN", "BETWEEN", "IS", "IS NOT",
      ]);
      const allowedFields = new Set(AI_MODEL_FILTERABLE_KEYS);
      const filterExprs: ReturnType<typeof Filter.fieldValue>[] = [];
      for (const cond of q.filters) {
        if (!validOps.has(cond.op)) continue;
        if (!allowedFields.has(cond.field)) continue;
        filterExprs.push(
          Filter.fieldValue(
            field(AiModelEntity, cond.field as any),
            cond.op as any,
            cond.value,
            q.connector ?? "AND",
          )
        );
      }
      if (filterExprs.length > 0) {
        filters.push(Filter.group(filterExprs, q.connector ?? "AND"));
      }
    }

    const sort_key = (q.sort_key ?? "sort_order") as string;
    const sort_dir = (q.sort_dir ?? "asc").toUpperCase() === "ASC" ? "ASC" : "DESC";
    const sorting = [Sort.by(field(AiModelEntity, sort_key as any), sort_dir as any)];

    const result = await this.repo.findByPage<AiModelDetailRow, AiModelDetailRow>(
      AiModelEntity,
      page,
      page_size,
      projectAllExceptId(),
      {
        filters: filters as any,
        sorting,
        deletedRecords: q.deleted_records as any,
        joins: buildAuditableJoins(AiModelEntity, UserProfileEntity),
      }
    );

    return {
      rows: result.entities.map((x) => this.toDto(x)),
      page,
      page_size,
      total: result.total_records,
    };
  }

  async createAiModel(body: AiModelCreateBody, tx?: PoolClient): Promise<{ uuid: string }> {
    const uuid = randomUUID();
    const actor = requireActor();
    const repo = tx ? new Repository(tx) : this.repo;
    await repo.add(
      AiModelEntity,
      {
        uuid,
        model_id: body.model_id,
        name: body.name,
        label_key: body.label_key,
        description_key: body.description_key,
        power_level: body.power_level,
        rank: body.rank,
        test_scores: body.test_scores,
        is_enabled: body.is_enabled,
        enable_thinking: body.enable_thinking,
        temperature: body.temperature,
        top_p: body.top_p,
        max_tokens: body.max_tokens,
        repetition_penalty: body.repetition_penalty,
        sort_order: body.sort_order,
        download_size_mb: body.download_size_mb,
        vram_mb: body.vram_mb,
        compatibility_status: body.compatibility_status,
        dtype: body.dtype,
        engine_type: body.engine_type,
        execution_config: body.execution_config,
      },
      { actor, audit: this.auditPort }
    );
    if (!tx) await this.invalidateCache();
    return { uuid };
  }

  async updateAiModel(uuid: string, body: AiModelUpdateBody, tx?: PoolClient): Promise<AiModelDetailDto> {
    const repo = tx ? new Repository(tx) : this.repo;
    // body.version is REQUIRED — the caller's observed version (client).
    const row = await repo.update<AiModelEntity, AiModelDetailRow>(
      AiModelEntity,
      { ...body, uuid },
      { actor: requireActor(), audit: this.auditPort, matchBy: 'uuid' as any }
    );
    if (!tx) await this.invalidateCache();
    return this.toDto(row);
  }

  async deleteAiModel(uuid: string, version: number): Promise<AiModelDetailDto> {
    const row = await this.repo.delete<AiModelEntity, AiModelDetailRow>(
      AiModelEntity,
      { uuid, version },
      { actor: requireActor(), audit: this.auditPort, matchBy: 'uuid' as any }
    );
    await this.invalidateCache();
    return this.toDto(row);
  }

  async restoreAiModel(uuid: string, version: number): Promise<AiModelDetailDto> {
    const row = await this.repo.restore<AiModelEntity, AiModelDetailRow>(
      AiModelEntity,
      { uuid, version },
      { actor: requireActor(), audit: this.auditPort, matchBy: 'uuid' as any }
    );
    await this.invalidateCache();
    return this.toDto(row);
  }

  async getAiModelAudit(uuid: string, page: number, limit: number) {
    const result = await findAuditPage(this.repo, {
      tableName: "ai_models_audit",
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
        changed_by_display_name: row.changed_by_display_name,
        changed_by_idp_code: row.changed_by_idp_code,
        version: row.version,
        delta: row.delta,
      })),
      pagination: result.pagination,
    };
  }

  private toDto(r: AiModelDetailRow): AiModelDetailDto {
    return {
      ...r,
      created_at: entityDateToApiIso(r.created_at),
      updated_at: entityDateToApiIso(r.updated_at),
      deleted_at: r.deleted_at ? entityDateToApiIso(r.deleted_at) : undefined,
    };
  }
}
