import { randomUUID } from "node:crypto";
import { entityDateToApiIso } from "../../domain/entities/entity-meta.js";
import { CustomerEntity, type CustomerStatus } from "./customer_entity.js";

export type ListCustomersParams = {
  search?: string;
  search_in?: (keyof CustomerListItem)[];
  status?: CustomerStatus;
  sort_key?: keyof CustomerListItem;
  sort_dir?: "asc" | "desc";
  page?: number;
  page_size?: number;
};

/** Search/sort shape for list API. Response rows use {@link CustomerDetail}. */
export type CustomerListItem = {
  uuid: string;
  code: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  email?: string;
  phone?: string;
  status: CustomerStatus;
  updated_at: string;
  version: number;
};

/** Detail wire shape: all columns except internal numeric id. */
export type CustomerDetail = {
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
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  version: number;
  deleted_at?: string;
  deleted_by?: string;
};

function makeCode(id: number) {
  return `CUST-${String(id).padStart(5, "0")}`;
}

function fullName(c: CustomerEntity) {
  const parts = [c.first_name, c.last_name].filter(Boolean) as string[];
  return parts.join(" ").trim();
}

function normalizeSearchIn(keys: (keyof CustomerListItem)[] | undefined): (keyof CustomerListItem)[] | undefined {
  if (!keys || keys.length === 0) return undefined;
  const allowed: (keyof CustomerListItem)[] = ["code", "uuid", "first_name", "last_name", "company_name", "email", "phone"];
  const allowedSet = new Set<keyof CustomerListItem>(allowed);
  const normalized = keys.filter((k) => allowedSet.has(k));
  return normalized.length ? normalized : undefined;
}

