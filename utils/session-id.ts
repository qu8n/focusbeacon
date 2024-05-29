import { randomBytes } from 'crypto';

/**
 * Generates a secure, random session ID.
 */
export function generateSessionId(): string {
  // Generate 32 bytes of random data (256 bits) and convert to hexadecimal string
  // as Math.random() is not cryptographically secure
  return randomBytes(32).toString('hex');
}