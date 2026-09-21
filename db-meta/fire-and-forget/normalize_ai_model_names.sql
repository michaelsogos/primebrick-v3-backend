-- Fire-and-forget patch: normalize ai_models.name.
--
-- Canonical shape: "<human name with param count> (<dtype>)".
-- Fixes: duplicated "(x) (x) (x)" suffixes, "(int8)" → "(q8)" matching the
-- model_id dtype token, and MLC rows missing the "(q4f16)" suffix.

BEGIN;

UPDATE public.ai_models SET name = 'Gemma 2 2B (q4f16)', updated_at = now() WHERE model_id = 'gemma-2-2b-it-q4f16_1-MLC';
UPDATE public.ai_models SET name = 'Gemma 2 2B (q4f16)', updated_at = now() WHERE model_id = 'gemma-2b-it-q4f16_1-MLC';
UPDATE public.ai_models SET name = 'Gemma 3 1B (q4f16)', updated_at = now() WHERE model_id = 'gemma3-1b-it-q4f16_1-MLC';
UPDATE public.ai_models SET name = 'Hermes 3 Llama 3.2 3B (q4f16)', updated_at = now() WHERE model_id = 'Hermes-3-Llama-3.2-3B-q4f16_1-MLC';
UPDATE public.ai_models SET name = 'SmolLM3 3B (bnb4)', updated_at = now() WHERE model_id = 'HuggingFaceTB/SmolLM3-3B-ONNX#bnb4';
UPDATE public.ai_models SET name = 'SmolLM3 3B (q8)', updated_at = now() WHERE model_id = 'HuggingFaceTB/SmolLM3-3B-ONNX#q8';
UPDATE public.ai_models SET name = 'Llama 3.2 1B (q4f16)', updated_at = now() WHERE model_id = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';
UPDATE public.ai_models SET name = 'Llama 3.2 3B (q4f16)', updated_at = now() WHERE model_id = 'Llama-3.2-3B-Instruct-q4f16_1-MLC';
UPDATE public.ai_models SET name = 'Ministral 3 3B Instruct (q4f16)', updated_at = now() WHERE model_id = 'Ministral-3-3B-Instruct-2512-BF16-q4f16_1-MLC';
UPDATE public.ai_models SET name = 'Ministral 3 3B Reasoning (q4f16)', updated_at = now() WHERE model_id = 'Ministral-3-3B-Reasoning-2512-q4f16_1-MLC';
UPDATE public.ai_models SET name = 'OLMo-2 1B (q4f16)', updated_at = now() WHERE model_id = 'OLMo-2-0425-1B-Instruct-q4f16_1-MLC';
UPDATE public.ai_models SET name = 'DeepSeek Coder 1.3B (bnb4)', updated_at = now() WHERE model_id = 'onnx-community/deepseek-coder-1.3b-instruct-ONNX#bnb4';
UPDATE public.ai_models SET name = 'DeepSeek Coder 1.3B (q8)', updated_at = now() WHERE model_id = 'onnx-community/deepseek-coder-1.3b-instruct-ONNX#q8';
UPDATE public.ai_models SET name = 'Distil-Qwen3-text2sql 0.6B (q4f16)', updated_at = now() WHERE model_id = 'onnx-community/distil-qwen3-0.6b-text2sql-ONNX#q4f16';
UPDATE public.ai_models SET name = 'Llama 3.2 1B (bnb4)', updated_at = now() WHERE model_id = 'onnx-community/Llama-3.2-1B-Instruct-ONNX#bnb4';
UPDATE public.ai_models SET name = 'Llama 3.2 1B (q8)', updated_at = now() WHERE model_id = 'onnx-community/Llama-3.2-1B-Instruct-ONNX#q8';
UPDATE public.ai_models SET name = 'Llama 3.2 3B (bnb4)', updated_at = now() WHERE model_id = 'onnx-community/Llama-3.2-3B-Instruct-ONNX#bnb4';
UPDATE public.ai_models SET name = 'Llama 3.2 3B (q8)', updated_at = now() WHERE model_id = 'onnx-community/Llama-3.2-3B-Instruct-ONNX#q8';
UPDATE public.ai_models SET name = 'Qwen2.5 0.5B (bnb4)', updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-0.5B-Instruct#bnb4';
UPDATE public.ai_models SET name = 'Qwen2.5 0.5B (fp32)', updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-0.5B-Instruct#fp32';
UPDATE public.ai_models SET name = 'Qwen2.5 0.5B (q8)', updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-0.5B-Instruct#q8';
UPDATE public.ai_models SET name = 'Qwen2.5 1.5B (bnb4)', updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-1.5B-Instruct#bnb4';
UPDATE public.ai_models SET name = 'Qwen2.5 1.5B (fp32)', updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-1.5B-Instruct#fp32';
UPDATE public.ai_models SET name = 'Qwen2.5 1.5B (q8)', updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-1.5B-Instruct#q8';
UPDATE public.ai_models SET name = 'Qwen2.5 Coder 1.5B (bnb4)', updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-Coder-1.5B-Instruct#bnb4';
UPDATE public.ai_models SET name = 'Qwen2.5 Coder 1.5B (q8)', updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-Coder-1.5B-Instruct#q8';
UPDATE public.ai_models SET name = 'Qwen2.5 Coder 3B (bnb4)', updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-Coder-3B-Instruct#bnb4';
UPDATE public.ai_models SET name = 'Qwen2.5 Coder 3B (q8)', updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-Coder-3B-Instruct#q8';
UPDATE public.ai_models SET name = 'Qwen3 1.7B (bnb4)', updated_at = now() WHERE model_id = 'onnx-community/Qwen3-1.7B-ONNX#bnb4';
UPDATE public.ai_models SET name = 'Qwen3 1.7B (q8)', updated_at = now() WHERE model_id = 'onnx-community/Qwen3-1.7B-ONNX#q8';
UPDATE public.ai_models SET name = 'Qwen3.5 2B (q8)', updated_at = now() WHERE model_id = 'onnx-community/Qwen3.5-2B-ONNX#q8';
UPDATE public.ai_models SET name = 'Qwen3.5 4B (q8)', updated_at = now() WHERE model_id = 'onnx-community/Qwen3.5-4B-ONNX#q8';
UPDATE public.ai_models SET name = 'Phi 3.5 mini (q4f16)', updated_at = now() WHERE model_id = 'Phi-3.5-mini-instruct-q4f16_1-MLC';
UPDATE public.ai_models SET name = 'Phi-4 Mini (q4f16)', updated_at = now() WHERE model_id = 'Phi-4-mini-instruct-q4f16_1-MLC';
UPDATE public.ai_models SET name = 'Qwen2.5 0.5B (q4f16)', updated_at = now() WHERE model_id = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC';
UPDATE public.ai_models SET name = 'Qwen2.5 1.5B (q4f16)', updated_at = now() WHERE model_id = 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC';
UPDATE public.ai_models SET name = 'Qwen2.5 3B (q4f16)', updated_at = now() WHERE model_id = 'Qwen2.5-3B-Instruct-q4f16_1-MLC';
UPDATE public.ai_models SET name = 'Qwen2.5 Coder 0.5B (q4f16)', updated_at = now() WHERE model_id = 'Qwen2.5-Coder-0.5B-Instruct-q4f16_1-MLC';
UPDATE public.ai_models SET name = 'Qwen2.5 Coder 1.5B (q4f16)', updated_at = now() WHERE model_id = 'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC';
UPDATE public.ai_models SET name = 'Qwen2.5 Coder 3B (q4f16)', updated_at = now() WHERE model_id = 'Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC';
UPDATE public.ai_models SET name = 'Qwen2.5 Math 1.5B (q4f16)', updated_at = now() WHERE model_id = 'Qwen2.5-Math-1.5B-Instruct-q4f16_1-MLC';
UPDATE public.ai_models SET name = 'Qwen3 0.6B (q4f16)', updated_at = now() WHERE model_id = 'Qwen3-0.6B-q4f16_1-MLC';
UPDATE public.ai_models SET name = 'Qwen3 1.7B (q4f16)', updated_at = now() WHERE model_id = 'Qwen3-1.7B-q4f16_1-MLC';
UPDATE public.ai_models SET name = 'Qwen3 4B (q4f16)', updated_at = now() WHERE model_id = 'Qwen3-4B-q4f16_1-MLC';
UPDATE public.ai_models SET name = 'Qwen3.5 0.8B (q4f16)', updated_at = now() WHERE model_id = 'Qwen3.5-0.8B-q4f16_1-MLC';
UPDATE public.ai_models SET name = 'Qwen3.5 2B (q4f16)', updated_at = now() WHERE model_id = 'Qwen3.5-2B-q4f16_1-MLC';
UPDATE public.ai_models SET name = 'Qwen3.5 4B (q4f16)', updated_at = now() WHERE model_id = 'Qwen3.5-4B-q4f16_1-MLC';
UPDATE public.ai_models SET name = 'SmolLM2 1.7B (q4f16)', updated_at = now() WHERE model_id = 'SmolLM2-1.7B-Instruct-q4f16_1-MLC';
UPDATE public.ai_models SET name = 'StableLM 2 Zephyr 1.6B (q4f16)', updated_at = now() WHERE model_id = 'stablelm-2-zephyr-1_6b-q4f16_1-MLC';

COMMIT;
