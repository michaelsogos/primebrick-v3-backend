/**
 * AiModelsService — business logic for the `ai_model` entity.
 *
 * Owns the list / get / create / update / delete / restore / audit flows.
 * The service is request-context-free: it takes plain parameters and reads
 * the actor from ALS (`requireActor()`) via the DAL. It never touches
 * `req`/`res`.
 *
 * Errors are thrown as `ApiError` subclasses so the centralized `errorHandler`
 * can convert them to RFC 7807 JSON.
 */
import type { Pool, PoolClient } from "pg";

import { AiModelsDal } from "./ai_models_dal.js";
import type {
  AiModelCreateBody,
  AiModelUpdateBody,
  AiModelListQuery,
} from "./dto.js";
import { getPool } from "../../db/pool.js";
import {
  ApiError,
  NotFoundError,
  ValidationError,
} from "../../http/api-errors.js";

export class AiModelsService {
  private dal: AiModelsDal | null = null;

  private getDal(): AiModelsDal {
    if (this.dal) return this.dal;
    const pool: Pool = getPool();
    this.dal = new AiModelsDal(pool);
    return this.dal;
  }

  // --- List -----------------------------------------------------------------

  async listAiModels(query: AiModelListQuery) {
    try {
      return await this.getDal().listAiModels({
        search: query.search,
        search_in: query.search_in ?? undefined,
        sort_key: query.sort_key,
        sort_dir: query.sort_dir,
        page: query.page ?? undefined,
        page_size: query.page_size ?? undefined,
        filters: query.filters,
        connector: query.connector,
        deleted_records: query.deleted_records,
      });
    } catch (e) {
      throw new ApiError(
        "/errors/list-failed",
        "An unexpected error occurred while fetching AI model list",
        500,
        "Failed to fetch AI model list",
        { severity: "HIGH" },
      );
    }
  }

  // --- Single record --------------------------------------------------------

  async getAiModel(uuid: string) {
    const found = await this.getDal().findByUuid(uuid);
    if (!found) {
      throw new NotFoundError("The requested AI model could not be found", {
        internal_code: "AI_MODEL_NOT_FOUND",
      });
    }
    return found;
  }

  // --- Create / Update / Delete / Restore -----------------------------------

  async createAiModel(body: AiModelCreateBody, tx?: PoolClient) {
    // Check model_id uniqueness before creating
    const existing = await this.getDal().findByModelId(body.model_id);
    if (existing) {
      throw new ValidationError("An AI model with this model_id already exists", {
        internal_code: "AI_MODEL_MODEL_ID_DUPLICATE",
      });
    }
    return this.getDal().createAiModel(body, tx);
  }

  async updateAiModel(uuid: string, body: AiModelUpdateBody, tx?: PoolClient) {
    // If model_id is being changed, check uniqueness against other rows
    if (body.model_id !== undefined) {
      const existing = await this.getDal().findByModelId(body.model_id);
      if (existing && existing.uuid !== uuid) {
        throw new ValidationError("An AI model with this model_id already exists", {
          internal_code: "AI_MODEL_MODEL_ID_DUPLICATE",
        });
      }
    }
    return await this.getDal().updateAiModel(uuid, body, tx);
  }

  async deleteAiModel(uuid: string, version: number) {
    return await this.getDal().deleteAiModel(uuid, version);
  }

  async restoreAiModel(uuid: string, version: number) {
    return await this.getDal().restoreAiModel(uuid, version);
  }

  // --- Audit ----------------------------------------------------------------

  async getAiModelAudit(uuid: string, page: number, limit: number) {
    return this.getDal().getAiModelAudit(uuid, page, limit);
  }
}
