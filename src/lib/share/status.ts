export const EXPIRY_OPTIONS = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
] as const;

export const MAX_ACTIVE_LINKS = 10;

export type LinkStatus = "ACTIVE" | "EXPIRED" | "REVOKED";

const DAY_MS = 24 * 60 * 60 * 1000;

export function expiryDate(days: number, now: Date = new Date()): Date {
  return new Date(now.getTime() + days * DAY_MS);
}

/** Revoked beats expired. A link whose expiry time has arrived is no longer active. */
export function linkStatus(
  link: { expiresAt: Date; revokedAt: Date | null },
  now: Date = new Date()
): LinkStatus {
  if (link.revokedAt) return "REVOKED";
  if (link.expiresAt.getTime() <= now.getTime()) return "EXPIRED";
  return "ACTIVE";
}

export const AUDIENCE_LABEL = {
  EMPLOYERS: "Logged-in employers only",
  ANYONE: "Anyone with the link",
} as const;