/**
 * Telemetry config — BE-owned single point of configuration.
 *
 * The `config_entries` rows (`telemetry_enabled`, `otel_*`, `log_*`) are
 * read from the DB and:
 *   - applied locally (initTelemetry / restartTelemetry / setLogOptions)
 *   - distributed to microservices via SharedConfig.telemetry (NATS
 *     `config.get` reply) — see index.ts subscribeSharedConfig
 *   - pushed on change: writes to config_entries call
 *     `applyTelemetryConfigFromDb()` (from ConfigEntriesDal.reloadCache),
 *     which reloads, restarts the pipeline in-process, and broadcasts
 *     `config.changed` so all microservices re-apply without restarts.
 */

import {
  initTelemetry,
  restartTelemetry,
  setLogOptions,
  logger,
  NatsClient,
  CONFIG_CHANGED_SUBJECT,
  type TelemetrySharedConfig,
  type TelemetryConfig,
} from "@primebrick/sdk";
import { getPool } from "../db/pool.js";

const TELEMETRY_KEYS = [
  "telemetry_enabled",
  "otel_exporter_otlp_endpoint",
  "otel_exporter_otlp_headers",
  "otel_traces_sampler",
  "otel_traces_sampler_arg",
  "log_format",
  "log_level",
] as const;

let cached: TelemetrySharedConfig = { enabled: false };
let serviceName = "primebrick-api";
let serviceVersion = "0.0.0";

function parseJsonObject(raw: string | null): Record<string, string> | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, string>;
    }
  } catch {
    // invalid JSON — ignore, treated as unset
  }
  return undefined;
}

async function readTelemetryFromDb(): Promise<TelemetrySharedConfig> {
  const res = await getPool().query(
    `select "key", "value" from config_entries where "key" = any($1) and deleted_at is null`,
    [TELEMETRY_KEYS],
  );
  const map = new Map<string, string | null>(
    res.rows.map((r: { key: string; value: string | null }) => [r.key, r.value]),
  );
  const get = (k: string): string | null => map.get(k) ?? null;

  const samplerRaw = get("otel_traces_sampler");
  const sampler: TelemetrySharedConfig["sampler"] =
    samplerRaw === "always_off" || samplerRaw === "traceidratio" ? samplerRaw : "always_on";
  const samplerArgRaw = get("otel_traces_sampler_arg");
  const samplerArg = samplerArgRaw !== null ? Number(samplerArgRaw) : undefined;
  const logFormatRaw = get("log_format");
  const logLevelRaw = get("log_level");

  return {
    enabled: get("telemetry_enabled") === "true",
    otlp_endpoint: get("otel_exporter_otlp_endpoint") ?? undefined,
    otlp_headers: parseJsonObject(get("otel_exporter_otlp_headers")),
    sampler,
    sampler_arg: samplerArg !== undefined && Number.isFinite(samplerArg) ? samplerArg : undefined,
    log_format: logFormatRaw === "json" ? "json" : "pretty",
    log_level:
      logLevelRaw === "debug" || logLevelRaw === "warn" || logLevelRaw === "error"
        ? logLevelRaw
        : "info",
  };
}

function toTelemetryConfig(t: TelemetrySharedConfig): TelemetryConfig {
  return {
    enabled: t.enabled ?? false,
    otlp_endpoint: t.otlp_endpoint,
    otlp_headers: t.otlp_headers,
    sampler: t.sampler,
    sampler_arg: t.sampler_arg,
  };
}

function applyLogOptions(t: TelemetrySharedConfig): void {
  setLogOptions({ level: t.log_level, format: t.log_format, service: serviceName });
}

/** SharedConfig.telemetry payload served to microservices via config.get. */
export function getTelemetryShared(): TelemetrySharedConfig {
  return cached;
}

/** Called once at startup (after pool + config are available). */
export async function initBackendTelemetry(name: string, version: string): Promise<void> {
  serviceName = name;
  serviceVersion = version;
  try {
    cached = await readTelemetryFromDb();
  } catch (err) {
    logger.warn("[telemetry] failed to read config_entries — telemetry disabled", {
      error: err instanceof Error ? err.message : String(err),
    });
    cached = { enabled: false };
  }
  applyLogOptions(cached);
  await initTelemetry(toTelemetryConfig(cached), serviceName, serviceVersion);
}

/**
 * Called on every config_entries write (from ConfigEntriesDal.reloadCache).
 * Reloads the telemetry rows, restarts the OTel pipeline in-process, applies
 * logger options, and broadcasts `config.changed` to all microservices.
 * Best-effort: never throws.
 */
export async function applyTelemetryConfigFromDb(): Promise<void> {
  try {
    cached = await readTelemetryFromDb();
  } catch (err) {
    logger.error("[telemetry] failed to reload config — keeping previous telemetry config", {
      error: err instanceof Error ? err.message : String(err),
    });
    return;
  }
  applyLogOptions(cached);
  await restartTelemetry(toTelemetryConfig(cached), serviceName, serviceVersion);
  try {
    await NatsClient.publish(CONFIG_CHANGED_SUBJECT, { keys: [...TELEMETRY_KEYS] });
  } catch (err) {
    logger.warn("[telemetry] config.changed broadcast failed (NATS down?)", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
