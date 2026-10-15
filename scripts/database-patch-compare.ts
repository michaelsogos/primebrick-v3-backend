/**
 * Builds canonical JSON snapshots: from @Entity registry vs local PostgreSQL,
 * then writes diff (entity intent vs database target).
 *
 * Run this when you change @Entity models / schema intent — not from git post-merge.
 * SQL patches: `db-meta/patches/<UTC_yyyyMMddHHmmss>_<slug>.sql`
 *
 * After generation: `primebrick-db sign --db-meta db-meta ...` seals the
 * manifest — unsigned manifests are refused by the apply engine (fail-closed).
 */
import { readFileSync, mkdirSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import {
  buildDatabaseSnapshot,
  buildEntitySnapshot,
  buildPatchFilename,
  patchNameFromFilename,
  sha256Hex,
  buildSqlPatchFromMetaDiff,
  compareSnapshots,
  getEntityPersistenceMeta,
  loadManifest,
  writeManifest,
  manifestPaths,
  type EntityClass,
  type PatchManifest,
} from "@primebrick/dal-pg";
import { ENTITY_REGISTRY } from "../src/domain/entities/registry.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const backendRoot = join(__dirname, "..");

function tryLoadDatabaseUrlFromEnvFile() {
  if (process.env.DATABASE_URL) return;
  try {
    const raw = readFileSync(join(backendRoot, ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const k = trimmed.slice(0, eq).trim();
      if (k !== "DATABASE_URL") continue;
      let v = trimmed.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      process.env.DATABASE_URL = v;
      return;
    }
  } catch {
    /* no .env */
  }
}

tryLoadDatabaseUrlFromEnvFile();

const outDir = join(backendRoot, "db-meta");
const patchesDir = join(outDir, "patches");
mkdirSync(outDir, { recursive: true });
mkdirSync(patchesDir, { recursive: true });

const entitySnap = buildEntitySnapshot(ENTITY_REGISTRY as EntityClass[]);

const url = process.env.DATABASE_URL;
if (!url) {
  writeFileSync(join(outDir, "snapshot-entities.json"), JSON.stringify(entitySnap, null, 2));
  console.warn("DATABASE_URL not set: wrote snapshot-entities.json only (no database snapshot / diff).");
  process.exit(0);
}

const tables = ENTITY_REGISTRY.map((c) => {
  const m = getEntityPersistenceMeta(c as EntityClass);
  return { schema: m.tableSchema, name: m.tableName };
});

const pool = new Pool({ connectionString: url, max: 2 });
let dbSnap;
try {
  dbSnap = await buildDatabaseSnapshot(pool, tables);
} finally {
  await pool.end();
}
const diff = compareSnapshots(entitySnap, dbSnap);
const sqlPatch = buildSqlPatchFromMetaDiff(entitySnap, diff);

writeFileSync(join(outDir, "snapshot-entities.json"), JSON.stringify(entitySnap, null, 2));
writeFileSync(join(outDir, "snapshot-database.json"), JSON.stringify(dbSnap, null, 2));
writeFileSync(join(outDir, "diff-entities-vs-database.json"), JSON.stringify(diff, null, 2));

const noop =
  diff.onlyInEntityTables.length === 0 &&
  Object.values(diff.tables).every(
    (t) =>
      !t.onlyInEntityColumns.length &&
      !t.likelyRenames.length &&
      !t.typeMismatches.length &&
      !t.nullabilityMismatches.length &&
      !(t.onlyInEntityIndexes?.length) &&
      !(t.onlyInEntityForeignKeys?.length),
  );

if (!noop) {
  const patchFilename = buildPatchFilename(diff);
  writeFileSync(join(patchesDir, patchFilename), sqlPatch);
  console.log(`SQL patch: ${join(patchesDir, patchFilename)}`);
  refreshManifest();
  console.warn("MANIFEST.json refreshed (UNSIGNED) — run `primebrick-db sign` to seal it");
} else {
  console.log("no drift — no patch written");
}

if (diff.renameHeuristicUserReviewRequired) {
  console.warn(
    "renameHeuristicUserReviewRequired: ambiguous rename heuristic — do not apply likelyRenames SQL without asking the user. See diff.renameHeuristicAgentInstruction."
  );
}

console.log(`Database patch snapshots written to ${outDir}`);

/** Re-hash every patch file on disk into MANIFEST.json (unsigned — sign seals it). */
function refreshManifest(): void {
  const { manifestPath } = manifestPaths(outDir);
  const existing = loadManifest(manifestPath);
  const patches: Record<string, string> = { ...(existing?.patches ?? {}) };
  for (const f of readdirSync(patchesDir).filter((f) => f.endsWith(".sql")).sort()) {
    patches[patchNameFromFilename(f)] = sha256Hex(readFileSync(join(patchesDir, f), "utf8"));
  }
  const onDisk = new Set(
    readdirSync(patchesDir).filter((f) => f.endsWith(".sql")).map(patchNameFromFilename),
  );
  for (const k of Object.keys(patches)) if (!onDisk.has(k)) delete patches[k];
  writeManifest(manifestPath, {
    version: 1,
    key_id: existing?.key_id ?? "unsigned",
    issued_at: new Date().toISOString(),
    patches,
    signature: "",
  } as PatchManifest);
}
