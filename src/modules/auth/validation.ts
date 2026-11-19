/**
 * Shared validation helpers for display_name and idp_name/username fields.
 *
 * display_name mirrors the display_field write-contract convention
 * (withColumnConstraints: required, min 5, max 255, edge-alphanumeric).
 * idp_name/username keep their own minimum (3) — they are IdP identifiers,
 * not the display identity.
 *
 * Error messages carry the `app.common.validation.*` i18n vocabulary in the
 * `key|{json-params}` wire format — the FE `translateError` decodes them
 * identically to entity-field issues.
 */
import { z } from "zod";

export const DISPLAY_NAME_MIN = 5;
export const DISPLAY_NAME_MAX = 255;

export const IDP_NAME_MIN = 3;
export const IDP_NAME_MAX = 255;

/**
 * Returns true if the value starts and ends with an alphanumeric character.
 * Empty strings pass (handled by required/min validators).
 */
export function startsAndEndsWithAlphanumeric(value: string): boolean {
  if (!value || value.length === 0) return true; // Skip empty (handled by required)
  const firstChar = value[0];
  const lastChar = value[value.length - 1];
  const alphanumericRegex = /^[a-z0-9]$/i;
  return alphanumericRegex.test(firstChar) && alphanumericRegex.test(lastChar);
}

/** Apply to a z.string() chain for display_name fields. */
export function displayNameSchema(base: z.ZodString) {
  return base
    .min(DISPLAY_NAME_MIN, { message: `app.common.validation.too_short|{"min": ${DISPLAY_NAME_MIN}}` })
    .max(DISPLAY_NAME_MAX, { message: `app.common.validation.too_long|{"max": ${DISPLAY_NAME_MAX}}` })
    .refine(startsAndEndsWithAlphanumeric, {
      message: "app.common.validation.invalid_format",
    });
}

/** Apply to a z.string() chain for idp_name / username fields. */
export function idpNameSchema(base: z.ZodString) {
  return base
    .min(IDP_NAME_MIN, { message: `app.common.validation.too_short|{"min": ${IDP_NAME_MIN}}` })
    .max(IDP_NAME_MAX, { message: `app.common.validation.too_long|{"max": ${IDP_NAME_MAX}}` })
    .refine(startsAndEndsWithAlphanumeric, {
      message: "app.common.validation.invalid_format",
    });
}
