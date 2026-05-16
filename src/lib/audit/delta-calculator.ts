export function calculateDelta(oldEntity: Record<string, unknown>, newEntity: Record<string, unknown>): Record<string, { old: unknown; new: unknown }> {
  const delta: Record<string, { old: unknown; new: unknown }> = {};
  for (const key in newEntity) {
    if (JSON.stringify(oldEntity[key]) !== JSON.stringify(newEntity[key])) {
      delta[key] = { old: oldEntity[key], new: newEntity[key] };
    }
  }
  return delta;
}

/**
 * Fields that should be excluded from audit deltas
 * These are typically audit/metadata fields that change with every operation
 * but are not meaningful business changes
 */
const AUDIT_FIELDS_TO_EXCLUDE = new Set([
  'created_at',
  'created_by',
  'updated_at',
  'updated_by',
  'version'
]);

/**
 * Calculate delta excluding audit/metadata fields
 * This ensures only meaningful business changes are tracked
 */
export function calculateDeltaExcludingAudit(oldEntity: Record<string, unknown>, newEntity: Record<string, unknown>): Record<string, { old: unknown; new: unknown }> {
  const delta: Record<string, { old: unknown; new: unknown }> = {};
  for (const key in newEntity) {
    // Skip audit/metadata fields
    if (AUDIT_FIELDS_TO_EXCLUDE.has(key)) {
      continue;
    }
    if (JSON.stringify(oldEntity[key]) !== JSON.stringify(newEntity[key])) {
      delta[key] = { old: oldEntity[key], new: newEntity[key] };
    }
  }
  return delta;
}
