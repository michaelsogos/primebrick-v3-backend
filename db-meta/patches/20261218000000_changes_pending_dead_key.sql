-- app.common.changes_pending — DEAD + BROKEN key, soft-deleted.
-- Broken: every language value embedded a JS ternary
-- ("{count} {count === 1 ? 'x' : 'y'}") that $t() never evaluates —
-- interpolate() covers {var} placeholders only, so the expression
-- rendered literally. Dead: zero call sites across FE/BE/UI/SDK/
-- US/core/dal/website (the live vocabulary is
-- system.settings.configurations.changes_pending_*).
-- The camelCase twin app.common.changesPending was already soft-deleted
-- by the snake cleanup; its stale copy inside the generated
-- en-GB-fallback.json disappears on the next i18n-fallback regen.

UPDATE "public"."translations"
SET "deleted_at" = '2026-12-18T00:00:00Z', "deleted_by" = 'migration-changes-pending-retire'
WHERE "key" = 'app.common.changes_pending' AND "deleted_at" IS NULL;
