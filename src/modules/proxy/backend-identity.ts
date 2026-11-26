/**
 * Backend identity — observability metadata only.
 *
 * The User-Agent stamps name+version+runtime on outbound internal calls for
 * logs and traces. No key material is ever transmitted: trust on internal
 * hops is proof-of-possession (HTTP signing provenance / NATS sealed
 * envelope), never a shared secret on the wire. The enrollment machinery is
 * gone (arch-internal-trust-and-transports, WP-5).
 */
import { buildUserAgent, detectPackageIdentity, configureInternalClient } from "@primebrick/sdk";

let currentUa: string | null = null;

export function backendIdentityHeaders(): Record<string, string> {
  return {
    "user-agent": currentUa ?? buildUserAgent(detectPackageIdentity(), "backend"),
  };
}

export async function initBackendIdentity(): Promise<void> {
  const identity = detectPackageIdentity();
  currentUa = buildUserAgent(identity, "backend");
  // The SDK internal client is the single outbound path for BE→US calls —
  // configure it now so `internalFetch` carries the BE identity everywhere.
  configureInternalClient(backendIdentityHeaders);
}
