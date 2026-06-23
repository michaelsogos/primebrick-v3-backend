/**
 * Auth module — request/response DTOs and zod schemas.
 *
 * Consolidates the schemas that were previously inlined in `router.ts` so they
 * can be shared between the thin controllers and the services, and so the
 * contract is scannable in one place.
 *
 * Conventions:
 *   - `*BodySchema`   → validates `req.body` (use with `validateBody`).
 *   - `*QuerySchema`  → validates `req.query` (use with `validateQuery`).
 *   - `*ParamSchema`  → validates `req.params` (used inline in controllers).
 *   - `*Response`     → the JSON shape returned to the frontend (View).
 */

import { z } from "zod";

// --- Session (login / refresh / me) ---------------------------------------

export const LoginBodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
export type LoginBody = z.infer<typeof LoginBodySchema>;

export const ProfileUpdateSchema = z
  .object({
    display_name: z.string().optional(),
    email: z.string().email().optional(),
    avatar_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    avatar_initials: z.string().min(1).optional(),
  })
  .strict();
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;

/** Response shape for `POST /api/v1/auth/login` (success case). */
export interface LoginSuccessResponse {
  success: true;
  user: {
    username: string;
    display_name: string;
    email: string;
    organization: string;
    expires_at: number;
    roles: Array<{ name: string; display_name: string; owner: string }>;
  };
}

// --- Admin user management ------------------------------------------------

export const CreateUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(8),
  display_name: z.string().min(1),
  email: z.string().email(),
  roles: z.array(z.string()).optional(),
  avatar_initials: z.string().optional(),
  avatar_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  idp_org: z.string().optional(),
  is_active: z.boolean().default(false),
  is_admin: z.boolean().default(false),
  is_verified: z.boolean().default(false),
  email_verified: z.boolean().default(false),
});
export type CreateUserBody = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z
  .object({
    display_name: z.string().optional(),
    email: z.string().email().optional(),
    avatar_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    is_active: z.boolean().optional(),
    is_admin: z.boolean().optional(),
    is_verified: z.boolean().optional(),
    email_verified: z.boolean().optional(),
    roles: z.array(z.string()).optional(),
  })
  .strict();
export type UpdateUserBody = z.infer<typeof UpdateUserSchema>;

// --- User profiles entity CRUD --------------------------------------------

export const UuidParamSchema = z.object({ uuid: z.string().uuid() });
export type UuidParam = z.infer<typeof UuidParamSchema>;

export const UserProfileAuditQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});
export type UserProfileAuditQuery = z.infer<typeof UserProfileAuditQuerySchema>;

export const UserUpdateBodySchema = z
  .object({
    display_name: z.string().max(255).optional(),
    email: z.string().email().max(320).optional().or(z.literal("")),
    avatar_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    avatar_initials: z.string().min(1).max(10).optional(),
    roles: z.array(z.string()).optional(),
  })
  .strict();
export type UserUpdateBody = z.infer<typeof UserUpdateBodySchema>;
