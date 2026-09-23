/**
 * Side-effect module — MUST be the first import in src/index.ts.
 *
 * Installs the async console bridge from @primebrick/sdk so every
 * `console.*` call gets a UTC ISO timestamp + trace_id/span_id (when a
 * span is active) + non-blocking batched writes. Log level/format/service
 * are refined later once config is loaded from the DB (telemetry.ts).
 */
import { installConsoleBridge } from "@primebrick/sdk";

installConsoleBridge();
