/**
 * Entity SQL metadata (decorator-driven). Prefer importing from here for a stable module path.
 */
export {
  Entity,
  Column,
  Key,
  Unique,
  IsNotColumn,
  isEntityClass,
  getTableName,
  getEntityName,
  getColumnName,
  getPrimaryKeyColumn,
  getEntityPersistenceMeta,
  listDecoratedPropertyKeys,
  listEntityPersistencePropertyKeys,
  syncImplicitEntityColumns,
  type EntityClass,
  type ColumnOptions,
  type KeyOptions,
  type EntityPersistenceMeta,
} from "./entity-decorators.js";

export {
  columnHintsFromMetaColumn,
  effectivePgStorageType,
  entityDateToApiIso,
  hydrateEntityDateFieldsFromJson,
  isLogicalJsDateColumn,
  jsValueToPgParam,
  pgValueToJsValue,
  type ColumnPgPersistenceHints,
} from "./column-pg-io.js";
