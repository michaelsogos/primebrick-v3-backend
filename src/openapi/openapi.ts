export const openapi = {
  openapi: "3.0.3",
  info: {
    title: "Primebrick API",
    version: "0.1.0",
  },
  servers: [
    {
      url: "http://localhost:3001",
      description: "Local development server",
    },
  ],
  tags: [
    { name: "Customers", description: "Customer entity CRUD and metadata endpoints" },
    { name: "Organizations", description: "Organization entity CRUD and metadata endpoints" },
    { name: "Authentication", description: "Login, token refresh, and user profile endpoints" },
    { name: "MCP", description: "Model Context Protocol server endpoint for AI client integration" },
  ],
  paths: {
    "/mcp": {
      post: {
        tags: ["MCP"],
        summary: "MCP Server Endpoint",
        description:
          "Model Context Protocol (MCP) server endpoint. AI clients (Claude, ChatGPT, Cursor, VS Code) connect to this endpoint to access Primebrick tools for entity CRUD, discovery, and service management. Authentication uses OAuth 2.1 Bearer tokens — see the authorization flow at /mcp/oauth/authorize.",
        operationId: "mcpEndpoint",
        "x-mcp-server": {
          name: "primebrick",
          version: "1.0.0",
          tools: [
            { name: "list_entities", description: "List all available entities across all modules" },
            { name: "get_entity_meta", description: "Get metadata for a specific entity (fields, types, validation)" },
            { name: "list_records", description: "List records for a specific entity with search, filter, sort, pagination" },
            { name: "get_record", description: "Get a single record by UUID" },
            { name: "create_record", description: "Create a new record for a specific entity" },
            { name: "update_record", description: "Update an existing record by UUID" },
            { name: "delete_record", description: "Soft-delete a record by UUID" },
            { name: "restore_record", description: "Restore a soft-deleted record by UUID" },
            { name: "get_audit", description: "Get audit history for a specific record" },
            { name: "bulk_delete_records", description: "Bulk soft-delete multiple records by UUID" },
            { name: "list_services", description: "List all registered microservices in the service registry" },
          ],
        },
        responses: {
          "200": {
            description: "MCP JSON-RPC response (tools/list, tools/call, initialize, etc.)",
          },
          "401": {
            description: "Unauthorized — Bearer token required. See WWW-Authenticate header for OAuth 2.1 discovery endpoints.",
          },
          "405": {
            description: "Method not allowed — use POST for MCP requests.",
          },
        },
      },
    },
    "/api/v1/entities/customer/meta": {
      get: {
        tags: ["Customers"],
        summary: "Get customer UI metadata",
        "x-badges": [
          { name: "v1", color: "#38bdf8", position: "after" },
          { name: "Latest", color: "#22c55e", position: "after" },
        ],
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
        tags: ["Customers"],
        summary: "List customers",
        "x-badges": [
          { name: "v1", color: "#38bdf8", position: "after" },
          { name: "Latest", color: "#22c55e", position: "after" },
        ],
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
        tags: ["Customers"],
        summary: "Create customer",
        "x-badges": [
          { name: "v1", color: "#38bdf8", position: "after" },
          { name: "Latest", color: "#22c55e", position: "after" },
        ],
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
        tags: ["Customers"],
        summary: "Get customer detail",
        "x-badges": [
          { name: "v1", color: "#38bdf8", position: "after" },
          { name: "Latest", color: "#22c55e", position: "after" },
        ],
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
    "/api/v1/entities/organization/meta": {
      get: {
        tags: ["Organizations"],
        summary: "Get organization UI metadata",
        "x-badges": [
          { name: "v1", color: "#38bdf8", position: "after" },
          { name: "Latest", color: "#22c55e", position: "after" },
        ],
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
    "/api/v1/entities/organization/list": {
      get: {
        tags: ["Organizations"],
        summary: "List organizations",
        "x-badges": [
          { name: "v1", color: "#38bdf8", position: "after" },
          { name: "Latest", color: "#22c55e", position: "after" },
        ],
        parameters: [
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "search_in", in: "query", schema: { type: "string", description: "CSV of fields to search in (e.g. idp_code,uuid,display_name)" } },
          { name: "sort_key", in: "query", schema: { type: "string", enum: ["updated_at", "uuid", "idp_code", "display_name"] } },
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
                schema: { $ref: "#/components/schemas/EntityListResponseOrganization" },
              },
            },
          },
        },
      },
    },
    "/api/v1/entities/organization": {
      post: {
        tags: ["Organizations"],
        summary: "Create organization",
        "x-badges": [
          { name: "v1", color: "#38bdf8", position: "after" },
          { name: "Latest", color: "#22c55e", position: "after" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OrganizationCreateBody" },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OrganizationCreateResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/entities/organization/{uuid}": {
      get: {
        tags: ["Organizations"],
        summary: "Get organization detail",
        "x-badges": [
          { name: "v1", color: "#38bdf8", position: "after" },
          { name: "Latest", color: "#22c55e", position: "after" },
        ],
        parameters: [
          { name: "uuid", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OrganizationDetail" },
              },
            },
          },
          "404": { description: "Not found" },
        },
      },
    },
    "/api/v1/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login with username and password",
        "x-badges": [
          { name: "v1", color: "#38bdf8", position: "after" },
          { name: "Latest", color: "#22c55e", position: "after" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginResponse" },
              },
            },
          },
          "401": { description: "Invalid credentials" },
          "429": { description: "Too many login attempts" },
        },
      },
    },
    "/api/v1/auth/refresh": {
      post: {
        tags: ["Authentication"],
        summary: "Refresh access token using refresh token cookie",
        "x-badges": [
          { name: "v1", color: "#38bdf8", position: "after" },
          { name: "Latest", color: "#22c55e", position: "after" },
        ],
        responses: {
          "200": {
            description: "Token refreshed successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginResponse" },
              },
            },
          },
          "401": { description: "Refresh token missing or invalid" },
        },
      },
    },
    "/api/v1/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get current user profile",
        "x-badges": [
          { name: "v1", color: "#38bdf8", position: "after" },
          { name: "Latest", color: "#22c55e", position: "after" },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserProfile" },
              },
            },
          },
          "401": { description: "Not authenticated" },
        },
      },
      patch: {
        tags: ["Authentication"],
        summary: "Update current user profile",
        "x-badges": [
          { name: "v1", color: "#38bdf8", position: "after" },
          { name: "Latest", color: "#22c55e", position: "after" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserProfileUpdateBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "Profile updated successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserProfile" },
              },
            },
          },
          "401": { description: "Not authenticated" },
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
      OrganizationCreateBody: {
        type: "object",
        required: ["idp_code"],
        properties: {
          idp_code: { type: "string", maxLength: 255 },
          display_name: { type: "string", maxLength: 255 },
          website_url: { type: "string", format: "uri", maxLength: 2048 },
        },
      },
      OrganizationCreateResponse: {
        type: "object",
        required: ["success", "organization"],
        properties: {
          success: { type: "boolean" },
          organization: { $ref: "#/components/schemas/OrganizationDetail" },
        },
      },
      OrganizationDetail: {
        type: "object",
        required: ["uuid", "idp_code", "created_at", "updated_at", "version"],
        properties: {
          uuid: { type: "string", format: "uuid" },
          idp_code: { type: "string", maxLength: 255 },
          display_name: { type: "string", maxLength: 255 },
          website_url: { type: "string", format: "uri", maxLength: 2048 },
          user_count: { type: "integer" },
          created_at: {
            type: "string",
            format: "date-time",
            description:
              "DateTime (instant). Serialized as RFC3339 / ISO-8601 string with timezone (Z or +/-HH:MM).",
            examples: ["2026-04-16T12:01:44.606Z", "2026-04-16T12:01:44.606+02:00"],
          },
          created_by: { type: "string" },
          created_by_name: { type: "string" },
          updated_at: {
            type: "string",
            format: "date-time",
            description:
              "DateTime (instant). Serialized as RFC3339 / ISO-8601 string with timezone (Z or +/-HH:MM).",
            examples: ["2026-04-16T12:01:44.606Z", "2026-04-16T12:01:44.606+02:00"],
          },
          updated_by: { type: "string" },
          updated_by_name: { type: "string" },
          last_synced_at: {
            type: "string",
            format: "date-time",
            description:
              "DateTime (instant). Serialized as RFC3339 / ISO-8601 string with timezone (Z or +/-HH:MM).",
            examples: ["2026-04-16T12:01:44.606Z", "2026-04-16T12:01:44.606+02:00"],
          },
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
      EntityListResponseOrganization: {
        type: "object",
        required: ["rows", "page", "page_size", "total"],
        properties: {
          rows: { type: "array", items: { $ref: "#/components/schemas/OrganizationDetail" } },
          page: { type: "integer" },
          page_size: { type: "integer" },
          total: { type: "integer" },
        },
      },
      LoginBody: {
        type: "object",
        required: ["username", "password"],
        properties: {
          username: { type: "string" },
          password: { type: "string" },
        },
      },
      LoginResponse: {
        type: "object",
        required: ["success", "user"],
        properties: {
          success: { type: "boolean" },
          user: { $ref: "#/components/schemas/User" },
        },
      },
      User: {
        type: "object",
        required: ["username", "display_name", "email", "expires_at", "roles"],
        properties: {
          username: { type: "string" },
          display_name: { type: "string" },
          email: { type: "string", format: "email" },
          organization: { type: "string" },
          expires_at: { type: "integer", description: "Expiration timestamp in milliseconds" },
          roles: {
            type: "array",
            items: { $ref: "#/components/schemas/Role" },
          },
        },
      },
      Role: {
        type: "object",
        required: ["name", "display_name", "owner"],
        properties: {
          name: { type: "string" },
          display_name: { type: "string" },
          owner: { type: "string" },
        },
      },
      UserProfile: {
        type: "object",
        required: ["uuid", "idp_code", "email", "display_name", "created_at", "updated_at", "version"],
        properties: {
          uuid: { type: "string", format: "uuid" },
          idp_code: { type: "string" },
          idp_org: { type: "string" },
          idp_username: { type: "string" },
          email: { type: "string", format: "email" },
          display_name: { type: "string" },
          avatar_color: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
          avatar_initials: { type: "string" },
          is_active: { type: "boolean" },
          is_admin: { type: "boolean" },
          roles: { type: "array", items: { type: "string" } },
          created_at: { type: "string", format: "date-time" },
          created_by: { type: "string" },
          created_by_name: { type: "string" },
          updated_at: { type: "string", format: "date-time" },
          updated_by: { type: "string" },
          updated_by_name: { type: "string" },
          version: { type: "integer" },
          deleted_at: { type: "string", format: "date-time" },
          deleted_by: { type: "string" },
          deleted_by_name: { type: "string" },
        },
      },
      UserProfileUpdateBody: {
        type: "object",
        properties: {
          display_name: { type: "string" },
          email: { type: "string", format: "email" },
          avatar_color: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
          avatar_initials: { type: "string" },
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
                    formDescription: { type: "string", description: "i18n key for form help tooltip (deprecated — use tooltip + showFormTooltip)" },
                    listDescription: { type: "string", description: "i18n key for list header help tooltip (deprecated — use tooltip + showListTooltip)" },
                    tooltip: { type: "string", description: "i18n key for tooltip content shown in form and/or list contexts" },
                    tooltipPriority: { type: "string", enum: ["INFORMATION", "WARNING", "ERROR", "QUESTION", "HINT", "SUCCESS"], description: "Priority/severity for tooltip icon and title color" },
                    tooltipTitle: { type: "string", description: "i18n key for tooltip title (shown in priority color)" },
                    showFormTooltip: { type: "boolean", description: "Show tooltip in form context (default: true if tooltip is set)" },
                    showListTooltip: { type: "boolean", description: "Show tooltip in list/table/card context (default: true if tooltip is set)" },
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

