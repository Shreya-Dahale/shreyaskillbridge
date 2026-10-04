import { randomInt } from "node:crypto";

// No I, L, O, 0 or 1, so a code is easy to read aloud and never confused.
export const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const CODE_LENGTH = 6;

/** A short random code that stands in for a candidate's name in discovery. */
export function generateDiscoveryCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return code;
}

export function isValidDiscoveryCode(code: string): boolean {
  return new RegExp(`^[${CODE_ALPHABET}]{${CODE_LENGTH}}$`).test(code);
}

export function displayCode(code: string): string {
  return `Candidate #${code}`;
}