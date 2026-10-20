/**
 * Namespace-boundary guard tests — the write rule that makes cross-module
 * translation collisions impossible by construction:
 * `public`→`app.*`, else `<schema>.*`. A service must never write keys
 * outside its own namespace.
 */
import { describe, it, expect } from "vitest";
import { Entity, TranslationEntityBase } from "@primebrick/dal-pg";

import {
  MODULE_ENTITIES,
  assertKeyNamespace,
} from "../translations.service.js";
import {
  AppTranslationEntity,
  SystemTranslationEntity,
  CustomTranslationEntity,
} from "../translation_entities.js";
import { ValidationError } from "../../../http/api-errors.js";

/** Same synthesis path as TranslationsService.discoverServiceEntities. */
function serviceEntity(schema: string) {
  const cls = class extends TranslationEntityBase {} as any;
  Entity("translations", schema)(cls);
  return cls;
}

describe("MODULE_ENTITIES — BE-owned schemas only", () => {
  it("contains only core BE namespaces (service schemas come from discovery)", () => {
    expect(Object.keys(MODULE_ENTITIES).sort()).toEqual(["app", "custom", "settings", "system"]);
  });
});

describe("assertKeyNamespace — schema → key-namespace write boundary", () => {
  it.each([
    [AppTranslationEntity, "app.common.save"],
    [SystemTranslationEntity, "system.entities.customer.title"],
    [SystemTranslationEntity, "system.settings.tabs.profile"],
    [CustomTranslationEntity, "custom.my_label"],
    [serviceEntity("job"), "job.entities.job_rule.title"],
    [serviceEntity("emailsender"), "emailsender.mail.subject"],
  ])("accepts %s keys inside its own namespace", (entity: any, key: string) => {
    expect(() => assertKeyNamespace(entity, key)).not.toThrow();
  });

  it.each([
    // the historical drift class: module schema seeding CORE namespaces
    [serviceEntity("job"), "system.entities.job_rule.title"],
    [serviceEntity("job"), "app.common.save"],
    // core schemas accepting foreign module keys
    [SystemTranslationEntity, "job.entities.job_rule.title"],
    [AppTranslationEntity, "system.entities.customer.title"],
    [AppTranslationEntity, "job.anything"],
    // user keys outside custom
    [SystemTranslationEntity, "custom.my_label"],
    [serviceEntity("job"), "custom.my_label"],
    // non-custom schemas must reject; custom rejects non-custom keys
    [CustomTranslationEntity, "system.entities.x"],
    // a foreign service namespace
    [serviceEntity("job"), "emailsender.mail.subject"],
  ])("rejects %s keys outside its own namespace", (entity: any, key: string) => {
    expect(() => assertKeyNamespace(entity, key)).toThrowError(ValidationError);
  });

  it("rejects keys with no namespace segment", () => {
    expect(() => assertKeyNamespace(AppTranslationEntity as any, "nokey")).toThrowError(ValidationError);
  });

  it("is a no-op when no key is provided (update without key change)", () => {
    expect(() => assertKeyNamespace(AppTranslationEntity as any, undefined)).not.toThrow();
  });
});
