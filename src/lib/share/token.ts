import { createHash, randomBytes } from "node:crypto";

/** A random, unguessable token. 32 bytes is about 256 bits of randomness. */
export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Only this hash is stored, so a database leak does not expose working links. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}