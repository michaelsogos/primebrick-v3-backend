/**
 * CustomersService — business logic for the `customer` entity.
 *
 * Owns the list / get / create / update / delete / restore / duplicate /
 * audit / export flows. The service is request-context-free: it takes plain
 * parameters and reads the actor from ALS (`requireActor()`) via the DAL.
 * It never touches `req`/`res` — except that `exportCustomers` returns an
 * async generator + an `ExportConfig` so the controller can stream the
 * response (streaming to `res` is inherently an HTTP concern).
 *
 * Errors are thrown as `ApiError` subclasses so the centralized `errorHandler`
 * can convert them to RFC 7807 JSON.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Pool } from "pg";

import { CustomersDal } from "./customers_dal.js";
import type {
  CustomerCreateBody,
  CustomerUpdateBody,
  CustomerListQuery,
  CustomerExportQuery,
} from "./dto.js";
import { CUSTOMER_DEFAULT_SORT } from "./list-config.js";
import { exportDataWithTemplateToStream } from "../../lib/export/index.js";
import type { ExportConfig } from "../../lib/export/types.js";
import { getPool } from "../../db/pool.js";
import {
  ApiError,
  NotFoundError,
  ValidationError,
} from "../../http/api-errors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Resolve the effective sort key/direction from the query, falling back to the
 * customer default sort. Pure function, no I/O.
 */
function resolveSort(
  sortKey: string | null | undefined,
  sortDir: "asc" | "desc" | undefined,
): { sort_key: string; sort_dir: "asc" | "desc" } {
  const eff_sort_key = (sortKey ?? CUSTOMER_DEFAULT_SORT.key ?? "uuid") as string;
  const eff_sort_dir =
    sortDir === "asc" || sortDir === "desc"
      ? sortDir
      : sortKey
        ? "asc"
        : CUSTOMER_DEFAULT_SORT.dir ?? "asc";
  return { sort_key: eff_sort_key, sort_dir: eff_sort_dir };
}

export class CustomersService {
  private dal: CustomersDal | null = null;

  private getDal(): CustomersDal {
    if (this.dal) return this.dal;
    const pool = getPool();
    this.dal = new CustomersDal(pool);
    return this.dal;
  }

  // --- List -----------------------------------------------------------------

  async listCustomers(query: CustomerListQuery) {
    // Debug toggles (preserved from the original handler).
    if (process.env.PB_CUSTOMERS_FORCE_EMPTY === "1") {
      const p = Math.max(1, query.page ? Number(query.page) : 1);
      const ps = Math.min(100, Math.max(1, query.page_size ? Number(query.page_size) : 25));
      return { rows: [], page: p, page_size: ps, total: 0n };
    }
    if (process.env.PB_CUSTOMERS_FORCE_ERROR === "1") {
      throw new ApiError(
        "/errors/list-failed",
        "List failed",
        500,
        "An unexpected error occurred while fetching customer list",
        { severity: "HIGH" },
      );
    }

    const { sort_key, sort_dir } = resolveSort(query.sort_key, query.sort_dir);
    return this.getDal().listCustomers({
      search: query.search,
      search_in: query.search_in ?? undefined,
      status: query.status,
      filters: query.filters,
      connector: query.connector,
      sort_key,
      sort_dir,
      page: query.page ?? undefined,
      page_size: query.page_size ?? undefined,
      deleted_records: query.deleted_records,
    });
  }

  // --- Single record --------------------------------------------------------

  async getCustomer(uuid: string) {
    const found = await this.getDal().getByUuid(uuid);
    if (!found) {
      throw new NotFoundError("The requested customer could not be found", {
        internal_code: "CUSTOMER_NOT_FOUND",
      });
    }
    return found;
  }

  // --- Create / Update / Delete / Restore -----------------------------------

  async createCustomer(body: CustomerCreateBody) {
    return this.getDal().createCustomer(body);
  }

  async updateCustomer(uuid: string, body: CustomerUpdateBody) {
    await this.getDal().updateCustomer(uuid, body);
  }

  async deleteCustomer(uuid: string) {
    await this.getDal().deleteCustomer(uuid);
  }

  async restoreCustomer(uuid: string) {
    await this.getDal().restoreCustomer(uuid);
  }

  // --- Duplicate (bulk) -----------------------------------------------------

  async duplicateCustomers(uuids: string[]) {
    const result = await this.getDal().duplicateCustomers(uuids);
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
    return this.getDal().getCustomerAudit(uuid, page, limit);
  }

  // --- Export ---------------------------------------------------------------

  /**
   * Stream an export to the provided Express response. This is the one method
   * that touches `res` — streaming a file download is inherently an HTTP
   * concern and awkward to abstract. The controller passes its `res` in.
   */
  async exportCustomers(
    query: CustomerExportQuery,
    res: import("express").Response,
  ): Promise<void> {
    const { sort_key, sort_dir } = resolveSort(query.sort_key, query.sort_dir);

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

    const dataStream = this.getDal().streamAllCustomers({
      search: query.search,
      search_in: query.search_in ?? undefined,
      status: query.status,
      filters: query.filters,
      connector: query.connector,
      sort_key,
      sort_dir,
      deleted_records: query.deleted_records,
    });

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
      data: dataStream,
    };

    const templatePath =
      file_type === "html"
        ? path.join(__dirname, "../../../templates/customer_export_template.html")
        : path.join(__dirname, "../../../templates/customer_export_template.xlsx");

    await exportDataWithTemplateToStream(templatePath, res, file_type, config);
  }
}
