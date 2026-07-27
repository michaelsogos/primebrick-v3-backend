# LLM Models directory

Models are downloaded **automatically** by the mistral.rs container on first start.
The GGUF file is fetched from Hugging Face Hub and cached in the persistent Docker
volume `primebrick_ai_llm_cache` (mounted at `/data` = `HF_HOME`).

## Default model: Qwen3-4B-Instruct-2507 (Q4_K_M)

- **Repo**: `bartowski/Qwen_Qwen3-4B-Instruct-2507-GGUF`
- **File**: `Qwen_Qwen3-4B-Instruct-2507-Q4_K_M.gguf`
- **Size**: ~2.5GB (downloaded automatically on first `docker compose up`)
- **RAM required**: ~4GB (model + overhead)
- **License**: Apache 2.0 (model) + MIT (mistral.rs runtime)

On subsequent starts, the cached model is reused — no re-download.
To force a re-download: `docker volume rm primebrick_ai_llm_cache` then restart.

## Lightweight alternative: Qwen3-1.7B-FC (Q4_K_M)

For machines with limited RAM (~2-3GB total). Edit `docker-compose.ai-llm.yml`:
```
-m bartowski/Qwen_Qwen3-1.7B-FC-GGUF
-f Qwen_Qwen3-1.7B-FC-Q4_K_M.gguf
```

## Fallback runtime: llama.cpp

If mistral.rs has issues, switch to llama.cpp (also auto-downloads from HF Hub):
1. Uncomment the llama.cpp block in `docker-compose.ai-llm.yml`
2. Update `LLM_BASE_URL` in `ai.config` table to `http://ai-llm:8080/v1`

## Offline / air-gapped use

After the first successful download, set `HF_HUB_OFFLINE=1` in the compose
environment to prevent any network calls to Hugging Face. The container will
load exclusively from the cached volume.

## Cloud LLM (no local model needed)

Skip the LLM container entirely. Set in `ai.config` or `.env`:
- `llm_base_url` = cloud provider URL (e.g. `https://api.openai.com/v1`)
- `llm_api_key` = your API key
- `llm_model` = cloud model name (e.g. `gpt-4o-mini`)
