import { randomUUID } from "node:crypto";

import type { Pool } from "pg";

import { entityDateToApiIso } from "../../domain/entities/entity-meta.js";
import { Repository } from "../../db/repository/repository.js";
import { field, Filter, Sort, type FieldProjector, type FilterExpr } from "../../db/repository/dsl.js";

import { CustomerEntity, type CustomerStatus } from "./customer_entity.js";
import type { CustomerCreateBody, CustomerUpdateBody, CustomerListQuery } from "./dto.js";
import { CUSTOMER_SEARCHABLE_KEYS, CUSTOMER_FILTERABLE_KEYS } from "./list-config.js";
import type { AuditService } from "../../lib/audit/audit-service.js";

function buildIlikeNeedleFromSearch(raw: string): {
  needle: string;
  trueChars: number;
  hasEscapedWildcard: boolean;
} {
  let out = "";
  let trueChars = 0;
  let hasEscapedWildcard = false;

  const s = raw;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]!;

    if (ch === "\\") {
      const next = s[i + 1];
      if (next === "*" || next === "?") {
        out += next === "*" ? "%" : "_";
        hasEscapedWildcard = true;
        i++;
        continue;
      }
      out += "\\";
      trueChars++;
      continue;
    }

    if (ch === "%") out += "#%";
    else if (ch === "_") out += "#_";
    else if (ch === "#") out += "##";
    else out += ch;

    trueChars++;
  }

  return { needle: `%${out}%`, trueChars, hasEscapedWildcard };
}

type FilterCondition = {
  field: string;
  op: string;
  value: unknown;
  connector?: "AND" | "OR";
};

function translateFilterConditions(conditions: FilterCondition[], connector: "AND" | "OR" = "AND"): FilterExpr[] | null {
  if (!conditions || conditions.length === 0) return null;

  const validOps = new Set([
    "=",
    "!=",
    "<>",
    "<",
    "<=",
    ">",
    ">=",
    "ILIKE",
    "LIKE",
    "IN",
    "NOT IN",
    "BETWEEN",
    "IS",
    "IS NOT",
  ]);

  const allowedFields = new Set(CUSTOMER_FILTERABLE_KEYS);

  const filterExprs: ReturnType<typeof Filter.fieldValue>[] = [];

  for (const cond of conditions) {
    if (!validOps.has(cond.op)) continue;
    if (!allowedFields.has(cond.field)) continue;

    let value: unknown = cond.value;

    if ((cond.op === "ILIKE" || cond.op === "LIKE") && typeof value === "string") {
      // Skip pattern building if value already contains % (from advanced filters)
      if (!value.includes('%')) {
        const { needle } = buildIlikeNeedleFromSearch(value);
        value = needle;
      }
    }

    // For IN and NOT IN operators with array values, use the array directly
    if ((cond.op === "IN" || cond.op === "NOT IN") && Array.isArray(value)) {
      filterExprs.push(Filter.fieldValue(
        field(CustomerEntity, cond.field as any),
        cond.op as any,
        value,
        connector
      ));
    } else if (cond.op === "BETWEEN" && typeof value === "object" && value !== null && "start" in value && "end" in value) {
      // BETWEEN operator expects an array of two values [start, end]
      const start = (value as { start: unknown; end: unknown }).start;
      const end = (value as { start: unknown; end: unknown }).end;
      if (start !== null && end !== null) {
        filterExprs.push(Filter.fieldValue(
          field(CustomerEntity, cond.field as any),
          cond.op as any,
          [start, end],
          connector
        ));
      }
    } else {
      filterExprs.push(Filter.fieldValue(
        field(CustomerEntity, cond.field as any),
        cond.op as any,
        value,
        connector
      ));
    }
  }

  if (filterExprs.length === 0) return null;

  // Always wrap in an outer AND group so the connector only applies BETWEEN advanced filters,
  // and the group itself is ANDed with outer where clauses (deleted_at, search, status).
  if (filterExprs.length === 1) {
    return [Filter.group(filterExprs, "AND")];
  }

  return [Filter.group([Filter.group(filterExprs, connector)], "AND")];
}

