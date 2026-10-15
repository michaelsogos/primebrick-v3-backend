/**
 * BE own-schema migrations — same engine as every microservice, but BE is
 * the gateway: it cannot "not register" or 503 itself (it IS the admin
 * remediation surface). On critical failure the BE keeps serving but marks
 * itself degraded — the flag surfaces in /health and the db-migration
 * admin routes so an operator sees it immediately.
 *
 * Runs as the FIRST startup task, before role mappings / auth config /
 * any other table read — mode is read by the engine from
 * public.config_entries (key `db_migration.mode`), never from env.
 */
import { join } from "node:path";
import { runMigrations, type MigrationRunResult } from "@primebrick/dal-pg";
import { getPool } from "./dal-gateway.js";
import { ENTITY_REGISTRY } from "../domain/entities/registry.js";
import type { EntityClass } from "@primebrick/dal-pg";
import { checkDrift, isDriftClean } from "@primebrick/dal-pg";
import { logger } from "@primebrick/sdk";

export interface BeMigrationState {
  result: MigrationRunResult | null;
  degraded: boolean;
  lastError: string | null;
}

const state: BeMigrationState = { result: null, degraded: false, lastError: null };
export function getBeMigrationState(): BeMigrationState {
  return state;
}

export async function runBeMigrations(): Promise<BeMigrationState> {
  try {
    const result = await runMigrations({
      // standards-exempt: getPool — migration engine needs the raw pool (advisory locks, DDL)
      pool: getPool(),
      schema: "public",
      patchesDir: join(process.cwd(), "db-meta", "patches"),
      allowedTrust:
        process.env.NODE_ENV === "production" ? ["release"] : ["dev", "release"],
      actor: `be-boot:${process.pid}`,
      logger,
    });
    state.result = result;
    state.degraded = result.degraded;

    if (result.degraded) {
      logger.error(
        "db-migration: CRITICAL patch failure — BE stays up (it is the remediation surface) but is flagged degraded; remediate via /api/v1/system/db-migration/*",
        { tags: ["db-migration"], error: result.failed.map((f) => `${f.patch_name}: ${f.error}`).join(" | ") },
      );
      return state;
    }

    // standards-exempt: getPool — drift inspection is migration tooling
    const drift = await checkDrift(ENTITY_REGISTRY as unknown as EntityClass[], getPool());
    if (!isDriftClean(drift)) {
      logger.warn("db-migration: post-apply drift remains (see diff-entities-vs-database.json / drift-check route)", {
        tags: ["db-migration"],
        onlyInEntityTables: drift.onlyInEntityTables,
      });
    } else {
      logger.done("db-migration: post-apply drift check clean", { tags: ["db-migration"] });
    }
    return state;
  } catch (error) {
    state.degraded = true;
    state.lastError = error instanceof Error ? error.message : String(error);
    logger.error(`db-migration: engine aborted — BE degraded (${state.lastError})`, {
      tags: ["db-migration"],
      error,
    });
    return state;
  }
}
