/**
 * customers.router — thin controller for the `customer` entity.
 *
 * Standard entity CRUD via `makeEntityRouter` — mandatory chain (permission,
 * uuid/body/query validation, translations permission, version query,
 * runEntityWrite tx) is non-overridable. This entity enables the full
 * optional feature set: export, duplicate, bulk delete/restore.
 *
 *   GET    /api/v1/entities/customer/meta            → entity metadata
 *   GET    /api/v1/entities/customer/list            → paginated list
 *   GET    /api/v1/entities/customer/export          → streamed export (csv/xlsx/html)
 *   POST   /api/v1/entities/customer                 → create
 *   POST   /api/v1/entities/customer/duplicate       → bulk duplicate
 *   GET    /api/v1/entities/customer/:uuid           → single record
 *   PUT    /api/v1/entities/customer/:uuid           → update
 *   DELETE /api/v1/entities/customer/:uuid           → soft delete
 *   POST   /api/v1/entities/customer/:uuid/restore   → restore soft-deleted
 *   POST   /api/v1/entities/customer/bulk-delete     → bulk soft delete
 *   POST   /api/v1/entities/customer/bulk-restore    → bulk restore
 *   GET    /api/v1/entities/customer/:uuid/audit     → audit history
 */

import { Permission } from "@primebrick/sdk";

import { makeEntityRouter } from "../../http/entity-router.js";
import { entityWriteBody } from "../../http/entity-write.js";
import {
  CustomerCreateBodySchema,
  CustomerUpdateBodySchema,
  CustomerListQuerySchema,
  CustomerExportQuerySchema,
  CustomerDuplicateBodySchema,
  CustomerAuditQuerySchema,
} from "../../modules/customers/dto.js";
import { customerMeta } from "../../modules/customers/customers.meta.js";
import { CustomerEntity } from "../../modules/customers/customer_entity.js";
import { CustomersService } from "../../modules/customers/customers.service.js";

// Write-payload standard: `{entity, translations?}` (src/http/entity-write.ts)
const CustomerCreateWriteSchema = entityWriteBody(CustomerCreateBodySchema);
const CustomerUpdateWriteSchema = entityWriteBody(CustomerUpdateBodySchema);

export function customersRouter() {
  const service = new CustomersService();

  return makeEntityRouter({
    entityName: "customer",
    entity: CustomerEntity,
    meta: customerMeta,
    service,
    permissions: {
      meta: [Permission.CUSTOMER_READ_ALL, Permission.CUSTOMER_READ_SINGLE],
      list: [Permission.CUSTOMER_READ_ALL],
      export: [Permission.CUSTOMER_EXPORT],
      create: [Permission.CUSTOMER_CREATE_SINGLE],
      duplicate: [Permission.CUSTOMER_DUPLICATE_BULK],
      bulkDelete: [Permission.CUSTOMER_DELETE_BULK],
      bulkRestore: [Permission.CUSTOMER_RESTORE_BULK],
      get: [Permission.CUSTOMER_READ_SINGLE],
      update: [Permission.CUSTOMER_UPDATE_SINGLE],
      delete: [Permission.CUSTOMER_DELETE_SINGLE],
      restore: [Permission.CUSTOMER_RESTORE_SINGLE],
      audit: [Permission.CUSTOMER_READ_AUDIT],
    },
    schemas: {
      listQuery: CustomerListQuerySchema,
      exportQuery: CustomerExportQuerySchema,
      createBody: CustomerCreateWriteSchema,
      updateBody: CustomerUpdateWriteSchema,
      duplicateBody: CustomerDuplicateBodySchema,
      auditQuery: CustomerAuditQuerySchema,
    },
    // E.7: meta-driven export pipeline — fieldMapping/labels/field types are
    // derived from `customerMeta` + `system.entities.customer.fields.*`
    // translations; rows stream through `service.stream` (same filter builder
    // as list). Templates resolve by convention: customer_export_template.*.
    export: {},
    methods: {
      list: "listCustomers",
      get: "getCustomer",
      create: "createCustomer",
      update: "updateCustomer",
      delete: "deleteCustomer",
      restore: "restoreCustomer",
      bulkDelete: "bulkDeleteCustomers",
      bulkRestore: "bulkRestoreCustomers",
      duplicate: "duplicateCustomers",
      audit: "getCustomerAudit",
    },
  });
}
