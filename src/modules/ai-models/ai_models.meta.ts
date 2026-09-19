/**
 * `ai_model` entity metadata — the JSON returned by
 * `GET /api/v1/entities/ai_model/meta`.
 *
 * Pure data, no logic. Mirrors `customers.meta.ts`.
 */

import {
  AI_MODEL_AUDITING_COLUMNS,
  AI_MODEL_DEFAULT_SORT,
  AI_MODEL_DEFAULT_VIEW,
  AI_MODEL_DEFAULT_VIEW_VISIBILITY,
  AI_MODEL_LIST_COLUMNS,
  AI_MODEL_STICKY_COLUMNS,
} from "./list-config.js";

export const aiModelMeta = {
  entity: "ai_model",
  translationKey: "ai_model",
  titleKey: "system.entities.ai_model.title",
  uid: "uuid",
  defaultView: AI_MODEL_DEFAULT_VIEW,
  list: {
    searchPlaceholderKey: "system.entities.list.searchPlaceholder",
    defaultPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
    columns: AI_MODEL_LIST_COLUMNS,
    rowActions: {
      duplicate: false,
      delete: true,
      edit: true,
    },
    actions_overrides: {
      "duplicate.single": { enabled: false },
      "duplicate.bulk": { enabled: false },
    },
    stickyColumns: AI_MODEL_STICKY_COLUMNS,
    auditingColumns: AI_MODEL_AUDITING_COLUMNS,
    defaultSort: AI_MODEL_DEFAULT_SORT,
    viewVisibility: AI_MODEL_DEFAULT_VIEW_VISIBILITY,
  },
} as const;
