/**
 * Publisher identity verification for service-to-BE NATS subjects.
 *
 * Shared between ServiceLifecycleSubscriber (register/heartbeat/unregister)
 * and the governed request routes (config.get, client_shield_registry.get,
 * service.registry.get, auth.apikey.byHash): the caller is a *service*,
 * not a user — identity is proven by User-Agent prefix + client shield key
 * against `system.client_shield_registry` (same contract as internal HTTP calls).
 *
 * Rows are cached 60s; callers subscribe to `client_shield_registry.changed` and
 * call `invalidate()` to refresh immediately on rotation.
 */

import type { Msg } from "nats";
import { ClientShieldRegistryService } from "../../modules/system/client-shield-registry.service.js";
import {
  CLIENT_SHIELD_KEY_HEADER,
  clientKeyHash,
  extJsonParse,
  logger,
  msgHeader,
  verifyClientIdentity,
  verifyRowKey,
  type NatsRouteVerify,
  type ShieldRegistryLike,
} from "@primebrick/sdk";

export interface PublisherVerifier {
  /**
   * Verify the caller's shield identity. `claimed` carries payload fields
   * (code/pkg_name/…) for log context and first-enrollment checks.
   * `allowNewPrefix` permits first-time enrollment (service.register only).
   */
  verify(
    msg: Msg,
    claimed?: {
      code?: string;
      base_url?: string;
      pkg_name?: string;
      service_version?: string;
      client_key_hash?: string;
      key_mode?: "static" | "derived";
      key_generation?: number;
    } | null,
    opts?: { allowNewPrefix?: boolean },
  ): Promise<boolean>;
  /** NatsRouteVerify adapter: verify + decode claimed payload from msg.data. */
  asRouteVerify(claimed?: Parameters<PublisherVerifier["verify"]>[1], opts?: { allowNewPrefix?: boolean }): NatsRouteVerify;
  /** Drop the client_shield_registry row cache (call on `client_shield_registry.changed`). */
  invalidate(): void;
  /**
   * ShieldRegistryLike view over the same cached rows — pass to the SDK's
   * setNatsShieldRegistry so EVERY governed NATS route (verifyAndAuthorize)
   * enforces layer-1 client shield before the user layer, identically to
   * US microservices.
   */
  readonly shieldRegistry: ShieldRegistryLike;
}

export function createPublisherVerifier(): PublisherVerifier {
  let rows: { ua_prefix: string; client_key_hash: string }[] | null = null;
  let rowsAt = 0;
  const registrySvc = new ClientShieldRegistryService();

  const loadRows = async () => {
    rows = await registrySvc.findAllEnabled();
    rowsAt = Date.now();
  };

  const verify: PublisherVerifier["verify"] = async (msg, claimed, opts = {}) => {
    if (!rows || Date.now() - rowsAt > 60_000) await loadRows();
    const r = rows!;
    const getHdr = (name: string): string | null => msgHeader(msg.headers, name);
    const ua = getHdr("user-agent") ?? "";
    const knownPrefix = r.find((x) => ua.startsWith(x.ua_prefix))?.ua_prefix;
    if (opts.allowNewPrefix && ua && !knownPrefix && claimed?.client_key_hash) {
      // First enrollment — the payload's client_key_hash becomes the
      // registry row in the register handler; nothing to verify against
      // yet. Without a hash there is nothing to enroll → reject.
      return true;
    }
    const result = await verifyClientIdentity(
      { headers: { get: getHdr } },
      {
        allowedPrefixes: r.map((x) => x.ua_prefix),
        verifyKey: (prefix, key) => verifyRowKey(r.find((x) => x.ua_prefix === prefix), key),
      },
    );
    if (!result.ok) {
      // Derived-mode bootstrap lane (B14, service.register only): a service
      // holding a valid derivation secret but deriving for a stale/unknown
      // generation cannot satisfy the row hash — it still proves the secret
      // because `clientKeyHash(headerKey) == hash(derive(secret, prefix,
      // claimed.generation))`. Admitted callers reach the register handler,
      // which re-verifies the claim and returns the issued generation when
      // stale — self-healing instead of a permanent wall.
      if (
        opts.allowNewPrefix &&
        knownPrefix &&
        claimed?.key_mode === "derived" &&
        typeof claimed.key_generation === "number" &&
        claimed.client_key_hash &&
        clientKeyHash(getHdr(CLIENT_SHIELD_KEY_HEADER) ?? "") === claimed.client_key_hash &&
        (await registrySvc.verifyDerivedClaim(knownPrefix, claimed.key_generation, claimed.client_key_hash))
      ) {
        return true;
      }
      logger.error(`service publisher rejected on "${msg.subject}" — ${result.error}`, {
        tags: ["nats", `${result.status}`],
        claimed_code: claimed?.code ?? claimed?.pkg_name ?? null,
        presented_ua: ua || null,
        shield_key_present: Boolean(getHdr(CLIENT_SHIELD_KEY_HEADER)),
      });
    }
    return result.ok;
  };

  return {
    verify,
    asRouteVerify: (claimed, opts) => async (msg) => {
      // Claimed fields may live in the payload (service.register) — decode
      // best-effort when the caller didn't pass them explicitly.
      let c = claimed;
      if (!c) {
        try {
          c = extJsonParse(new TextDecoder().decode(msg.data)) as typeof claimed;
        } catch {
          c = undefined;
        }
      }
      return (await verify(msg, c, opts)) ? undefined : null;
    },
    invalidate: () => {
      rows = null;
      rowsAt = 0;
    },
    shieldRegistry: {
      get allowedPrefixes() {
        // TTL applies to the shield path too — a service enrolled after
        // the last load must not be UNKNOWN_CLIENT until restart. The
        // stale snapshot is still used for THIS check; verifyNatsPublisher
        // force-refreshes + retries once on a 403.
        if (!rows || Date.now() - rowsAt > 60_000) void loadRows();
        return (rows ?? []).map((x) => x.ua_prefix);
      },
      verifyKey: (prefix, key) =>
        verifyRowKey((rows ?? []).find((x) => x.ua_prefix === prefix), key),
      refresh: () => loadRows(),
    },
  };
}
