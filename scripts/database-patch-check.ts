/**
 * Thin wrapper over `primebrick-db check` (the canonical implementation in
 * @primebrick/dal-pg): delegates the entity-declaration vs committed-snapshot
 * gate. The schema domain comes from OWNED_SCHEMAS — the single source of
 * truth (src/db/owned-schemas.ts), never from env.
 *
 * Snapshot mode needs no database: it is the CI/build gate — "entities
 * changed without a committed patch" exits non-zero.
 */
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { OWNED_SCHEMAS } from "../src/db/owned-schemas.js";

const cli = join(process.cwd(), "node_modules", "@primebrick", "dal-pg", "dist", "cli", "primebrick-db.js");
// `--import tsx`: the CLI imports the entity registry module, which pulls in
// .ts entity classes — the tsx ESM loader resolves them under plain node.
const res = spawnSync(
  process.execPath,
  [
    "--import", "tsx",
    cli,
    "check",
    "--registry", "src/domain/entities/registry.ts",
    "--snapshot", "db-meta/snapshot-entities.json",
    "--schema", OWNED_SCHEMAS.join(","),
  ],
  { stdio: "inherit" },
);
process.exit(res.status ?? 1);
