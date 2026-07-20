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

Every meta object MUST include a `translationKey` field alongside `entity`:

```ts
export const roleMappingsMeta = {
  entity: "role_mappings",           // snake_case plural — used for API URLs
  translationKey: "role_mapping",    // snake_case singular — used for i18n keys
  titleKey: "entities.role_mapping.title",
  list: {
    columns: [
      { key: "idp_role", labelKey: "entities.role_mapping.fields.idp_role", ... },
    ],
  },
} as const;
```

- `entity`: snake_case plural (API URL path, e.g. `/api/v1/entities/role_mappings`)
- `translationKey`: snake_case singular (i18n key prefix, e.g. `entities.role_mapping.*`)

All `labelKey`, `titleKey`, `tooltip`, `tooltipTitle` values MUST use the `translationKey` as the entity segment.

### BE router files with inline meta

Any inline meta object in router files (e.g. `auth-session.router.ts`) MUST also follow this convention — include `translationKey` and use snake_case singular in all i18n keys.

## Enforcement

- AI agent MUST use snake_case singular for all translation key entity segments.
- AI agent MUST include `translationKey` in every new BE meta file.
- AI agent MUST NOT use camelCase or PascalCase in translation key entity segments.
- AI agent MUST NOT use snake_case plural in translation key entity segments.
- When reviewing existing code, flag any camelCase or plural entity segments in translation keys as violations.
