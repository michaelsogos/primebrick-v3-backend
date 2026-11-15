-- translations created_at repair — 42 rows (app.smart.regex.explainer.*,
-- all 7 locales) carry created_at = 2026-09-08 21:08:44.248275, a one-off
-- mass-rewrite instant that postdates their updated_at (2026-05-18
-- 14:27:00, the original seed stamp). public.translations has no audit
-- table, so the earliest surviving evidence is updated_at itself.
--
-- Repair restores the invariant created_at <= updated_at by collapsing
-- created_at onto updated_at ("created and last touched at the same
-- time" — the only defensible reading without a trail). Predicate is the
-- invariant violation itself: self-scoping, touches exactly the 42
-- corrupted rows.

UPDATE public.translations
SET created_at = updated_at
WHERE created_at > updated_at;
