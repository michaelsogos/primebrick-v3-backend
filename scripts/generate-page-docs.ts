/**
 * generate-page-docs — backend-owned user-guide pages.
 *
 * Thin service-local wiring over the shared `@primebrick/sdk` docs-gen
 * engine: imports this repo's declarations NATIVELY (tsx), loads
 * translations + census options from the platform DB, extracts facts from
 * the frontend's host `+page.svelte` sources (the sanctioned BE↔FE pair —
 * the FE is this service's own UI surface and supplies its own compiler),
 * and renders MDX into `docs/user-guide/generated/` — shipped by
 * `generate-docs-pack` (docsDir).
 *
 * Route universe = MODULE_NAV declared routes ∪ host static pages NOT
 * claimed by any module service's registry nav — the same universe the
 * runtime census serves for BE-owned surfaces.
 *
 * Usage: tsx scripts/generate-page-docs.ts
 * Env:   DATABASE_URL (required — loaded from .env below)
 */
import { config as loadEnv } from "dotenv";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import {
  assertWithinRoot,
  claimedRoutesFromRegistry,
  collectCensusOptions,
  collectDocRoutes,
  extractHostRouteSet,
  foreignEntitiesFromRegistry,
  generatePageDocs,
  loadPermValues,
  mergeTranslationScopes,
  normalizeEntityContext,
  reconcileOrder,
  routeFromHostFile,
  scanRouterCaps,
  sheetsFromNav,
  walkHostPages,
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

const req = createRequire(join(SERVICE_ROOT, "package.json"));
const ts = req("typescript") as typeof import("typescript");
const { Client } = req("pg") as typeof import("pg");
// the sanctioned seam: host pages live in fe-v3 — extraction runs with the
// FE's own svelte compiler (docs-gen injects ports, never hardcodes deps)
const svelte = (await import(pathToFileURL(join(FE_ROOT, "node_modules/svelte/compiler/index.js")).href))
  .default as { parse: (s: string, o?: { modern?: boolean }) => unknown };

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");
const pg = new Client({ connectionString: DATABASE_URL });
await pg.connect();

// ── translations: system/public/custom first (BE owns them), then every
// service schema (the option-label lexicon for census sources) ──
const { rows: registry } = await pg.query<{ code: string; schemas: string[]; endpoints: Record<string, unknown> }>(
  `SELECT code, schemas, endpoints FROM service_registry WHERE deleted_at IS NULL`,
);
const ownSchemas = ["system", "public", "custom"];
const lexiconSchemas = [...new Set(registry.flatMap((r) => r.schemas ?? []))]
  .filter((s) => !ownSchemas.includes(s));
const dicts: Record<string, string>[] = [];
for (const s of [...ownSchemas, ...lexiconSchemas]) {
  try {
    const r = await pg.query<{ key: string; value: string }>(
      `SELECT key, value FROM ${s}.translations WHERE language='en-GB'`,
    );
    dicts.push(Object.fromEntries(r.rows.map((row) => [row.key, row.value])));
  } catch { /* schema without translations */ }
}
const translations = mergeTranslationScopes(...dicts);

// ── census options: every module's emits/callables from the registry ──
const censusOptions = collectCensusOptions(
  registry.map((r) => ({
    service: r.code,
    emits: (r.endpoints?.events as { emits?: [] } | undefined)?.emits ?? [],
    callables: (r.endpoints?.callables as { callables?: [] } | undefined)?.callables ?? [],
  })),
);

// ── identity provider display name ──
let idpName: string | undefined;
try {
  const { rows: [idp] } = await pg.query<{ value: string }>(
    `SELECT value FROM public.config_entries WHERE key='idp_type' LIMIT 1`,
  );
  idpName = idp?.value ? idp.value.replace(/\b\w/g, (c: string) => c.toUpperCase()) : undefined;
} catch { /* absent */ }
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

// ── host statics: every fe page, minus claimed-by-services and declared ──
// (BE documents only what no module declared — same rule the census applies)
const claimed = new Set(claimedRoutesFromRegistry(registry, "be"));
const allHostRoutes = walkHostPages(FE_ROUTES).map((f) => routeFromHostFile(f, FE_ROUTES));
// excluded from the user guide: catch-alls, the app root shell, dev-only
// surfaces (/dev/* is tooling, not a documented page)
const unclaimed = allHostRoutes.filter(
  (r) => !routeMap.has(r) && !claimed.has(r)
    && !r.includes("[...") && !r.includes("{...")
    && r !== "/" && !r.startsWith("/dev/"),
);
const hostFacts = extractHostRouteSet(FE_ROUTES, allHostRoutes.filter((r) => routeMap.has(r) || unclaimed.includes(r)), { svelte, ts });
for (const [route, doc] of routeMap) if (hostFacts[route]) doc.facts = hostFacts[route];
for (const route of unclaimed) routeMap.set(route, { route, kind: "page", facts: hostFacts[route], delivery: "host-static" });

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
  routes: [...routeMap.values()],
  sheets,
  meta_by_entity,
  caps_by_entity: scan.caps_by_entity,
  extra_routes: scan.extra_routes,
  perm_values: permValues,
  translations,
  census_options: censusOptions,
  foreign_entities: foreignEntitiesFromRegistry(registry, "be"),
  idp_name: idpName,
  access_namespace: "access.system.settings",
  out_dir: OUT_DIR,
  keep_files: [
    "entity-api-catalog",
    "entity-field-reference",
    "filter-operator-reference",
    "filter-syntax-guide",
    "navigation-map",
  ],
});

console.log(`generated ${report.emitted.length} page(s) → docs/user-guide/generated`);
for (const f of report.emitted) console.log(`  + ${f}`);
if (report.skipped.length) {
  console.warn(`coverage: ${report.skipped.length} declared route(s) produced no document:`);
  for (const s of report.skipped) console.warn(`  - ${s.route} (${s.reason})`);
}
if (report.ghosts_deleted.length) {
  console.log(`ghosts deleted: ${report.ghosts_deleted.join(", ")}`);
}
const ord = reconcileOrder(OUT_DIR);
if (ord.added.length || ord.dropped.length) {
  console.log(`_order.json: +${ord.added.length} -${ord.dropped.length}`);
}
