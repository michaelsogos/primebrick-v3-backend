export type WithDeletedRecords = "EXCLUDED" | "ONLY" | "INCLUDED";

export type FindByIdOptions = {
  /** If true (default), throw when rowcount !== 1. */
  throwExceptionIfNullOrMany?: boolean;
  deletedRecords?: WithDeletedRecords;
};

export type FindOptions = {
  deletedRecords?: WithDeletedRecords;
  filters?: import("./dsl.js").FilterExpr[];
  sorting?: import("./dsl.js").SortingExpr[];
  joins?: import("./dsl.js").JoinExpr[];
  /** Automatically add auditable joins for IAuditableEntity implementations */
  includeAuditableJoins?: boolean;
};

export type PaginatedEntity<TEntity> = {
  entities: TEntity[];
  total_records: number;
};

