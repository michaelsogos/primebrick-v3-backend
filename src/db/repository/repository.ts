import type { Pool, PoolClient } from "pg";
import { randomUUID } from "node:crypto";

import type { EntityClass } from "@primebrick/dal-pg";
import {
  getColumnName,
  getEntityPersistenceMeta,
  getTableName,
  syncImplicitEntityColumns
} from "@primebrick/dal-pg";
import {
  AuditableFieldType,
  DeletableFieldType
} from "@primebrick/dal-pg";

import type { FieldProjector, FilterExpr, JoinExpr, SortingExpr } from "./dsl.js";
import { field, Filter } from "./dsl.js";
import { buildSelectQuery } from "./query-builder.js";
import type { FindByIdOptions, FindOptions, PaginatedEntity } from "./types.js";
import type { AuditService } from "../../lib/audit/audit-service.js";
import { AuditAction } from "../../lib/audit/audit-types.js";
import { calculateDelta, calculateDeltaWithForcedFields } from "../../lib/audit/delta-calculator.js";
import { NotFoundError } from "../../http/api-errors.js";

type Queryable = Pick<Pool, "query"> | Pick<PoolClient, "query">;

export class Repository {
  constructor(private readonly db: Queryable, private readonly auditService?: AuditService) {}

  async rawSql<TResult = unknown>(text: string, values?: unknown[]): Promise<TResult[]> {
    const r = await this.db.query(text, values ?? []);
    return (r.rows ?? []) as TResult[];
  }

  async count(entity: EntityClass): Promise<bigint> {
    const table = getTableName(entity);
    const r = await this.db.query<{ n: bigint }>(`SELECT COUNT(*) AS n FROM "${table}"`, []);
    return r.rows?.[0]?.n ?? 0n;
  }

  /**
   * Bulk insert (single INSERT … VALUES …). Columns are inferred from the first row (undefined omitted).
   * Skips identity PK column automatically when not provided.
   */
  async insertMany<TEntity extends object>(
    entity: EntityClass,
    rows: Array<Partial<Record<keyof TEntity & string, unknown>>>
  ): Promise<void> {
    if (rows.length === 0) return;
    const meta = getEntityPersistenceMeta(entity);
    const table = getTableName(entity);
    const pk = Object.values(meta.columns).find((c) => c.isKey);
    const isAuditable = meta.isAuditable;

    const first = rows[0] as Record<string, unknown>;
    let keys = Object.keys(first).filter((k) => first[k] !== undefined);

    // Drop identity key unless explicitly provided
    if (pk && meta.columns[pk.sqlName]?.usePostgresIdentity) {
      keys = keys.filter((k) => k !== pk.propertyKey);
    }

    if (keys.length === 0) {
      throw new Error("insertMany: no columns to insert (all undefined?)");
    }

    // Validate keys exist in meta
    for (const k of keys) {
      const sqlName = getColumnName(entity, k);
      if (!meta.columns[sqlName]) {
        throw new Error(`insertMany: unknown column/property ${k}`);
      }
    }

    const colsSql = keys.map((k) => `"${getColumnName(entity, k)}"`).join(", ");
    const values: unknown[] = [];
    const tuples: string[] = [];
    for (const row of rows) {
      const rec = row as Record<string, unknown>;
      const params: string[] = [];
      for (const k of keys) {
        values.push(rec[k] ?? null);
        params.push(`$${values.length}`);
      }
      tuples.push(`(${params.join(", ")})`);
    }
    const sql = `INSERT INTO "${table}" (${colsSql}) VALUES ${tuples.join(", ")} RETURNING "${pk?.sqlName}", uuid`;
    const result = await this.db.query(sql, values);

    // Write audit records if entity is auditable
    if (isAuditable && this.auditService) {
      const insertedRows = result.rows as Array<{ [key: string]: unknown }>;
      for (let i = 0; i < insertedRows.length; i++) {
        const inserted = insertedRows[i];
        const row = rows[i] as Record<string, unknown>;
        const entityId = inserted[pk!.sqlName] as bigint;
        const entityUuid = inserted.uuid as string;
        
        // Calculate delta (empty old, full new)
        const delta = calculateDelta({}, row);

        // Write audit without await
        this.auditService.writeAudit(
          entity,
          entityId,
          entityUuid,
          AuditAction.INSERT,
          new Date(),
          1, // version starts at 1
          delta
        ).catch((err) => console.error('[Audit Error]', err));
      }
    }
  }