export type CustomerDetailRow = {
  uuid: string;
  code: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  email?: string;
  phone?: string;
  status: CustomerStatus;
  status_reason?: string;
  local_address?: string;
  local_city?: string;
  local_state?: string;
  local_country?: string;
  local_zip?: string;
  onboarding_at?: Date;
  onboarding_time_zone?: string;
  created_at: Date;
  created_by: string;
  updated_at: Date;
  updated_by: string;
  version: number;
  deleted_at?: Date;
  deleted_by?: string;
};

export type CustomerDetailDto = Omit<
  CustomerDetailRow,
  "created_at" | "updated_at" | "deleted_at" | "onboarding_at"
> & {
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  onboarding_at?: string;
};

function projectAllExceptId(): FieldProjector[] {
  const keys: Array<keyof CustomerDetailRow & string> = [
    "uuid",
    "code",
    "first_name",
    "last_name",
    "company_name",
    "email",
    "phone",
    "status",
    "status_reason",
    "local_address",
    "local_city",
    "local_state",
    "local_country",
    "local_zip",
    "onboarding_at",
    "onboarding_time_zone",
    "created_at",
    "created_by",
    "updated_at",
    "updated_by",
    "version",
    "deleted_at",
    "deleted_by",
  ];
  return keys.map((k) => ({ kind: "field", field: field(CustomerEntity, k) }));
}

export class CustomersDal {
  private repo: Repository;
  private pool: Pool;

  constructor(pool: Pool, auditService?: AuditService) {
    this.repo = new Repository(pool, auditService);
    this.pool = pool;
  }

