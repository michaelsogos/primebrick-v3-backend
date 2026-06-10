/**
 * TypeScript utility types for auditable entities.
 * These types add display name fields to row types for entities that implement IAuditableEntity.
 */

/**
 * Adds display name fields to a row type for auditable entities.
 * Use this to type the result of queries that include auditable joins.
 * 
 * The display name fields are added by the query-builder when using the auditable join helpers.
 * 
 * @example
 * ```typescript
 * export type CustomerDetailRow = WithAuditableDisplayNames<{
 *   uuid: string;
 *   created_by: string;
 *   updated_by: string;
 *   deleted_by?: string;
 *   // ... other fields
 * }>;
 * ```
 */
export type WithAuditableDisplayNames<T> = T & {
  created_by_name?: string;
  updated_by_name?: string;
  deleted_by_name?: string;
};

/**
 * Adds only creator display name (for cases where you only need created_by).
 * Useful for list views where you only show who created the record.
 * 
 * @example
 * ```typescript
 * export type CustomerListItem = WithCreatorDisplayName<{
 *   uuid: string;
 *   created_by: string;
 *   // ... other fields
 * }>;
 * ```
 */
export type WithCreatorDisplayName<T> = T & {
  created_by_name?: string;
};

/**
 * Adds only updater display name (for cases where you only need updated_by).
 * Useful for list views where you only show who last updated the record.
 * 
 * @example
 * ```typescript
 * export type CustomerListItem = WithUpdaterDisplayName<{
 *   uuid: string;
 *   updated_by: string;
 *   // ... other fields
 * }>;
 * ```
 */
export type WithUpdaterDisplayName<T> = T & {
  updated_by_name?: string;
};
