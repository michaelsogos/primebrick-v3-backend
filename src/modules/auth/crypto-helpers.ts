/**
 * AES-256-GCM encryption helper for storing sensitive data at rest.
 *
 * Used by MfaService to encrypt TOTP secrets before storing them in PG.
 * The encryption key is derived from `mfa_challenge_signing_secret` (the same
 * secret used to sign MFA challenge JWTs).
 *
 * Format: `<iv_hex>:<auth_tag_hex>:<ciphertext_hex>`
 * - IV: 12 bytes (96 bits) — standard for GCM, randomly generated per encryption
 * - Auth tag: 16 bytes (128 bits) — GCM authentication tag
 * - Ciphertext: variable length
 *
 * All values are hex-encoded for safe storage in a text column.
 */

import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto";

/**
 * Derive a 32-byte AES-256 key from a secret string.
 * The secret is hashed with SHA-256 to produce a fixed-length key.
 */
function deriveKey(secret: string): Buffer {
  return createHash("sha256").update(secret).digest();
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns `<iv_hex>:<auth_tag_hex>:<ciphertext_hex>`.
 */
export function encrypt(plaintext: string, secret: string): string {
  const key = deriveKey(secret);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${ciphertext.toString("hex")}`;
}

/**
 * Decrypt a string produced by `encrypt()`.
 * Throws if the auth tag doesn't verify (tampering or wrong key).
 */
export function decrypt(encrypted: string, secret: string): string {
  const key = deriveKey(secret);
  const parts = encrypted.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted format — expected <iv>:<auth_tag>:<ciphertext>");
  }
  const [ivHex, authTagHex, ciphertextHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const ciphertext = Buffer.from(ciphertextHex, "hex");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString("utf8");
}
