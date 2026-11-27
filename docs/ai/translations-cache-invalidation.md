# Devin Rule: Translations Cache Invalidation (deterministic)

> Canonical body of `.devin/rules/translations-cache-invalidation.md` — the rule file is a pointer to this page.

## Trigger
- Applies whenever writing/mutating rows in any `*.translations` table
  (`public`, `system`, `custom`, `emailsender` schemas) — via API, DAL, SQL
  script, or manual `psql`.

## Contract
- The BE serves i18n dicts from Redis key `translations:i18n:{schema}:{language}`
  (TTL 6h — performance only, NOT an anti-stale mechanism).
- Correctness is guaranteed by **invalidation on write**, never by TTL expiry.
- Writes through `TranslationsService` (`create`/`update`/`softDelete`/`restore`)
  already invalidate automatically — nothing to do.
- Writes through any other channel (fire-and-forget SQL, `psql`, migrations)
  bypass the DAL and leave the Redis dict stale for up to 6h.

## Mandatory action for out-of-band writes
Every script/manual edit touching a `*.translations` table MUST end with a
Redis invalidation of the affected schema (or all schemas if unsure):

```bash
# targeted — preferred
redis-cli DEL "translations:i18n:{schema}:{language}"
# or all languages of the schema
redis-cli --scan --pattern "translations:i18n:{schema}:*" | xargs redis-cli DEL
```

For Node scripts (fire-and-forget runners), the equivalent is
`redis.del("translations:i18n:{schema}:{lang}")` after the SQL commits.

## Forbidden
- ❌ Relying on the 6h TTL to "eventually" fix stale dicts.
- ❌ Reducing the TTL as a correctness fix — TTL exists only to bound DB load.
- ❌ Shipping a fire-and-forget script that mutates translations without a
  trailing cache invalidation step.


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
