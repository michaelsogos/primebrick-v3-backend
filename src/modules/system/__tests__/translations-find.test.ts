/**
 * findTranslations matcher grammar — the wired filter's input contract.
 * A match string carries the namespace it targets: `{ns}`/`{ns}.*` subtree
 * prefixes and `{ns}.seg…` exact keys; interior wildcards, unbounded
 * matchers and oversized inputs are transport-level rejects (ValidationError).
 * `parseTranslationMatchers` is the pure, DB-free half of the gate.
 */
import { describe, it, expect } from "vitest";

import {
  parseTranslationMatchers,
  FIND_TRANSLATIONS_MAX_MATCHES,
} from "../translations.service.js";
import { ValidationError } from "../../../http/api-errors.js";

describe("parseTranslationMatchers — match grammar", () => {
  it.each([
    // [input, ns, exact, value] — prefix terms carry the trailing-dot prefix
    ["job", "job", false, "job."],                        // bare ns → whole namespace
    ["job.*", "job", false, "job."],                      // explicit ns wildcard
    ["job.settings.config.*", "job", false, "job.settings.config."],
    ["app.common.ok", "app", true, "app.common.ok"],      // exact key
    ["ai.entities.ai_model.title", "ai", true, "ai.entities.ai_model.title"],
    ["system.entities.x.*", "system", false, "system.entities.x."],
    ["custom.a.b.c.*", "custom", false, "custom.a.b.c."],
  ])("'%s' → ns=%s exact=%s value=%s", (raw, ns, exact, value) => {
    const terms = parseTranslationMatchers([raw]).get(ns);
    expect(terms).toEqual([{ exact, value }]);
  });

  it("groups terms by namespace, preserving first-seen order", () => {
    const byModule = parseTranslationMatchers([
      "job.a.*",
      "ai.x",
      "job.b",
      "app.*",
    ]);
    expect([...byModule.keys()]).toEqual(["job", "ai", "app"]);
    expect(byModule.get("job")).toEqual([
      { exact: false, value: "job.a." },
      { exact: true, value: "job.b" },
    ]);
  });

  it("dedupes identical matchers", () => {
    const byModule = parseTranslationMatchers(["job.*", "job.*"]);
    expect(byModule.get("job")).toHaveLength(1);
  });

  it.each([
    "*", "%", "job.%", "job..a", "job.", ".job", "JOB", "Job.*",
    "job.a.*.b",      // interior wildcard
    "job-Handler.*",  // hyphen outside segment grammar
    "", "job.*.*",
  ])("rejects malformed matcher '%s'", (raw) => {
    expect(() => parseTranslationMatchers([raw])).toThrowError(ValidationError);
  });

  it("rejects empty input — never a full download", () => {
    expect(() => parseTranslationMatchers([])).toThrowError(ValidationError);
  });

  it(`rejects more than ${FIND_TRANSLATIONS_MAX_MATCHES} matchers`, () => {
    const tooMany = Array.from({ length: FIND_TRANSLATIONS_MAX_MATCHES + 1 }, (_, i) => `app.k${i}`);
    expect(() => parseTranslationMatchers(tooMany)).toThrowError(ValidationError);
  });
});
