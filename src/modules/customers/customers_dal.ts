import { randomUUID } from "node:crypto";

import type { Pool } from "pg";

import { entityDateToApiIso } from "../../domain/entities/entity-meta.js";
import { Repository } from "../../db/repository/repository.js";
import { field, Filter, Sort, type FieldProjector } from "../../db/repository/dsl.js";

import { CustomerEntity, type CustomerStatus } from "./customer_entity.js";
import type { CustomerCreateBody, CustomerListQuery } from "./dto.js";
import { CUSTOMER_SEARCHABLE_KEYS } from "./list-config.js";

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

function translateFilterConditions(conditions: FilterCondition[]): ReturnType<typeof Filter.group> | null {
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
    "IS",
    "IS NOT",
  ]);

  const allowedFields = new Set(CUSTOMER_SEARCHABLE_KEYS);

  const filterExprs: ReturnType<typeof Filter.fieldValue>[] = [];

  for (const cond of conditions) {
    if (!validOps.has(cond.op)) continue;
    if (!allowedFields.has(cond.field)) continue;

    let value: unknown = cond.value;

    if ((cond.op === "ILIKE" || cond.op === "LIKE") && typeof value === "string") {
      const { needle } = buildIlikeNeedleFromSearch(value);
      value = needle;
    }

    filterExprs.push(Filter.fieldValue(
      field(CustomerEntity, cond.field as any),
      cond.op as any,
      value,
      (cond.connector as any) ?? "AND"
    ));
  }

  if (filterExprs.length === 0) return null;

  if (filterExprs.length === 1) {
    const single = filterExprs[0]!;
    single.operand = "AND";
    return Filter.group([single], "AND");
  }

return Filter.group(filterExprs, "AND");
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

  constructor(pool: Pool) {
    this.repo = new Repository(pool);
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

    const rows: Array<Partial<Record<keyof CustomerDetailRow & string, unknown>>> = [];
    for (let i = 1; i <= 137; i++) {
      const status: CustomerStatus = i % 7 === 0 ? "INACTIVE" : "ACTIVE";
      const isCompany = i % 4 === 0;
      const code = `CUST-${String(i).padStart(5, "0")}`;

      if (isCompany) {
        const company = companies[i % companies.length]!;
        const email = i % 3 === 0 ? `info${i}@example.com` : `contact${i}@example.com`;
        rows.push({
          code,
          company_name: company,
          email,
          phone: i % 5 === 0 ? `+39 02 00${String(i).padStart(4, "0")}` : undefined,
          status,
          created_by: "system",
          updated_by: "system",
          version: 1,
        });
      } else {
        const first_name = firstNames[i % firstNames.length]!;
        const last_name = lastNames[i % lastNames.length]!;
        const email = i % 6 === 0 ? undefined : `${first_name.toLowerCase()}.${last_name.toLowerCase().replace(/\s+/g, "")}${i}@example.com`;
        rows.push({
          code,
          first_name,
          last_name,
          email,
          phone: i % 4 === 0 ? `+39 3${String(20 + (i % 80)).padStart(2, "0")} ${String(i).padStart(7, "0")}` : undefined,
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
      const advancedFilter = translateFilterConditions(q.filters as FilterCondition[]);
      if (advancedFilter) {
        filters.push(advancedFilter);
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
      { filters: filters as any, sorting }
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
}

