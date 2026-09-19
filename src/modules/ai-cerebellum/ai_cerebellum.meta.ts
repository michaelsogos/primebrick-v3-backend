/**
 * `ai_cerebellum` entity metadata — the JSON returned by
 * `GET /api/v1/entities/ai_cerebellum/meta`.
 *
 * Pure data, no logic. Mirrors `ai_models.meta.ts`.
 */

import {
  AI_CEREBELLUM_AUDITING_COLUMNS,
  AI_CEREBELLUM_DEFAULT_SORT,
  AI_CEREBELLUM_DEFAULT_VIEW,
  AI_CEREBELLUM_DEFAULT_VIEW_VISIBILITY,
  AI_CEREBELLUM_LIST_COLUMNS,
  AI_CEREBELLUM_STICKY_COLUMNS,
} from "./list-config.js";

export const aiCerebellumMeta = {
  entity: "ai_cerebellum",
  translationKey: "ai_cerebellum",
  titleKey: "system.entities.ai_cerebellum.title",
  uid: "uuid",
  defaultView: AI_CEREBELLUM_DEFAULT_VIEW,
  list: {
    searchPlaceholderKey: "system.entities.list.searchPlaceholder",
    defaultPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
    columns: AI_CEREBELLUM_LIST_COLUMNS,
    rowActions: {
      duplicate: false,
      delete: true,
      edit: true,
    },
    actions_overrides: {
      "duplicate.single": { enabled: false },
      "duplicate.bulk": { enabled: false },
    },
    stickyColumns: AI_CEREBELLUM_STICKY_COLUMNS,
    auditingColumns: AI_CEREBELLUM_AUDITING_COLUMNS,
    defaultSort: AI_CEREBELLUM_DEFAULT_SORT,
    viewVisibility: AI_CEREBELLUM_DEFAULT_VIEW_VISIBILITY,
  },
} as const;
