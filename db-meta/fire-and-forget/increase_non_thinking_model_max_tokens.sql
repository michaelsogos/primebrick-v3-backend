-- Increase max_tokens from 256 to 1024 for compatible non-thinking models
-- These models (Qwen2.5, Phi-4, Llama, Qwen2.5 Coder) generate JSON directly
-- but 256 tokens was cutting off complex regex patterns (phone, VAT) mid-output
UPDATE ai_models
SET max_tokens = 1024,
    updated_at = NOW(),
    updated_by = 'system',
    version = version + 1
WHERE compatibility_status = 'COMPATIBLE'
  AND max_tokens = 256;
