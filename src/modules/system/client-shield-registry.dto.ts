/**
 * client_registry entity — request schemas and DTO types.
 *
 * The table stores only `client_key_hash` (sha256). The write contract
 * accepts `client_key` (raw): the service hashes it on the write path and
 * the raw value NEVER persists. When `client_key` is omitted on create the
 * server generates a strong key and echoes it once in the response.
 */

import { z } from "zod";

import { zBoundedInt } from "../../http/validation.js";
import { ListQueryBaseSchema } from "../../http/list-query.js";

export const CLIENT_REGISTRY_SOURCES = ["manual", "registry"] as const;
export type ClientRegistrySource = (typeof CLIENT_REGISTRY_SOURCES)[number];

export const CLIENT_REGISTRY_SORT_KEYS = [
  "ua_prefix",
  "source",
  "is_enabled",
  "created_at",
  "updated_at",
] as const;

export const ClientRegistryListQuerySchema = ListQueryBaseSchema.extend({
  source: z.enum(CLIENT_REGISTRY_SOURCES).optional(),
  sort_key: z.enum(CLIENT_REGISTRY_SORT_KEYS as unknown as [string, ...string[]]).optional(),
});
export type ClientRegistryListQuery = z.infer<typeof ClientRegistryListQuerySchema>;

/**
 * `ua_prefix` is matched with `ua.startsWith(prefix)` by every verifying
 * service — it must be a single non-empty token (optionally
 * `name[/version]`). Whitespace is rejected outright.
 */
const uaPrefixSchema = z
  .string()
  .min(2)
  .max(120)
  .regex(/^\S+$/, "ua_prefix must not contain whitespace");

/** Raw client key — write-only field, never persisted as-is. */
const clientKeySchema = z.string().min(16).max(256);

export const ClientRegistryCreateEntitySchema = z.object({
  ua_prefix: uaPrefixSchema,
  client_key: clientKeySchema.optional(),
  is_enabled: z.boolean().optional(),
});
export type ClientRegistryCreateEntity = z.infer<typeof ClientRegistryCreateEntitySchema>;

export const ClientRegistryUpdateEntitySchema = z.object({
  ua_prefix: uaPrefixSchema.optional(),
  client_key: clientKeySchema.optional(),
  is_enabled: z.boolean().optional(),
  version: zBoundedInt(0, Number.MAX_SAFE_INTEGER),
});
export type ClientRegistryUpdateEntity = z.infer<typeof ClientRegistryUpdateEntitySchema>;

/**
 * POST /:uuid/rotate body — a `client_key` sets an explicit new key
 * (manual rows; static registry rows where the admin will reconfigure the
 * service to match). Omit on derived rows: the generation is bumped and
 * the BE pre-computes the new hash from its derivation master.
 */
export const ClientRegistryRotateBodySchema = z.object({
  client_key: clientKeySchema.optional(),
});
export type ClientRegistryRotateBody = z.infer<typeof ClientRegistryRotateBodySchema>;
