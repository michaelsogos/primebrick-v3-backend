/**
 * generate-reference-docs — metadata-derived user-guide pages, generated
 * IN the owning repo (successor of v3-docs generate-reference-docs.mjs).
 *
 * Emits into docs/user-guide/generated/:
 *   1. entity-field-reference.mdx   — fields from src/modules/**\/*.meta.ts
 *   2. filter-operator-reference.mdx — SqlOperator union from @primebrick/dal-pg
 *   3. filter-syntax-guide.mdx       — examples per operator and entity
 *   4. navigation-map.mdx            — module routes from module-nav-meta
 *
 * Sources are repo-local (meta files, DAL dependency, module nav) — no
 * cross-repo filesystem reads.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { buildModuleNavMeta, listModuleNavCodes } from "../src/modules/module-nav-meta.js";

// ─── Source collection ────────────────────────────────────────────────────

type EntityColumn = {
  key: string;
  type?: string;
  label_key?: string;
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  audited?: boolean;
};
type EntityMeta = {
  entity?: string;
  translation_key?: string;
  title_key?: string;
  uid?: string;
  display_field?: string;
  columns?: EntityColumn[];
  table?: {
    default_sort?: { key: string; dir?: string };
    row_custom_actions?: { action_name: string }[];
  };
};

// MDX-safe prose: escape MDX metacharacters outside inline-code spans so
// `{`, `}`, `<`, `>` in generated text can never be parsed as JSX/expressions.
function mdxSafe(s: string): string {
  return String(s).replace(/(`[^`]*`)|[{}<>]/g, (m, codeSpan) =>
    codeSpan ? m : `&#${m.charCodeAt(0)};`,
  );
}

function listFilesRecursive(dir: string, predicate: (n: string) => boolean): string[] {
  const out: string[] = [];
  function walk(d: string) {
    for (const name of readdirSync(d)) {
      const full = join(d, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (predicate(name)) out.push(full);
    }
  }
  walk(dir);
  return out;
}

/** Import every *.meta.ts and pick the exported *Meta object(s). */
async function collectEntityMetas(modulesDir: string): Promise<EntityMeta[]> {
  const metas: EntityMeta[] = [];
  for (const file of listFilesRecursive(modulesDir, (n) => n.endsWith(".meta.ts"))) {
    const mod = (await import(pathToFileURL(file).href)) as Record<string, unknown>;
    for (const value of Object.values(mod)) {
      if (value && typeof value === "object" && "entity" in (value as EntityMeta)) {
        metas.push(value as EntityMeta);
      }
    }
  }
  return metas;
}

