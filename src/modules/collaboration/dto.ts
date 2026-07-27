/**
 * Collaboration module — request/response DTOs and zod schemas.
 *
 * Conventions (mirror `src/modules/auth/dto.ts`):
 *   - `*BodySchema`   → validates `req.body` (use with `validateBody`).
 *   - `*Response`     → the JSON shape returned to the frontend (View).
 *
 * snake_case everywhere per `data-model-conventions.md`.
 */

import { z } from "zod";

// --- Presence signal (POST body) -----------------------------------------

export const PresenceSignalSchema = z.object({
  action: z.enum(["READING", "EDITING", "LEAVE", "HEARTBEAT"]),
  field: z.string().optional(),
  value: z.unknown().optional(),
  loaded_version: z.number().int().nonnegative().optional(),
  session_id: z.string().uuid().optional(),
});
export type PresenceSignalBody = z.infer<typeof PresenceSignalSchema>;

// --- Audit diff response (GET audit/:auditLogId) -------------------------

export interface AuditDiffResponse {
  audit_log_id: number;
  entity_type: string;
  entity_uuid: string;
  version: number;
  changed_by: string;
  changed_at: number;
  delta: Record<string, { old: unknown; new: unknown }>;
}
