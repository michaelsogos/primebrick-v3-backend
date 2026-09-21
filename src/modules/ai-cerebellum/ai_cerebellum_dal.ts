/**
 * DAL for `ai_cerebellum` — per-assistant model tuning presets.
 *
 * Mirrors `AiModelsDal` — Redis-cached list + standard CRUD/audit.
 * Adds `findByAssistantAndModel()` used by the FE resolution flow.
 */
import { randomUUID } from "node:crypto";

import type { Pool, PoolClient } from "pg";

import {
  entityDateToApiIso,
  Repository,
  field, Filter, Sort,
  buildAuditableJoins,
  type FieldProjector,
} from "@primebrick/dal-pg";

import { AiCerebellumEntity } from "./ai_cerebellum_entity.js";
import { UserProfileEntity } from "../auth/user_profile_entity.js";
import type { AiCerebellumCreateBody, AiCerebellumUpdateBody, AiCerebellumListQuery } from "./dto.js";
import {
  AI_CEREBELLUM_FILTERABLE_KEYS,
  AI_CEREBELLUM_SEARCHABLE_KEYS,
} from "./list-config.js";
import { requireActor, type CacheEntry, wrapCacheEntry } from "@primebrick/sdk";
import { createRepository } from "../../db/repository-factory.js";
import { BeAuditPortAdapter } from "../../db/audit-port-adapter.js";
import { findAuditPage } from "../../db/audit-query-helper.js";
import { getCachePort } from "../../cache/cache-port-holder.js";

const LIST_CACHE_KEY = "dal:ai_cerebellum:list";
const LIST_CACHE_TTL = 300_000; // 5 min — same as entity TTL

export type AiCerebellumDetailRow = {
  uuid: string;
  assistant_key: string;
  model_id: string;
  name: string;
  description_key?: string;
  enable_thinking?: boolean;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  repetition_penalty?: number;
  execution_config?: Record<string, any>;
  is_enabled: boolean;
  sort_order: number;
  test_scores?: Record<string, any>;
  created_at: Date;
  created_by: string;
  updated_at: Date;
  updated_by: string;
  version: number;
  deleted_at?: Date;
  deleted_by?: string;
};

export type AiCerebellumDetailDto = Omit<
  AiCerebellumDetailRow,
  "created_at" | "updated_at" | "deleted_at"
> & {
  created_at: string;
  updated_at: string;
  deleted_at?: string;
};

function projectAllExceptId(): FieldProjector[] {
  const keys = [
    "uuid",
    "assistant_key",
    "model_id",
    "name",
    "description_key",
    "enable_thinking",
    "temperature",
    "top_p",
    "max_tokens",
    "repetition_penalty",
    "execution_config",
    "is_enabled",
    "sort_order",
    "test_scores",
    "created_at",
    "created_by",
    "updated_at",
    "updated_by",
    "version",
    "deleted_at",
    "deleted_by",
  ] as const;
  return keys.map((k) => ({ kind: "field" as const, field: field(AiCerebellumEntity, k) }));
}

export class AiCerebellumDal {
  private repo: Repository;
  private auditPort: BeAuditPortAdapter;

  constructor(pool: Pool) {
    this.repo = createRepository(pool);
    this.auditPort = new BeAuditPortAdapter(this.repo);
  }

  /**
   * Load all ai_cerebellum rows (excluding soft-deleted), sorted by sort_order ASC.
   */
  async findAll(): Promise<AiCerebellumEntity[]> {
    const entry = await this.findAllWithCache();
    return entry.data;
  }

