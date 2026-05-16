export function calculateDelta(oldEntity: Record<string, unknown>, newEntity: Record<string, unknown>): Record<string, { old: unknown; new: unknown }> {
  const delta: Record<string, { old: unknown; new: unknown }> = {};
  for (const key in newEntity) {
    if (JSON.stringify(oldEntity[key]) !== JSON.stringify(newEntity[key])) {
      delta[key] = { old: oldEntity[key], new: newEntity[key] };
    }
  }
  return delta;
}
