/**
 * entity-write — shared `{ entity, translations? }` write-payload standard
 * for all `/api/v1/entities/:entity` single-row writes (POST create,
 * PUT update).
 *
 * The envelope wraps an existing entity body schema WITHOUT touching its
 * validation rules: `entityWriteBody(S)` produces
 * `{ entity: S, translations?: PendingTranslation[] }` as a strict object —
 * a flat legacy body fails with `unrecognized_keys` (400, hard break).
 *
 * `translations` piggyback rows are inserted in the SAME transaction as the
 * entity write (atomic: all-or-nothing) via `persistPendingTranslations`
 * inside `runInTransaction`. They are translation WRITES and therefore
 * require `translation.create.single` on top of the route's gate
 * (`assertTranslationsPermission`).
 *
 * Bulk ops (bulk-update, bulk-delete, bulk-restore, duplicate) are exempt:
 * they already run atomic via streams + temp tables and their bodies are not
 * entity payloads. The translation entity itself uses `entityOnlyWriteBody`
 * — a translation row has no translations.
 */

import type { Request } from "express";
import type { Pool, PoolClient } from "pg";
import { z } from "zod";

import { Permission, checkRbac } from "@primebrick/sdk";
import { runInTransaction } from "@primebrick/dal-pg";

import { ForbiddenError } from "./api-errors.js";
import { TranslationsDal } from "../modules/system/translations-dal.js";

export const PendingTranslationSchema = z.object({
  key: z.string().min(1).max(255),
  language: z.string().min(1).max(10),
  value: z.string(),
});
export type PendingTranslation = z.infer<typeof PendingTranslationSchema>;

/**
 * Wrap an entity body schema into the `{entity, translations?}` standard.
 * The inner schema is used verbatim — all Zod rules, superRefine and
 * partial() are preserved unchanged.
 */
export function entityWriteBody<S extends z.ZodTypeAny>(entitySchema: S) {
  return z
    .object({
      entity: entitySchema,
      translations: z.array(PendingTranslationSchema).optional(),
    })
    .strict();
}

/**
 * Same envelope for entities that may never carry piggybacked translations
 * (the translation entity itself). `.strict()` rejects a `translations`
 * sibling with `unrecognized_keys`.
 */
export function entityOnlyWriteBody<S extends z.ZodTypeAny>(entitySchema: S) {
  return z.object({ entity: entitySchema }).strict();
}

/**
 * Piggybacked translation rows are translation WRITES — they require
 * `translation.create.single` on top of the route's existing permission gate.
 * No-op when no translations are present.
 */
export function assertTranslationsPermission(
  req: Request,
  translations: PendingTranslation[] | undefined,
): void {
  if (!translations?.length) return;
  const rbac = checkRbac(req.user!, [Permission.TRANSLATION_CREATE_SINGLE]);
  if (!rbac.allowed) {
    throw new ForbiddenError("Missing permission: translation.create.single", {
      internal_code: "RBAC_MISSING_PERMISSION",
    });
  }
}

/**
 * Insert pending translation rows inside an open transaction.
 * Statement-level idempotent (createIfAbsent: false → ON CONFLICT DO
 * NOTHING): a duplicate (key, language) is skipped, never fatal.
 * Key prefix == translation module code (app.*, system.*, custom.*).
 */
export async function persistPendingTranslations(
  translationsDal: TranslationsDal,
  rows: PendingTranslation[],
  tx: PoolClient,
): Promise<void> {
  for (const t of rows) {
    await translationsDal.create(t.key.split(".")[0], t, {
      tx,
      createIfAbsent: false,
    });
  }
}

/**
 * Post-commit cache invalidation for piggybacked translations: flush the
 * i18n dict of every touched module (key prefix).
 */
export async function invalidateTranslationModules(
  translationsDal: TranslationsDal,
  rows: PendingTranslation[],
): Promise<void> {
  const modules = new Set(rows.map((t) => t.key.split(".")[0]));
  for (const moduleCode of modules) {
    await translationsDal.invalidateModuleCache(moduleCode);
  }
}

/**
 * Router-level write orchestrator for the `{entity, translations?}` standard.
 *
 * - `translations` empty → `write()` runs plain (no tx overhead).
 * - `translations` present → entity write + translation inserts commit in ONE
 *   transaction; `invalidateEntityCache` + i18n dict invalidation run
 *   post-commit.
 *
 * `write(tx?)` must forward `tx` down to the dal write so the entity row
 * lands in the same transaction.
 */
export async function runEntityWrite<T>(
  pool: Pool,
  translations: PendingTranslation[] | undefined,
  write: (tx?: PoolClient) => Promise<T>,
  invalidateEntityCache?: () => Promise<void>,
): Promise<T> {
  if (!translations?.length) {
    return write();
  }
  const translationsDal = new TranslationsDal(pool);
  const result = await runInTransaction(pool, async (tx) => {
    const out = await write(tx);
    await persistPendingTranslations(translationsDal, translations, tx);
    return out;
  });
  // Post-commit: deferred cache invalidation (entity cache + i18n dicts)
  if (invalidateEntityCache) await invalidateEntityCache();
  await invalidateTranslationModules(translationsDal, translations);
  return result;
}