  async findAllWithCache(): Promise<CacheEntry<AiCerebellumEntity[]>> {
    const port = getCachePort();
    if (port) {
      try {
        const cached = await port.get<CacheEntry<AiCerebellumEntity[]>>(LIST_CACHE_KEY);
        if (cached && typeof cached === "object" && "data" in cached && "etag" in cached) {
          return cached;
        }
      } catch { /* best-effort — fall through to DB */ }
    }

    const rows = await this.repo.findAll<AiCerebellumEntity, AiCerebellumEntity>(
      AiCerebellumEntity,
      null,
      {
        deletedRecords: "EXCLUDED",
        sorting: [Sort.by(field(AiCerebellumEntity, "sort_order" as any), "ASC")],
      }
    );
    const result = rows as AiCerebellumEntity[];
    const entry = wrapCacheEntry(result);
    if (port) {
      try {
        await port.set(LIST_CACHE_KEY, entry, LIST_CACHE_TTL);
      } catch { /* best-effort */ }
    }
    return entry;
  }

  async invalidateCache(): Promise<void> {
    const port = getCachePort();
    if (port) {
      try { await port.del(LIST_CACHE_KEY); } catch { /* best-effort */ }
    }
  }

  async findByUuid(uuid: string): Promise<AiCerebellumDetailDto | null> {
    const row = await this.repo.find<AiCerebellumDetailRow, AiCerebellumDetailRow>(
      AiCerebellumEntity,
      projectAllExceptId(),
      {
        filters: [Filter.fieldValue(field(AiCerebellumEntity, "uuid"), "=", uuid)] as any,
        joins: buildAuditableJoins(AiCerebellumEntity, UserProfileEntity),
        deletedRecords: "EXCLUDED",
        throwIfNotFound: false,
      }
    );
    return row ? this.toDto(row) : null;
  }

  /**
   * Tunings for a specific (assistant_key, model_id) pair — the FE calls this
   * (via the generic list with filters) to resolve the effective params.
   */
  async findByAssistantAndModel(
    assistant_key: string,
    model_id: string,
  ): Promise<AiCerebellumDetailDto[]> {
    const rows = (await this.repo.findAll<AiCerebellumDetailRow, AiCerebellumDetailRow>(
      AiCerebellumEntity,
      projectAllExceptId(),
      {
        filters: [
          Filter.fieldValue(field(AiCerebellumEntity, "assistant_key"), "=", assistant_key, "AND"),
          Filter.fieldValue(field(AiCerebellumEntity, "model_id"), "=", model_id, "AND"),
          Filter.fieldValue(field(AiCerebellumEntity, "is_enabled"), "=", true, "AND"),
        ] as any,
        deletedRecords: "EXCLUDED",
        sorting: [Sort.by(field(AiCerebellumEntity, "sort_order" as any), "ASC")],
      }
    )) as AiCerebellumDetailRow[];
    return rows.map((r) => this.toDto(r));
  }

