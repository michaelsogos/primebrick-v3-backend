/**
 * Helper functions for audit trail queries that include user profile joins.
 * Audit tables use a single 'changed_by' field (not created_by/updated_by/deleted_by).
 */

/**
 * Returns the SQL fragment for joining user_profiles in audit trail queries.
 * Audit tables use 'changed_by' field (single field, not created_by/updated_by/deleted_by).
 * Uses the regex guardrail pattern to only join when changed_by is a UUID.
 * 
 * @returns SQL LEFT JOIN fragment
 */
export function getAuditUserJoinSql(): string {
  return `
    LEFT JOIN public.user_profiles creator
      ON audit.changed_by ~ '^[0-9a-fA-F-]{36}$'
     AND creator.uuid::text = audit.changed_by
  `;
}

/**
 * Returns the SELECT clause for audit queries including display name.
 * Audit tables use 'changed_by' field with 'changed_by_display_name' alias.
 * 
 * @returns SQL SELECT clause with display name projection
 */
export function getAuditSelectWithDisplayName(): string {
  return `
    audit.id,
    audit.entity_uuid,
    audit.action,
    audit.changed_at,
    audit.changed_by,
    creator.display_name as changed_by_display_name,
    creator.idp_code as changed_by_idp_code,
    audit.version,
    audit.delta
  `;
}

/**
 * Returns the SELECT clause for audit queries with IDP code only (no display name).
 * Use this when you only need the IDP code for filtering/lookup purposes.
 * 
 * @returns SQL SELECT clause with IDP code projection
 */
export function getAuditSelectWithIdpCode(): string {
  return `
    audit.id,
    audit.entity_uuid,
    audit.action,
    audit.changed_at,
    audit.changed_by,
    creator.idp_code as changed_by_idp_code,
    audit.version,
    audit.delta
  `;
}
