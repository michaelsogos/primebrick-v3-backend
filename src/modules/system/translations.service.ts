/**
 * TranslationsService — business logic for the translation CRUD gateway.
 *
 * Wraps `TranslationsDal`: i18n dict reads (with cache) and the module-scoped
 * admin CRUD. The service is request-context-free: it never touches
 * `req`/`res`. Errors propagate to the centralized `errorHandler` as RFC 7807.
 */

import type { CacheEntry, I18nDict } from "@primebrick/sdk";

import { getPool } from "../../db/pool.js";
import {
  TranslationsDal,
  type TranslationListQuery,
  type TranslationCreateBody,
  type TranslationUpdateBody,
} from "./translations-dal.js";

export class TranslationsService {
  private dal: TranslationsDal | null = null;

  private getDal(): TranslationsDal {
    if (this.dal) return this.dal;
    this.dal = new TranslationsDal(getPool());
    return this.dal;
  }

  /**
   * Flat i18n dict for a module schema (cached; used with etagMiddleware).
   */
  async getI18nDict(
    module: string,
    language: string,
  ): Promise<CacheEntry<I18nDict>> {
    return this.getDal().getI18nDictWithCache(module, language);
  }

  async list(module: string, query: TranslationListQuery) {
    return this.getDal().list(module, query);
  }

  async create(module: string, entity: TranslationCreateBody) {
    return this.getDal().create(module, entity);
  }

  async update(module: string, uuid: string, entity: TranslationUpdateBody) {
    return this.getDal().update(module, uuid, entity);
  }

  async softDelete(module: string, uuid: string): Promise<void> {
    await this.getDal().softDelete(module, uuid);
  }

  async restore(module: string, uuid: string): Promise<void> {
    await this.getDal().restore(module, uuid);
  }
}
