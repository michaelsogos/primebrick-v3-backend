import { Router } from "express";
import { getPool } from "../../db/pool.js";
import { CustomersDal } from "./customers_dal.js";
import { validateBody, validateQuery } from "../../http/validation.js";
import { asyncHandler } from "../../http/async-handler.js";
import { isDatabaseUnavailableError } from "../../http/api-errors.js";
import { CustomerCreateBodySchema, CustomerListQuerySchema, UuidParamSchema } from "./dto.js";
import { z } from "zod";
import { CUSTOMER_DEFAULT_SORT, CUSTOMER_LIST_COLUMNS } from "./list-config.js";

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
      /** Column key used to identify a list row in the UI (uuid today; may change). */
      uid: "uuid",
      list: {
        searchPlaceholderKey: "entities.list.searchPlaceholder",
        defaultPageSize: 25,
        pageSizeOptions: [10, 25, 50, 100],
        columns: CUSTOMER_LIST_COLUMNS,
        defaultSort,
        filters: [
          { key: "status", labelKey: "entities.customer.fields.status", type: "enum", options: ["ACTIVE", "INACTIVE"] },
        ],
      },
    });
  });

  router.get(
    "/api/v1/entities/customer/list",
    validateQuery(CustomerListQuerySchema),
    asyncHandler(async (req, res) => {
      const { search, search_in, status, sort_key, sort_dir, page, page_size } =
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
        res.status(503).json({ error: "LIST_FAILED", impact: "HIGH" });
        return;
      }

      try {
        const result = await getDal().listCustomers({
          search,
          search_in: search_in ?? undefined,
          status,
          sort_key: eff_sort_key,
          sort_dir: eff_sort_dir,
          page: page ?? undefined,
          page_size: page_size ?? undefined,
        });
        res.json(result);
      } catch (e) {
        // Standard: list/get-paginated failures are 503 (>=501) with a stable code,
        // but when we can specialize (e.g. DB down) we forward the original error
        // so the global handler can emit DATABASE_UNAVAILABLE + CRITICAL.
        if (isDatabaseUnavailableError(e)) throw e;
        res.status(503).json({ error: "LIST_FAILED", impact: "HIGH" });
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
          error: "VALIDATION_ERROR",
          impact: "MEDIUM",
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
        res.status(404).json({ error: "NOT_FOUND", impact: "LOW" });
        return;
      }
      res.json(found);
    })
  );

  return router;
}

