/**
 * MCP tool invocation over REST (system RPC).
 *
 * POST /api/v1/system/mcp/call
 *
 * Body: { tool: string, args: Record<string, unknown> }
 *
 * Lets the browser-local Guide assistant invoke the generic entity/service
 * tools (`create_entity`, `list_entities`, `manage_service`, …) without an
 * MCP JSON-RPC session. Thin controller: RBAC `AUTHENTICATED_USER` here +
 * per-tool `checkRbac` inside the shared handlers — same enforcement as MCP.
 */

import { z } from "zod";

import { makeProtectedRouter } from "../../http/protected-router.js";
import { rbacHandler } from "../../modules/auth/rbac.middleware.js";
import { Permission } from "@primebrick/sdk";
import { asyncHandler } from "../../http/async-handler.js";
import { validateBody } from "../../http/validation.js";
import { UnauthorizedError } from "../../http/api-errors.js";
import { McpCallService } from "../../modules/mcp/mcp-call.service.js";

const McpCallBodySchema = z.object({
  tool: z.string().min(1).max(100),
  args: z.record(z.string(), z.unknown()).default({}),
});

export function mcpCallRouter() {
  const router = makeProtectedRouter();
  const service = new McpCallService();

  router.post(
    "/api/v1/system/mcp/call",
    rbacHandler([Permission.AUTHENTICATED_USER]),
    validateBody(McpCallBodySchema),
    asyncHandler(async (req, res) => {
      if (!req.user) {
        throw new UnauthorizedError("No authenticated user", {
          internal_code: "UNAUTHORIZED",
        });
      }
      const { tool, args } = req.body as z.infer<typeof McpCallBodySchema>;
      const result = await service.call(
        req.user,
        req.rawAccessToken ?? "",
        tool,
        args,
      );
      res.status(result.status).json(result);
    }),
  );

  return router;
}