  async findById<TEntity extends object, TResult = TEntity>(
    entity: EntityClass,
    id: bigint | string,
    options?: FindByIdOptions
  ): Promise<TResult | null> {
    const throwExceptionIfNullOrMany = options?.throwExceptionIfNullOrMany ?? true;
    const meta = getEntityPersistenceMeta(entity);
    const pk = Object.values(meta.columns).find((c) => c.isKey);
    if (!pk) throw new Error(`Entity ${meta.entityClassName} has no @Key() column`);

    const q = buildSelectQuery({
      entity,
      filters: [Filter.fieldValue(field(entity, pk.propertyKey), "=", id)],
      deletedRecords: options?.deletedRecords,
    });

    const r = await this.db.query(q.text, q.values);
    const rows = (r.rows ?? []) as TResult[];

    if (!throwExceptionIfNullOrMany) return rows[0] ?? null;
    if (rows.length !== 1) {
      throw new Error(`Expected exactly 1 row, got ${rows.length}`);
    }
    return rows[0] ?? null;
  }

  async find<TEntity extends object, TResult = TEntity>(
    entity: EntityClass,
    fields?: FieldProjector[] | null,
    options?: FindOptions
  ): Promise<TResult | null> {
    const q = buildSelectQuery({
      entity,
      fields: fields ?? undefined,
      joins: options?.joins,
      filters: options?.filters,
      sorting: options?.sorting,
      deletedRecords: options?.deletedRecords,
      limit: 1,
    });
    const r = await this.db.query(q.text, q.values);
    return (r.rows?.[0] as TResult | undefined) ?? null;
  }

  async findAll<TEntity extends object, TResult = TEntity>(
    entity: EntityClass,
    fields?: FieldProjector[] | null,
    options?: FindOptions
  ): Promise<TResult[]> {
    const q = buildSelectQuery({
      entity,
      fields: fields ?? undefined,
      joins: options?.joins,
      filters: options?.filters,
      sorting: options?.sorting,
      deletedRecords: options?.deletedRecords,
    });
    const r = await this.db.query(q.text, q.values);
    return (r.rows ?? []) as TResult[];
  }

  async findByPage<TEntity extends object, TResult = TEntity>(
    entity: EntityClass,
    page: number,
    recordsPerPage: number,
    fields?: FieldProjector[] | null,
    options?: FindOptions
  ): Promise<PaginatedEntity<TResult>> {
    if (page <= 0) throw new Error("Cannot query with page number lower than 1!");
    if (recordsPerPage <= 0) throw new Error("Cannot query with records per page number lower than 1!");

    const limit = recordsPerPage;
    const offset = recordsPerPage * (page - 1);

    const q = buildSelectQuery({
      entity,
      fields: fields ?? undefined,
      joins: options?.joins,
      filters: options?.filters,
      sorting: options?.sorting,
      deletedRecords: options?.deletedRecords,
      limit,
      offset,
      includeTotalRecordsWindow: true,
    });
    const r = await this.db.query(q.text, q.values);

    const rows = (r.rows ?? []) as Array<TResult & { _total_records?: bigint | null }>;
    const total_records = rows[0]?._total_records ?? 0n;

    const entities = rows.map((x) => {
      const { _total_records, ...rest } = x as any;
      return rest as TResult;
    });

    return { entities, total_records };
  }

