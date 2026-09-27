/**
 * Canonical model power-level derivation.
 *
 * `power_level` (1-5) is the agnostic "how big a working set this model
 * needs" indicator, directly comparable to the FE machine rank which uses
 * the SAME bucket table: `machineRank = max{ lvl | free_fast_mb >= LEVEL[lvl] }`
 * where free_fast_mb = measured fast GPU memory − 1536MB headroom.
 * `power_level <= machine_rank` ⇒ advisory "should fit" (never blocking).
 *
 * Mirrored by FE `LEVEL_REQUIREMENT_MB` in
 * `src/lib/composables/useMachineCapabilities.svelte.ts` — keep in sync.
 *
 * `working_set_mb` provenance is tracked by `working_set_source`:
 *  - 'hf_estimate'  → COALESCE(vram_mb, download_size_mb) + kv×8192
 *  - 'e2e_measured' → GPUBuffer-tracked total (KV already inside —
 *                     NEVER re-add kv_cache_bytes_per_token).
 * Derivation here is source-agnostic: it only consumes the final value.
 */

/** Top working_set_mb of each power-level bucket. */
export const LEVEL_REQUIREMENT_MB: Record<number, number> = {
  1: 1200,
  2: 2200,
  3: 4000,
  4: 7000,
  5: 9500,
};

/**
 * Bucket a working_set_mb value into its power level (1-5).
 * Returns null when the working set is unknown (e.g. webllm/MCL rows —
 * power_level stays manual there). Values above the top bucket cap at 5,
 * matching the machine-rank domain.
 */
export function powerLevelFromWorkingSet(
  working_set_mb: number | null | undefined,
): number | null {
  if (working_set_mb == null) return null;
  for (const lvl of [1, 2, 3, 4, 5]) {
    if (working_set_mb <= LEVEL_REQUIREMENT_MB[lvl]) return lvl;
  }
  return 5;
}
