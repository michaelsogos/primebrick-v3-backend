/**
 * McpCallService — invoke the generic MCP tools over REST.
 *
 * Single service path for POST /api/v1/system/mcp/call: builds the AuthInfo
 * from the HTTP session (same shape the MCP bearer middleware produces via
 * `authUserToAuthInfo`) and delegates to `invokeGenericTool` — the SAME
 * wrapped handlers registered on the MCP server, so validation, RBAC
 * (checkRbac) and dispatch are shared. No AI-specific logic lives here.
 */
import type { AuthUser } from "@primebrick/sdk";
import { extJsonParse } from "@primebrick/sdk";
import type { AuthInfo } from "@modelcontextprotocol/server";

import { authUserToAuthInfo } from "./token-verifier.js";
import { invokeGenericTool } from "./tools/generic-tools.js";

export interface McpCallResult {
  ok: boolean;
  /** Parsed tool payload (entity record, list page, etc.) on success. */
  result?: unknown;
  /** Error message when `ok` is false (RBAC denial, validation, …). */
  error?: string;
  /**
   * HTTP-ish status hint for the controller: 403 for permission denial,
   * 404 for unknown entity/tool, 400 otherwise.
   */
  status: number;
}

/**
 * Normalize args coming over HTTP: `extJsonBodyParser` decodes every JSON
 * integer as bigint, but the MCP tool arg schemas (shared with the JSON-RPC
 * transport, where ints arrive as plain numbers) expect `number`. Convert
 * bigint → number only when the value is a safe integer — a bigint beyond
 * ±2^53 is left untouched so it fails validation loudly instead of being
 * silently truncated.
 */
function normalizeArgNumbers(v: unknown): unknown {
  if (typeof v === "bigint") {
    return v <= BigInt(Number.MAX_SAFE_INTEGER) &&
      v >= BigInt(-Number.MAX_SAFE_INTEGER)
      ? Number(v)
      : v;
  }
  if (Array.isArray(v)) return v.map(normalizeArgNumbers);
  if (v !== null && typeof v === "object") {
    return Object.fromEntries(
      Object.entries(v as Record<string, unknown>).map(([k, x]) => [
        k,
        normalizeArgNumbers(x),
      ]),
    );
  }
  return v;
}

export class McpCallService {
  async call(
    user: AuthUser,
    token: string,
    tool: string,
    args: Record<string, unknown>,
  ): Promise<McpCallResult> {
    const authInfo: AuthInfo = authUserToAuthInfo(user, token);
    const toolResult = await invokeGenericTool(
      tool,
      normalizeArgNumbers(args) as Record<string, unknown>,
      authInfo,
    );

    const text =
      toolResult.content[0]?.type === "text" ? toolResult.content[0].text : "";

    if (toolResult.isError) {
      const status = text.startsWith("Permission denied")
        ? 403
        : /not found|Unknown tool/i.test(text)
          ? 404
          : 400;
      return { ok: false, error: text, status };
    }

    // Tool payloads are extJsonStringify'd by textResult — parse them back so
    // the HTTP response carries real JSON (bigint-safe via res.json extJson).
    let result: unknown = text;
    try {
      result = extJsonParse(text);
    } catch {
      // Non-JSON text payload — return as-is.
    }
    return { ok: true, result, status: 200 };
  }
}