  async listAiCerebellum(q: AiCerebellumListQuery) {
    const page = q.page ?? 1;
    const page_size = q.page_size ?? 25;

    const filters: ReturnType<typeof Filter.group>[] = [];

    if (q.search && q.search.trim()) {
      const raw = q.search.trim();
      const escaped = raw.replace(/[%_#]/g, (c) => "#" + c);
      const needle = "%" + escaped + "%";
      const fields = (q.search_in?.length ? q.search_in : AI_CEREBELLUM_SEARCHABLE_KEYS) as string[];
      const allowed = new Set([...AI_CEREBELLUM_SEARCHABLE_KEYS, "uuid"]);
      const ors = fields
        .filter((f) => allowed.has(f))
        .map((f) => Filter.fieldValue(field(AiCerebellumEntity, f as any), "ILIKE", needle, "OR"));
      if (ors.length) filters.push(Filter.group(ors, "OR"));
    }

    if (q.filters && q.filters.length > 0) {
      const validOps = new Set([
        "=", "!=", "<>", "<", "<=", ">", ">=", "ILIKE", "LIKE",
        "IN", "NOT IN", "BETWEEN", "IS", "IS NOT",
      ]);
      const allowedFields = new Set(AI_CEREBELLUM_FILTERABLE_KEYS);
      const filterExprs: ReturnType<typeof Filter.fieldValue>[] = [];
      for (const cond of q.filters) {
        if (!validOps.has(cond.op)) continue;
        if (!allowedFields.has(cond.field)) continue;
        filterExprs.push(
          Filter.fieldValue(
            field(AiCerebellumEntity, cond.field as any),
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
    const sorting = [Sort.by(field(AiCerebellumEntity, sort_key as any), sort_dir as any)];

    const result = await this.repo.findByPage<AiCerebellumDetailRow, AiCerebellumDetailRow>(
      AiCerebellumEntity,
      page,
      page_size,
      projectAllExceptId(),
      {
        filters: filters as any,
        sorting,
        deletedRecords: q.deleted_records as any,
        joins: buildAuditableJoins(AiCerebellumEntity, UserProfileEntity),
      }
    );

    return {
      rows: result.entities.map((x) => this.toDto(x)),
      page,
      page_size,
      total: result.total_records,
    };
  }

  async createAiCerebellum(body: AiCerebellumCreateBody, tx?: PoolClient): Promise<{ uuid: string }> {
    const uuid = randomUUID();
    const actor = requireActor();
    const repo = tx ? new Repository(tx) : this.repo;
    await repo.add(
      AiCerebellumEntity,
      {
        uuid,
        assistant_key: body.assistant_key,
        model_id: body.model_id,
        name: body.name,
        description_key: body.description_key,
        enable_thinking: body.enable_thinking,
        temperature: body.temperature,
        top_p: body.top_p,
        max_tokens: body.max_tokens,
        repetition_penalty: body.repetition_penalty,
        execution_config: body.execution_config,
        is_enabled: body.is_enabled,
        sort_order: body.sort_order,
        test_scores: body.test_scores,
      },
      { actor, audit: this.auditPort }
    );
    if (!tx) await this.invalidateCache();
    return { uuid };
  }

  async updateAiCerebellum(uuid: string, body: AiCerebellumUpdateBody, tx?: PoolClient): Promise<AiCerebellumDetailDto> {
    const repo = tx ? new Repository(tx) : this.repo;
    // body.version is REQUIRED — the caller's observed version (client).
    const row = await repo.update<AiCerebellumEntity, AiCerebellumDetailRow>(
      AiCerebellumEntity,
      { ...body, uuid },
      { actor: requireActor(), audit: this.auditPort, matchBy: 'uuid' as any }
    );
    if (!tx) await this.invalidateCache();
    return this.toDto(row);
  }

  async deleteAiCerebellum(uuid: string, version: number): Promise<AiCerebellumDetailDto> {
    const row = await this.repo.delete<AiCerebellumEntity, AiCerebellumDetailRow>(
      AiCerebellumEntity,
      { uuid, version },
      { actor: requireActor(), audit: this.auditPort, matchBy: 'uuid' as any }
    );
    await this.invalidateCache();
    return this.toDto(row);
  }

  async restoreAiCerebellum(uuid: string, version: number): Promise<AiCerebellumDetailDto> {
    const row = await this.repo.restore<AiCerebellumEntity, AiCerebellumDetailRow>(
      AiCerebellumEntity,
      { uuid, version },
      { actor: requireActor(), audit: this.auditPort, matchBy: 'uuid' as any }
    );
    await this.invalidateCache();
    return this.toDto(row);
  }

  async getAiCerebellumAudit(uuid: string, page: number, limit: number) {
    const result = await findAuditPage(this.repo, {
      tableName: "ai_cerebellum_audit",
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

  private toDto(r: AiCerebellumDetailRow): AiCerebellumDetailDto {
    return {
      ...r,
      created_at: entityDateToApiIso(r.created_at),
      updated_at: entityDateToApiIso(r.updated_at),
      deleted_at: r.deleted_at ? entityDateToApiIso(r.deleted_at) : undefined,
    };
  }
}
