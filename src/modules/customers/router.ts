import { Router } from "express";
import { getPool } from "../../db/pool.js";
import { CustomersDal } from "./customers_dal.js";
import { validateBody, validateQuery } from "../../http/validation.js";
import { asyncHandler } from "../../http/async-handler.js";
import { isDatabaseUnavailableError } from "../../http/api-errors.js";
import {
  CustomerCreateBodySchema,
  CustomerListQuerySchema,
  CustomerExportQuerySchema,
  UuidParamSchema,
} from "./dto.js";
import { z } from "zod";
import {
  CUSTOMER_AUDITING_COLUMNS,
  CUSTOMER_DATA_COLUMNS,
  CUSTOMER_DEFAULT_SORT,
  CUSTOMER_DEFAULT_VIEW,
  CUSTOMER_DEFAULT_VIEW_VISIBILITY,
  CUSTOMER_LIST_COLUMNS,
  CUSTOMER_STICKY_COLUMNS,
} from "./list-config.js";
import { exportDataWithTemplateToStream } from "../../lib/export/index.js";
import type { ExportConfig } from "../../lib/export/types.js";

export function customersRouter() {
  const router = Router();
  let dal: CustomersDal | null = null;
  const getDal = () => {
    if (dal) return dal;
    dal = new CustomersDal(getPool());
    return dal;
  };

  const defaultSort = CUSTOMER_DEFAULT_SORT;

  router.get("/api/v1/entities/customer/meta", (_req, res) => {
    res.json({
      entity: "customer",
      titleKey: "entities.customer.title",
      uid: "uuid",
      defaultView: CUSTOMER_DEFAULT_VIEW,
      list: {
        searchPlaceholderKey: "entities.list.searchPlaceholder",
        defaultPageSize: 25,
        pageSizeOptions: [10, 25, 50, 100],
        columns: CUSTOMER_LIST_COLUMNS,
        stickyColumns: CUSTOMER_STICKY_COLUMNS,
        auditingColumns: CUSTOMER_AUDITING_COLUMNS,
        defaultSort,
        viewVisibility: CUSTOMER_DEFAULT_VIEW_VISIBILITY,
      },
    });
  });

  router.get(
    "/api/v1/entities/customer/list",
    validateQuery(CustomerListQuerySchema),
    asyncHandler(async (req, res) => {
      const { search, search_in, status, sort_key, sort_dir, page, page_size, filters, connector, deleted_records } =
        req.query as unknown as import("./dto.js").CustomerListQuery;
      const eff_sort_key = (sort_key ?? defaultSort.key ?? "uuid") as NonNullable<typeof sort_key> | "uuid";
      const eff_sort_dir =
        sort_dir === "asc" || sort_dir === "desc"
          ? sort_dir
          : sort_key
            ? "asc"
            : defaultSort.dir ?? "asc";

      if (process.env.PB_CUSTOMERS_FORCE_EMPTY === "1") {
        const p = Math.max(1, page ? Number(page) : 1);
        const ps = Math.min(100, Math.max(1, page_size ? Number(page_size) : 25));
        res.json({ rows: [], page: p, page_size: ps, total: 0 });
        return;
      }

      if (process.env.PB_CUSTOMERS_FORCE_ERROR === "1") {
        res.status(500).json({
          type: '/errors/list-failed',
          title: 'List failed',
          status: 500,
          detail: 'An unexpected error occurred while fetching customer list',
        });
        return;
      }

      try {
        const result = await getDal().listCustomers({
          search,
          search_in: search_in ?? undefined,
          status,
          filters,
          connector,
          sort_key: eff_sort_key,
          sort_dir: eff_sort_dir,
          page: page ?? undefined,
          page_size: page_size ?? undefined,
          deleted_records,
        });
        res.json(result);
      } catch (e) {
        // Standard: list/get-paginated failures are 500 with a stable code,
        // but when we can specialize (e.g. DB down) we forward the original error
        // so the global handler can emit DATABASE_UNAVAILABLE + CRITICAL.
        if (isDatabaseUnavailableError(e)) throw e;
        res.status(500).json({
          type: '/errors/list-failed',
          title: 'List failed',
          status: 500,
          detail: 'An unexpected error occurred while fetching customer list',
        });
        return;
      }
    })
  );

  router.get(
    "/api/v1/entities/customer/export",
    validateQuery(CustomerExportQuerySchema),
    asyncHandler(async (req, res) => {
      const { search, search_in, status, sort_key, sort_dir, filters, connector, deleted_records, file_type, locale, timezone } =
        req.query as unknown as import("./dto.js").CustomerExportQuery;
      
      const eff_sort_key = (sort_key ?? defaultSort.key ?? "uuid") as NonNullable<typeof sort_key> | "uuid";
      const eff_sort_dir =
        sort_dir === "asc" || sort_dir === "desc"
          ? sort_dir
          : sort_key
            ? "asc"
            : defaultSort.dir ?? "asc";

      // Set response headers
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `customers-export-${timestamp}.${file_type}`;
      const contentType = file_type === 'xlsx' 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv';
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      try {
        // Get data stream from DAL
        const dataStream = getDal().streamAllCustomers({
          search,
          search_in: search_in ?? undefined,
          status,
          filters,
          connector,
          sort_key: eff_sort_key,
          sort_dir: eff_sort_dir,
          deleted_records,
        });

        // Prepare export configuration
        const config: ExportConfig = {
          locale: locale || 'en-GB',
          defaultTimezone: timezone || 'Europe/Rome',
          entity: {
            singular: 'Customer',
            plural: 'Customers'
          },
          translations: {
            'col_uuid': 'UUID',
            'col_code': 'Code',
            'col_first_name': 'First Name',
            'col_last_name': 'Last Name',
            'col_company_name': 'Company Name',
            'col_email': 'Email',
            'col_phone': 'Phone',
            'col_status': 'Status',
            'col_status_reason': 'Status Reason',
            'col_local_address': 'Address',
            'col_local_city': 'City',
            'col_local_state': 'State',
            'col_local_country': 'Country',
            'col_local_zip': 'ZIP',
            'col_onboarding_at': 'Onboarding Date',
            'col_created_at': 'Created At',
            'col_updated_at': 'Updated At',
          },
          fieldMapping: {
            'uuid': 'uuid',
            'code': 'code',
            'first_name': 'first_name',
            'last_name': 'last_name',
            'company_name': 'company_name',
            'email': 'email',
            'phone': 'phone',
            'status': 'status',
            'status_reason': 'status_reason',
            'local_address': 'local_address',
            'local_city': 'local_city',
            'local_state': 'local_state',
            'local_country': 'local_country',
            'local_zip': 'local_zip',
            'onboarding_at': 'onboarding_at',
            'created_at': 'created_at',
            'updated_at': 'updated_at',
          },
          metadata: {
            fields: {
              uuid: { type: 'string' },
              code: { type: 'string' },
              first_name: { type: 'string' },
              last_name: { type: 'string' },
              company_name: { type: 'string' },
              email: { type: 'string' },
              phone: { type: 'string' },
              status: { type: 'string' },
              status_reason: { type: 'string' },
              local_address: { type: 'string' },
              local_city: { type: 'string' },
              local_state: { type: 'string' },
              local_country: { type: 'string' },
              local_zip: { type: 'string' },
              onboarding_at: { 
                type: 'date',
                timezoneField: 'onboarding_time_zone'
              },
              created_at: { type: 'datetime', precision: 'seconds' },
              updated_at: { type: 'datetime', precision: 'seconds' },
            }
          },
          data: dataStream,
        };

        // Path to template file (this should be configured properly)
        const templatePath = './templates/customer_export_template.xlsx';
        
        // Stream the export to the response
        await exportDataWithTemplateToStream(
          templatePath,
          res,
          file_type,
          config
        );

      } catch (e) {
        if (isDatabaseUnavailableError(e)) throw e;
        res.status(500).json({
          type: '/errors/export-failed',
          title: 'Export failed',
          status: 500,
          detail: 'An unexpected error occurred during export',
          internal_code: 'EXPORT_FAILED',
          instance: `/api/v1/entities/customer/export`,
        });
        return;
      }
    })
  );

  router.post(
    "/api/v1/entities/customer",
    validateBody(CustomerCreateBodySchema),
    asyncHandler(async (req, res) => {
      const body = req.body as unknown as import("./dto.js").CustomerCreateBody;
      const created = await getDal().createCustomer(body);
      res.status(201).json(created);
    })
  );

  router.get(
    "/api/v1/entities/customer/:uuid",
    (req, res, next) => {
      const r = UuidParamSchema.safeParse(req.params);
      if (!r.success) {
        res.status(400).json({
          type: '/errors/validation-error',
          title: 'Validation error',
          status: 400,
          detail: 'Request validation failed',
          issues: r.error.issues.map((i) => ({
            path: i.path.join("."),
            code: i.code,
            message: i.message,
          })),
        });
        return;
      }
      (req as any).params = r.data;
      next();
    },
    asyncHandler(async (req, res) => {
      const { uuid } = req.params as unknown as z.infer<typeof UuidParamSchema>;
      const found = await getDal().getByUuid(uuid);
      if (!found) {
        res.status(404).json({
          type: '/errors/not-found',
          title: 'Customer not found',
          status: 404,
          detail: 'The requested customer could not be found',
        });
        return;
      }
      res.json(found);
    })
  );

  router.delete(
    "/api/v1/entities/customer/:uuid",
    (req, res, next) => {
      const r = UuidParamSchema.safeParse(req.params);
      if (!r.success) {
        res.status(400).json({
          type: '/errors/validation-error',
          title: 'Validation error',
          status: 400,
          detail: 'Request validation failed',
          issues: r.error.issues.map((i) => ({
            path: i.path.join("."),
            code: i.code,
            message: i.message,
          })),
        });
        return;
      }
      (req as any).params = r.data;
      next();
    },
    asyncHandler(async (req, res) => {
      const { uuid } = req.params as unknown as z.infer<typeof UuidParamSchema>;
      const deletedBy = (req as any).user?.id || "system";
      await getDal().deleteCustomer(uuid, deletedBy);
      res.status(204).send();
    })
  );

  return router;
}

