/**
 * Decode a base64-encoded AAGUID (16 bytes) into a standard UUID string.
 *
 * Casdoor's go-webauthn serializes the `authenticator.AAGUID` field as a
 * base64-encoded 16-byte array (e.g. "00UmaAH9TBKSbIOkIEhTqg==").
 * The FE AAGUID registry uses lowercase UUID strings
 * (e.g. "d3452668-01fd-4c12-926c-83a4204853aa"), so we must decode + format
 * the base64 into a UUID before lookup.
 *
 * Returns `undefined` for:
 *   - empty/null input
 *   - the zero AAGUID (00000000-0000-0000-0000-000000000000) — some platform
 *     authenticators intentionally report this to stay anonymous
 *   - wrong byte count (AAGUID must be exactly 16 bytes)
 */
export function decodeAaguid(base64?: string | null): string | undefined {
  if (!base64 || base64.length === 0) return undefined;
  let bytes: Buffer;
  try {
    bytes = Buffer.from(base64, "base64");
  } catch {
    return undefined;
  }
  if (bytes.length !== 16) return undefined;
  const hex = bytes.toString("hex");
  const uuid = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  if (uuid === "00000000-0000-0000-0000-000000000000") return undefined;
  return uuid;
}

/**
 * Best-effort OS / device_model inference from a known AAGUID.
 *
 * WebAuthn platform authenticators are tied to a specific OS, so we can infer
 * `os` and `device_model` from the AAGUID when the User-Agent was not captured
 * at enrollment time (e.g. passkeys created via syncPasskeys reconciliation).
 *
 * Returns `{ os: undefined, device_model: undefined }` for unknown AAGUIDs —
 * per the data-model-conventions rule (no fake defaults).
 *
 * Source: https://github.com/passkeydeveloper/passkey-authenticator-aaguids
 */
const AAGUID_TO_OS: Record<string, { os: string; device_model: string }> = {
  // Microsoft Password Manager (Windows Hello)
  "d3452668-01fd-4c12-926c-83a4204853aa": { os: "Windows", device_model: "Windows PC" },
  // Windows Hello (3 known AAGUIDs across Windows versions)
  "08987058-cadc-4b81-b6e1-30de50dcbe96": { os: "Windows", device_model: "Windows PC" },
  "6028b017-b1d4-4c02-b4b3-afcdafc96bb2": { os: "Windows", device_model: "Windows PC" },
  "9ddd1817-af5a-4672-a2b9-3e3dd95000a9": { os: "Windows", device_model: "Windows PC" },
  // Apple Passkey Manager (iCloud Keychain)
  "adce0002-35bc-c60a-648b-0b25f1f05503": { os: "iOS", device_model: "Apple Device" },
  "dd4ec279-dbc5-4d6f-8c8f-6f7b8c3a9b12": { os: "macOS", device_model: "Mac" },
  // Google Password Manager (Android / Chrome)
  "ea9b8d66-4d01-1d21-3ce4-bd5e467c28e8": { os: "Android", device_model: "Android Device" },
};

export function inferOsFromAaguid(aaguid?: string): { os?: string; device_model?: string } {
  if (!aaguid) return {};
  return AAGUID_TO_OS[aaguid] ?? {};
}

