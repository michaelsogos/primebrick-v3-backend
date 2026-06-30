/**
 * Password policy module — enum, regex configs, and helpers.
 *
 * The active policy is stored in the `auth_configurations` table under key
 * `password_policy`. The DB value is the lowercase string matching the enum
 * (e.g. "letter_number_special").
 *
 * Policies (from weakest to strongest):
 *   - alpha_numeric        : any mix of letters/numbers, no specials, 8-64
 *   - letter_and_number    : ≥1 letter + ≥1 number, no specials, 8-64
 *   - letter_number_special: ≥1 letter + ≥1 number + ≥1 special, 8-64  (DEFAULT)
 *   - mixed_case_special   : ≥1 lower + ≥1 upper + ≥1 number + ≥1 special, 8-64
 *
 * Allowed special characters: * - _ . # @ ! | ? ^ :
 */

import { z } from "zod";

export enum PasswordPolicy {
  ALPHA_NUMERIC = "alpha_numeric",
  LETTER_AND_NUMBER = "letter_and_number",
  LETTER_NUMBER_SPECIAL = "letter_number_special",
  MIXED_CASE_SPECIAL = "mixed_case_special",
}

export const DEFAULT_PASSWORD_POLICY = PasswordPolicy.LETTER_NUMBER_SPECIAL;

/** Allowed special characters across all policies that require specials. */
export const PASSWORD_SPECIAL_CHARS = "*-_.#@!|?^:";

/**
 * Checklist rules that the FE renders. Each policy declares which rules to show.
 * The FE mirrors this enum and uses it to decide which checklist items to render.
 */
export enum PasswordChecklistRule {
  LENGTH = "length",
  LETTER = "letter",
  LOWERCASE = "lowercase",
  UPPERCASE = "uppercase",
  NUMBER = "number",
  SPECIAL = "special",
}

export interface PasswordPolicyConfig {
  /** Anchored regex (^...$) used for validation. */
  regex: RegExp;
  /** i18n key for the validation error message shown when the password fails. */
  errorLabelKey: string;
  /** Ordered list of checklist rules the FE should render for this policy. */
  checklistRules: PasswordChecklistRule[];
}

/**
 * Per-policy configuration.
 *
 * Regex breakdown:
 *   - ALPHA_NUMERIC:         [A-Za-z0-9]{8,64}
 *   - LETTER_AND_NUMBER:     (?=.*[A-Za-z])(?=.*\d) + [A-Za-z0-9]{8,64}
 *   - LETTER_NUMBER_SPECIAL: + (?=.*[specials]) + [A-Za-z0-9*specials]{8,64}
 *   - MIXED_CASE_SPECIAL:    (?=.*[a-z])(?=.*[A-Z]) instead of (?=.*[A-Za-z])
 *
 * In the character class [*\-_.#@!|?^:]:
 *   - `\-` is escaped to be a literal hyphen (not a range)
 *   - `^` is NOT at the start, so it's literal
 *   - `|` inside [] is literal
 *   - `.`, `#`, `@`, `!`, `?`, `:` are all literal inside []
 */
export const PASSWORD_POLICY_CONFIGS: Record<PasswordPolicy, PasswordPolicyConfig> = {
  [PasswordPolicy.ALPHA_NUMERIC]: {
    regex: /^[A-Za-z0-9]{8,64}$/,
    errorLabelKey: "validation.passwordPolicyAlphaNumeric",
    checklistRules: [PasswordChecklistRule.LENGTH],
  },
  [PasswordPolicy.LETTER_AND_NUMBER]: {
    regex: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]{8,64}$/,
    errorLabelKey: "validation.passwordPolicyLetterAndNumber",
    checklistRules: [
      PasswordChecklistRule.LENGTH,
      PasswordChecklistRule.LETTER,
      PasswordChecklistRule.NUMBER,
    ],
  },
  [PasswordPolicy.LETTER_NUMBER_SPECIAL]: {
    regex: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[*\-_.#@!|?^:])[A-Za-z0-9*\-_.#@!|?^:]{8,64}$/,
    errorLabelKey: "validation.passwordPolicyLetterNumberSpecial",
    checklistRules: [
      PasswordChecklistRule.LENGTH,
      PasswordChecklistRule.LETTER,
      PasswordChecklistRule.NUMBER,
      PasswordChecklistRule.SPECIAL,
    ],
  },
  [PasswordPolicy.MIXED_CASE_SPECIAL]: {
    regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[*\-_.#@!|?^:])[A-Za-z0-9*\-_.#@!|?^:]{8,64}$/,
    errorLabelKey: "validation.passwordPolicyMixedCaseSpecial",
    checklistRules: [
      PasswordChecklistRule.LENGTH,
      PasswordChecklistRule.LOWERCASE,
      PasswordChecklistRule.UPPERCASE,
      PasswordChecklistRule.NUMBER,
      PasswordChecklistRule.SPECIAL,
    ],
  },
};

/**
 * Parse a DB string into a PasswordPolicy enum value.
 * Falls back to DEFAULT_PASSWORD_POLICY if the value is missing or invalid.
 */
export function parsePasswordPolicy(value: string | undefined | null): PasswordPolicy {
  if (value && Object.values(PasswordPolicy).includes(value as PasswordPolicy)) {
    return value as PasswordPolicy;
  }
  return DEFAULT_PASSWORD_POLICY;
}

/**
 * Get the config for a policy. Always returns a valid config
 * (falls back to default if the policy is somehow invalid).
 */
export function getPasswordPolicyConfig(policy: PasswordPolicy): PasswordPolicyConfig {
  return PASSWORD_POLICY_CONFIGS[policy] ?? PASSWORD_POLICY_CONFIGS[DEFAULT_PASSWORD_POLICY];
}

/**
 * Build a zod string schema for password validation given a policy.
 * The schema enforces:
 *   1. Non-empty (with a "passwordRequired" message)
 *   2. Matches the policy regex (with the policy-specific error label key)
 */
export function passwordZodSchema(policy: PasswordPolicy) {
  const config = getPasswordPolicyConfig(policy);
  return z
    .string()
    .min(1, { message: "validation.passwordRequired" })
    .regex(config.regex, { message: config.errorLabelKey });
}
