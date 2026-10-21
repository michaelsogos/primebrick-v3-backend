/**
 * Canonical entity metadata schema — the closed contract for every
 * `GET /api/v1/entities/{entity}/meta` response.
 *
 * The normative types live in `@primebrick/core` (re-exported via
 * `@primebrick/sdk`); this file re-exports them so existing internal import
 * sites keep working, and hosts only the BE-specific extension
 * (`ConfigEntryMeta`).
 *
 * Every `*.meta.ts` file MUST be annotated with `EntityMeta` (or a derived
 * interface such as `ConfigEntryMeta`). The schema is CLOSED: undeclared
 * properties are compile errors, so new meta props require extending the
 * canonical types in `@primebrick/core` first.
 *
 * Field naming is snake_case end-to-end (BE JSON → FE TS model, no DTO
 * renaming).
 */

import type { ConfigType, EntityMeta, TypeCapabilities } from "@primebrick/sdk";

export type { ActionsOverrides } from "@primebrick/sdk";

export type {
  EntityAction,
  EntityActionEndpoint,
  EntityMeta,
  EntityMetaResponse,
  MetaColumn,
  MetaColumnType,
  RowCustomAction,
  TableMeta,
  CollaborationMeta,
  ViewName,
  TooltipPriority,
} from "@primebrick/sdk";

/**
 * `config_entry` specialization — owns the canonical per-type capability
 * matrix (`TYPE_CAPABILITIES` from `@primebrick/sdk`).
 */
export interface ConfigEntryMeta extends EntityMeta {
  type_capabilities: Record<ConfigType, TypeCapabilities>;
}
