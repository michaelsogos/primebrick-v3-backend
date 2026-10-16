/**
 * Rotating secret engine — BE is the OWNER side of the rotating-secret model
 * (see sdk/secrets/rotating-secret.ts):
 *
 *   - generates/persists secrets into Redis (TTL = rotation + grace);
 *   - serves them to consumers over the governed `secret.get` correlation
 *     route (client-shield verified — services only);
 *   - rotates on a timer and broadcasts the shielded `secret.rotated` event;
 *   - keeps the local client-shield secret slot warm so this process's own
 *     outbound headers (proxy, buildNatsAuthHeaders) stamp `current`.
 *
 * `secret.get` is allowlisted: only declared refs are served, everything
 * else is denied — a service must never be able to fetch arbitrary secrets.
 */

import {
  RotatingSecretEngine,
  SECRET_SUBJECTS,
  makeNatsRequestRoute,
  getRedisClient,
  logger,
  humanizeMs,
  SECRET_DEFAULTS,
  CLIENT_SHIELD_SECRET_REF,
  type RotatingSecretRef,
} from "@primebrick/sdk";
import { createPublisherVerifier } from "../../controllers/nats-sub/publisher-identity.js";

/** Secrets the engine owns and may serve — explicit, no wildcards. */
const SERVED_SECRETS: readonly RotatingSecretRef[] = [CLIENT_SHIELD_SECRET_REF];

export async function initSecretEngine(): Promise<void> {
  const redis = getRedisClient();
  if (!redis) {
    logger.error(
      "The secret engine is disabled — Redis client not initialized (redis_url missing?). Client-shield secrets will not rotate.",
      { tags: ["secret-engine"] },
    );
    return;
  }
  const engine = new RotatingSecretEngine(redis);
  const verifier = createPublisherVerifier();

  await makeNatsRequestRoute(
    [
      {
        subject: SECRET_SUBJECTS.GET,
        verify: verifier.asRouteVerify(),
        permissions: [],
        handler: async ({ request }) => {
          const ref = request as RotatingSecretRef;
          const served = SERVED_SECRETS.some((s) => s.scope === ref?.scope && s.name === ref?.name);
          if (!served) {
            logger.error(`The secret engine refused to serve ${ref?.scope}/${ref?.name} — it is not a declared secret`, { tags: ["secret-engine"] });
            return { error: "secret not servable" };
          }
          return engine.get(ref);
        },
      },
    ],
    { serviceCode: "primebrick-api" },
  );

  // Provision now (cold start ⇒ generates), keep the local slot warm for
  // this process's outbound headers, then rotate on the cadence.
  await engine.get(SERVED_SECRETS[0]);
  engine.startAutoRotation(SERVED_SECRETS[0]);
  logger.done(
    `The secret engine is ready — the service client-shield secret rotates every ${humanizeMs(SECRET_DEFAULTS.rotationMs)} with ${humanizeMs(SECRET_DEFAULTS.graceMs)} of grace`,
    { tags: ["secret-engine"] },
  );
}
