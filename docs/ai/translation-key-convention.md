# Devin Rule: Translation Key Convention — snake_case singular

> Canonical body of `.devin/rules/translation-key-convention.md` — the rule file is a pointer to this page.

## Trigger
- Applies to ALL translation keys in BE meta files and any BE code that returns i18n keys to the FE.

## Golden Rule

**Translation key entity names MUST be `snake_case` singular.**

- ✅ `entities.user_profile.fields.idp_code`
- ✅ `entities.role_mapping.fields.idp_role`
- ✅ `entities.organization.fields.display_name`
- ❌ `entities.userProfile.fields.idp_code` (camelCase)
- ❌ `entities.user_profiles.fields.idp_code` (snake_case plural)
- ❌ `entities.RoleMapping.fields.idp_role` (PascalCase)

## Where this applies

### BE meta files (`*.meta.ts`)

Every meta object MUST be typed `EntityMeta` (see `.devin/rules/entity-meta-schema.md` for the canonical anatomy) and include `translation_key` alongside `entity` and `display_field`:

```ts
export const roleMappingsMeta: EntityMeta = {
  entity: "role_mapping",            // snake_case singular — used for API URLs
  translation_key: "role_mapping",   // snake_case singular — used for i18n keys
  title_key: "entities.role_mapping.title",
  display_field: "idp_role",
  columns: [
    { key: "idp_role", label_key: "entities.role_mapping.fields.idp_role", type: "text", order: 0, ... },
  ],
};
```

- `entity`: snake_case **singular** (API URL path, e.g. `/api/v1/entities/role_mapping`)
- `translation_key`: snake_case singular (i18n key prefix, e.g. `entities.role_mapping.*`)

**Note:** The `entity` field was previously plural in some meta files
(`role_mappings`, `user_profiles`, `config_entries`). The new standard is
**singular** for both `entity` and `translation_key`. Existing plural meta
files will be renamed in a separate PR.

All `label_key`, `title_key`, `tooltip`, `tooltip_title` values MUST use the `translation_key` as the entity segment.

### BE router files with inline meta

Any inline meta object in router files (e.g. `auth-session.router.ts`) MUST also follow this convention — include `translation_key` and use snake_case singular in all i18n keys.

## Enforcement

- AI agent MUST use snake_case singular for all translation key entity segments.
- AI agent MUST include `translation_key` in every new BE meta file.
- AI agent MUST NOT use camelCase or PascalCase in translation key entity segments.
- AI agent MUST NOT use snake_case plural in translation key entity segments.
- When reviewing existing code, flag any camelCase or plural entity segments in translation keys as violations.


## Deep dive

The normative rules live here; the full mechanics and rationale are in `docs/dev-guide/translations.mdx` — link, do not duplicate.

## Never a phase 2 — translations are complete at birth or they are bugs

Every translation key is seeded for **all seven supported languages** (de-DE, en-GB, en-US, es-ES, fr-FR, it-IT, pt-PT) in the very same patch that introduces it — **never deferred** to a later phase, never partial, never "english for now, translate later". A missing row in any language is a bug, not a partial feature: the end user otherwise sees raw keys or foreign text in the UI. Gender and idiom are correct by construction because the seed carries the exact string per language — nothing is composed at runtime. If a translation is hard, write it anyway: an imperfect human-grade translation beats a raw key, and the fix is one UPDATE away.

## Related documents

The translations doctrine is one family — no single document is sufficient alone:

- `docs/ai/i18n.md` + `docs/dev-guide/i18n.mdx` (fe-v3) — FE consumption rules, UiLang ↔ dictionary parity, raw-key rendering
- `docs/ai/i18n-translation-sources.md` (fe-v3) — BE owns all translations; FE fallback is English-only `app.*` keys
- `docs/ai/translation-key-convention.md` (fe-v3, be-v3) — snake_case singular key naming
- `docs/ai/i18n-namespace-segregation.md` (be-v3, us-v3) — services seed their own schema, never public/system/custom
- `docs/ai/translations-cache-invalidation.md` (be-v3) — out-of-band writes require Redis invalidation
- `docs/dev-guide/translations.mdx` (be-v3, v3-sdk) — end-to-end authoring workflow: patch, sign, migrate
