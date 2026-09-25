# Devin Rule: Canonical Entity Meta Schema (`EntityMeta`)

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
  "title_key": "system.entities.user_profile.title",
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
      "type": "text",                  // text | badge | date | datetime | color | boolean | number
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
    { "op": "list", "enabled": true, "permissions": ["user_profile.read.all"] },
    { "op": "create.single", "enabled": true, "permissions": ["user_profile.create.single"] },
    { "op": "duplicate.bulk", "enabled": false }   // route absent → explicit false
  ],
  "collaboration": { "enabled": true, "expose_editing_value": true }
}
```

## `MetaColumn` props sheet

| Prop | Required | Purpose |
|------|----------|---------|
| `key` | yes | Row field key (snake_case) |
| `label_key` | yes | i18n key for header/form label |
| `type` | yes | `text` \| `badge` \| `date` \| `datetime` \| `color` \| `boolean` \| `number` |
| `order` | yes | Explicit position inside its group (sticky → normal → audited). Array position in `columns` MUST NOT matter. Standard: `uuid` is `order: -1` — the canonical first sticky column, hidden but selectable; `display_field` column is `order: 0` |
| `sticky` | | Pinned left, first group (`uuid` + `display_field` are the standard sticky pair) |
| `audited` | | System audit column — rendered last group |
| `sortable` / `searchable` / `filterable` / `hideable` | | Capability flags (default `true` when omitted — set `false` explicitly to disable) |
| `default_visible` | | `false` = selectable but hidden by default (e.g. `uuid`) |
| `badge` | | `{ values: Record<string, { label_key?, label_text?, color? }> }` |
| `datetime_iana_toggle` | | `{ record_iana_field }` — browser/record timezone toggle |
| `tooltip`, `tooltip_priority`, `tooltip_title` | | Tooltip content/priority/title keys |
| `show_form_tooltip`, `show_list_tooltip` | | Tooltip visibility per context |

## Standard operation vocabulary (`deriveEntityActions`)

The generated `actions` array ALWAYS contains every standard op — missing
routes produce explicit `{ enabled: false }` entries, never absent ops:

`list`, `meta`, `get`, `create.single`, `update.single`, `delete.single`,
`restore.single`, `read.audit`, `export`, `delete.bulk`, `restore.bulk`,
`duplicate.single`, `duplicate.bulk`

Non-standard routes (e.g. `change-password`) surface as additional bare ops.

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
