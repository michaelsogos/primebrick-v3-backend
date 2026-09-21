-- Drop ai_cerebellum.is_default — the concept was wrong by design.
-- Cerebellum rows are per-(assistant_key, model_id) tunings, all equal;
-- the selected assistant's dedicated tuning is auto-selected on open, and
-- "defaults" live on the model (ai_models), never on a cerebellum row.
ALTER TABLE public.ai_cerebellum DROP COLUMN IF EXISTS is_default;
