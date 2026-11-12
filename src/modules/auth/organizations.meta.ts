/**
 * `organization` entity metadata — the JSON returned by
 * `GET /api/v1/entities/organization/meta`.
 *
 * Pure data, no logic. Canonical `EntityMeta` shape (see
 * `src/http/entity-meta.types.ts`). `display_name` is omitted —
 * `assembleMeta` materializes it as `"${display_name}"` from `display_field`.
 */
import { withColumnConstraints } from "@primebrick/dal-pg";
import type { EntityMeta } from "../../http/entity-meta.types.js";
import { OrganizationEntity } from "./organization_entity.js";

export const organizationMeta: EntityMeta = withColumnConstraints({
  entity: "organization",
  translation_key: "organization",
  uid: "uuid",
  display_field: "display_name",
  columns: [
    { key: "display_name", label_key: "system.entities.organization.fields.display_name", type: "text", order: 0, default_visible: true, sticky: true, hideable: false },
    // uuid stays declared only to override filterable (derived uid default is false)
    { key: "uuid", label_key: "system.common.fields.uuid", type: "text", order: -1, default_visible: false, sticky: true },
    { key: "idp_code", label_key: "system.entities.organization.fields.idp_code", type: "text", order: 2, default_visible: false },
    { key: "website_url", label_key: "system.entities.organization.fields.website_url", type: "text", order: 3, default_visible: true },
    { key: "user_count", label_key: "system.entities.organization.fields.user_count", type: "number", order: 4, sortable: false, default_visible: true, kind: "calculated" },
    { key: "last_synced_at", label_key: "system.entities.organization.fields.last_synced_at", type: "datetime", order: 9, default_visible: false, audited: true },
  ],
  table: {
    default_view: "table",
    default_sort: { key: "created_at", dir: "desc" },
    default_page_size: 25,
    page_size_options: [10, 25, 50, 100],
  },
}, OrganizationEntity);
