import { invitationState } from "./rules";

type Item = { status: "PENDING" | "ACCEPTED" | "DECLINED"; expiresAt: Date; createdAt: Date };

/** Open invitations that still need an answer, and everything else, each newest first. */
export function partitionInvitations<T extends Item>(items: T[], now: Date = new Date()) {
  const pending: T[] = [];
  const answered: T[] = [];
  for (const item of items) {
    (invitationState(item, now) === "PENDING" ? pending : answered).push(item);
  }
  const newest = (a: T, b: T) => b.createdAt.getTime() - a.createdAt.getTime();
  return { pending: pending.sort(newest), answered: answered.sort(newest) };
}

export function daysLeft(expiresAt: Date, now: Date = new Date()): number {
  return Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
}