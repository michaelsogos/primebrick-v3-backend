/**
 * powerLevelFromWorkingSet — bucket boundaries.
 * Buckets mirror FE machine-rank LEVEL_REQUIREMENT_MB exactly:
 * 1≤1200, 2≤2200, 3≤4000, 4≤7000, 5≤9500 (cap).
 */
import { describe, expect, it } from "vitest";

import {
  LEVEL_REQUIREMENT_MB,
  powerLevelFromWorkingSet,
} from "../power-level.js";

describe("powerLevelFromWorkingSet", () => {
  it.each([
    [null, null],
    [undefined, null],
    [0, 1],
    [8, 1],
    [1200, 1],
    [1201, 2],
    [2200, 2],
    [2201, 3],
    [4000, 3],
    [4001, 4],
    [7000, 4],
    [7001, 5],
    [9500, 5],
    [9501, 5],
    [50000, 5],
  ])("working_set_mb=%s → %s", (ws, expected) => {
    expect(powerLevelFromWorkingSet(ws)).toBe(expected);
  });

  it("bucket table is the 5-level domain used by the FE machine rank", () => {
    expect(Object.keys(LEVEL_REQUIREMENT_MB).sort()).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
    ]);
    expect(LEVEL_REQUIREMENT_MB[1]).toBe(1200);
    expect(LEVEL_REQUIREMENT_MB[5]).toBe(9500);
  });
});
