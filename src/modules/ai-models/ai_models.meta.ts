/**
 * `ai_model` entity metadata — the JSON returned by
 * `GET /api/v1/entities/ai_model/meta`.
 *
 * Pure data, no logic. Canonical `EntityMeta` shape (see
 * `src/http/entity-meta.types.ts`). `display_name` is omitted —
 * `assembleMeta` materializes it as `"${model_id}"` from `display_field`.
 */

import type { EntityMeta } from "../../http/entity-meta.types.js";
import {
  AI_MODEL_DEFAULT_SORT,
  AI_MODEL_LIST_COLUMNS,
} from "./list-config.js";

export const aiModelMeta: EntityMeta = {
  entity: "ai_model",
  translation_key: "ai_model",
  title_key: "system.entities.ai_model.title",
  uid: "uuid",
  display_field: "model_id",
  columns: AI_MODEL_LIST_COLUMNS,
  table: {
    default_view: "table",
    default_sort: AI_MODEL_DEFAULT_SORT,
    default_page_size: 25,
    page_size_options: [10, 25, 50, 100],
  },
};
