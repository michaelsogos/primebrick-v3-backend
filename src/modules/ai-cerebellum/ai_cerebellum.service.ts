/**
 * AiCerebellumService — thin facade over `makeEntityService` (Part E).
 *
 * Core CRUD is generic; this facade keeps the legacy method names consumed by
 * `ai-cerebellum.router` plus the entity-specific rule expressed as a
 * `beforeCreate` hook: a tuning preset name must be unique within the same
 * (assistant_key, model_id) pair.
 * List-cache invalidation stays in `hooks.afterWrite` — the router keeps
 * wiring `service.invalidateCache()` for compatibility.
 */

import type { PoolClient } from "pg";

import { makeEntityService, type EntityService } from "../../http/entity-service.js";
import { AiCerebellumEntity } from "./ai_cerebellum_entity.js";
import type {
  AiCerebellumCreateBody,
  AiCerebellumUpdateBody,
  AiCerebellumListQuery,
  AiCerebellumDetailDto,
} from "./dto.js";
import {
  AI_CEREBELLUM_DEFAULT_SORT,
  AI_CEREBELLUM_SEARCHABLE_KEYS,
  AI_CEREBELLUM_FILTERABLE_KEYS,
} from "./list-config.js";
import { getCachePort } from "../../cache/cache-port-holder.js";
import { NotFoundError, ValidationError } from "../../http/api-errors.js";

const LIST_CACHE_KEY = "dal:ai_cerebellum:list";

export class AiCerebellumService {
  private svc: EntityService<AiCerebellumDetailDto>;

  constructor() {
    this.svc = makeEntityService<AiCerebellumDetailDto>({
      entity: AiCerebellumEntity,
      list: {
        searchableKeys: AI_CEREBELLUM_SEARCHABLE_KEYS,
        filterableKeys: new Set(AI_CEREBELLUM_FILTERABLE_KEYS),
        defaultSort: AI_CEREBELLUM_DEFAULT_SORT,
      },
      hooks: {
        beforeCreate: async (body) => {
          // A tuning preset name must be unique within the same
          // assistant/model pair.
          const siblings = await this.svc.list({
            filters: [
              { field: "assistant_key", op: "=", value: body.assistant_key as string },
              { field: "model_id", op: "=", value: body.model_id as string },
              ...(body.dtype !== undefined && body.dtype !== null
                ? [{ field: "dtype", op: "=" as const, value: body.dtype as string }]
                : []),
            ],
            page_size: 100,
          });
          if (siblings.rows.some((t) => t.name === body.name)) {
            throw new ValidationError(
              "An AI cerebellum tuning with this name already exists for this assistant/model",
              { internal_code: "AI_CEREBELLUM_NAME_DUPLICATE" },
            );
          }
          return body;
        },
      },
    });
  }

  /** Post-commit cache invalidation hook for `runEntityWrite`. */
  async invalidateCache(): Promise<void> {
    const port = getCachePort();
    if (port) {
      try { await port.del(LIST_CACHE_KEY); } catch { /* best-effort */ }
    }
  }

  // --- Legacy method names (router `methods` map) ---------------------------

  async listAiCerebellum(query: AiCerebellumListQuery) {
    return this.svc.list(query);
  }

  async getAiCerebellum(uuid: string) {
    try {
      return await this.svc.get(uuid);
    } catch {
      throw new NotFoundError("The requested AI cerebellum could not be found", {
        internal_code: "AI_CEREBELLUM_NOT_FOUND",
      });
    }
  }

  async createAiCerebellum(body: AiCerebellumCreateBody, tx?: PoolClient) {
    return this.svc.create(body as unknown as Record<string, unknown>, tx);
  }

  async updateAiCerebellum(uuid: string, body: AiCerebellumUpdateBody, tx?: PoolClient) {
    return this.svc.update(uuid, body as unknown as Record<string, unknown> & { version: number }, tx);
  }

  async deleteAiCerebellum(uuid: string, version: number) {
    return this.svc.delete(uuid, version);
  }

  async restoreAiCerebellum(uuid: string, version: number) {
    return this.svc.restore(uuid, version);
  }

  async getAiCerebellumAudit(uuid: string, page: number, limit: number) {
    return this.svc.audit(uuid, page, limit);
  }
}
