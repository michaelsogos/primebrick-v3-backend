# i18n Namespace Segregation

> `.devin/rules/` may point here — canonical text for the cross-repo
> translation-namespace ownership contract.

## The principle

**A module never knows another module — not by convention, not by
accident, not "because the shell loads that dict anyway".**

Every translation key is owned by exactly one namespace. A code surface
may cite a key only when that surface is allowed to know the owning
namespace. Availability at runtime (a loaded dictionary, a seeded table)
is NOT permission.

## The namespaces

| Namespace | DB schema | Owner | May be cited by |
|---|---|---|---|
| `app.*` | `public.translations` | platform (BE seed patches) | every surface — shared application vocabulary (pre-auth floor, common chrome/errors) |
| `system.*` | `system.translations` | platform shell / BE | **BE code and the FE shell ONLY** — never US modules |
| `{schema}.*` | `{schema}.translations` | the module (us-v3 service) | the owning module; other surfaces only via the gated cross-read |
| `custom.*` | `custom.translations` | the customer (runtime editor) | runtime resolution only — never cited by module/service code |

`{schema}` = the microservice's `OWNED_SCHEMAS[0]` (primary schema —
declared in each `src/db/dal.ts`: `ai`, `boilerplate`,
`crm`, `emailsender`, `job`, `webhook`). A module's i18n namespace equals
its schema name — `job.translations` holds `job.*` keys.

## Enforcement layers (defense in depth)

1. **Write boundary** — `{schema}.translations` accepts only `{ns}.*` keys
   where `ns = translationKeyNamespace(schema)` (`public`→`app`, else the
   schema name). Cross-namespace writes are rejected at the DAL layer.
2. **Registration** — `service.register` validates declared nav/config
   key references (`validateNavDeclaration`); keys outside the owning
   namespace are refused at registration time.
3. **Static gate** — `check-standards` i18n rules (below) run in
   `pnpm check:standards` on every service and in CI across all six.
4. **Runtime cross-read** — `findTranslations` is the ONLY sanctioned
   way for one surface to read another namespace's keys.

## `findTranslations` — the gated cross-read

When a surface legitimately renders labels owned by several modules
(e.g. the shell's `/system/settings/modules` page resolving each
service's `label_key`), it must NOT bulk-load foreign dictionaries. It
asks the platform for exactly the keys it needs:

- **HTTP**: `GET /api/v1/system/translations/find?matches[]={m}&language=` —
  `AUTHENTICATED_USER`, zod-validated.
- **NATS**: `system.translations.find` (internal request route).
- **Matcher grammar**: `{ns}` | `{ns}.*` | `{ns}.seg…` | `{ns}.seg….*` —
  an exact key or a prefix subtree. Interior `*`/`%` is rejected; a call
  carries ≤64 matchers, deduped, grouped per namespace.
- **Namespace gate**: each matcher's first segment must resolve to a
  registered entity/schema — unknown namespace → 404, same contract as
  the dict routes.
- It is **key-scoped by construction** — never a dictionary dump.

FE helper path: `fetchTranslationsFind` (`$lib/api`) →
`loadTranslationsByKeys(matches)` (`use-module-translations.svelte.ts`) —
dedup, chunk ≤64, merge per-language into the dict store.

## check-standards i18n rules

Scanner: `primebrick-v3-sdk/tools/check-standards.ts` (single canonical
copy — vendoring forbidden).

| Rule | Surface | Fails when |
|---|---|---|
| `i18n-key-ns` | `src/` + `fe/src/` | an i18n-bearing literal's first segment is outside `i18n_namespaces` |
| `i18n-key-grammar` | same | any dot-segment is not `snake_case` (camelCase keys fail) |
| `i18n-sql-ns` | `db-meta/patches/*.sql` | an INSERT seeds a key outside `{app, <stmt-schema>}` |
| `i18n-sql-key-ref` | same | a `*_key` reference (INSERT column values, `UPDATE SET`, nested JSON) points outside `{app, <stmt-schema>}` |

### Scanned code surfaces

| Surface | Form | Checked |
|---|---|---|
| `t('…')`, `$t('…')`, `tFn('…')` | literal | full key |
| `*_key:` / `*Key:` / `tooltip:` / `tooltip_title:` | literal | full key — snake_case AND camelCase field families (`label_key`, `labelKey`, `messageKey`, `errorScopeKey`, …) |
| any of the above | template `` `ns.rest.${x}` `` | static prefix only — the namespace is provable when a `.` precedes the first `${`; a template opening with `${` is unprovable and skipped |

### Deliberately NOT scanned

- **Arbitrary `fn('dotted.key')` calls** — NATS subjects, event names and
  generic getters guarantee a false-positive storm. The function-name
  allowlist (`t`, `$t`, `tFn`) is closed by convention.
- **`system_key` / `systemKey`** — carries callable NATS subjects
  (`ai.partition_maintenance`), not translations.
- **Credential `*Key` fields** — `apiKey`, `privateKey`, `publicKey`,
  `sshKey` can hold dotted non-i18n values. `NON_I18N_KEY_FIELDS` is the
  explicit denylist.
- **Single-segment literals** — a value with no `.` is a field name, not
  a key (`sort_key: "key"`, `apiKey: "v1"` never flag).
- **Display-text fields** (`scope:`, `message:`) — they carry resolved
  text, not key references; citing a key there is a semantic bug the
  scanner cannot distinguish from legitimate text.

### Config & exemptions

- `i18n_namespaces` (config root, array): the allowlist for `i18n-key-ns`.
  **US modules MUST declare `["app", "{own-code}"]`.** `system` or
  `custom` in a module's list is a contract violation.
- `i18n_sql_exempt` / `i18n_key_ref_exempt` / `i18n_lang_exempt`:
  filename-level grandfathering for **immutable shipped patches** that
  predate the boundary — declared debt, remedied by corrective patches.
  Never add a new filename.
- `// standards-exempt:` line comments do NOT cover `i18n-key-ns`: the
  rule has no line-exemption path — a namespace violation is never
  "correct by construction". Cite a legal key instead.

## FE loading model

- **Bootstrap**: `CORE_DICT_MODULES` (`app`, `custom`, `system`) load at
  login — shell-side shared vocabulary.
- **Per-route**: the matched module's dict loads lazily
  (route → `route_prefixes` → schema).
- **Key-scoped enrichment**: `loadTranslationsByKeys` → `findTranslations`
  for cross-owned labels (service `label_key`s, `config_entries`
  `label_key`/`description_key`) — merged into the dict store per
  language, en-GB floor included for free.

## Operations

- Direct SQL on `*.translations` bypasses DAL cache invalidation → flush
  `translations:i18n:{schema}:{language}` keys afterwards (see
  `translations-cache-invalidation.md`).
- Adding a module-owned key = a seed patch in the module's own
  `db-meta/patches/` targeting its own schema — never `public`/`system`.

## History

The contract was convention until 2026-12, when it became enforced:
allowlists narrowed to `["app","{schema}"]` across all six services,
67 `config_entries` key refs repointed `system.*`→`{schema}.*`,
1,099 orphaned `system.settings.config.*` rows soft-deleted (54
BE-referenced keys preserved via dynamic cross-schema NOT-EXISTS),
shared keys modules actually cite grown into `app.*`
(`entities.list.no_records`, `common.delete_failed`,
`common.restore_failed`, `common.errors.scope.*_api`), and scanner
coverage extended to the camelCase `*Key` field family and `tFn()`.
