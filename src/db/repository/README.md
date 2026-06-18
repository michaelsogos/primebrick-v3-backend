# Auditable Entity Joins

## Overview

Entities implementing `IAuditableEntity` have audit fields (created_by, updated_by, deleted_by) that store user UUIDs. To display human-readable names, these fields should be joined with the `user_profiles` table.

## Standard Usage

### Automatic Joins

For simple cases, use the `buildAuditableJoins` helper:

```typescript
import { buildAuditableJoins } from "../../db/repository/auditable-joins.js";

const result = await repo.findByPage(
  MyEntity,
  page,
  page_size,
  null,
  {
    joins: buildAuditableJoins(MyEntity)
  }
);
```

### Selective Joins

If you only need specific joins (e.g., only creator):

```typescript
import { buildAuditableJoinsSelective } from "../../db/repository/auditable-joins.js";

const result = await repo.findByPage(
  MyEntity,
  page,
  page_size,
  null,
  {
    joins: buildAuditableJoinsSelective(MyEntity, {
      includeCreator: true,
      includeUpdater: false,
      includeDeleter: false
    })
  }
);
```

### Type Safety

Use the `WithAuditableDisplayNames` type helper:

```typescript
import { WithAuditableDisplayNames } from "../../db/repository/auditable-types.ts";

export type MyEntityRow = WithAuditableDisplayNames<{
  uuid: string;
  created_by: string;
  updated_by: string;
  // ... other fields
}>;
```

## Guardrail Pattern

The join uses a regex pattern to ensure we only join when the field contains a valid UUID.

**For main entity tables** (created_by, updated_by, deleted_by):
```sql
LEFT JOIN public.user_profiles creator
  ON entity.created_by ~ '^[0-9a-fA-F-]{36}$'
 AND creator.uuid::text = entity.created_by
```

**For audit tables** (changed_by):
```sql
LEFT JOIN public.user_profiles creator
  ON audit.changed_by ~ '^[0-9a-fA-F-]{36}$'
 AND creator.uuid::text = audit.changed_by
```

This prevents errors when the field contains non-UUID values like "system".

## Audit Trail Queries

For audit trail queries, use the helper functions:

```typescript
import { getAuditUserJoinSql, getAuditSelectWithDisplayName } from "../../db/repository/audit-join-helper.js";

const query = `
  SELECT ${getAuditSelectWithDisplayName()}
  FROM public.my_entity_audit audit
  ${getAuditUserJoinSql()}
  WHERE audit.entity_uuid = $1
  ORDER BY audit.changed_at DESC
`;
```

## Automatic Join Option

You can also use the `includeAuditableJoins` option in `FindOptions` to automatically add auditable joins:

```typescript
const result = await repo.findByPage(
  MyEntity,
  page,
  page_size,
  null,
  {
    includeAuditableJoins: true
  }
);
```

This is useful when you want to avoid manually specifying joins for every query.

## Implementation Details

### Files

- `auditable-joins.ts` - Helper functions for building auditable joins
- `auditable-types.ts` - TypeScript type helpers for auditable entities
- `audit-join-helper.ts` - Helper functions for audit trail queries
- `query-builder.ts` - Updated to support automatic auditable joins
- `types.ts` - Updated with `includeAuditableJoins` option

### Field Mapping

The query-builder automatically maps join aliases to display name fields:

- `creator` alias → `created_by_name` field
- `updater` alias → `updated_by_name` field
- `deleter` alias → `deleted_by_name` field

### Audit Table Differences

**Main entity tables** have three separate fields:
- `created_by` - UUID of user who created the record
- `updated_by` - UUID of user who last updated the record
- `deleted_by` - UUID of user who deleted the record (nullable)

**Audit tables** have a single field:
- `changed_by` - UUID of user who made the change (or "system" for automated changes)

This is why audit queries use different helper functions.

## Examples

### Complete Example: Customer List

```typescript
import { buildAuditableJoins } from "../../db/repository/auditable-joins.js";
import { WithAuditableDisplayNames } from "../../db/repository/auditable-types.js";

export type CustomerDetailRow = WithAuditableDisplayNames<{
  uuid: string;
  code: string;
  created_by: string;
  updated_by: string;
  deleted_by?: string;
  // ... other fields
}>;

async listCustomers(query: CustomerListQuery) {
  const result = await this.repo.findByPage<CustomerDetailRow, CustomerDetailRow>(
    CustomerEntity,
    query.page,
    query.page_size,
    null,
    {
      filters: baseFilters,
      sorting,
      deletedRecords: query.deleted_records,
      joins: buildAuditableJoins(CustomerEntity)
    }
  );

  return {
    rows: result.entities.map((r) => this.toDto(r)),
    page: query.page,
    page_size: query.page_size,
    total: result.total_records,
  };
}
```

### Complete Example: Audit Trail

```typescript
import { getAuditUserJoinSql, getAuditSelectWithDisplayName } from "../../db/repository/audit-join-helper.js";

async getCustomerAudit(uuid: string, page: number, limit: number) {
  const offset = (page - 1) * limit;

  const query = `
    SELECT ${getAuditSelectWithDisplayName()}
    FROM public.customers_audit audit
    ${getAuditUserJoinSql()}
    WHERE audit.entity_uuid = $1
    ORDER BY audit.changed_at DESC, audit.id DESC
    LIMIT $2 OFFSET $3
  `;

  const result = await this.pool.query(query, [uuid, limit, offset]);

  return {
    data: result.rows.map((row: any) => ({
      id: row.id.toString(),
      entity_uuid: row.entity_uuid,
      action: row.action,
      changed_at: entityDateToApiIso(row.changed_at),
      changed_by: row.changed_by,
      changed_by_display_name: row.changed_by_display_name,
      changed_by_idp_code: row.changed_by_idp_code,
      version: row.version,
      delta: row.delta,
    })),
    pagination: {
      page,
      limit,
      total,
      hasMore: offset + limit < total,
    },
  };
}
```

## Migration Guide

If you have existing code with manual joins, migrate to the centralized helpers:

**Before:**
```typescript
joins: [
  Join.on(
    field(UserProfileEntity, "uuid"),
    field(CustomerEntity, "created_by"),
    "LEFT",
    { castRightTo: "text", castLeftTo: "text", alias: "creator" }
  ),
  Join.on(
    field(UserProfileEntity, "uuid"),
    field(CustomerEntity, "updated_by"),
    "LEFT",
    { castRightTo: "text", castLeftTo: "text", alias: "updater" }
  ),
  Join.on(
    field(UserProfileEntity, "uuid"),
    field(CustomerEntity, "deleted_by"),
    "LEFT",
    { castRightTo: "text", castLeftTo: "text", alias: "deleter" }
  ),
],
```

**After:**
```typescript
import { buildAuditableJoins } from "../../db/repository/auditable-joins.js";

joins: buildAuditableJoins(CustomerEntity),
```

## Notes

- The regex pattern `^[0-9a-fA-F-]{36}$` is the standard UUID v4 format
- The cast to `text` is necessary because PostgreSQL doesn't allow direct UUID = text comparison
- The LEFT JOIN ensures that records with non-UUID values (like "system") are still returned
- The alias mapping (creator -> created_by_name) is handled by the query-builder
