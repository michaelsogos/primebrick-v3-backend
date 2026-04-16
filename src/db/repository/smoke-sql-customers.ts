import { CustomerEntity } from "../../modules/customers/customer_entity.js";

import { field, Filter, Sort } from "./dsl.js";
import { buildSelectQuery } from "./query-builder.js";

export function buildCustomersListExampleSql() {
  return buildSelectQuery({
    entity: CustomerEntity,
    filters: [Filter.fieldValue(field(CustomerEntity, "uuid"), "=", "00000000-0000-0000-0000-000000000000")],
    sorting: [Sort.by(field(CustomerEntity, "uuid"), "ASC")],
    deletedRecords: "EXCLUDED",
    limit: 25,
    offset: 0,
    includeTotalRecordsWindow: true,
  });
}

