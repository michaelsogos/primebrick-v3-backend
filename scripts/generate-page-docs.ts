/**
 * generate-page-docs — backend-owned user-guide pages.
 *
 * Thin service-local wiring over the shared `@primebrick/sdk` docs-gen
 * engine: imports this repo's declarations NATIVELY (tsx), loads
 * translations + census options from the platform DB via the shared
 * `loadDocsDbContext`, extracts facts from the frontend's host
 * `+page.svelte` sources (the sanctioned BE↔FE pair — the FE is this
 * service's own UI surface and supplies its own compiler), and renders
 * MDX into `docs/user-guide/generated/` — shipped by `generate-docs-pack`
 * (docsDir).
 *
 * Route universe = MODULE_NAV declared routes ∪ host static pages NOT
 * claimed by any module service's registry nav — the same universe the
 * runtime census serves for BE-owned surfaces.
 *
 * Usage: tsx scripts/generate-page-docs.ts
 * Env:   DATABASE_URL (required — loaded from .env below)
 */
import { config as loadEnv } from "dotenv";
import { readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  applyHostFacts,
  assertWithinRoot,
  collectDocRoutes,
  foreignEntitiesFromRegistry,
  generatePageDocs,
  loadDocsCompilers,
  loadDocsDbContext,
  loadPermValues,
  normalizeEntityContext,
  printDocsReport,
  scanRouterCaps,
  sheetsFromNav,
  type DocRoute,
  type DocSheet,
} from "@primebrick/sdk";
import { buildModuleNavMeta, listModuleNavCodes } from "../src/modules/module-nav-meta.js";

loadEnv();

const SERVICE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(SERVICE_ROOT, "docs", "user-guide", "generated");
const FE_ROOT = resolve(SERVICE_ROOT, "..", "primebrick-fe-v3");
const FE_ROUTES = join(FE_ROOT, "src", "routes", "(app)");
const ROUTER_DIR = join(SERVICE_ROOT, "src", "controllers", "http");
assertWithinRoot(SERVICE_ROOT, OUT_DIR, ROUTER_DIR);

// the sanctioned seam: host pages live in fe-v3 — extraction runs with the
// FE's own svelte compiler (docs-gen injects ports, never hardcodes deps)
const { ts, PgClient, svelte } = await loadDocsCompilers(SERVICE_ROOT, FE_ROOT);

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");
const pg = new PgClient({ connectionString: DATABASE_URL });
await pg.connect();
const { registry, translations, census_options, idp_name } = await loadDocsDbContext(pg, [
  "system",
  "public",
  "custom",
]);
await pg.end();

// ── declared census → doc routes (MODULE_NAV is keyed by module code) ──
const routeMap = new Map<string, DocRoute>();
const sheets: DocSheet[] = [];
for (const code of listModuleNavCodes()) {
  const mod = buildModuleNavMeta(code);
  if (!mod) continue;
  for (const r of collectDocRoutes(mod)) routeMap.set(r.route, r);
  sheets.push(...sheetsFromNav(mod));
}
const routes = [...routeMap.values()];

// ── host statics: every fe page, minus claimed-by-services and declared ──
const allRoutes = applyHostFacts(
  { mode: "host", routes_root: FE_ROUTES },
  routes,
  registry,
  "be",
  { svelte, ts },
);

// ── metas: src/modules/**/*.meta.ts evaluated natively (pure literals) ──
const metaDecls: { entityName: string; meta: Record<string, unknown> }[] = [];
const walkMetas = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walkMetas(join(dir, e.name)) : e.name.endsWith(".meta.ts") ? [join(dir, e.name)] : []);
for (const f of walkMetas(join(SERVICE_ROOT, "src", "modules"))) {
  const mod = (await import(pathToFileURL(f).href)) as Record<string, unknown>;
  for (const v of Object.values(mod))
    if (v && typeof v === "object" && typeof (v as { entity?: unknown }).entity === "string")
      metaDecls.push({ entityName: (v as { entity: string }).entity, meta: v as Record<string, unknown> });
}

// ── caps: router scan (makeEntityRouter configs are not importable) ──
// package "exports" doesn't expose dist/* — resolve on disk through the
// node_modules symlink (workspace-linked SDK)
const sdkDist = join(SERVICE_ROOT, "node_modules", "@primebrick", "sdk", "dist");
const permValues = loadPermValues(join(sdkDist, "auth", "permissions.d.ts"));
const scan = scanRouterCaps(ROUTER_DIR, permValues);
const { meta_by_entity } = normalizeEntityContext(metaDecls);

const report = generatePageDocs({
  service_code: "be",
  routes: allRoutes,
  sheets,
  meta_by_entity,
  caps_by_entity: scan.caps_by_entity,
  extra_routes: scan.extra_routes,
  perm_values: permValues,
  translations,
  census_options,
  foreign_entities: foreignEntitiesFromRegistry(registry, "be"),
  idp_name,
  access_namespace: "access.system.settings",
  out_dir: OUT_DIR,
});

printDocsReport(report, OUT_DIR);
