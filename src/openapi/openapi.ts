export const openapi = {
  openapi: "3.0.3",
  info: {
    title: "System Catalog",
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
    { name: "MCP OAuth", description: "OAuth 2.1 endpoints for MCP server authentication (RFC 9728, RFC 8414, RFC 7591)" },
  ],
  paths: {
    "/mcp": {
      post: {
        tags: ["MCP"],
        summary: "MCP Server Endpoint",
        description:
          "Model Context Protocol (MCP) server endpoint. AI clients (Claude, ChatGPT, Cursor, VS Code) connect to this endpoint to access Primebrick tools for entity CRUD, discovery, and service management. Authentication uses OAuth 2.1 Bearer tokens — see the authorization flow at /mcp/oauth/authorize.\n\n## Available Tools\n\nThe MCP server exposes 11 generic tools that work across all registered entities:\n\n| Tool | Description |\n|------|-------------|\n| `list_entities` | List all available entities across all modules |\n| `get_entity_meta` | Get metadata for a specific entity |\n| `list_records` | List records with search, filter, sort, pagination |\n| `get_record` | Get a single record by UUID |\n| `create_record` | Create a new record |\n| `update_record` | Update an existing record by UUID |\n| `delete_record` | Soft-delete a record by UUID |\n| `restore_record` | Restore a soft-deleted record by UUID |\n| `get_audit` | Get audit history for a specific record |\n| `bulk_delete_records` | Bulk soft-delete multiple records |\n| `list_services` | List all registered microservices |\n\n## Authentication\n\nSend a Bearer token in the `Authorization` header. The token is obtained via the OAuth 2.1 Authorization Code flow — see the [MCP OAuth endpoints](#tag/MCP-OAuth) for details.\n\n## JSON-RPC Protocol\n\nThe MCP server uses JSON-RPC 2.0 over HTTP. Each request is a single JSON-RPC object (batch requests are not supported in stateless mode).",
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
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/McpJsonRpcRequest" },
              examples: {
                initialize: {
                  summary: "Initialize session",
                  value: {
                    jsonrpc: "2.0",
                    id: 1,
                    method: "initialize",
                    params: {
                      protocolVersion: "2025-06-18",
                      capabilities: {},
                      clientInfo: { name: "claude-desktop", version: "1.0.0" },
                    },
                  },
                },
                toolsList: {
                  summary: "List available tools",
                  value: {
                    jsonrpc: "2.0",
                    id: 2,
                    method: "tools/list",
                    params: {},
                  },
                },
                toolsCall: {
                  summary: "Call a tool — list customers",
                  value: {
                    jsonrpc: "2.0",
                    id: 3,
                    method: "tools/call",
                    params: {
                      name: "list_records",
                      arguments: {
                        module: "be",
                        entity: "customers",
                        page: 1,
                        page_size: 20,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "MCP JSON-RPC response (tools/list, tools/call, initialize, etc.)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/McpJsonRpcResponse" },
                examples: {
                  toolsList: {
                    summary: "Response: tools/list",
                    value: {
                      jsonrpc: "2.0",
                      id: 2,
                      result: {
                        tools: [
                          {
                            name: "list_entities",
                            description: "List all available entities across all modules",
                            inputSchema: {
                              type: "object",
                              properties: {
                                module: { type: "string", description: "Filter by module (e.g. 'be', 'emailsender')" },
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                  toolsCall: {
                    summary: "Response: tools/call (list_records)",
                    value: {
                      jsonrpc: "2.0",
                      id: 3,
                      result: {
                        content: [
                          {
                            type: "text",
                            text: '{"data":[{"uuid":"...","code":"ACME","email":"info@acme.com"}],"total":42,"page":1,"page_size":20}',
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Bad request — invalid JSON-RPC payload or unknown method",
          },
          "401": {
            description: "Unauthorized — Bearer token required. See WWW-Authenticate header for OAuth 2.1 discovery endpoints.",
            headers: {
              "WWW-Authenticate": {
                description: "Bearer challenge with resource_metadata URL (RFC 9728)",
                schema: { type: "string" },
              },
            },
          },
          "405": {
            description: "Method not allowed — use POST for MCP requests.",
          },
        },
      },
    },
    "/.well-known/oauth-protected-resource/mcp": {
      get: {
        tags: ["MCP OAuth"],
        summary: "Protected Resource Metadata (RFC 9728)",
        description:
          "Returns metadata about the MCP protected resource, including the authorization server URL. AI clients use this to discover where to obtain access tokens.",
        operationId: "getProtectedResourceMetadata",
        responses: {
          "200": {
            description: "Protected Resource Metadata",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProtectedResourceMetadata" },
              },
            },
          },
        },
      },
    },
    "/.well-known/oauth-authorization-server": {
      get: {
        tags: ["MCP OAuth"],
        summary: "Authorization Server Metadata (RFC 8414)",
        description:
          "Returns metadata about the OAuth 2.1 authorization server, including endpoints, supported grant types, and scopes. AI clients use this to discover the authorization and token endpoints.",
        operationId: "getAuthorizationServerMetadata",
        responses: {
          "200": {
            description: "Authorization Server Metadata",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthorizationServerMetadata" },
              },
            },
          },
        },
      },
    },
    "/mcp/oauth/register": {
      post: {
        tags: ["MCP OAuth"],
        summary: "Dynamic Client Registration (RFC 7591)",
        description:
          "Registers a new OAuth client. AI clients call this endpoint to obtain a client_id and client_secret before initiating the authorization flow.",
        operationId: "registerOAuthClient",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/DcrRequest" },
              examples: {
                default: {
                  summary: "Register an AI client",
                  value: {
                    client_name: "Claude Desktop",
                    redirect_uris: ["http://localhost:8080/callback"],
                    grant_types: ["authorization_code"],
                    response_types: ["code"],
                    token_endpoint_auth_method: "client_secret_post",
                    scope: "mcp:tools",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Client registered successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DcrResponse" },
              },
            },
          },
          "400": {
            description: "Invalid registration request",
          },
        },
      },
    },
    "/mcp/oauth/authorize": {
      get: {
        tags: ["MCP OAuth"],
        summary: "Authorization Endpoint",
        description:
          "Initiates the OAuth 2.1 Authorization Code flow. Redirects the user to the Primebrick consent screen, then to Casdoor for authentication. On approval, redirects back with an authorization code. On denial, redirects back with `error=access_denied`.\n\n**Parameters:**\n- `response_type` — must be `code`\n- `client_id` — from DCR registration\n- `redirect_uri` — must match a registered redirect URI\n- `scope` — requested scopes (e.g. `mcp:tools`)\n- `state` — client-generated state for CSRF protection\n- `code_challenge` / `code_challenge_method` — PKCE parameters (recommended)",
        operationId: "authorize",
        parameters: [
          { name: "response_type", in: "query", required: true, schema: { type: "string", enum: ["code"] } },
          { name: "client_id", in: "query", required: true, schema: { type: "string" } },
          { name: "redirect_uri", in: "query", required: true, schema: { type: "string", format: "uri" } },
          { name: "scope", in: "query", required: false, schema: { type: "string" } },
          { name: "state", in: "query", required: false, schema: { type: "string" } },
          { name: "code_challenge", in: "query", required: false, schema: { type: "string" } },
          { name: "code_challenge_method", in: "query", required: false, schema: { type: "string", enum: ["S256"] } },
        ],
        responses: {
          "302": {
            description: "Redirect to consent screen (or Casdoor if consent already approved). On success, redirects to `redirect_uri` with `code` and `state`. On denial, redirects with `error=access_denied`.",
            headers: {
              Location: { schema: { type: "string" } },
            },
          },
          "400": {
            description: "Invalid authorization request (missing required parameters or invalid client_id)",
          },
        },
      },
    },
    "/mcp/oauth/token": {
      post: {
        tags: ["MCP OAuth"],
        summary: "Token Endpoint",
        description:
          "Exchanges an authorization code for an access token (and optional refresh token). The BE proxies the request to Casdoor's token endpoint using its own OIDC client credentials.\n\n**Content-Type:** `application/x-www-form-urlencoded`",
        operationId: "exchangeToken",
        requestBody: {
          required: true,
          content: {
            "application/x-www-form-urlencoded": {
              schema: { $ref: "#/components/schemas/TokenRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Token response",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TokenResponse" },
              },
            },
          },
          "400": {
            description: "Invalid token request (invalid code, expired code, invalid client credentials)",
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
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "OAuth 2.1 Bearer token obtained via the Authorization Code flow. See /.well-known/oauth-authorization-server for discovery endpoints.",
      },
    },
    schemas: {
      McpJsonRpcRequest: {
        type: "object",
        required: ["jsonrpc", "method", "id"],
        properties: {
          jsonrpc: { type: "string", enum: ["2.0"] },
          id: { oneOf: [{ type: "string" }, { type: "number" }] },
          method: {
            type: "string",
            enum: ["initialize", "ping", "tools/list", "tools/call"],
            description: "JSON-RPC method name",
          },
          params: {
            type: "object",
            description: "Method-specific parameters. For tools/call, includes `name` (tool name) and `arguments` (tool arguments).",
          },
        },
      },
      McpJsonRpcResponse: {
        type: "object",
        required: ["jsonrpc", "id"],
        properties: {
          jsonrpc: { type: "string", enum: ["2.0"] },
          id: { oneOf: [{ type: "string" }, { type: "number" }] },
          result: {
            type: "object",
            description: "Result object (present on success). Structure depends on the method called.",
          },
          error: {
            type: "object",
            properties: {
              code: { type: "integer" },
              message: { type: "string" },
              data: { type: "object" },
            },
          },
        },
      },
      ProtectedResourceMetadata: {
        type: "object",
        description: "RFC 9728 Protected Resource Metadata",
        properties: {
          resource: { type: "string", description: "URL of the protected resource (the MCP endpoint)" },
          authorization_servers: { type: "array", items: { type: "string" } },
          bearer_methods_supported: { type: "array", items: { type: "string" } },
          resource_name: { type: "string" },
        },
      },
      AuthorizationServerMetadata: {
        type: "object",
        description: "RFC 8414 Authorization Server Metadata",
        properties: {
          issuer: { type: "string" },
          authorization_endpoint: { type: "string" },
          token_endpoint: { type: "string" },
          registration_endpoint: { type: "string" },
          response_types_supported: { type: "array", items: { type: "string" } },
          grant_types_supported: { type: "array", items: { type: "string" } },
          code_challenge_methods_supported: { type: "array", items: { type: "string" } },
          scopes_supported: { type: "array", items: { type: "string" } },
        },
      },
      DcrRequest: {
        type: "object",
        description: "RFC 7591 Dynamic Client Registration request",
        required: ["client_name", "redirect_uris"],
        properties: {
          client_name: { type: "string" },
          redirect_uris: { type: "array", items: { type: "string" } },
          grant_types: { type: "array", items: { type: "string" } },
          response_types: { type: "array", items: { type: "string" } },
          token_endpoint_auth_method: { type: "string" },
          scope: { type: "string" },
        },
      },
      DcrResponse: {
        type: "object",
        description: "RFC 7591 Dynamic Client Registration response",
        properties: {
          client_id: { type: "string" },
          client_secret: { type: "string" },
          client_id_issued_at: { type: "integer" },
          client_name: { type: "string" },
          redirect_uris: { type: "array", items: { type: "string" } },
          grant_types: { type: "array", items: { type: "string" } },
          response_types: { type: "array", items: { type: "string" } },
          token_endpoint_auth_method: { type: "string" },
          scope: { type: "string" },
        },
      },
      TokenRequest: {
        type: "object",
        description: "OAuth 2.1 token exchange request (application/x-www-form-urlencoded)",
        required: ["grant_type", "code", "redirect_uri", "client_id"],
        properties: {
          grant_type: { type: "string", enum: ["authorization_code"] },
          code: { type: "string", description: "Authorization code from the authorize endpoint" },
          redirect_uri: { type: "string" },
          client_id: { type: "string" },
          client_secret: { type: "string" },
          code_verifier: { type: "string", description: "PKCE code verifier" },
        },
      },
      TokenResponse: {
        type: "object",
        description: "OAuth 2.1 token response",
        properties: {
          access_token: { type: "string" },
          token_type: { type: "string", enum: ["Bearer"] },
          expires_in: { type: "integer" },
          refresh_token: { type: "string" },
          scope: { type: "string" },
        },
      },
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

