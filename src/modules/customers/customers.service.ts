/**
 * CustomersService — thin facade over `makeEntityService` (Part E pilot).
 *
 * All core CRUD (list/get/create/update/delete/restore/purge, bulk ops,
 * audit, stream) is provided by the generic entity service configured below — there
 * is no per-entity DAL anymore. This facade only keeps:
 *   - the legacy method names consumed by `customers.router` (`methods` map)
 *     and the MCP dispatch layer;
 *   - the export flow (template + fieldMapping + streaming to `res`), which
 *     feeds on the generic `stream()` — no duplicated filter logic;
 *   - the duplicate partial-failure error mapping.
 *
 * NEVER reintroduce a hand-written CustomersDal: per-entity variation belongs
 * in the config object, not in copied code.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import type { PoolClient } from "pg";

import { Filter, field } from "@primebrick/dal-pg";

import { makeEntityService, type EntityService } from "../../http/entity-service.js";
import { CustomerEntity } from "./customer_entity.js";
import type {
  CustomerCreateBody,
  CustomerUpdateBody,
  CustomerListQuery,
  CustomerExportQuery,
  CustomerDetailDto,
} from "./dto.js";
import {
  CUSTOMER_DEFAULT_SORT,
  CUSTOMER_SEARCHABLE_KEYS,
  CUSTOMER_FILTERABLE_KEYS,
} from "./list-config.js";
import { exportDataWithTemplateToStream } from "../../lib/export/index.js";
import type { ExportConfig } from "../../lib/export/types.js";
import { ApiError } from "../../http/api-errors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  // --- Export ---------------------------------------------------------------

  /**
   * Stream an export to the provided Express response. Rows come from the
   * generic `stream()` — the SAME filter builder as `list` (no third copy).
   * This is the one method that touches `res` — streaming a file download is
   * inherently an HTTP concern; a future iteration can lift the headers +
   * template piping into the router itself (see plan Part E.4).
   */
  async exportCustomers(
    query: CustomerExportQuery,
    res: import("express").Response,
  ): Promise<void> {
    const { file_type, locale, timezone } = query;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `customers-export-${timestamp}.${file_type}`;
    const contentType =
      file_type === "xlsx"
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : file_type === "html"
          ? "text/html"
          : "text/csv";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    const config: ExportConfig = {
      locale: locale || "en-GB",
      defaultTimezone: timezone || "Europe/Rome",
      entity: {
        singular: "Customer",
        plural: "Customers",
      },
      translations: {
        col_uuid: "UUID",
        col_code: "Code",
        col_first_name: "First Name",
        col_last_name: "Last Name",
        col_company_name: "Company Name",
        col_email: "Email",
        col_phone: "Phone",
        col_status: "Status",
        col_status_reason: "Status Reason",
        col_local_address: "Address",
        col_local_city: "City",
        col_local_state: "State",
        col_local_country: "Country",
        col_local_zip: "ZIP",
        col_onboarding_at: "Onboarding Date",
        col_created_at: "Created At",
        col_updated_at: "Updated At",
      },
      fieldMapping: {
        uuid: "uuid",
        code: "code",
        first_name: "first_name",
        last_name: "last_name",
        company_name: "company_name",
        email: "email",
        phone: "phone",
        status: "status",
        status_reason: "status_reason",
        local_address: "local_address",
        local_city: "local_city",
        local_state: "local_state",
        local_country: "local_country",
        local_zip: "local_zip",
        onboarding_at: "onboarding_at",
        created_at: "created_at",
        updated_at: "updated_at",
      },
      metadata: {
        fields: {
          uuid: { type: "string" },
          code: { type: "string" },
          first_name: { type: "string" },
          last_name: { type: "string" },
          company_name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          status: { type: "string" },
          status_reason: { type: "string" },
          local_address: { type: "string" },
          local_city: { type: "string" },
          local_state: { type: "string" },
          local_country: { type: "string" },
          local_zip: { type: "string" },
          onboarding_at: {
            type: "date",
            timezoneField: "onboarding_time_zone",
          },
          created_at: { type: "datetime", precision: "seconds" },
          updated_at: { type: "datetime", precision: "seconds" },
        },
      },
      data: this.svc.stream(query),
    };

    const templatePath =
      file_type === "html"
        ? path.join(__dirname, "../../../templates/customer_export_template.html")
        : path.join(__dirname, "../../../templates/customer_export_template.xlsx");

    await exportDataWithTemplateToStream(templatePath, res, file_type, config);
  }
}