  /**
   * Soft delete a single entity by UUID.
   * Updates deleted_at, deleted_by, updated_at, updated_by instead of physical DELETE.
   * @param entity - Entity class
   * @param uuid - UUID of the record to delete
   * @param deletedBy - User/identifier performing the deletion
   * @throws Error if entity has no key column, no uuid column, or if no rows are affected
   */
  async delete<TEntity extends object>(
    entity: EntityClass,
    uuid: string,
    deletedBy: string
  ): Promise<void> {
    const meta = getEntityPersistenceMeta(entity);
    const table = getTableName(entity);
    const isAuditable = meta.isAuditable;

    // Find the uuid column (usually named 'uuid' and marked with @Unique())
    const uuidColumn = Object.entries(meta.columns).find(([name, col]) =>
      name === 'uuid' || col.isUnique
    );
    if (!uuidColumn) throw new Error(`Entity ${meta.entityClassName} has no uuid column`);

    const uuidColumnName = uuidColumn[0];
    const uuidColumnMeta = uuidColumn[1];
    const pk = Object.values(meta.columns).find((c) => c.isKey);

    const deleted_at = new Date();
    
    // Fetch old record for audit if auditable
    let oldRecord: Record<string, unknown> | null = null;
    if (isAuditable && this.auditService) {
      const oldQuery = `SELECT * FROM "${table}" WHERE "${uuidColumnMeta.sqlName}" = $1`;
      const oldResult = await this.db.query(oldQuery, [uuid]);
      if (oldResult.rowCount && oldResult.rowCount > 0) {
        oldRecord = oldResult.rows[0] as Record<string, unknown>;
      }
    }

    const sql = `UPDATE "${table}" SET deleted_at = $1, deleted_by = $2, updated_at = $3, updated_by = $4, version = version + 1 WHERE "${uuidColumnMeta.sqlName}" = $5 RETURNING "${pk?.sqlName}", version`;
    const result = await this.db.query(sql, [deleted_at, deletedBy, deleted_at, deletedBy, uuid]);

    if (result.rowCount === 0) {
      throw new NotFoundError(`No ${table} found with UUID ${uuid}`, {
        instance: `/api/v1/entities/${table}/${uuid}`,
      });
    }

    // Write audit record if entity is auditable
    if (isAuditable && this.auditService && oldRecord) {
      const updated = result.rows[0] as { [key: string]: unknown };
      const entityId = updated[pk!.sqlName] as bigint;
      const newVersion = updated.version as number;
      
      // Calculate delta; force include updated_at/updated_by so the audit trail
      // always carries the actor and timestamp even when unchanged across operations.
      const newRecord = { ...oldRecord, deleted_at, deleted_by: deletedBy, updated_at: deleted_at, updated_by: deletedBy, version: newVersion };
      const delta = calculateDeltaWithForcedFields(oldRecord, newRecord, ['updated_at', 'updated_by']);

      // Write audit without await
      this.auditService.writeAudit(
        entity,
        entityId,
        uuid,
        AuditAction.SOFT_DELETE,
        deleted_at,
        newVersion,
        delta
      ).catch((err) => console.error('[Audit Error]', err));
    }
  }

