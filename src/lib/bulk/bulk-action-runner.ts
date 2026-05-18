/**
 * Module-agnostic helper that executes a per-uuid action with uniform RFC 7807
 * partial-failure semantics.
 *
 * Each module owns its own bulk endpoint URL (per the secure-first / no-global
 * controller policy), but the **logic** of iterating over uuids, classifying
 * errors as 422 (business) vs 500 (infrastructure), and producing a partial-
 * failure body is identical. This helper centralizes that logic so each module
 * router can simply provide:
 *
 *   - the per-uuid action (`(uuid) => Promise<void>`)
 *   - the URL it's running on (for `instance` field of error payloads)
 *   - the human label (singular/plural for the message)
 *
 * Errors classified as 422:
 *   - "No rows affected" / "record not found"
 *   - "foreign key" / "violates foreign key" (delete only — caller decides via
 *     `kind`).
 *
 * Anything else is treated as infrastructure failure: the runner aborts the
 * loop and returns a 500-shape result so the route can re-throw / send 500.
 *
 * Usage:
 *   const outcome = await runBulkAction({
 *     kind: "delete",
 *     uuids,
 *     instance: req.originalUrl,
 *     entityLabel: "customer",
 *     run: (uuid) => repo.delete(CustomerEntity, uuid, requireActor()),
 *   });
 *   sendBulkOutcome(res, outcome);
 */

import type { Response } from "express";

export type BulkActionKind = "delete" | "restore";

export interface BulkActionInput {
  kind: BulkActionKind;
  uuids: readonly string[];
  /** `req.originalUrl` for the RFC 7807 `instance` field. */
  instance: string;
  /** Singular entity label, used for the human-readable error detail. */
  entityLabel: string;
  /** Per-uuid worker. Throw to mark the uuid as failed. */
  run: (uuid: string) => Promise<void>;
}

interface BulkOutcomeOk {
  status: 204;
}

interface BulkOutcomePartial {
  status: 422;
  body: import("../../http/api-errors.js").ApiErrorResponse;
}

interface BulkOutcomeFatal {
  status: 500;
  body: import("../../http/api-errors.js").ApiErrorResponse;
}

export type BulkOutcome = BulkOutcomeOk | BulkOutcomePartial | BulkOutcomeFatal;

function classify(kind: BulkActionKind, message: string): "business" | "infra" {
  const lower = message.toLowerCase();
  if (lower.includes("no rows affected") || lower.includes("record not found")) {
    return "business";
  }
  if (kind === "delete") {
    if (lower.includes("foreign key") || lower.includes("violates foreign key")) {
      return "business";
    }
  }
  return "infra";
}

export async function runBulkAction(input: BulkActionInput): Promise<BulkOutcome> {
  const { kind, uuids, instance, entityLabel, run } = input;
  const ok: string[] = [];
  const failed: Array<{ uuid: string; error: string }> = [];

  for (const uuid of uuids) {
    try {
      await run(uuid);
      ok.push(uuid);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(`[bulk-${kind} ${entityLabel}:${uuid}]`, e);
      const cls = classify(kind, message);
      if (cls === "business") {
        failed.push({ uuid, error: message });
      } else {
        return {
          status: 500,
          body: {
            type: `/errors/bulk-${kind}-failed`,
            title: `Bulk ${kind} failed`,
            status: 500,
            detail: `An unexpected error occurred during bulk ${kind}`,
            instance,
            internal_code: `BULK_${kind.toUpperCase()}_FAILED`,
            severity: "HIGH",
            extra: { issues: { error_details: message } },
          },
        };
      }
    }
  }

  if (failed.length === 0) {
    return { status: 204 };
  }

  return {
    status: 422,
    body: {
      type: "/errors/partial-failure",
      title: `Partial bulk ${kind} failure`,
      status: 422,
      detail: `${failed.length} of ${uuids.length} ${entityLabel} records could not be ${kind}d`,
      instance,
      internal_code: "PARTIAL_FAILURE",
      severity: "HIGH",
      extra: { issues: { successful: ok, failed } },
    },
  };
}

/** Convenience: write the BulkOutcome to the response. */
export function sendBulkOutcome(res: Response, outcome: BulkOutcome): void {
  if (outcome.status === 204) {
    res.status(204).send();
    return;
  }
  res.status(outcome.status).json(outcome.body);
}
