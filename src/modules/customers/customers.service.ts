/**
 * CustomersService — thin facade over `makeEntityService` (Part E pilot).
 *
 * All core CRUD (list/get/create/update/delete/restore/purge, bulk ops,
 * audit, stream) is provided by the generic entity service configured below — there
 * is no per-entity DAL anymore. This facade only keeps:
 *   - the legacy method names consumed by `customers.router` (`methods` map)
 *     and the MCP dispatch layer;
 *   - `stream()` passthrough for the router-owned export pipeline
 *     (`streamEntityExport` in `entity-export.ts`) — Part E.7;
 *   - the duplicate partial-failure error mapping.
 *
 * NEVER reintroduce a hand-written CustomersDal: per-entity variation belongs
 * in the config object, not in copied code.
 */

import type { PoolClient } from "pg";

import { Filter, field } from "@primebrick/dal-pg";

import { makeEntityService, type EntityService } from "../../http/entity-service.js";
import { CustomerEntity } from "./customer_entity.js";
import type {
  CustomerCreateBody,
  CustomerUpdateBody,
  CustomerListQuery,
  CustomerDetailDto,
} from "./dto.js";
import {
  CUSTOMER_DEFAULT_SORT,
  CUSTOMER_SEARCHABLE_KEYS,
  CUSTOMER_FILTERABLE_KEYS,
} from "./list-config.js";
import { ApiError } from "../../http/api-errors.js";

export class CustomersService {
  private svc: EntityService<CustomerDetailDto>;

  constructor() {
    this.svc = makeEntityService<CustomerDetailDto>({
      entity: CustomerEntity,
      debugCode: "CUSTOMERS", // PB_CUSTOMERS_FORCE_EMPTY / PB_CUSTOMERS_FORCE_ERROR
      list: {
        searchableKeys: CUSTOMER_SEARCHABLE_KEYS,
        filterableKeys: new Set(CUSTOMER_FILTERABLE_KEYS),
        defaultSort: CUSTOMER_DEFAULT_SORT,
        // Entity-specific shortcut param: ?status=ACTIVE|...
        extraFilters: (q) =>
          q.status
            ? [Filter.group([Filter.fieldValue(field(CustomerEntity, "status"), "=", q.status)], "AND")]
            : [],
      },
    });
  }

  // --- List / get -----------------------------------------------------------

  async listCustomers(query: CustomerListQuery) {
    return this.svc.list(query);
  }

  async getCustomer(uuid: string) {
    return this.svc.get(uuid);
  }

  // --- Create / update / delete / restore ----------------------------------

  async createCustomer(body: CustomerCreateBody, tx?: PoolClient) {
    return this.svc.create(body as unknown as Record<string, unknown>, tx);
  }

  async updateCustomer(uuid: string, body: CustomerUpdateBody, tx?: PoolClient) {
    return this.svc.update(uuid, body as unknown as Record<string, unknown> & { version: number }, tx);
  }

  async deleteCustomer(uuid: string, version: number) {
    return this.svc.delete(uuid, version);
  }

  async restoreCustomer(uuid: string, version: number) {
    return this.svc.restore(uuid, version);
  }

  async bulkDeleteCustomers(items: Array<{ uuid: string; version: number }>) {
    return this.svc.bulkDelete(items);
  }

  async bulkRestoreCustomers(items: Array<{ uuid: string; version: number }>) {
    return this.svc.bulkRestore(items);
  }

  // --- Duplicate ------------------------------------------------------------

  async duplicateCustomers(uuids: string[]) {
    const result = await this.svc.duplicate(uuids);
    if (result.errors.length > 0) {
      throw new ApiError(
        "/errors/duplicate-partial-failure",
        "Record duplication partially failed",
        500,
        `${result.errors.length} of ${uuids.length} records could not be duplicated`,
        {
          instance: "/api/v1/entities/customer/duplicate",
          internal_code: "DUPLICATE_PARTIAL_FAILURE",
          extra: {
            issues: {
              successful: result.uuids,
              failed: result.errors,
            },
          },
        },
      );
    }
    return result;
  }

  // --- Audit ----------------------------------------------------------------

  async getCustomerAudit(uuid: string, page: number, limit: number) {
    return this.svc.audit(uuid, page, limit);
  }

  // --- Export (Part E.7) -----------------------------------------------------

  /** Row stream consumed by the router-owned `streamEntityExport` pipeline.
   *  Same filter builder as `list` — no duplicated query logic. */
  stream(query: CustomerListQuery) {
    return this.svc.stream(query);
  }
}
