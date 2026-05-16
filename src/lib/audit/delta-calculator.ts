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
 * Calculate delta and force include specific fields in the result even when their
 * values did not change. Useful to ensure audit traceability fields (e.g. updated_by)
 * are always present in the delta alongside their paired timestamp.
 */
export function calculateDeltaWithForcedFields(
  oldEntity: Record<string, unknown>,
  newEntity: Record<string, unknown>,
  forceFields: string[]
): Record<string, { old: unknown; new: unknown }> {
  const delta = calculateDelta(oldEntity, newEntity);
  for (const key of forceFields) {
    if (!(key in delta) && key in newEntity) {
      delta[key] = { old: oldEntity[key] ?? null, new: newEntity[key] };
    }
  }
  return delta;
}
