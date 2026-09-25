/**
 * `customer` entity metadata — the JSON returned by
 * `GET /api/v1/entities/customer/meta`.
 *
 * Pure data, no logic. Canonical `EntityMeta` shape (see
 * `src/http/entity-meta.types.ts`). `display_name` is omitted —
 * `assembleMeta` materializes it as `"${code}"` from `display_field`.
 */

import type { EntityMeta } from "../../http/entity-meta.types.js";
import {
  CUSTOMER_DEFAULT_SORT,
  CUSTOMER_LIST_COLUMNS,
} from "./list-config.js";

export const customerMeta: EntityMeta = {
  entity: "customer",
  translation_key: "customer",
  title_key: "system.entities.customer.title",
  uid: "uuid",
  display_field: "code",
  columns: CUSTOMER_LIST_COLUMNS,
  table: {
    default_view: "table",
    default_sort: CUSTOMER_DEFAULT_SORT,
    default_page_size: 25,
    page_size_options: [10, 25, 50, 100],
  },
};