  async seedIfEmpty(): Promise<void> {
    const count = await this.repo.count(CustomerEntity);
    if (count > 0) return;

    const firstNames = [
      "Mario",
      "Giulia",
      "Luca",
      "Sara",
      "Marco",
      "Francesca",
      "Paolo",
      "Elena",
      "Andrea",
      "Chiara",
      "Matteo",
      "Valentina",
      "Davide",
      "Martina",
      "Stefano",
      "Laura",
    ];
    const lastNames = [
      "Rossi",
      "Bianchi",
      "Ferrari",
      "Esposito",
      "Romano",
      "Colombo",
      "Ricci",
      "Marino",
      "Greco",
      "Bruno",
      "Gallo",
      "Conti",
      "De Luca",
      "Mancini",
      "Costa",
      "Giordano",
    ];
    const companies = [
      "Acme Srl",
      "Prime Logistics",
      "BlueWave Consulting",
      "Northwind Italia",
      "Contoso Retail",
      "Futura Energia",
      "Alfa Tech",
      "Omega Services",
      "Delta Foods",
      "Aurora Design",
      "Zenith Group",
      "Nova Manufacturing",
      "Terra Verde",
      "Pixel Studio",
      "Orion Systems",
      "Vento & Co",
    ];

    const addresses = [
      "Via Roma 1",
      "Corso Italia 23",
      "Via Nazionale 45",
      "Piazza Duomo 12",
      "Viale Gramsci 78",
      "Via Garibaldi 34",
      "Corso Buenos Aires 56",
      "Via Torino 89",
      "Piazza San Marco 3",
      "Viale Europa 21",
      "Via Po 67",
      "Corso Vittorio Emanuele 90",
      "Via Dante 15",
      "Piazza Castello 42",
      "Viale Liguria 33",
    ];

    const cities = [
      "Milano",
      "Roma",
      "Napoli",
      "Torino",
      "Bologna",
      "Firenze",
      "Genova",
      "Venezia",
      "Palermo",
      "Bari",
      "Verona",
      "Padova",
      "Trieste",
      "Brescia",
      "Prato",
    ];

    const provinces = [
      "MI",
      "RM",
      "NA",
      "TO",
      "BO",
      "FI",
      "GE",
      "VE",
      "PA",
      "BA",
      "VR",
      "PD",
      "TS",
      "BS",
      "PO",
    ];

    const countries = [
      "Italia",
      "Italia",
      "Italia",
      "Italia",
      "Italia",
      "Italia",
      "Italia",
      "Italia",
      "Italia",
      "Italia",
      "Italia",
      "Italia",
      "Italia",
      "Italia",
      "Italia",
    ];

    const zipCodes = [
      "20100",
      "00100",
      "80100",
      "10100",
      "40100",
      "50100",
      "16100",
      "30100",
      "90100",
      "70100",
      "37100",
      "35100",
      "34100",
      "25100",
      "59000",
    ];

    const rows: Array<Partial<Record<keyof CustomerDetailRow & string, unknown>>> = [];
    for (let i = 1; i <= 138; i++) {
      const status: CustomerStatus = i % 7 === 0 ? "INACTIVE" : "ACTIVE";
      const isCompany = i === 1 || i % 4 === 0; // Make first row always a company
      const code = `CUST-${String(i).padStart(5, "0")}`;
      const address = addresses[i % addresses.length]!;
      const city = cities[i % cities.length]!;
      const province = provinces[i % provinces.length]!;
      const country = countries[i % countries.length]!;
      const zip = zipCodes[i % zipCodes.length]!;

      // Add onboarding data for first 3 records
      let onboarding_at: Date | undefined;
      let onboarding_time_zone: string | undefined;
      if (i === 1) {
        onboarding_at = new Date();
        onboarding_at.setUTCHours(15, 0, 0, 0);
        onboarding_time_zone = "Europe/Rome";
      } else if (i === 2) {
        onboarding_at = new Date();
        onboarding_at.setUTCHours(15, 0, 0, 0);
        onboarding_time_zone = "America/New_York";
      } else if (i === 3) {
        onboarding_at = new Date();
        onboarding_at.setUTCHours(15, 0, 0, 0);
        onboarding_time_zone = "Asia/Tokyo";
      }

      if (isCompany) {
        const company = companies[i % companies.length]!;
        const email = i % 3 === 0 ? `info${i}@example.com` : `contact${i}@example.com`;
        rows.push({
          code,
          first_name: null,
          last_name: null,
          company_name: company,
          email,
          phone: `+39 02 ${String(i).padStart(4, "0")}`,
          local_address: address,
          local_city: city,
          local_state: province,
          local_country: country,
          local_zip: zip,
          onboarding_at,
          onboarding_time_zone,
          status,
          created_by: "system",
          updated_by: "system",
          version: 1,
        });
      } else {
        const first_name = firstNames[i % firstNames.length]!;
        const last_name = lastNames[i % lastNames.length]!;
        const email = i % 6 === 0 ? null : `${first_name.toLowerCase()}.${last_name.toLowerCase().replace(/\s+/g, "")}${i}@example.com`;
        rows.push({
          code,
          first_name,
          last_name,
          company_name: null,
          email,
          phone: `+39 3${String(20 + (i % 80)).padStart(2, "0")} ${String(i).padStart(7, "0")}`,
          local_address: address,
          local_city: city,
          local_state: province,
          local_country: country,
          local_zip: zip,
          onboarding_at,
          onboarding_time_zone,
          status,
          created_by: "system",
          updated_by: "system",
          version: 1,
        });
      }
    }

    await this.repo.insertMany(CustomerEntity, rows);
  }

  private toDto(r: CustomerDetailRow): CustomerDetailDto {
    return {
      ...r,
      created_at: entityDateToApiIso(r.created_at),
      updated_at: entityDateToApiIso(r.updated_at),
      deleted_at: r.deleted_at ? entityDateToApiIso(r.deleted_at) : undefined,
      onboarding_at: r.onboarding_at ? entityDateToApiIso(r.onboarding_at) : undefined,
    };
  }

  async listCustomers(q: CustomerListQuery) {
    const page = q.page ?? 1;
    const page_size = q.page_size ?? 25;

    const filters: ReturnType<typeof Filter.group>[] = [];
    if (q.status) {
      filters.push(Filter.group([Filter.fieldValue(field(CustomerEntity, "status"), "=", q.status)], "AND"));
    }

    if (q.search && q.search.trim()) {
      const raw = q.search.trim();
      const { needle, trueChars, hasEscapedWildcard } = buildIlikeNeedleFromSearch(raw);
      const canSearch = trueChars >= 3 || (hasEscapedWildcard && trueChars >= 1);
      if (!canSearch) {
        filters.push(Filter.group([Filter.raw("1", "=", "0")], "AND"));
      } else {
        const looksLikeUuid =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw);

        const fields = (q.search_in?.length ? q.search_in : CUSTOMER_SEARCHABLE_KEYS) as string[];
        const allowed = new Set([...CUSTOMER_SEARCHABLE_KEYS, "uuid"]);
        const ors = fields
          .filter((f) => allowed.has(f))
          .flatMap((f) => {
            if (f === "uuid") {
              return looksLikeUuid
                ? [Filter.fieldValue(field(CustomerEntity, "uuid"), "=", raw, "OR")]
                : [Filter.fieldValue(field(CustomerEntity, "uuid"), "ILIKE", needle, "OR")];
            }
            return [Filter.fieldValue(field(CustomerEntity, f as any), "ILIKE", needle, "OR")];
          });
        if (ors.length) filters.push(Filter.group(ors, "OR"));
      }
    }

