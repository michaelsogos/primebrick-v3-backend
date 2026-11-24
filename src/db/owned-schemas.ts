/**
 * OWNED_SCHEMAS — the BE's PG schema domain, declared in code.
 * [0] = the primary schema (patch registry, unpinned entity resolution).
 *
 * Single source of truth for initDal, service-lifecycle schema-ownership
 * checks, db:check/compare tooling and migration scripts. Schema identity
 * is immutable product data — it can never come from env (DATABASE_SCHEMA
 * is a boot violation under the closed-set contract).
 *
 * ORDER NOTE: `system` is primary (closed schema model) — it hosts the dal
 * builtins (config_entries, sequences, sequence_counters) and the patch
 * registry. Business entities carry @PublicEntity to stay on `public`.
 */
export const OWNED_SCHEMAS = ["system", "public", "custom"] as const;
