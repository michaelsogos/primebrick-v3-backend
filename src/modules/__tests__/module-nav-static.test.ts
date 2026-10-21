import { describe, expect, it } from "vitest";

import { validateNavDeclaration } from "@primebrick/sdk";

import { buildModuleNavMeta, listModuleNavCodes } from "../module-nav-meta.js";

/**
 * Static BE-owned declarations (`MODULE_NAV`) pass through the SAME
 * enrollment validator as service-declared nav — a static module cannot
 * regress into convention violations (singular list leaf, `/new` create,
 * undeclared nav targets) without breaking this test in CI.
 */
describe("MODULE_NAV — static declarations pass the enrollment validator", () => {
  for (const code of listModuleNavCodes()) {
    it(`module '${code}' nav declaration is valid`, () => {
      const decl = buildModuleNavMeta(code);
      expect(decl).not.toBeNull();
      // Static modules are owned by the BE; their part_of is the platform
      // root unless the module IS its own root.
      const partOf = code === "settings" ? "system" : code;
      expect(validateNavDeclaration(code, decl, partOf)).toBeNull();
    });
  }
});
