# Devin Rule: API Path Conventions

## Trigger
- Applies to ALL code in this repository that defines HTTP routes, OpenAPI specs,
  or route handlers.

## Canonical doc
**`docs/ai/api-path-conventions.md` — read it before acting.** This file is a
pointer; the normative text lives in the canonical doc.

## Enforcement
- AI agent MUST use the `/api/v1/entities/:entity/...` pattern for ALL
  new entity CRUD routes.
- AI agent MUST use snake_case **singular** for the `:entity` path segment.
- AI agent MUST NOT create entity routes outside the `/api/v1/entities/` prefix.
- AI agent MUST NOT move MCP endpoints under any other prefix.
- AI agent MUST use PascalCase **singular** for entity class names.
- AI agent MUST use snake_case **plural** for `@Entity` table names.
- When reviewing existing code, flag any plural entity segments in URLs as
  violations (deferred fixes documented in the endpoint taxonomy plan).
