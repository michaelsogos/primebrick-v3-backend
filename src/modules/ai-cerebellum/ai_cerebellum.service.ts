/**
 * AiCerebellumService — business logic for the `ai_cerebellum` entity.
 *
 * Mirrors `AiModelsService` — thin orchestration over the DAL, errors thrown
 * as `ApiError` subclasses for the centralized RFC 7807 handler.
 */
import type { Pool, PoolClient } from "pg";

import { AiCerebellumDal } from "./ai_cerebellum_dal.js";
import type {
  AiCerebellumCreateBody,
  AiCerebellumUpdateBody,
  AiCerebellumListQuery,
} from "./dto.js";
import { getPool } from "../../db/pool.js";
import {
  ApiError,
  NotFoundError,
  ValidationError,
} from "../../http/api-errors.js";

export class AiCerebellumService {
  private dal: AiCerebellumDal | null = null;

  private getDal(): AiCerebellumDal {
    if (this.dal) return this.dal;
    const pool: Pool = getPool();
    this.dal = new AiCerebellumDal(pool);
    return this.dal;
  }

  // --- List -----------------------------------------------------------------

  async listAiCerebellum(query: AiCerebellumListQuery) {
    try {
      return await this.getDal().listAiCerebellum({
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
        "An unexpected error occurred while fetching AI cerebellum list",
        500,
        "Failed to fetch AI cerebellum list",
        { severity: "HIGH" },
      );
    }
  }

  // --- Single record --------------------------------------------------------

  async getAiCerebellum(uuid: string) {
    const found = await this.getDal().findByUuid(uuid);
    if (!found) {
      throw new NotFoundError("The requested AI cerebellum could not be found", {
        internal_code: "AI_CEREBELLUM_NOT_FOUND",
      });
    }
    return found;
  }

  // --- Create / Update / Delete / Restore -----------------------------------

  async createAiCerebellum(body: AiCerebellumCreateBody, tx?: PoolClient) {
    const existing = await this.getDal().findByAssistantAndModel(
      body.assistant_key,
      body.model_id,
    );
    if (existing.some((t) => t.name === body.name)) {
      throw new ValidationError(
        "An AI cerebellum tuning with this name already exists for this assistant/model",
        { internal_code: "AI_CEREBELLUM_NAME_DUPLICATE" },
      );
    }
    return this.getDal().createAiCerebellum(body, tx);
  }

  async updateAiCerebellum(uuid: string, body: AiCerebellumUpdateBody, tx?: PoolClient) {
    return await this.getDal().updateAiCerebellum(uuid, body, tx);
  }

  async deleteAiCerebellum(uuid: string, version: number) {
    return await this.getDal().deleteAiCerebellum(uuid, version);
  }

  async restoreAiCerebellum(uuid: string, version: number) {
    return await this.getDal().restoreAiCerebellum(uuid, version);
  }

  // --- Audit ----------------------------------------------------------------

  async getAiCerebellumAudit(uuid: string, page: number, limit: number) {
    return this.getDal().getAiCerebellumAudit(uuid, page, limit);
  }
}
