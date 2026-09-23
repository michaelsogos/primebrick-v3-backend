-- Cerebellum tuning rows for onnx-community/Llama-3.2-3B-Instruct-ONNX#q4f16.
-- Same overrides for both assistants: temp 0.10, max_tokens 512,
-- repetition_penalty 1.00 (JSON keys repeat legitimately — 1.1 penalizes them),
-- kv_cache_reuse=false (aligned with all other json_config cerebellum rows).
-- Measured effect on json assistant E2E: 5/5 exact vs 1/5 on model defaults.
INSERT INTO ai_cerebellum (uuid, assistant_key, model_id, name, enable_thinking, temperature, top_p, max_tokens, repetition_penalty, execution_config, is_enabled, sort_order, version, created_by, updated_by)
VALUES (gen_random_uuid(), 'json_config', 'onnx-community/Llama-3.2-3B-Instruct-ONNX#q4f16', 'app.smart.json.ai.cerebellum_name', NULL, 0.10, NULL, 512, 1.00, '{"kv_cache_reuse":false}', true, 100, 1, 'devin', 'devin');
INSERT INTO ai_cerebellum (uuid, assistant_key, model_id, name, enable_thinking, temperature, top_p, max_tokens, repetition_penalty, execution_config, is_enabled, sort_order, version, created_by, updated_by)
VALUES (gen_random_uuid(), 'regex', 'onnx-community/Llama-3.2-3B-Instruct-ONNX#q4f16', 'app.smart.regex.ai.cerebellum_name', NULL, 0.10, NULL, 512, 1.00, '{"kv_cache_reuse":false}', true, 100, 1, 'devin', 'devin');
