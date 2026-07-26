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
 *
 * Windows version detection (10 vs 11):
 *   `navigator.userAgent` reports "Windows NT 10.0" on BOTH Windows 10 and
 *   Windows 11, so the UA alone cannot distinguish them. Chromium-based
 *   browsers (Chrome, Edge) expose `navigator.userAgentData.getHighEntropyValues
 *   (["platformVersion"])` which returns a version string where:
 *     - `0.x.x`        = Windows 7/8/8.1
 *     - `1.x.x`–`10.x.x` = Windows 10
 *     - `13.x.x`+      = Windows 11
 *   The FE captures this and sends it as `platform_version` in the signup
 *   body. We use it to refine `os` ("Windows 11" / "Windows 10" / "Windows").
 *   When `platform_version` is missing (Firefox, Safari, or older browsers),
 *   we fall back to the generic "Windows".
 */

export interface UaParseResult {
  os?: string;
  device_model?: string;
}

/**
 * Parse a User-Agent string into `{ os, device_model }`.
 * Both fields are `undefined` when the UA doesn't match a known pattern.
 * `userAgent` is truncated to 512 chars by the caller before storage.
 *
 * `platformVersion` is the optional User-Agent Client Hints value
 * (`navigator.userAgentData.getHighEntropyValues(["platformVersion"])`)
 * that lets us distinguish Windows 10 from Windows 11. Ignored for non-
 * Windows OSes.
 */
export function parseUserAgent(
  userAgent: string,
  platformVersion?: string,
): UaParseResult {
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

  // Windows — distinguish 10 vs 11 via Client Hints platformVersion when
  // available. The UA string alone reports "Windows NT 10.0" on both.
  if (/Windows/i.test(ua)) {
    const winVersion = windowsVersionFromPlatformVersion(platformVersion);
    return {
      os: winVersion ?? "Windows",
      device_model: "Windows PC",
    };
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
 * Map a User-Agent Client Hints `platformVersion` string to a Windows
 * version label. Returns `undefined` when the version is missing or does
 * not map to a known Windows version (caller falls back to "Windows").
 *
 * Source: Microsoft's specification for User-Agent Client Hints on Windows.
 *   - "0.x.x"        → Windows 7/8/8.1 (we label as "Windows" — too old to
 *                     bother distinguishing, and Win 7/8 are EOL)
 *   - "1.x.x"–"10.x.x" → Windows 10
 *   - "13.x.x"+      → Windows 11
 *   - "11.x.x"/"12.x.x" are skipped by Microsoft (jump from 10 → 13)
 */
function windowsVersionFromPlatformVersion(
  platformVersion?: string,
): string | undefined {
  if (!platformVersion) return undefined;
  const major = parseInt(platformVersion.split(".")[0], 10);
  if (Number.isNaN(major)) return undefined;
  if (major >= 13) return "Windows 11";
  if (major >= 1 && major <= 10) return "Windows 10";
  return undefined; // 0.x.x or unknown — fall back to generic "Windows"
}

/**
 * Truncate a User-Agent string to the max column length (512 chars).
 * Prevents overflow when storing in `user_passkeys.user_agent`.
 */
export function truncateUserAgent(userAgent: string, maxLen = 512): string {
  if (userAgent.length <= maxLen) return userAgent;
  return userAgent.slice(0, maxLen);
}
