export const openapi = {
  openapi: "3.0.3",
  info: {
    title: "Primebrick API",
    version: "0.1.0",
  },
  paths: {
    "/api/v1/entities/customer/meta": {
      get: {
        summary: "Get customer UI metadata",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EntityMetaResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/entities/customer/list": {
      get: {
        summary: "List customers",
        parameters: [
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "search_in", in: "query", schema: { type: "string", description: "CSV of fields to search in (e.g. code,uuid,email)" } },
          { name: "status", in: "query", schema: { $ref: "#/components/schemas/CustomerStatus" } },
          { name: "sort_key", in: "query", schema: { type: "string", enum: ["updated_at", "uuid", "code", "status"] } },
          { name: "sort_dir", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
          { name: "page", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "page_size", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } },
          {
            name: "filters",
            in: "query",
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  op: { type: "string", enum: ["=", "!=", "<>", "<", "<=", ">", ">=", "ILIKE", "LIKE", "IN", "NOT IN", "IS", "IS NOT"] },
                  value: { oneOf: [{ type: "string" }, { type: "number" }, { type: "boolean" }, { type: "null" }] },
                  connector: { type: "string", enum: ["AND", "OR"] },
                },
              },
            },
            description: "Advanced filter conditions array",
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EntityListResponseCustomer" },
              },
            },
          },
        },
      },
    },
    "/api/v1/entities/customer": {
      post: {
        summary: "Create customer",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CustomerCreateBody" },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CustomerCreateResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/entities/customer/{uuid}": {
      get: {
        summary: "Get customer detail",
        parameters: [
          { name: "uuid", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CustomerDetail" },
              },
            },
          },
          "404": { description: "Not found" },
        },
      },
    },
  },
  components: {
    schemas: {
      CustomerStatus: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
      CustomerCreateBody: {
        type: "object",
        required: ["code"],
        properties: {
          code: { type: "string", maxLength: 20 },
          first_name: { type: "string" },
          last_name: { type: "string" },
          company_name: { type: "string" },
          email: { type: "string", format: "email", maxLength: 320 },
          phone: { type: "string", maxLength: 64 },
          status: { $ref: "#/components/schemas/CustomerStatus" },
          status_reason: { type: "string" },
          local_address: { type: "string" },
          local_city: { type: "string" },
          local_state: { type: "string" },
          local_country: { type: "string" },
          local_zip: { type: "string" },
          onboarding_at: {
            type: "string",
            format: "date-time",
            description:
              "Onboarding instant (UTC in DB). Send ISO-8601; pair with onboarding_time_zone for display in that IANA zone.",
          },
          onboarding_time_zone: {
            type: "string",
            maxLength: 100,
            description: "IANA time zone id (e.g. Europe/Rome). Required if onboarding_at is set.",
            examples: ["Europe/Rome", "America/New_York"],
          },
        },
      },
      CustomerCreateResponse: {
        type: "object",
        required: ["uuid"],
        properties: {
          uuid: { type: "string", format: "uuid" },
        },
      },
      CustomerDetail: {
        type: "object",
        required: ["uuid", "code", "status", "created_at", "created_by", "updated_at", "updated_by", "version"],
        properties: {
          uuid: { type: "string", format: "uuid" },
          code: { type: "string", maxLength: 20 },
          first_name: { type: "string" },
          last_name: { type: "string" },
          company_name: { type: "string" },
          email: { type: "string", format: "email", maxLength: 320 },
          phone: { type: "string", maxLength: 64 },
          status: { $ref: "#/components/schemas/CustomerStatus" },
          status_reason: { type: "string" },
          local_address: { type: "string" },
          local_city: { type: "string" },
          local_state: { type: "string" },
          local_country: { type: "string" },
          local_zip: { type: "string" },
          onboarding_at: {
            type: "string",
            format: "date-time",
            description:
              "Onboarding instant (stored as UTC / timestamptz). Use onboarding_time_zone with Intl in the UI for local wall time (incl. DST).",
            examples: ["2026-04-16T12:01:44.606Z"],
          },
          onboarding_time_zone: {
            type: "string",
            maxLength: 100,
            description: "IANA zone captured when onboarding was recorded.",
            examples: ["Europe/Rome"],
          },
          created_at: {
            type: "string",
            format: "date-time",
            description:
              "DateTime (instant). Serialized as RFC3339 / ISO-8601 string with timezone (Z or +/-HH:MM).",
            examples: ["2026-04-16T12:01:44.606Z", "2026-04-16T12:01:44.606+02:00"],
          },
          created_by: { type: "string" },
          updated_at: {
            type: "string",
            format: "date-time",
            description:
              "DateTime (instant). Serialized as RFC3339 / ISO-8601 string with timezone (Z or +/-HH:MM).",
            examples: ["2026-04-16T12:01:44.606Z", "2026-04-16T12:01:44.606+02:00"],
          },
          updated_by: { type: "string" },
          version: { type: "integer" },
          deleted_at: {
            type: "string",
            format: "date-time",
            description:
              "DateTime (instant). Serialized as RFC3339 / ISO-8601 string with timezone (Z or +/-HH:MM).",
            examples: ["2026-04-16T12:01:44.606Z", "2026-04-16T12:01:44.606+02:00"],
          },
          deleted_by: { type: "string" },
        },
      },
      CustomerListItem: {
        type: "object",
        required: ["uuid", "code", "status", "updated_at", "version"],
        properties: {
          uuid: { type: "string" },
          code: { type: "string" },
          first_name: { type: "string" },
          last_name: { type: "string" },
          company_name: { type: "string" },
          email: { type: "string", format: "email" },
          phone: { type: "string" },
          status: { $ref: "#/components/schemas/CustomerStatus" },
          updated_at: {
            type: "string",
            format: "date-time",
            description:
              "DateTime (instant). Serialized as RFC3339 / ISO-8601 string with timezone (Z or +/-HH:MM).",
            examples: ["2026-04-16T12:01:44.606Z", "2026-04-16T12:01:44.606+02:00"],
          },
          version: { type: "integer" },
        },
      },
      EntityListResponseCustomer: {
        type: "object",
        required: ["rows", "page", "page_size", "total"],
        properties: {
          rows: { type: "array", items: { $ref: "#/components/schemas/CustomerDetail" } },
          page: { type: "integer" },
          page_size: { type: "integer" },
          total: { type: "integer" },
        },
      },
      EntityMetaResponse: {
        type: "object",
        required: ["entity", "titleKey", "uid", "defaultView", "list"],
        properties: {
          entity: { type: "string" },
          titleKey: { type: "string" },
          uid: { type: "string", description: "List row unique identifier column key (e.g. uuid)" },
          defaultView: { type: "string", enum: ["table", "cards", "cards_list"] },
          list: {
            type: "object",
            required: ["columns", "viewVisibility"],
            properties: {
              searchPlaceholderKey: { type: "string" },
              defaultSort: {
                type: "object",
                properties: {
                  key: { type: "string" },
                  dir: { type: "string", enum: ["asc", "desc"] },
                },
              },
              columns: {
                type: "array",
                items: {
                  type: "object",
                  required: ["key", "labelKey", "type"],
                  properties: {
                    key: { type: "string" },
                    labelKey: { type: "string" },
                    type: { type: "string" },
                    sortable: { type: "boolean" },
                    searchable: { type: "boolean" },
                    hideable: { type: "boolean" },
                    defaultVisible: { type: "boolean" },
                    filterable: { type: "boolean" },
                  },
                },
              },
              stickyColumns: {
                type: "array",
                items: {
                  type: "object",
                  required: ["key", "labelKey", "type"],
                  properties: {
                    key: { type: "string" },
                    labelKey: { type: "string" },
                    type: { type: "string" },
                  },
                },
              },
              auditingColumns: {
                type: "array",
                items: {
                  type: "object",
                  required: ["key", "labelKey", "type"],
                  properties: {
                    key: { type: "string" },
                    labelKey: { type: "string" },
                    type: { type: "string" },
                  },
                },
              },
              viewVisibility: {
                type: "object",
                properties: {
                  table: {
                    type: "object",
                    properties: {
                      visible: { type: "array", items: { type: "string" } },
                      hidden: { type: "array", items: { type: "string" } },
                      notDisplayable: { type: "array", items: { type: "string" } },
                      notHideable: { type: "array", items: { type: "string" } },
                    },
                  },
                  cards: {
                    type: "object",
                    properties: {
                      visible: { type: "array", items: { type: "string" } },
                      hidden: { type: "array", items: { type: "string" } },
                      notDisplayable: { type: "array", items: { type: "string" } },
                      notHideable: { type: "array", items: { type: "string" } },
                    },
                  },
                  cards_list: {
                    type: "object",
                    properties: {
                      visible: { type: "array", items: { type: "string" } },
                      hidden: { type: "array", items: { type: "string" } },
                      notDisplayable: { type: "array", items: { type: "string" } },
                      notHideable: { type: "array", items: { type: "string" } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const;

