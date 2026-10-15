/**
 * DbMigrationService — BE-side remediation logic for the `db_patch` system
 * module. Thin orchestration over the dal-pg migration engine helpers;
 * the controller layer only validates + serializes (controller-boundary).
 */
import { join } from "node:path";
import {
  registryStatus,
  retryFailedPatches,
  approvePendingReview,
  resolveManually,
  runMigrations,
  checkDrift,
  isDriftClean,
  type EntityClass,
} from "@primebrick/dal-pg";
import { getPool } from "../../db/dal-gateway.js";
import { ENTITY_REGISTRY } from "../../domain/entities/registry.js";
import { getBeMigrationState } from "../../db/run-be-migrations.js";
import { NotFoundError } from "../../http/api-errors.js";

const SCHEMA = "public";

export class DbMigrationService {
  async status() {
    return {
      service_schema: SCHEMA,
      degraded: getBeMigrationState().degraded,
      last_error: getBeMigrationState().lastError,
      boot_result: getBeMigrationState().result,
      patches: await registryStatus(
      // standards-exempt: getPool — migration control surface (patch registry tooling)
      getPool(), SCHEMA),
    };
  }

  private async rerun(actor: string) {
    const result = await runMigrations({
      // standards-exempt: getPool — migration engine needs the raw pool (advisory locks, DDL)
      pool: getPool(),
      schema: SCHEMA,
      patchesDir: join(process.cwd(), "db-meta", "patches"),
      allowedTrust:
        process.env.NODE_ENV === "production" ? ["release"] : ["dev", "release"],
      actor,
    });
    const st = getBeMigrationState();
    st.result = result;
    st.degraded = result.degraded;
    st.lastError = result.failed[0]?.error ?? null;
    return result;
  }

  async retry(actorUuid: string) {
    const actor = `admin:${actorUuid}`;
    const flipped = await retryFailedPatches(
      // standards-exempt: getPool — migration control surface
      getPool(), SCHEMA, actor);
    return { retried: flipped, result: await this.rerun(actor) };
  }

  async approve(patchName: string, note: string | undefined, actorUuid: string) {
    const actor = `admin:${actorUuid}`;
    const ok = await approvePendingReview(
      // standards-exempt: getPool — migration control surface
      getPool(), SCHEMA, patchName, actor, note);
    if (!ok) {
      throw new NotFoundError(`no pending_review patch named '${patchName}'`, {
        internal_code: "PATCH_NOT_PENDING_REVIEW",
      });
    }
    return { approved: true, result: await this.rerun(actor) };
  }

  async resolve(patchName: string, note: string, actorUuid: string) {
    const actor = `admin:${actorUuid}`;
    const ok = await resolveManually(
      // standards-exempt: getPool — migration control surface
      getPool(), SCHEMA, patchName, actor, note);
    if (!ok) {
      throw new NotFoundError(`no failed/pending patch named '${patchName}'`, {
        internal_code: "PATCH_NOT_FOUND",
      });
    }
    return { resolved: true, result: await this.rerun(actor) };
  }

  async driftCheck() {
    const diff = await checkDrift(
      // standards-exempt: getPool — drift inspection is migration tooling
      ENTITY_REGISTRY as unknown as EntityClass[], getPool());
    return { checked: true, clean: isDriftClean(diff), diff };
  }
}
