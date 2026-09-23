import { describe, it, expect } from "vitest";
import { AiModelUpdateBodySchema } from "../dto.js";

/**
 * Regression: the BE body parser (ext-json) decodes every JSON integer as
 * `bigint`, and zod v4 `.partial()` re-applies `.default()` to omitted keys —
 * a partial PUT like `{vram_mb: 2257, version: 41}` used to rewrite
 * temperature/top_p/rank/engine_type/... with create-time defaults
 * (observed on ai_model a1111111-...-0005, version 41→42).
 */
describe("AiModelUpdateBodySchema", () => {
  it("accepts bigint integers and emits only provided keys", () => {
    const r = AiModelUpdateBodySchema.safeParse({ vram_mb: 2257n, version: 41n });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).toEqual({ vram_mb: 2257, version: 41 });
      expect("temperature" in r.data).toBe(false);
      expect("engine_type" in r.data).toBe(false);
      expect("rank" in r.data).toBe(false);
      expect("compatibility_status" in r.data).toBe(false);
    }
  });

  it("accepts bigint for float fields (ext-json decodes `1` as bigint)", () => {
    const r = AiModelUpdateBodySchema.safeParse({
      temperature: 1n,
      top_p: 1n,
      repetition_penalty: 1n,
      rank: 4n,
      version: 42n,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).toEqual({
        temperature: 1,
        top_p: 1,
        repetition_penalty: 1,
        rank: 4,
        version: 42,
      });
    }
  });

  it("never re-injects defaults for omitted fields", () => {
    const r = AiModelUpdateBodySchema.safeParse({ version: 42n });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toEqual({ version: 42 });
  });

  it("still validates provided fields", () => {
    const r = AiModelUpdateBodySchema.safeParse({ temperature: 99, version: 42n });
    expect(r.success).toBe(false);
  });

  it("explicitly provided fields pass through validation+transform", () => {
    const r = AiModelUpdateBodySchema.safeParse({
      model_id: "onnx-community/Qwen2.5-Coder-3B-Instruct#q4f16",
      engine_type: "onnx",
      compatibility_status: "COMPATIBLE",
      version: 43n,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.engine_type).toBe("onnx");
      expect(r.data.compatibility_status).toBe("COMPATIBLE");
    }
  });
});
