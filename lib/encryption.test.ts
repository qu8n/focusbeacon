import { describe, expect, it } from "vitest"

import { decrypt, encrypt, generateSessionId } from "@/lib/encryption"

const TOKEN = "fm_access_token_abc123"

describe("encrypt and decrypt", () => {
  it("round trips", () => {
    expect(decrypt(encrypt(TOKEN))).toBe(TOKEN)
  })

  it.each([
    ["empty", ""],
    ["one character", "a"],
    ["exactly one block", "x".repeat(16)],
    ["one under a block", "x".repeat(15)],
    ["one over a block", "x".repeat(17)],
    ["unicode", "✓ é 日本語"],
    ["containing a colon", "token:with:colons"],
  ])("round trips %s", (_label, text) => {
    expect(decrypt(encrypt(text))).toBe(text)
  })

  it("formats as iv:ciphertext, base64 on each side", () => {
    const [iv, body] = encrypt(TOKEN).split(":")
    expect(Buffer.from(iv, "base64")).toHaveLength(16)
    expect(body.length).toBeGreaterThan(0)
  })

  it("uses a fresh iv on every call", () => {
    // A fixed iv makes CBC deterministic, so identical tokens encrypt
    // identically and shared prefixes stay visible in the database
    expect(encrypt(TOKEN)).not.toBe(encrypt(TOKEN))
  })

  it("never repeats a ciphertext for the same plaintext", () => {
    const seen = new Set(Array.from({ length: 20 }, () => encrypt(TOKEN)))
    expect(seen.size).toBe(20)
  })

  it("decrypts a value produced by the Python module", () => {
    // api_utils/encryption.py reads the token back on every API request, so
    // the two implementations have to stay interchangeable. Generated with
    // the same key under a fixed iv.
    const fromPython =
      "AAECAwQFBgcICQoLDA0ODw==:xuFESGp7GkHDWkSoCaTdBER1kuF5IcFhsh1McTXJR/o="
    expect(decrypt(fromPython)).toBe(TOKEN)
  })

  it("does not return the token for a tampered ciphertext", () => {
    const [iv, body] = encrypt(TOKEN).split(":")
    const bytes = Buffer.from(body, "base64")
    bytes[0] ^= 0xff
    const tampered = `${iv}:${bytes.toString("base64")}`

    let result: string | null = null
    try {
      result = decrypt(tampered)
    } catch {
      return // failing to unpad is a correct outcome
    }
    expect(result).not.toBe(TOKEN)
  })
})

describe("generateSessionId", () => {
  it("returns 32 bytes as hex", () => {
    expect(generateSessionId()).toMatch(/^[0-9a-f]{64}$/)
  })

  it("does not repeat", () => {
    // Math.random() is not cryptographically secure; this is a bearer
    // credential, so a guessable value would be an account takeover
    const seen = new Set(Array.from({ length: 100 }, generateSessionId))
    expect(seen.size).toBe(100)
  })
})