  /**
   * Restore a soft-deleted entity by UUID.
   * Clears deleted_at and deleted_by, updates updated_at and updated_by.
   * @param entity - Entity class
   * @param uuid - UUID of the record to restore
   * @param restoredBy - User/identifier performing the restoration
   * @throws Error if entity has no key column, no uuid column, or if no rows are affected
   */
  async restore<TEntity extends object>(
    entity: EntityClass,
    uuid: string,
    restoredBy: string
  ): Promise<void> {
    const meta = getEntityPersistenceMeta(entity);
    const table = getTableName(entity);
    const isAuditable = meta.isAuditable;

    // Find the uuid column (usually named 'uuid' and marked with @Unique())
    const uuidColumn = Object.entries(meta.columns).find(([name, col]) =>
      name === 'uuid' || col.isUnique
    );
    if (!uuidColumn) throw new Error(`Entity ${meta.entityClassName} has no uuid column`);

    const uuidColumnName = uuidColumn[0];
    const uuidColumnMeta = uuidColumn[1];
    const pk = Object.values(meta.columns).find((c) => c.isKey);

    const updated_at = new Date();
    
    // Fetch old record for audit if auditable
    let oldRecord: Record<string, unknown> | null = null;
    if (isAuditable && this.auditService) {
      const oldQuery = `SELECT * FROM "${table}" WHERE "${uuidColumnMeta.sqlName}" = $1`;
      const oldResult = await this.db.query(oldQuery, [uuid]);
      if (oldResult.rowCount && oldResult.rowCount > 0) {
        oldRecord = oldResult.rows[0] as Record<string, unknown>;
      }
    }

    const sql = `UPDATE "${table}" SET deleted_at = NULL, deleted_by = NULL, updated_at = $1, updated_by = $2, version = version + 1 WHERE "${uuidColumnMeta.sqlName}" = $3 RETURNING "${pk?.sqlName}", version`;
    const result = await this.db.query(sql, [updated_at, restoredBy, uuid]);

    if (result.rowCount === 0) {
      throw new NotFoundError(`No ${table} found with UUID ${uuid}`, {
        instance: `/api/v1/entities/${table}/${uuid}/restore`,
      });
    }

    // Write audit record if entity is auditable
    if (isAuditable && this.auditService && oldRecord) {
      const updated = result.rows[0] as { [key: string]: unknown };
      const entityId = updated[pk!.sqlName] as bigint;
      const newVersion = updated.version as number;
      
      // Calculate delta; force include updated_at/updated_by so the audit trail
      // always carries the actor and timestamp even when unchanged across operations.
      const newRecord = { ...oldRecord, deleted_at: null, deleted_by: null, updated_at, updated_by: restoredBy, version: newVersion };
      const delta = calculateDeltaWithForcedFields(oldRecord, newRecord, ['updated_at', 'updated_by']);

      // Write audit without await
      this.auditService.writeAudit(
        entity,
        entityId,
        uuid,
        AuditAction.RESTORE,
        updated_at,
        newVersion,
        delta
      ).catch((err) => console.error('[Audit Error]', err));
    }
  }

  /**
   * Clone/duplicate a record by UUID.
   * Creates a new record identical to the source, excluding:
   * - Primary keys (auto-generated)
   * - Unique fields (auto-generated)
   * - Audit fields (reset to default)
   * - Delete fields (reset to null)
   * - Clone fields (set to source UUID)
   * @param entity - Entity class
   * @param sourceUuid - UUID of the record to clone
   * @param clonedBy - User/identifier performing the clone
   * @returns UUID of the newly created record
   * @throws Error if entity has no uuid column, source record not found, or clone fails
   */
  async clone<TEntity extends object>(
    entity: EntityClass,
    sourceUuid: string,
    clonedBy: string
  ): Promise<string> {
    const meta = getEntityPersistenceMeta(entity);
    const table = getTableName(entity);
    
    // Find the uuid column (usually named 'uuid' and marked with @Unique())
    const uuidColumn = Object.entries(meta.columns).find(([name, col]) => 
      name === 'uuid' || col.isUnique
    );
    if (!uuidColumn) throw new Error(`Entity ${meta.entityClassName} has no uuid column`);
    
    const uuidColumnName = uuidColumn[0];
    const uuidColumnMeta = uuidColumn[1];

    // Fetch the source record
    const sourceQuery = `SELECT * FROM "${table}" WHERE "${uuidColumnMeta.sqlName}" = $1`;
    const sourceResult = await this.db.query(sourceQuery, [sourceUuid]);
    if (sourceResult.rowCount === 0) {
      throw new NotFoundError(`Source record not found with UUID ${sourceUuid}`, {
        instance: `/api/v1/entities/${table}/${sourceUuid}/clone`,
      });
    }
    const sourceRecord = sourceResult.rows[0] as Record<string, unknown>;

    // Build the shadow copy excluding fields that should not be copied
    const clonedRecord: Record<string, unknown> = {};
    const newUuid = randomUUID();
    const now = new Date();

    for (const [propKey, colMeta] of Object.entries(meta.columns)) {
      const sqlName = colMeta.sqlName;
      
      // Skip excluded fields
      if (colMeta.isKey || colMeta.isUnique || colMeta.isClone) {
        continue;
      }

      // Handle auditable fields - reset to default
      if (colMeta.isAuditable) {
        switch (colMeta.auditableType) {
          case AuditableFieldType.CREATED_AT:
          case AuditableFieldType.UPDATED_AT:
            clonedRecord[sqlName] = now;
            continue;
          case AuditableFieldType.CREATED_BY:
          case AuditableFieldType.UPDATED_BY:
            clonedRecord[sqlName] = clonedBy;
            continue;
          case AuditableFieldType.VERSION:
            clonedRecord[sqlName] = 1;
            continue;
        }
      }

      // Handle deletable fields - reset to null
      if (colMeta.isDeletable) {
        clonedRecord[sqlName] = null;
        continue;
      }

      // Copy all other fields from source
      if (sourceRecord[sqlName] !== undefined) {
        clonedRecord[sqlName] = sourceRecord[sqlName];
      }
    }

    // Set the new UUID
    clonedRecord[uuidColumnMeta.sqlName] = newUuid;

    // Find the clone field and set it to source UUID
    const cloneField = Object.entries(meta.columns).find(([_, col]) => col.isClone);
    if (cloneField) {
      clonedRecord[cloneField[1].sqlName] = sourceUuid;
    }

    // Build and execute the INSERT
    const columns = Object.keys(clonedRecord);
    const values = Object.values(clonedRecord);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const columnNames = columns.map(c => `"${c}"`).join(', ');

    const insertSql = `INSERT INTO "${table}" (${columnNames}) VALUES (${placeholders}) RETURNING "${uuidColumnMeta.sqlName}"`;
    const insertResult = await this.db.query(insertSql, values);

    if (insertResult.rowCount === 0) {
      throw new Error(`Failed to clone record for ${table}`);
    }

    return insertResult.rows[0][uuidColumnMeta.sqlName] as string;
  }

