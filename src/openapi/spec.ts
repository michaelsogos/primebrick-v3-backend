import { openapi } from "./openapi.js";
import { collectEntitySpecPaths } from "../http/entity-router.js";

/**
 * The BE's complete OpenAPI spec: canonical entity-CRUD paths generated from
 * every live makeEntityRouter registration, merged UNDER the hand-written
 * spec (hand-written wins on conflicts — richer descriptions preserved).
 * Single source used by both /api/v1/openapi.json and the aggregated spec.
 */
export function mergedOpenApiSpec(): Record<string, unknown> {
  return {
    ...openapi,
    paths: { ...collectEntitySpecPaths(), ...openapi.paths },
  };
}
