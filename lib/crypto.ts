import { randomBytes, createCipheriv, createDecipheriv } from "crypto"

// Configuration for AES encryption
const algorithm = "aes-256-cbc"
const keyAsString = process.env.ENCRYPTION_KEY as string
const keyAsBuffer = Buffer.from(keyAsString, "hex")
const aesIV = process.env.ENCRYPTION_AES_IV as string

export function encrypt(text: string): string {
  const iv = Buffer.from(aesIV, "hex")
  const cipher = createCipheriv(algorithm, keyAsBuffer, iv)
  let encrypted = cipher.update(text, "utf8", "base64")
  encrypted += cipher.final("base64")
  return `${iv.toString("base64")}:${encrypted}`
}

export function decrypt(encryptedText: string): string {
  const [ivText, encrypted] = encryptedText.split(":")
  const iv = Buffer.from(ivText, "base64")
  const decipher = createDecipheriv(algorithm, keyAsBuffer, iv)
  let decrypted = decipher.update(encrypted, "base64", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}

export function generateSessionId(): string {
  // Generate 32 bytes of random data (256 bits) and convert to hexadecimal string
  // because Math.random() is not cryptographically secure
  return randomBytes(32).toString("hex")
}
