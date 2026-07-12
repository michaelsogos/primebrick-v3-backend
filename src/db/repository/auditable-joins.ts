import { EntityClass } from "@primebrick/dal-pg";
import { UserProfileEntity } from "../../modules/auth/user_profile_entity.js";
import { Join, field } from "./dsl.js";

/**
 * Standard join configuration for auditable entities.
 * Automatically adds LEFT JOINs to user_profiles table for created_by, updated_by, deleted_by fields.
 * 
 * Uses regex guardrail pattern to only join when the field contains a valid UUID.
 * This prevents errors when the field contains non-UUID values like "system".
 * 
 * @param entity - The entity class implementing IAuditableEntity
 * @returns Array of Join expressions for creator, updater, and deleter
 */
export function buildAuditableJoins(entity: EntityClass): ReturnType<typeof Join.on>[] {
  return [
    Join.on(
      field(UserProfileEntity, "uuid"),
      field(entity, "created_by" as any),
      "LEFT",
      { castRightTo: "text", castLeftTo: "text", alias: "creator" }
    ),
    Join.on(
      field(UserProfileEntity, "uuid"),
      field(entity, "updated_by" as any),
      "LEFT",
      { castRightTo: "text", castLeftTo: "text", alias: "updater" }
    ),
    Join.on(
      field(UserProfileEntity, "uuid"),
      field(entity, "deleted_by" as any),
      "LEFT",
      { castRightTo: "text", castLeftTo: "text", alias: "deleter" }
    ),
  ];
}

/**
 * Enhanced version that allows selective joins (e.g., only creator and updater).
 * Useful when you only need specific audit fields to reduce query overhead.
 * 
 * @param entity - The entity class implementing IAuditableEntity
 * @param options - Configuration for which joins to include
 * @returns Array of Join expressions for selected audit fields
 */
export function buildAuditableJoinsSelective(
  entity: EntityClass,
  options: {
    includeCreator?: boolean;
    includeUpdater?: boolean;
    includeDeleter?: boolean;
  } = {}
): ReturnType<typeof Join.on>[] {
  const joins: ReturnType<typeof Join.on>[] = [];
  const { includeCreator = true, includeUpdater = true, includeDeleter = true } = options;

  if (includeCreator) {
    joins.push(
      Join.on(
        field(UserProfileEntity, "uuid"),
        field(entity, "created_by" as any),
        "LEFT",
        { castRightTo: "text", castLeftTo: "text", alias: "creator" }
      )
    );
  }

  if (includeUpdater) {
    joins.push(
      Join.on(
        field(UserProfileEntity, "uuid"),
        field(entity, "updated_by" as any),
        "LEFT",
        { castRightTo: "text", castLeftTo: "text", alias: "updater" }
      )
    );
  }

  if (includeDeleter) {
    joins.push(
      Join.on(
        field(UserProfileEntity, "uuid"),
        field(entity, "deleted_by" as any),
        "LEFT",
        { castRightTo: "text", castLeftTo: "text", alias: "deleter" }
      )
    );
  }

  return joins;
}