    if (q.filters && q.filters.length > 0) {
      const advancedFilters = translateFilterConditions(q.filters as FilterCondition[], q.connector ?? "AND");
      if (advancedFilters) {
        filters.push(...advancedFilters);
      }
    }

    const sort_key = (q.sort_key ?? "updated_at") as keyof CustomerDetailRow & string;
    const sort_dir = (q.sort_dir ?? "desc").toUpperCase() === "ASC" ? "ASC" : "DESC";
    const sorting = [Sort.by(field(CustomerEntity, sort_key as any), sort_dir as any)];

    const result = await this.repo.findByPage<CustomerDetailRow, CustomerDetailRow>(
      CustomerEntity,
      page,
      page_size,
      projectAllExceptId(),
      {
        filters: filters as any,
        sorting,
        deletedRecords: q.deleted_records as any
      }
    );

    return {
      rows: result.entities.map((x) => this.toDto(x)),
      page,
      page_size,
      total: result.total_records,
    };
  }

  async getByUuid(uuid: string): Promise<CustomerDetailDto | null> {
    const row = await this.repo.find<CustomerDetailRow, CustomerDetailRow>(
      CustomerEntity,
      projectAllExceptId(),
      { filters: [Filter.fieldValue(field(CustomerEntity, "uuid"), "=", uuid)] as any }
    );
    return row ? this.toDto(row) : null;
  }

  async createCustomer(body: CustomerCreateBody): Promise<{ uuid: string }> {
    const uuid = randomUUID();
    await this.repo.insertMany(CustomerEntity, [
      {
        uuid,
        code: body.code,
        first_name: body.first_name,
        last_name: body.last_name,
        company_name: body.company_name,
        email: body.email,
        phone: body.phone,
        status: body.status,
        status_reason: body.status_reason,
        local_address: body.local_address,
        local_city: body.local_city,
        local_state: body.local_state,
        local_country: body.local_country,
        local_zip: body.local_zip,
        onboarding_at: body.onboarding_at,
        onboarding_time_zone: body.onboarding_time_zone,
        created_by: "system",
        updated_by: "system",
        version: 1,
      },
    ]);
    return { uuid };
  }

  async updateCustomer(uuid: string, body: CustomerUpdateBody, updatedBy: string): Promise<void> {
    await this.repo.update(CustomerEntity, uuid, body, updatedBy);
  }

  async deleteCustomer(uuid: string, deletedBy: string): Promise<void> {
    await this.repo.delete(CustomerEntity, uuid, deletedBy);
  }

  async restoreCustomer(uuid: string, restoredBy: string): Promise<void> {
    await this.repo.restore(CustomerEntity, uuid, restoredBy);
  }

  async restoreCustomers(uuids: string[], restoredBy: string): Promise<{ uuids: string[]; errors: Array<{ uuid: string; error: string }> }> {
    const results: string[] = [];
    const errors: Array<{ uuid: string; error: string }> = [];

    for (const uuid of uuids) {
      try {
        await this.restoreCustomer(uuid, restoredBy);
        results.push(uuid);
      } catch (e) {
        console.error('[Customer Restore Error]', {
          uuid,
          error: e,
          stack: e instanceof Error ? e.stack : undefined,
          message: e instanceof Error ? e.message : String(e)
        });
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        errors.push({ uuid, error: errorMessage });
      }
    }

    return { uuids: results, errors };
  }

  async duplicateCustomer(uuid: string, duplicatedBy: string): Promise<{ uuid: string }> {
    const newUuid = await this.repo.clone(CustomerEntity, uuid, duplicatedBy);
    return { uuid: newUuid };
  }

  async duplicateCustomers(uuids: string[], duplicatedBy: string): Promise<{ uuids: string[]; errors: Array<{ uuid: string; error: string }> }> {
    const results: string[] = [];
    const errors: Array<{ uuid: string; error: string }> = [];

    for (const uuid of uuids) {
      try {
        const result = await this.duplicateCustomer(uuid, duplicatedBy);
        results.push(result.uuid);
      } catch (e) {
        console.error('[Customer Duplicate Error]', {
          uuid,
          error: e,
          stack: e instanceof Error ? e.stack : undefined,
          message: e instanceof Error ? e.message : String(e)
        });
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        errors.push({ uuid, error: errorMessage });
      }
    }

    return { uuids: results, errors };
  }

  async *streamAllCustomers(q: CustomerListQuery): AsyncGenerator<CustomerDetailRow> {
    const filters: ReturnType<typeof Filter.group>[] = [];
    if (q.status) {
      filters.push(Filter.group([Filter.fieldValue(field(CustomerEntity, "status"), "=", q.status)], "AND"));
    }

    if (q.search && q.search.trim()) {
      const raw = q.search.trim();
      const { needle, trueChars, hasEscapedWildcard } = buildIlikeNeedleFromSearch(raw);
      const canSearch = trueChars >= 3 || (hasEscapedWildcard && trueChars >= 1);
      if (!canSearch) {
        filters.push(Filter.group([Filter.raw("1", "=", "0")], "AND"));
      } else {
        const looksLikeUuid =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw);

        const fields = (q.search_in?.length ? q.search_in : CUSTOMER_SEARCHABLE_KEYS) as string[];
        const allowed = new Set([...CUSTOMER_SEARCHABLE_KEYS, "uuid"]);
        const ors = fields
          .filter((f) => allowed.has(f))
          .flatMap((f) => {
            if (f === "uuid") {
              return looksLikeUuid
                ? [Filter.fieldValue(field(CustomerEntity, "uuid"), "=", raw, "OR")]
                : [Filter.fieldValue(field(CustomerEntity, "uuid"), "ILIKE", needle, "OR")];
            }
            return [Filter.fieldValue(field(CustomerEntity, f as any), "ILIKE", needle, "OR")];
          });
        if (ors.length) filters.push(Filter.group(ors, "OR"));
      }
    }

    if (q.filters && q.filters.length > 0) {
      const advancedFilters = translateFilterConditions(q.filters as FilterCondition[], q.connector ?? "AND");
      if (advancedFilters) {
        filters.push(...advancedFilters);
      }
    }

    const sort_key = (q.sort_key ?? "updated_at") as keyof CustomerDetailRow & string;
    const sort_dir = (q.sort_dir ?? "desc").toUpperCase() === "ASC" ? "ASC" : "DESC";
    const sorting = [Sort.by(field(CustomerEntity, sort_key as any), sort_dir as any)];

    const result = await this.repo.findAll<CustomerDetailRow, CustomerDetailRow>(
      CustomerEntity,
      projectAllExceptId(),
      {
        filters: filters as any,
        sorting,
        deletedRecords: q.deleted_records as any
      }
    );

    for (const row of result) {
      yield row;
    }
  }

  async getCustomerAudit(uuid: string, page: number, limit: number) {
    const offset = (page - 1) * limit;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM public.customers_audit
      WHERE entity_uuid = $1
    `;

    const countResult = await this.pool.query(countQuery, [uuid]);
    const total = parseInt(countResult.rows[0].total, 10);

    const query = `
      SELECT
        id,
        entity_uuid,
        action,
        changed_at,
        version,
        delta
      FROM public.customers_audit
      WHERE entity_uuid = $1
      ORDER BY changed_at DESC, id DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await this.pool.query(query, [uuid, limit, offset]);

    return {
      data: result.rows.map((row: any) => ({
        id: row.id.toString(),
        entity_uuid: row.entity_uuid,
        action: row.action,
        changed_at: entityDateToApiIso(row.changed_at),
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
}

