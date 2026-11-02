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

import { zBoundedInt } from "../../http/validation.js";

// --- Presence signal (POST body) -----------------------------------------

export const PresenceSignalSchema = z.object({
  action: z.enum(["READING", "EDITING", "LEAVE", "HEARTBEAT"]),
  field: z.string().optional(),
  value: z.unknown().optional(),
  loaded_version: zBoundedInt(0, Number.MAX_SAFE_INTEGER).optional(),
  session_id: z.string().uuid().optional(),
});
export type PresenceSignalBody = z.infer<typeof PresenceSignalSchema>;
