/**
 * `customer` entity metadata — the JSON returned by
 * `GET /api/v1/entities/customer/meta`.
 *
 * Pure data, no logic. Extracted from the inline block that used to live in
 * `router.ts` so the meta is scannable and reusable.
 */

import {
  CUSTOMER_AUDITING_COLUMNS,
  CUSTOMER_DEFAULT_SORT,
  CUSTOMER_DEFAULT_VIEW,
  CUSTOMER_DEFAULT_VIEW_VISIBILITY,
  CUSTOMER_LIST_COLUMNS,
  CUSTOMER_STICKY_COLUMNS,
} from "./list-config.js";

export const customerMeta = {
  entity: "customer",
  titleKey: "entities.customer.title",
  uid: "uuid",
  defaultView: CUSTOMER_DEFAULT_VIEW,
  list: {
    searchPlaceholderKey: "entities.list.searchPlaceholder",
    defaultPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
    columns: CUSTOMER_LIST_COLUMNS,
    rowActions: {
      duplicate: true,
      delete: true,
      edit: true,
    },
    stickyColumns: CUSTOMER_STICKY_COLUMNS,
    auditingColumns: CUSTOMER_AUDITING_COLUMNS,
    defaultSort: CUSTOMER_DEFAULT_SORT,
    viewVisibility: CUSTOMER_DEFAULT_VIEW_VISIBILITY,
  },
} as const;
