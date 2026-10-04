import { createHash, randomBytes } from "node:crypto";

/** A random, unguessable token. 32 bytes is about 256 bits of randomness. */
export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Only this hash is stored, so a database leak does not expose working links. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Cheap check before hashing: our tokens are always 43 URL-safe characters. */
export function isValidTokenFormat(token: string): boolean {
  return /^[A-Za-z0-9_-]{43}$/.test(token);
}