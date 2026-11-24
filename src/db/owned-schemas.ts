/**
 * OWNED_SCHEMAS — the BE's PG schema domain, declared in code.
 * [0] = the primary schema (patch registry, unpinned entity resolution).
 *
 * Single source of truth for initDal, service-lifecycle schema-ownership
 * checks, db:check/compare tooling and migration scripts. Schema identity
 * is immutable product data — it can never come from env (DATABASE_SCHEMA
 * is a boot violation under the closed-set contract).
 *
 * ORDER NOTE: `public` is primary today. The system-primary flip (closed
 * schema model, phase 3) reorders this list AND marks business entities
 * @PublicEntity — the two changes must land together or entities drift.
 */
export const OWNED_SCHEMAS = ["public", "system", "custom"] as const;