  /**
   * Update a single entity by UUID.
   * Updates provided fields and increments version.
   * @param entity - Entity class
   * @param uuid - UUID of the record to update
   * @param updates - Partial record with fields to update
   * @param updatedBy - User/identifier performing the update
   * @throws Error if entity has no key column, no uuid column, or if no rows are affected
   */
  async update<TEntity extends object>(
    entity: EntityClass,
    uuid: string,
    updates: Partial<Record<keyof TEntity & string, unknown>>,
    updatedBy: string
  ): Promise<void> {
    const meta = getEntityPersistenceMeta(entity);
    const table = getTableName(entity);
    const isAuditable = meta.isAuditable;

    // Find the uuid column (usually named 'uuid' and marked with @Unique())
    const uuidColumn = Object.entries(meta.columns).find(([name, col]) =>
      name === 'uuid' || col.isUnique
    );
    if (!uuidColumn) throw new Error(`Entity ${meta.entityClassName} has no uuid column`);

    const uuidColumnMeta = uuidColumn[1];
    const pk = Object.values(meta.columns).find((c) => c.isKey);

    const updated_at = new Date();
    
    // Fetch old record for audit if auditable
    let oldRecord: Record<string, unknown> | null = null;
    if (isAuditable && this.auditService) {
      const oldQuery = `SELECT * FROM "${table}" WHERE "${uuidColumnMeta.sqlName}" = $1`;
      const oldResult = await this.db.query(oldQuery, [uuid]);
      if (oldResult.rowCount && oldResult.rowCount > 0) {
        oldRecord = oldResult.rows[0] as Record<string, unknown>;
      }
    }

    // Build SET clause
    const updateRec = updates as Record<string, unknown>;
    const setClauses: string[] = [];
    const values: unknown[] = [];
    
    // Add updated_at and updated_by
    setClauses.push(`updated_at = $${values.length + 1}`);
    values.push(updated_at);
    setClauses.push(`updated_by = $${values.length + 1}`);
    values.push(updatedBy);
    setClauses.push(`version = version + 1`);

    // Add user-provided updates
    for (const [key, value] of Object.entries(updateRec)) {
      if (value === undefined) continue;
      const sqlName = getColumnName(entity, key);
      if (!meta.columns[sqlName]) {
        throw new Error(`update: unknown column/property ${key}`);
      }
      setClauses.push(`"${sqlName}" = $${values.length + 1}`);
      values.push(value);
    }

    const sql = `UPDATE "${table}" SET ${setClauses.join(", ")} WHERE "${uuidColumnMeta.sqlName}" = $${values.length + 1} RETURNING "${pk?.sqlName}", version`;
    values.push(uuid);
    const result = await this.db.query(sql, values);

    if (result.rowCount === 0) {
      throw new NotFoundError(`No ${table} found with UUID ${uuid}`, {
        instance: `/api/v1/entities/${table}/${uuid}`,
      });
    }

    // Write audit record if entity is auditable
    if (isAuditable && this.auditService && oldRecord) {
      const updated = result.rows[0] as { [key: string]: unknown };
      const entityId = updated[pk!.sqlName] as bigint;
      const newVersion = updated.version as number;
      
      // Calculate delta; force include updated_at/updated_by so the audit trail
      // always carries the actor and timestamp even when unchanged across operations.
      const newRecord = { ...oldRecord, ...updateRec, updated_at, updated_by: updatedBy, version: newVersion };
      const delta = calculateDeltaWithForcedFields(oldRecord, newRecord, ['updated_at', 'updated_by']);

      // Write audit without await
      this.auditService.writeAudit(
        entity,
        entityId,
        uuid,
        AuditAction.UPDATE,
        updated_at,
        newVersion,
        delta
      ).catch((err) => console.error('[Audit Error]', err));
    }
  }

