# Devin Rule: Canonical Entity Meta Schema (`EntityMeta`)

> Canonical body of `.devin/rules/entity-meta-schema.md` — the rule file is a pointer to this page.

## Trigger
- Applies whenever an AI agent creates or modifies a `*.meta.ts` file, a
  `list-config.ts` column dictionary, `assembleMeta`, `deriveEntityActions`,
  or any `/meta` endpoint response.

## Canonical type

All entity metadata is typed against `EntityMeta` in
`src/http/entity-meta.types.ts`. The interface is **closed** — it has no
index signature, so TypeScript rejects any property not declared in the
schema. Every static meta object MUST be annotated explicitly:

```ts
import type { EntityMeta } from "../../http/entity-meta.types.js";

export const organizationMeta: EntityMeta = { /* ... */ };
```

Omitting `display_field` or adding an unknown property is a compile error.
`ConfigEntryMeta extends EntityMeta` exists for metas that carry extra
required fields (`type_capabilities`).

## Anatomy (static meta — what `*.meta.ts` declares)

```jsonc
{
  // ── Root: entity identity + display contract (required) ──────────────
  "entity": "user_profile",            // snake_case singular, matches route segment
  "translation_key": "user_profile",   // snake_case singular i18n prefix
  "title_key": "system.entities.user_profile.title",  // OPTIONAL override — omit on
                                       // standard CRUD metas: list/create/edit titles
                                       // come from system.entities.page_title.* templates
                                       // (see FE rule page-title-standard.md)
  "uid": "uuid",                       // column key used as row identity
  "display_field": "display_name",     // REQUIRED — key of the primary display column
  "display_name": "${display_name}",   // OPTIONAL — template; assembleMeta defaults it
                                       // to `"${" + display_field + "}"`. Generic
                                       // "how the entity is displayed" (edit titles,
                                       // comboboxes, related-object labels…)

  "actions_overrides": {               // OPTIONAL escape hatch — may only set
    "duplicate.bulk": { "enabled": false }  // `enabled` on EXISTING standard ops;
  },                                     // never invents operations

  // ── Root: field dictionary — transversal to ALL page types ───────────
  "columns": [
    {
      "key": "display_name",           // row field name (snake_case)
      "label_key": "system.entities.user_profile.fields.display_name",
      "type": "text",                  // text | badge | date | datetime | color | boolean | number | sparkline
      "order": 0,                      // REQUIRED — deterministic position within its group
      "sticky": true,                  // pinned left, rendered first (display_field column)
      "hideable": false,               // cannot be hidden from the column selector
      "default_visible": true,
      "sortable": true, "searchable": true, "filterable": true
    },
    { "key": "uuid", "type": "text", "order": -1, "sticky": true, "default_visible": false, "sortable": true, "searchable": true, "hideable": true },
    { "key": "created_at", "type": "datetime", "order": 90, "audited": true, "default_visible": false, "sortable": true, "searchable": false }
  ],

  // ── table: EntityListTable options — OPTIONAL (absent on form-only metas) ──
  "table": {
    "default_view": "table",           // table | cards | cards_list
    "default_sort": { "key": "created_at", "dir": "desc" },
    "default_page_size": 25,
    "page_size_options": [10, 25, 50, 100],
    "row_custom_actions": [            // table-only custom row CTAs (non-standard ops)
      {
        "action_name": "change_password",   // bare op name — must exist in actions
        "translation_key": "system.settings.users.change_password",
        "icon": "key-round",
        "text_color": "",
        "disabled_when_deleted": true,
        "required_permission": "AUTHENTICATED_ADMIN"
      }
    ],
    "filter_presets": [                // toolbar scope selectors — mutually
      {                                // exclusive, exactly ONE always active
        "id": "schedule_kind",
        "display": "button_group",     // button_group | combobox
        "label_key": "…",              // group a11y label / combo placeholder
        "default_option": "recurring", // REQUIRED — fallback for bad state
        "options": [
          {
            "id": "recurring",
            "label_key": "…", "icon": "repeat", "tooltip_key": "…",
            "where": [{ "field": "schedule_type", "op": "=", "value": "recurring" }]
          },
          { "id": "all", "label_key": "…", "where": [] }  // [] = escape option
        ]
      }
    ]
  }
}
```

## Runtime additions (never declared in static meta)

`assembleMeta` / the meta route inject these into the response:

```jsonc
{
  "display_name": "${display_name}",  // materialized default when omitted
  "actions": [                         // deriveEntityActions — full standard
    { "op": "list", "enabled": true, "permissions": ["user_profile.read.all"],
      "endpoint": { "method": "GET", "path": "/api/v1/entities/user_profile/list" } },
    { "op": "delete.single", "enabled": true, "permissions": ["user.delete.single"],
      "endpoint": { "method": "DELETE", "path": "/api/v1/auth/users/:uuid" } },
    { "op": "duplicate.bulk", "enabled": false }   // route absent → explicit false, no endpoint
  ],
  "collaboration": { "enabled": true, "expose_editing_value": true }
}
```

## `MetaColumn` props sheet

