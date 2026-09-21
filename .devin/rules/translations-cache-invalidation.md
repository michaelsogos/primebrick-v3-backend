# Devin Rule: Translations Cache Invalidation (deterministic)

## Trigger
- Applies whenever writing/mutating rows in any `*.translations` table
  (`public`, `system`, `custom`, `emailsender` schemas) — via API, DAL, SQL
  script, or manual `psql`.

## Contract
- The BE serves i18n dicts from Redis key `translations:i18n:{schema}:{language}`
  (TTL 6h — performance only, NOT an anti-stale mechanism).
- Correctness is guaranteed by **invalidation on write**, never by TTL expiry.
- Writes through `TranslationsDal` (`create`/`update`/`softDelete`/`restore`)
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
