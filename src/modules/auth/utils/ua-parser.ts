/**
 * Dependency-free User-Agent parser for passkey enrollment metadata.
 *
 * Extracts `os` and `device_model` from `navigator.userAgent` at enrollment
 * time. WebAuthn itself does NOT expose device name/model/OS — this is a
 * best-effort inference from the UA string. Unknown values stay `undefined`
 * per the data-model-conventions rule (no fake defaults).
 *
 * Covers the common cases: Windows, macOS, iOS, Android, Linux, ChromeOS.
 * Returns `{ os: undefined, device_model: undefined }` for unrecognized UAs.
 */

export interface UaParseResult {
  os?: string;
  device_model?: string;
}

/**
 * Parse a User-Agent string into `{ os, device_model }`.
 * Both fields are `undefined` when the UA doesn't match a known pattern.
 * `userAgent` is truncated to 512 chars by the caller before storage.
 */
export function parseUserAgent(userAgent: string): UaParseResult {
  const ua = userAgent.trim();
  if (ua.length === 0) return {};

  // --- OS detection (order matters: iOS before macOS, Android before Linux) ---

  // iOS: iPhone, iPad, or iPod Touch. iPadOS 13+ reports as Macintosh but
  // still has "iPad" in the UA; iPhone reports "iPhone" directly.
  if (/iPhone/i.test(ua)) {
    return { os: "iOS", device_model: "iPhone" };
  }
  if (/iPad/i.test(ua)) {
    return { os: "iOS", device_model: "iPad" };
  }
  if (/iPod/i.test(ua)) {
    return { os: "iOS", device_model: "iPod Touch" };
  }

  // Android: extract device model from UA if present (e.g. "Pixel 7 Pro").
  // Android UA format: "... (Linux; Android 14; Pixel 7 Pro) ..."
  if (/Android/i.test(ua)) {
    const modelMatch = ua.match(/Android[^;]*;\s*([^);]+?)\s*[);]/i);
    const model = modelMatch?.[1]?.trim();
    return {
      os: "Android",
      device_model: model && model.length > 0 ? model : "Android Device",
    };
  }

  // ChromeOS / Chromebook
  if (/CrOS/i.test(ua)) {
    return { os: "ChromeOS", device_model: "Chromebook" };
  }

  // Windows
  if (/Windows/i.test(ua)) {
    return { os: "Windows", device_model: "Windows PC" };
  }

  // macOS — must come after iOS checks. iPadOS 13+ may report "Macintosh"
  // but the iPad check above already caught it via the "iPad" token.
  if (/Mac OS X|Macintosh/i.test(ua)) {
    return { os: "macOS", device_model: "Mac" };
  }

  // Linux (desktop — not Android, already handled above)
  if (/Linux/i.test(ua)) {
    return { os: "Linux", device_model: "Linux PC" };
  }

  // Unknown — return undefined for both, per data-model-conventions rule.
  return {};
}

/**
 * Truncate a User-Agent string to the max column length (512 chars).
 * Prevents overflow when storing in `user_passkeys.user_agent`.
 */
export function truncateUserAgent(userAgent: string, maxLen = 512): string {
  if (userAgent.length <= maxLen) return userAgent;
  return userAgent.slice(0, maxLen);
}