| Prop | Required | Purpose |
|------|----------|---------|
| `key` | yes | Row field key (snake_case) |
| `label_key` | yes | i18n key for header/form label |
| `type` | yes | `text` \| `badge` \| `date` \| `datetime` \| `color` \| `boolean` \| `number` \| `sparkline` |
| `order` | yes | Explicit position inside its group (sticky → normal → audited). Array position in `columns` MUST NOT matter. Standard: `uuid` is `order: -1` — the canonical first sticky column, hidden but selectable; `display_field` column is `order: 0` |
| `sticky` | | Pinned left, first group (`uuid` + `display_field` are the standard sticky pair) |
| `audited` | | System audit column — rendered last group |
| `sortable` / `searchable` / `filterable` / `hideable` | | Capability flags (default `true` when omitted — set `false` explicitly to disable) |
| `default_visible` | | `false` = selectable but hidden by default (e.g. `uuid`) |
| `badge` | | `{ values: Record<string, { label_key?, label_text?, color? }> }` |
| `datetime_iana_toggle` | | `{ record_iana_field }` — browser/record timezone toggle |
| `sparkline` | | `type:"sparkline"` — `{ endpoint, request_field, row_key, response_field?, bucket_field?, bucket_unit_field?, series: {field,color,label_key?}[] }`; virtual column, the list engine batch-POSTs row keys to `serviceApiBase(basePath)+endpoint` after every load |
| `tooltip`, `tooltip_priority`, `tooltip_title` | | Tooltip content/priority/title keys |
| `show_form_tooltip`, `show_list_tooltip` | | Tooltip visibility per context |

## Standard operation vocabulary (`deriveEntityActions`)

The generated `actions` array ALWAYS contains every standard op — missing
routes produce explicit `{ enabled: false }` entries, never absent ops:

`list`, `meta`, `get`, `create.single`, `update.single`, `delete.single`,
`restore.single`, `read.audit`, `export`, `delete.bulk`, `restore.bulk`,
`duplicate.single`, `duplicate.bulk`

Non-standard routes (e.g. `change-password`) surface as additional bare ops.

Every enabled op carries `endpoint: { method, path }` — the real registered
route (path params use `:param`, filled client-side from the row `uid`).
This is how entities whose writes live outside `/entities/{entity}/` (e.g.
`user_profile` → `/api/v1/auth/users/*`) dispatch correctly: the frontend
uses the declared endpoint and only falls back to the entity convention
when `endpoint` is absent. Disabled ops carry no endpoint.

## Filter presets semantics (`table.filter_presets`)

- `display: "button_group"` is the **toolbar icon-only standard**: the label
  is NEVER rendered visibly — `icon` is REQUIRED on every option (a lucide
  name resolvable by `DynamicIcon`), `tooltip_key` SHOULD be declared (it
  feeds the `title` tooltip, falling back to `label_key`). Meaning lives in
  the tooltip + `aria-label`/`aria-pressed`, like `DeletionFilterToggle`.
- `display: "combobox"` renders the detailed option row (icon + label +
  tooltip as secondary text) — use it for long option lists.
- Exactly one option is always selected — no deselect; restoring a persisted
  selection that doesn't match a declared option falls back to `default_option`.
- `where: []` or omitted = "all" — still a real selection, not a clear.
- Option `where[]` conditions are appended to **every** list request (refresh,
  pagination, sorting, user filters, deleted-records) as `filters[i][field|
  op|value]` with `connector=AND`, combined with `fixedFilters`. `value` may be
  an array (serializes as `filters[i][value][j]` — IN semantics).
- Reset-filters does NOT clear the selection — presets are scope, not filters.
- A field owned by a preset should lose `filterable` — prevents contradictory
  AND between the preset and the filter sheet.
- Backend needs nothing — conditions ride the existing `/list` filter wire.
- Host `useEntityList` and remote `remote-list` resolve state through the same
  `@primebrick/core` helpers (`resolvePresetSelection`,
  `resolvePresetConditions`, `serviceApiBase`).

## Search contract

Default "all fields" search = **visible ∩ searchable ∩ text-physical**
columns (FE computes `search_in`; BE derives fallbacks via
`src/lib/search-keys.ts` from meta + DAL `pgType`). JSONB/non-text columns
MUST be `searchable: false`. Hidden-by-default columns are excluded from
default search but remain selectable in the scope selector.

## Forbidden

- ❌ camelCase or unlisted props — the closed type rejects them at compile time
- ❌ `list.*` wrapper, `sticky_columns`, `auditing_columns`, `view_visibility`,
  `search_placeholder_key`, `enable_create_action`, `row_actions` boolean maps —
  all removed; groups derive from `columns` flags
- ❌ `actions`/`actions_overrides` inside `table` — they are root-level
- ❌ Static `actions`/`collaboration`/`display_name` defaults duplicated per meta —
  `display_name` is only written when it differs from `"${display_field}"`


## Deep dive

The normative rules live here; the full mechanics and rationale are in `docs/dev-guide/entity-metadata.mdx` — link, do not duplicate.
