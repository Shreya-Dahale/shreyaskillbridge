import { describe, it, expect } from "vitest";
import {
  DAILY_INVITATION_LIMIT,
  INVITATION_EXPIRY_DAYS,
  MAX_MESSAGE_CHARS,
  MIN_MESSAGE_CHARS,
  invitationExpiry,
  invitationState,
  invitationsRemaining,
  looksLikeLink,
  validateInvitationMessage,
} from "./rules";

const GOOD = "We are hiring a Java Backend Developer and your SQL and REST API evidence stood out to our team.";

describe("policy constants", () => {
  it("match the approved design", () => {
    expect(DAILY_INVITATION_LIMIT).toBe(10);
    expect(INVITATION_EXPIRY_DAYS).toBe(14);
    expect(MAX_MESSAGE_CHARS).toBe(500);
  });
});

describe("validateInvitationMessage", () => {
  it("accepts a normal message and trims it", () => {
    const r = validateInvitationMessage(`  ${GOOD}\r\n`);
    expect(r).toEqual({ ok: true, message: GOOD });
  });

  it("keeps line breaks", () => {
    const r = validateInvitationMessage(`${GOOD}\n\nWould you be open to a chat?`);
    expect(r.ok).toBe(true);
  });

  it("rejects messages that are too short", () => {
    expect(validateInvitationMessage("Hi").ok).toBe(false);
    expect(validateInvitationMessage("x".repeat(MIN_MESSAGE_CHARS - 1)).ok).toBe(false);
    expect(validateInvitationMessage("x".repeat(MIN_MESSAGE_CHARS)).ok).toBe(true);
  });

  it("rejects messages that are too long", () => {
    expect(validateInvitationMessage("x".repeat(MAX_MESSAGE_CHARS)).ok).toBe(true);
    expect(validateInvitationMessage("x".repeat(MAX_MESSAGE_CHARS + 1)).ok).toBe(false);
  });

  it("rejects links in several forms", () => {
    for (const bad of [
      `${GOOD} See https://acme.example.com/jobs`,
      `${GOOD} See http://acme.example.com`,
      `${GOOD} Visit www.acme.example`,
      `${GOOD} Apply at jobs.acme.io/java`,
      `${GOOD} Details: bit.ly/abc123`,
      `${GOOD} Our site is acme.com`,
    ]) {
      const r = validateInvitationMessage(bad);
      expect(r.ok, bad).toBe(false);
    }
  });

  it("rejects email addresses", () => {
    const r = validateInvitationMessage(`${GOOD} Write to hr@acme-corp.example`);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/email/i);
  });

  it("allows ordinary technical wording", () => {
    for (const fine of [
      `${GOOD} We use Node.js and Java 17 with Spring Boot 3.2.`,
      `${GOOD} We need 5.5 years e.g. REST and J2EE work.`,
      `${GOOD} Acme Co. is hiring in Pune, and the role is hybrid.`,
    ]) {
      expect(validateInvitationMessage(fine).ok, fine).toBe(true);
    }
  });

  it("rejects control characters but not tabs or newlines", () => {
    expect(validateInvitationMessage(`${GOOD}\u0000`).ok).toBe(false);
    expect(validateInvitationMessage(`${GOOD}\u0007`).ok).toBe(false);
    expect(validateInvitationMessage(`${GOOD}\tIndented\nSecond line`).ok).toBe(true);
  });
});

describe("looksLikeLink", () => {
  it("is false for plain prose", () => {
    expect(looksLikeLink("Hello there, we would love to talk.")).toBe(false);
  });
});

describe("invitationState", () => {
  const now = new Date("2026-10-10T12:00:00Z");
  const future = new Date("2026-10-20T12:00:00Z");
  const past = new Date("2026-10-01T12:00:00Z");

  it("keeps a pending invitation pending until it expires", () => {
    expect(invitationState({ status: "PENDING", expiresAt: future }, now)).toBe("PENDING");
  });

  it("expires a pending invitation exactly at the expiry time", () => {
    expect(invitationState({ status: "PENDING", expiresAt: now }, now)).toBe("EXPIRED");
    expect(invitationState({ status: "PENDING", expiresAt: past }, now)).toBe("EXPIRED");
  });

  it("never expires an invitation that was answered", () => {
    expect(invitationState({ status: "ACCEPTED", expiresAt: past }, now)).toBe("ACCEPTED");
    expect(invitationState({ status: "DECLINED", expiresAt: past }, now)).toBe("DECLINED");
  });
});

describe("invitationExpiry", () => {
  it("is 14 days later", () => {
    expect(invitationExpiry(new Date("2026-10-10T00:00:00Z"))).toEqual(new Date("2026-10-24T00:00:00Z"));
  });
});

describe("invitationsRemaining", () => {
  it("counts down and stops at zero", () => {
    expect(invitationsRemaining(0)).toBe(10);
    expect(invitationsRemaining(4)).toBe(6);
    expect(invitationsRemaining(10)).toBe(0);
    expect(invitationsRemaining(25)).toBe(0);
  });
});