  /**
   * Hard delete (physical delete) a single entity by UUID.
   * Permanently removes the record from the database.
   * @param entity - Entity class
   * @param uuid - UUID of the record to delete
   * @param deletedBy - User/identifier performing the deletion
   * @throws Error if entity has no key column, no uuid column, or if no rows are affected
   */
  async hardDelete<TEntity extends object>(
    entity: EntityClass,
    uuid: string,
    deletedBy: string
  ): Promise<void> {
    const meta = getEntityPersistenceMeta(entity);
    const table = getTableName(entity);
    const isAuditable = meta.isAuditable;

    // Find the uuid column (usually named 'uuid' and marked with @Unique())
    const uuidColumn = Object.entries(meta.columns).find(([name, col]) =>
      name === 'uuid' || col.isUnique
    );
    if (!uuidColumn) throw new Error(`Entity ${meta.entityClassName} has no uuid column`);

    const uuidColumnMeta = uuidColumn[1];
    const pk = Object.values(meta.columns).find((c) => c.isKey);

    const deleted_at = new Date();
    
    // Fetch old record for audit if auditable
    let oldRecord: Record<string, unknown> | null = null;
    let entityId: bigint | null = null;
    if (isAuditable && this.auditService) {
      const oldQuery = `SELECT * FROM "${table}" WHERE "${uuidColumnMeta.sqlName}" = $1`;
      const oldResult = await this.db.query(oldQuery, [uuid]);
      if (oldResult.rowCount && oldResult.rowCount > 0) {
        oldRecord = oldResult.rows[0] as Record<string, unknown>;
        entityId = oldRecord[pk!.sqlName] as bigint;
      }
    }

    // Perform hard delete
    const sql = `DELETE FROM "${table}" WHERE "${uuidColumnMeta.sqlName}" = $1`;
    const result = await this.db.query(sql, [uuid]);

    if (result.rowCount === 0) {
      throw new NotFoundError(`No ${table} found with UUID ${uuid}`, {
        instance: `/api/v1/entities/${table}/${uuid}`,
      });
    }

    // Write audit record if entity is auditable
    if (isAuditable && this.auditService && oldRecord && entityId) {
      // Calculate delta (empty new, full old for hard delete)
      const delta = calculateDelta(oldRecord, {});

      // Write audit without await
      this.auditService.writeAudit(
        entity,
        entityId,
        uuid,
        AuditAction.HARD_DELETE,
        deleted_at,
        (oldRecord.version as number) + 1,
        delta
      ).catch((err) => console.error('[Audit Error]', err));
    }
  }
}