/** SqlOperator union from the DAL package's own type declarations. */
function extractSqlOperators(): string[] {
  const dalDir = join(process.cwd(), "node_modules", "@primebrick", "dal-pg");
  const candidates = [
    join(dalDir, "dist", "query", "dsl.d.ts"),
    join(dalDir, "src", "query", "dsl.ts"),
  ];
  for (const dslPath of candidates) {
    if (!existsSync(dslPath)) continue;
    const content = readFileSync(dslPath, "utf-8");
    const match = content.match(/export type SqlOperator\s*=\s*([^;]+);/s);
    if (match) return [...match[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  }
  console.warn("  ! SqlOperator not found in @primebrick/dal-pg declarations");
  return [];
}

// ─── 1. Entity Field Reference ────────────────────────────────────────────

function generateEntityFieldReference(entityMetas: EntityMeta[]): string {
  const lines = [
    "---",
    'title: "Entity Field Reference"',
    'description: "Complete field reference for all Primebrick entities — auto-generated from BE metadata"',
    'source: guide',
    'repo: "backend"',
    "---",
    "",
    "# Entity Field Reference",
    "",
    "<!-- AUTO-GENERATED:entity-fields — DO NOT EDIT MANUALLY. Run pnpm generate:docs to regenerate. -->",
    "",
    "This document lists every field exposed by each Primebrick entity, including",
    "type, filterability, sortability, and the i18n label key. It is the canonical",
    "reference for the AI assistant when answering questions about entity fields.",
    "",
  ];

  for (const meta of entityMetas) {
    const entityName = meta.entity || "unknown";
    const titleKey = meta.title_key || `entities.${entityName}.title`;
    lines.push(`## ${entityName}`, "", `**Title key:** \`${titleKey}\``, `**UID field:** \`${meta.uid || "uuid"}\``, "");

    const columns = meta.columns;
    if (columns && Array.isArray(columns)) {
      lines.push("| Field | Type | Sortable | Filterable | Searchable | Label Key |");
      lines.push("|-------|------|----------|------------|------------|-----------|");
      for (const col of columns) {
        const sortable = col.sortable ? "yes" : "no";
        const filterable = col.filterable ? "yes" : "no";
        const searchable = col.searchable === false ? "no" : "yes";
        lines.push(`| \`${col.key}\` | ${mdxSafe(col.type || "text")} | ${sortable} | ${filterable} | ${searchable} | \`${col.label_key || ""}\` |`);
      }
      lines.push("");
      if (meta.table?.default_sort) {
        lines.push(`**Default sort:** \`${meta.table.default_sort.key}\` ${meta.table.default_sort.dir || "asc"}`, "");
      }
      if (meta.table?.row_custom_actions?.length) {
        const actions = meta.table.row_custom_actions.map((a) => a.action_name).join(", ");
        lines.push(`**Row actions:** ${actions}`, "");
      }
    } else {
      lines.push("_No list columns defined._", "");
    }
  }
  lines.push("<!-- END -->");
  return lines.join("\n");
}

// ─── 2. Filter Operator Reference ─────────────────────────────────────────

function generateFilterOperatorReference(operators: string[]): string {
  const opDescriptions: Record<string, string> = {
    "=": "Equality. Matches rows where the field equals the value.",
    "!=": "Inequality. Matches rows where the field does not equal the value.",
    "<>": "Inequality (ANSI alternative to !=). Same behavior as !=.",
    "<": "Less than. Matches rows where the field is strictly less than the value.",
    "<=": "Less than or equal. Matches rows where the field is <= the value.",
    ">": "Greater than. Matches rows where the field is strictly greater than the value.",
    ">=": "Greater than or equal. Matches rows where the field is >= the value.",
    ILIKE: "Case-insensitive pattern match (PostgreSQL). Use % as wildcard for any sequence, _ for any single char.",
    LIKE: "Case-sensitive pattern match. Use % and _ wildcards.",
    IN: "Membership in a set. Value is an array; matches rows where the field equals any element.",
    "NOT IN": "Exclusion from a set. Value is an array; matches rows where the field is not any element.",
    BETWEEN: "Range check. Value is an object { start, end }; matches rows where start <= field <= end.",
    IS: "Null/boolean check. Use value: null for IS NULL, true/false for boolean.",
    "IS NOT": "Negated null/boolean check. Use value: null for IS NOT NULL.",
  };

  const lines = [
    "---",
    'title: "Filter Operator Reference"',
    'description: "All supported filter operators for entity list queries — auto-generated from BE source"',
    'source: guide',
    'repo: "backend"',
    "---",
    "",
    "# Filter Operator Reference",
    "",
    "<!-- AUTO-GENERATED:filter-operators — DO NOT EDIT MANUALLY. Run pnpm generate:docs to regenerate. -->",
    "",
    "Primebrick entity list endpoints (`GET /api/v1/entities/:entity/list`) accept a",
    "`filters` array. Each filter condition specifies a `field`, an `op` (operator),",
    "and a `value`. This document lists every supported operator.",
    "",
    "| Operator | Description | Value type |",
    "|----------|-------------|------------|",
  ];

  for (const op of operators) {
    const desc = opDescriptions[op] || "Custom operator.";
    const valueType =
      op === "IN" || op === "NOT IN" ? "array"
      : op === "BETWEEN" ? "`{ start, end }`"
      : op === "IS" || op === "IS NOT" ? "null / boolean"
      : "string / number";
    lines.push(`| \`${op}\` | ${mdxSafe(desc)} | ${valueType} |`);
  }

  lines.push(
    "",
    "## Filter connectors",
    "",
    "When multiple filters are provided, they are combined with a connector:",
    "- `AND` (default) — all filters must match",
    "- `OR` — any filter must match",
    "",
    "<!-- END -->",
  );
  return lines.join("\n");
}

// ─── 3. Filter Syntax Guide ───────────────────────────────────────────────

function generateFilterSyntaxGuide(entityMetas: EntityMeta[]): string {
  const lines = [
    "---",
    'title: "Filter Syntax Guide"',
    'description: "Examples of filter syntax for every operator and entity — auto-generated from BE metadata"',
    'source: guide',
    'repo: "backend"',
    "---",
    "",
    "# Filter Syntax Guide",
    "",
    "<!-- AUTO-GENERATED:filter-syntax — DO NOT EDIT MANUALLY. Run pnpm generate:docs to regenerate. -->",
    "",
    "This guide shows concrete examples of how to construct filter queries for",
    "Primebrick entity list endpoints. Each example is a JSON snippet for the",
    "`filters` query parameter.",
    "",
    "## Common patterns",
    "",
    "### Equality (`=`)",
    "```json",
    '[{ "field": "status", "op": "=", "value": "ACTIVE" }]',
    "```",
    "",
    "### Case-insensitive search (`ILIKE`)",
    "```json",
    '[{ "field": "email", "op": "ILIKE", "value": "%@example.com" }]',
    "```",
    "",
    "### Membership (`IN`)",
    "```json",
    '[{ "field": "status", "op": "IN", "value": ["ACTIVE", "INACTIVE"] }]',
    "```",
    "",
    "### Date range (`BETWEEN`)",
    "```json",
    '[{ "field": "created_at", "op": "BETWEEN", "value": { "start": "2026-01-01", "end": "2026-12-31" } }]',
    "```",
    "",
    "### Null check (`IS`)",
    "```json",
    '[{ "field": "deleted_at", "op": "IS", "value": null }]',
    "```",
    "",
    "### Combined filters with OR connector",
    "```json",
    "[",
    '  { "field": "status", "op": "=", "value": "ACTIVE" },',
    '  { "field": "email", "op": "ILIKE", "value": "%@gmail.com" }',
    "]",
    "```",
    "With `connector=OR` query parameter, matches rows where status is ACTIVE **or** email ends with @gmail.com.",
    "",
    "## Filterable fields per entity",
    "",
  ];

  for (const meta of entityMetas) {
    const entityName = meta.entity || "unknown";
    const columns = meta.columns;
    if (!columns) continue;
    const filterable = columns.filter((c) => c.filterable);
    if (filterable.length === 0) continue;
    lines.push(`### ${entityName}`, "", "| Field | Type | Example |", "|-------|------|---------|");
    for (const col of filterable) {
      const example =
        col.type === "datetime"
          ? '{ "op": "BETWEEN", "value": { "start": "2026-01-01", "end": "2026-12-31" } }'
          : col.type === "badge"
            ? '{ "op": "=", "value": "ACTIVE" }'
            : '{ "op": "ILIKE", "value": "%search%" }';
      lines.push(`| \`${col.key}\` | ${mdxSafe(col.type)} | \`${example}\` |`);
    }
    lines.push("");
  }
  lines.push("<!-- END -->");
  return lines.join("\n");
}

// ─── 4. Navigation Map ────────────────────────────────────────────────────

function generateNavigationMap(): string {
  const lines = [
    "---",
    'title: "Navigation Map"',
    'description: "Frontend route map with entity associations — auto-generated from BE module navigation metadata"',
    'source: guide',
    'repo: "backend"',
    "---",
    "",
    "# Navigation Map",
    "",
    "<!-- AUTO-GENERATED:navigation-map — DO NOT EDIT MANUALLY. Run pnpm generate:docs to regenerate. -->",
    "",
    "This document maps every application route to its owning module and its",
    "associated entity (when declared). The AI assistant uses this to answer",
    '"where do I find X?" questions and to emit navigation events.',
    "",
    "Only **BE-owned** (static `MODULE_NAV`) routes appear here — service-owned",
    "modules (job, crm, emailsender, …) declare their nav in",
    "`service_registry.endpoints.nav` at registration; resolve them at runtime",
    "via the access-filtered `GET /api/v1/modules` discovery payload",
    "(`ModuleInfo.routes`). Every module route lives under its",
    "primary namespace `/{part_of}/{code}` — collapsed to `/{code}` when the",
    "module IS its own root level (e.g. crm → `/crm`) — or under an extra",
    "root membership `/{other-root}/{code}` (e.g. crm → `/system/crm/pipeline`).",
    "",
    "| Route | Module | Kind | Entity |",
    "|-------|--------|------|--------|",
  ];

  const byEntity = new Map<string, string[]>();
  for (const code of listModuleNavCodes()) {
    const meta = buildModuleNavMeta(code);
    if (!meta) continue;
    const declared = new Set((meta.routes ?? []).map((r) => r.route));
    for (const link of meta.nav) {
      if (!declared.has(link.href)) lines.push(`| \`${link.href}\` | ${code} | page | — |`);
    }
    for (const r of meta.routes ?? []) {
      const entity = r.entity || "—";
      lines.push(`| \`${r.route}\` | ${code} | ${r.kind} | ${entity} |`);
      if (r.entity) {
        if (!byEntity.has(r.entity)) byEntity.set(r.entity, []);
        byEntity.get(r.entity)!.push(r.route);
      }
    }
  }

  lines.push("", "## Routes grouped by entity", "");
  for (const [entity, paths] of [...byEntity.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    lines.push(`### ${entity}`);
    for (const p of paths) lines.push(`- \`${p}\``);
    lines.push("");
  }
  lines.push("<!-- END -->");
  return lines.join("\n");
}

// ─── 5. Entity API / Tool Catalog ───────────────────────────────────────────
//
// Grounding page for the Guide assistant's tool-arg production: the generic
// entity tools (same set as MCP `tools/list` and `GET /api/v1/system/mcp/tools`)
// plus the (module, entity) operation matrix from the live entityRegistry.
// The tool table mirrors generic-tools.ts — keep them in sync.

const ENTITY_TOOLS: Array<{ name: string; kind: "read" | "write"; args: string; notes: string }> = [
  { name: "list_available_entities", kind: "read", args: "—", notes: "Discovery: all (module, entity) + supported operations + online status. Always call first." },
  { name: "get_entity_meta", kind: "read", args: "module, entity", notes: "Field schema for create/update — required fields, types, flags." },
  { name: "list_entities", kind: "read", args: "module, entity, search?, search_in?, sort_key?, sort_dir?, page?, page_size?, filters?, deleted_records?, aggregate?", notes: "Paginated list; `aggregate` switches to COUNT/SUM/AVG/MIN/MAX." },
  { name: "get_entity", kind: "read", args: "module, entity, uuid", notes: "Single record by UUID." },
  { name: "get_entity_audit", kind: "read", args: "module, entity, uuid, page?, page_size?", notes: "Audit history for one record." },
  { name: "search_docs", kind: "read", args: "embedding, keywords?, limit?, repo?", notes: "Docs KB vector+keyword search (caller supplies the embedding)." },
  { name: "create_entity", kind: "write", args: "module, entity, data", notes: "data keys = snake_case entity fields; fetch get_entity_meta first." },
  { name: "update_entity", kind: "write", args: "module, entity, uuid, data", notes: "Partial update — only provided fields change." },
  { name: "delete_entity", kind: "write", args: "module, entity, uuid, version", notes: "Soft-delete; `version` is the optimistic-concurrency guard." },
  { name: "restore_entity", kind: "write", args: "module, entity, uuid, version", notes: "Restores a soft-deleted record." },
  { name: "bulk_entity_action", kind: "write", args: "module, entity, action, items[]", notes: "action: delete|restore; items: up to 100 {uuid, version} pairs." },
  { name: "manage_service", kind: "write", args: "action, code?, data?", notes: "Service registry: list|get|activate|update|delete (delete is permanent)." },
];

async function generateEntityApiCatalog(entityMetas: EntityMeta[]): Promise<string> {
  const { entityRegistry, registerBeEntities } = await import(
    "../src/modules/mcp/tools/entity-registry.js"
  );
  entityRegistry.clear();
  registerBeEntities();

  const lines = [
    "---",
    'title: "Entity API & Tool Catalog"',
    'description: "Generic entity tools and the (module, entity) operation matrix — auto-generated from the BE entity registry"',
    'source: guide',
    'repo: "backend"',
    "---",
    "",
    "# Entity API & Tool Catalog",
    "",
    "<!-- AUTO-GENERATED:entity-api-catalog — DO NOT EDIT MANUALLY. Run pnpm generate:docs to regenerate. -->",
    "",
    "The assistant can act on entities through the generic entity tools",
    "(exposed via MCP `tools/list` and the REST shim `POST /api/v1/system/mcp/call`).",
    "Every call is RBAC-enforced for the current user; **write tools always",
    "require user confirmation** before dispatching.",
    "",
    "## Tools",
    "",
    "| Tool | Kind | Arguments | Notes |",
    "|------|------|-----------|-------|",
  ];
  for (const t of ENTITY_TOOLS) {
    lines.push(`| \`${t.name}\` | ${t.kind} | \`${t.args}\` | ${mdxSafe(t.notes)} |`);
  }

  lines.push(
    "",
    "## Entity operation matrix",
    "",
    "Valid `(module, entity)` pairs and the operations each supports.",
    "Microservice entities appear dynamically — `list_available_entities` is",
    "the authoritative live source.",
    "",
    "| Module | Entity | Label | Supported operations |",
    "|--------|--------|-------|----------------------|",
  );
  const metaByEntity = new Map(entityMetas.map((m) => [m.entity, m]));
  for (const { module, entities } of entityRegistry.listModules()) {
    for (const e of entities) {
      lines.push(`| \`${module}\` | \`${e.entity}\` | ${mdxSafe(e.label)} | ${e.supported_operations.join(", ")} |`);
    }
  }

  lines.push("", "## Writable fields per entity", "");
  for (const { module, entities } of entityRegistry.listModules()) {
    for (const e of entities) {
      const meta = metaByEntity.get(e.entity);
      const writable = (meta?.columns ?? []).filter((c) => !c.audited && c.key !== "uuid");
      if (!e.supported_operations.includes("create") || writable.length === 0) continue;
      lines.push(`### ${module}.${e.entity}`, "", `\`${writable.map((c) => `${c.key} (${c.type ?? "text"})`).join("`, `")}\``, "");
    }
  }
  lines.push("<!-- END -->");
  return lines.join("\n");
}

// ─── Main ─────────────────────────────────────────────────────────────────

export async function generateReferenceDocs(outDir: string): Promise<string[]> {
  mkdirSync(outDir, { recursive: true });
  const modulesDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "modules");

  console.log("[generate-reference-docs] Collecting entity metas...");
  const metas = await collectEntityMetas(modulesDir);
  console.log(`  Found ${metas.length} entity metas`);
  const operators = extractSqlOperators();

  const pages: Array<[string, string]> = [
    ["entity-field-reference.mdx", generateEntityFieldReference(metas)],
    ["filter-operator-reference.mdx", generateFilterOperatorReference(operators)],
    ["filter-syntax-guide.mdx", generateFilterSyntaxGuide(metas)],
    ["navigation-map.mdx", generateNavigationMap()],
    ["entity-api-catalog.mdx", await generateEntityApiCatalog(metas)],
  ];
  for (const [name, content] of pages) {
    writeFileSync(join(outDir, name), content + "\n", "utf-8");
    console.log(`  wrote ${name}`);
  }

  // Keep _order.json in sync — generated pages come after hand-written ones.
  const orderPath = join(outDir, "..", "_order.json");
  const generated = pages.map(([name]) => `generated/${name.replace(/\.mdx$/, "")}`);
  const order = existsSync(orderPath) ? JSON.parse(readFileSync(orderPath, "utf-8")) : { pages: [] };
  order.pages = [...order.pages.filter((p: string) => !generated.includes(p)), ...generated];
  writeFileSync(orderPath, JSON.stringify(order, null, 2) + "\n", "utf-8");

  return pages.map(([name]) => name);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1].replace(/\\/g, "/")) {
  generateReferenceDocs(join(process.cwd(), "docs", "user-guide", "generated")).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
