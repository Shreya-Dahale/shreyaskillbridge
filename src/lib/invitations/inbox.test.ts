import { describe, it, expect } from "vitest";
import { daysLeft, partitionInvitations } from "./inbox";

const now = new Date("2026-10-10T12:00:00Z");
const d = (s: string) => new Date(s);

const make = (id: string, status: "PENDING" | "ACCEPTED" | "DECLINED", created: string, expires: string) => ({
  id,
  status,
  createdAt: d(created),
  expiresAt: d(expires),
});

describe("partitionInvitations", () => {
  const items = [
    make("old-pending", "PENDING", "2026-10-01T00:00:00Z", "2026-10-15T00:00:00Z"),
    make("new-pending", "PENDING", "2026-10-08T00:00:00Z", "2026-10-22T00:00:00Z"),
    make("expired", "PENDING", "2026-09-01T00:00:00Z", "2026-09-15T00:00:00Z"),
    make("accepted", "ACCEPTED", "2026-10-05T00:00:00Z", "2026-10-19T00:00:00Z"),
    make("declined", "DECLINED", "2026-10-09T00:00:00Z", "2026-10-23T00:00:00Z"),
  ];

  it("puts only live pending invitations in the pending list, newest first", () => {
    const { pending } = partitionInvitations(items, now);
    expect(pending.map((i) => i.id)).toEqual(["new-pending", "old-pending"]);
  });

  it("puts accepted, declined and expired invitations in the answered list, newest first", () => {
    const { answered } = partitionInvitations(items, now);
    expect(answered.map((i) => i.id)).toEqual(["declined", "accepted", "expired"]);
  });

  it("handles an empty inbox", () => {
    expect(partitionInvitations([], now)).toEqual({ pending: [], answered: [] });
  });
});

describe("daysLeft", () => {
  it("rounds up to whole days and never goes below zero", () => {
    expect(daysLeft(d("2026-10-20T12:00:00Z"), now)).toBe(10);
    expect(daysLeft(d("2026-10-10T18:00:00Z"), now)).toBe(1);
    expect(daysLeft(d("2026-10-10T12:00:00Z"), now)).toBe(0);
    expect(daysLeft(d("2026-10-01T12:00:00Z"), now)).toBe(0);
  });
});