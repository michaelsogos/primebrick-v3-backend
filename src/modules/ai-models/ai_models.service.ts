/**
 * AiModelsService — thin facade over `makeEntityService` (Part E).
 *
 * Core CRUD is generic; this facade keeps the legacy method names consumed by
 * `ai-models.router` plus the entity-specific write rules expressed as
 * `beforeCreate`/`beforeUpdate` hooks in the service config:
 *   - `power_level` is always DERIVED from `working_set_mb`, never manual;
 *   - (model_id, dtype) uniqueness is pre-checked on update so the caller gets
 *     a domain error instead of a raw conflict.
 * List-cache invalidation stays in `hooks.afterWrite` — the router keeps
 * wiring `service.invalidateCache()` for compatibility.
 */

import type { PoolClient } from "pg";

import { makeEntityService, type EntityService } from "../../http/entity-service.js";
import { AiModelEntity } from "./ai_model_entity.js";
import type {
  AiModelCreateBody,
  AiModelUpdateBody,
  AiModelListQuery,
  AiModelDetailDto,
} from "./dto.js";
import {
  AI_MODEL_DEFAULT_SORT,
  AI_MODEL_SEARCHABLE_KEYS,
  AI_MODEL_FILTERABLE_KEYS,
} from "./list-config.js";
import { powerLevelFromWorkingSet } from "./power-level.js";
import { getCachePort } from "../../cache/cache-port-holder.js";
import { NotFoundError, ValidationError } from "../../http/api-errors.js";

const LIST_CACHE_KEY = "dal:ai_model:list";

export class AiModelsService {
  private svc: EntityService<AiModelDetailDto>;

  constructor() {
    this.svc = makeEntityService<AiModelDetailDto>({
      entity: AiModelEntity,
      list: {
        searchableKeys: AI_MODEL_SEARCHABLE_KEYS,
        filterableKeys: new Set(AI_MODEL_FILTERABLE_KEYS),
        defaultSort: AI_MODEL_DEFAULT_SORT,
      },
      hooks: {
        beforeCreate: (body) => {
          // power_level is always derived from working_set_mb.
          const derived = powerLevelFromWorkingSet(body.working_set_mb as number | undefined);
          return derived !== null ? { ...body, power_level: derived } : body;
        },
        beforeUpdate: async (uuid, body) => {
          // If the variant identity (model_id or dtype) is being changed,
          // check uniqueness of the effective pair against other rows.
          if (body.model_id !== undefined || body.dtype !== undefined) {
            let current: AiModelDetailDto;
            try {
              current = await this.svc.get(uuid);
            } catch {
              throw new NotFoundError("The requested AI model could not be found", {
                internal_code: "AI_MODEL_NOT_FOUND",
              });
            }
            const effectiveModelId = (body.model_id ?? current.model_id) as string;
            const effectiveDtype = body.dtype !== undefined ? body.dtype : current.dtype;
            const candidates = await this.svc.list({
              filters: [{ field: "model_id", op: "=", value: effectiveModelId }],
              page_size: 100,
            });
            const clash = candidates.rows.find(
              (r) => r.uuid !== uuid && r.dtype === effectiveDtype,
            );
            if (clash) {
              throw new ValidationError("An AI model with this model_id already exists", {
                internal_code: "AI_MODEL_MODEL_ID_DUPLICATE",
              });
            }
          }
          const derived = powerLevelFromWorkingSet(body.working_set_mb as number | undefined);
          return derived !== null ? { ...body, power_level: derived } : body;
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

  async listAiModels(query: AiModelListQuery) {
    return this.svc.list(query);
  }

  async getAiModel(uuid: string) {
    return this.svc.get(uuid);
  }

  async createAiModel(body: AiModelCreateBody, tx?: PoolClient) {
    return this.svc.create(body as unknown as Record<string, unknown>, tx);
  }

  async updateAiModel(uuid: string, body: AiModelUpdateBody, tx?: PoolClient) {
    return this.svc.update(uuid, body as unknown as Record<string, unknown> & { version: number }, tx);
  }

  async deleteAiModel(uuid: string, version: number) {
    return this.svc.delete(uuid, version);
  }

  async restoreAiModel(uuid: string, version: number) {
    return this.svc.restore(uuid, version);
  }

  async getAiModelAudit(uuid: string, page: number, limit: number) {
    return this.svc.audit(uuid, page, limit);
  }
}