function matchesSearch(c: CustomerEntity, s: string, search_in?: (keyof CustomerListItem)[]) {
  const needle = s.toLowerCase();

  if (!search_in || search_in.length === 0) {
    const hay = [
      c.code,
      c.uuid,
      fullName(c),
      c.company_name ?? "",
      c.email ?? "",
      c.phone ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(needle);
  }

  const item: CustomerListItem = {
    uuid: c.uuid,
    code: c.code,
    first_name: c.first_name,
    last_name: c.last_name,
    company_name: c.company_name,
    email: c.email,
    phone: c.phone,
    status: c.status,
    updated_at: entityDateToApiIso(c.updated_at),
    version: c.version,
  };

  const hay = search_in
    .map((k) => {
      const v = (item as Record<string, unknown>)[k as string];
      return v == null ? "" : String(v);
    })
    .join(" ")
    .toLowerCase();

  return hay.includes(needle);
}

export class CustomersRepo {
  private data: CustomerEntity[] = [];

  constructor() {
    const seedEnabled = process.env.PB_SEED_CUSTOMERS !== "0";
    if (!seedEnabled) return;

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

    // Seed 137 demo customers (until DB + repository pattern is wired).
    for (let i = 1; i <= 137; i++) {
      const status: CustomerStatus = i % 7 === 0 ? "INACTIVE" : "ACTIVE";
      const isCompany = i % 4 === 0;

      if (isCompany) {
        const company = companies[i % companies.length];
        const email = i % 3 === 0 ? `info${i}@example.com` : `contact${i}@example.com`;
        this.data.push(
          this.createSeed({
            company_name: company,
            email,
            phone: i % 5 === 0 ? `+39 02 00${String(i).padStart(4, "0")}` : undefined,
            status,
          })
        );
      } else {
        const first_name = firstNames[i % firstNames.length];
        const last_name = lastNames[i % lastNames.length];
        const email = i % 6 === 0 ? null : `${first_name.toLowerCase()}.${last_name.toLowerCase().replace(/\s+/g, "")}${i}@example.com`;
        this.data.push(
          this.createSeed({
            first_name,
            last_name,
            email: email ?? undefined,
            phone: i % 4 === 0 ? `+39 3${String(20 + (i % 80)).padStart(2, "0")} ${String(i).padStart(7, "0")}` : undefined,
            status,
          })
        );
      }
    }
  }

  private createSeed(input: Partial<Pick<CustomerEntity, "first_name" | "last_name" | "company_name" | "email" | "phone">> & { status: CustomerStatus }) {
    const id = this.data.length + 1;
    const ts = new Date();
    return Object.assign(Object.create(CustomerEntity.prototype), {
      id,
      uuid: randomUUID(),
      code: makeCode(id),

      first_name: input.first_name ?? undefined,
      last_name: input.last_name ?? undefined,
      company_name: input.company_name ?? undefined,
      email: input.email ?? undefined,
      phone: input.phone ?? undefined,

      status: input.status,
      status_reason: undefined,

      local_address: undefined,
      local_city: undefined,
      local_state: undefined,
      local_country: undefined,
      local_zip: undefined,

      created_at: ts,
      created_by: "system",
      updated_at: ts,
      updated_by: "system",
      version: 1,
      deleted_at: undefined,
      deleted_by: undefined,
    }) as CustomerEntity;
  }

  listCustomers(params: ListCustomersParams) {
    const page = Math.max(1, Number(params.page ?? 1));
    const page_size = Math.min(100, Math.max(1, Number(params.page_size ?? 25)));
    const search = (params.search ?? "").trim();
    const search_in = normalizeSearchIn(params.search_in);
    const status = params.status;
    const sort_key = (params.sort_key ?? "uuid") as keyof CustomerListItem;
    const sort_dir = params.sort_dir ?? "asc";

    const filteredBase = search ? this.data.filter((c) => matchesSearch(c, search, search_in)) : [...this.data];
    const filtered = status ? filteredBase.filter((c) => c.status === status) : [...filteredBase];
    const total = filtered.length;

    const sorted = [...filtered].sort((a, b) => {
      const aa = this.toListItem(a);
      const bb = this.toListItem(b);
      const av = aa[sort_key];
      const bv = bb[sort_key];

      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;

      if (typeof av === "number" && typeof bv === "number") return sort_dir === "asc" ? av - bv : bv - av;
      const as = String(av).toLowerCase();
      const bs = String(bv).toLowerCase();
      if (as < bs) return sort_dir === "asc" ? -1 : 1;
      if (as > bs) return sort_dir === "asc" ? 1 : -1;
      return 0;
    });

    const start = (page - 1) * page_size;
    const rows = sorted.slice(start, start + page_size).map((c) => this.toDetail(c));

    return { rows, page, page_size, total };
  }

  addCustomer(input: {
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
  }): CustomerEntity {
    const id = this.data.length + 1;
    const ts = new Date();
    const entity = Object.assign(Object.create(CustomerEntity.prototype), {
      id,
      uuid: randomUUID(),
      code: input.code,
      first_name: input.first_name,
      last_name: input.last_name,
      company_name: input.company_name,
      email: input.email,
      phone: input.phone,
      status: input.status,
      status_reason: input.status_reason,
      local_address: input.local_address,
      local_city: input.local_city,
      local_state: input.local_state,
      local_country: input.local_country,
      local_zip: input.local_zip,
      created_at: ts,
      created_by: "system",
      updated_at: ts,
      updated_by: "system",
      version: 1,
      deleted_at: undefined,
      deleted_by: undefined,
    }) as CustomerEntity;
    this.data.unshift(entity);
    return entity;
  }

  getCustomerByUuid(uuid: string): CustomerDetail | null {
    const c = this.data.find((x) => x.uuid === uuid);
    if (!c) return null;
    return this.toDetail(c);
  }

  private toListItem(c: CustomerEntity): CustomerListItem {
    return {
      uuid: c.uuid,
      code: c.code,
      first_name: c.first_name,
      last_name: c.last_name,
      company_name: c.company_name,
      email: c.email,
      phone: c.phone,
      status: c.status,
      updated_at: entityDateToApiIso(c.updated_at),
      version: c.version,
    };
  }

  private toDetail(c: CustomerEntity): CustomerDetail {
    return {
      uuid: c.uuid,
      code: c.code,
      first_name: c.first_name,
      last_name: c.last_name,
      company_name: c.company_name,
      email: c.email,
      phone: c.phone,
      status: c.status,
      status_reason: c.status_reason,
      local_address: c.local_address,
      local_city: c.local_city,
      local_state: c.local_state,
      local_country: c.local_country,
      local_zip: c.local_zip,
      created_at: entityDateToApiIso(c.created_at),
      created_by: c.created_by,
      updated_at: entityDateToApiIso(c.updated_at),
      updated_by: c.updated_by,
      version: c.version,
      deleted_at: c.deleted_at ? entityDateToApiIso(c.deleted_at) : undefined,
      deleted_by: c.deleted_by,
    };
  }
}
