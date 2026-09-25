# Devin Rule: Translation Key Convention — snake_case singular

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
