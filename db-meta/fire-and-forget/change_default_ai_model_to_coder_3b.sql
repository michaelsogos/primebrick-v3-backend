-- Change default AI assistant model to Qwen2.5 Coder 3B
-- Best balance of precision and speed after 5-turn regression testing
-- Previous default: Qwen2.5-1.5B-Instruct-q4f16_1-MLC
UPDATE auth_configurations
SET value = 'Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC',
    updated_at = NOW(),
    updated_by = 'system',
    version = version + 1
WHERE key = 'ai_assistant_model'
  AND value = 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC';
