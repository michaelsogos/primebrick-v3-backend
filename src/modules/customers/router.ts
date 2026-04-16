import { Router } from "express";
import { getPool } from "../../db/pool.js";
import { CustomersDal } from "./customers_dal.js";
import { validateBody, validateQuery } from "../../http/validation.js";
import { CustomerCreateBodySchema, CustomerListQuerySchema, UuidParamSchema } from "./dto.js";
import { z } from "zod";
import { CUSTOMER_DEFAULT_SORT, CUSTOMER_LIST_COLUMNS } from "./list-config.js";

export function customersRouter() {
  const router = Router();
  const dal = new CustomersDal(getPool());

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

  router.get("/api/v1/entities/customer/list", validateQuery(CustomerListQuerySchema), async (req, res) => {
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
      res.status(500).json({ error: "Simulated customers list failure" });
      return;
    }

    const result = await dal.listCustomers({
      search,
      search_in: search_in ?? undefined,
      status,
      sort_key: eff_sort_key,
      sort_dir: eff_sort_dir,
      page: page ?? undefined,
      page_size: page_size ?? undefined,
    });
    res.json(result);
  });

  router.post(
    "/api/v1/entities/customer",
    validateBody(CustomerCreateBodySchema),
    async (req, res) => {
      const body = req.body as unknown as import("./dto.js").CustomerCreateBody;
      const created = await dal.createCustomer(body);
      res.status(201).json(created);
    }
  );

  router.get(
    "/api/v1/entities/customer/:uuid",
    (req, res, next) => {
      const r = UuidParamSchema.safeParse(req.params);
      if (!r.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
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
    async (req, res) => {
      const { uuid } = req.params as unknown as z.infer<typeof UuidParamSchema>;
      const found = await dal.getByUuid(uuid);
      if (!found) {
        res.status(404).json({ error: "NOT_FOUND" });
        return;
      }
      res.json(found);
    }
  );

  return router;
}

