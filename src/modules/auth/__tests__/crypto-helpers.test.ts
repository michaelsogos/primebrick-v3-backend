import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "../crypto-helpers.js";

describe("crypto-helpers — AES-256-GCM encrypt/decrypt", () => {
  it("round-trips a string with the correct key", () => {
    const key = "a".repeat(64); // 32 bytes hex = 64 hex chars
    const plaintext = "JBSWY3DPEHPK3PXP"; // typical base32 TOTP secret
    const ciphertext = encrypt(plaintext, key);
    // Ciphertext must NOT equal plaintext
    expect(ciphertext).not.toBe(plaintext);
    // Must contain the GCM auth tag + nonce (longer than plaintext)
    expect(ciphertext.length).toBeGreaterThan(plaintext.length);
    // Round-trip
    expect(decrypt(ciphertext, key)).toBe(plaintext);
  });

  it("round-trips an empty string", () => {
    const key = "b".repeat(64);
    const plaintext = "";
    const ciphertext = encrypt(plaintext, key);
    expect(decrypt(ciphertext, key)).toBe(plaintext);
  });

  it("round-trips a long string (1000 chars)", () => {
    const key = "c".repeat(64);
    const plaintext = "x".repeat(1000);
    const ciphertext = encrypt(plaintext, key);
    expect(decrypt(ciphertext, key)).toBe(plaintext);
  });

  it("produces different ciphertexts for the same plaintext (random nonce)", () => {
    const key = "d".repeat(64);
    const plaintext = "JBSWY3DPEHPK3PXP";
    const c1 = encrypt(plaintext, key);
    const c2 = encrypt(plaintext, key);
    // Random nonce means ciphertexts must differ
    expect(c1).not.toBe(c2);
    // Both decrypt to the same plaintext
    expect(decrypt(c1, key)).toBe(plaintext);
    expect(decrypt(c2, key)).toBe(plaintext);
  });

  it("fails to decrypt with the wrong key", () => {
    const key1 = "e".repeat(64);
    const key2 = "f".repeat(64);
    const plaintext = "JBSWY3DPEHPK3PXP";
    const ciphertext = encrypt(plaintext, key1);
    // Wrong key must throw (GCM auth tag verification fails)
    expect(() => decrypt(ciphertext, key2)).toThrow();
  });

  it("fails to decrypt tampered ciphertext", () => {
    const key = "g".repeat(64);
    const plaintext = "JBSWY3DPEHPK3PXP";
    const ciphertext = encrypt(plaintext, key);
    // Flip the last 4 hex chars
    const suffix = ciphertext.slice(-4);
    const flipped = suffix === "0000" ? "1111" : "0000";
    const tampered = ciphertext.slice(0, -4) + flipped;
    expect(() => decrypt(tampered, key)).toThrow();
  });
});
