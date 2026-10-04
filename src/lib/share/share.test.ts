import { describe, it, expect } from "vitest";
import { generateToken, hashToken } from "./token";
import { expiryDate, linkStatus } from "./status";
import { DEFAULT_SETTINGS, includedLabels } from "../profile/settings";

describe("tokens", () => {
  it("are long, URL-safe and unique", () => {
    const tokens = Array.from({ length: 200 }, () => generateToken());
    for (const t of tokens) {
      expect(t).toHaveLength(43);
      expect(t).toMatch(/^[A-Za-z0-9_-]+$/);
    }
    expect(new Set(tokens).size).toBe(tokens.length);
  });

  it("hash deterministically with SHA-256", () => {
    expect(hashToken("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(hashToken("abc")).toBe(hashToken("abc"));
    expect(hashToken("abc")).not.toBe(hashToken("abd"));
  });

  it("hashes never contain the token", () => {
    const token = generateToken();
    const hash = hashToken(token);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain(token);
  });
});

describe("linkStatus", () => {
  const now = new Date("2026-10-10T12:00:00Z");
  const future = new Date("2026-10-20T12:00:00Z");
  const past = new Date("2026-10-01T12:00:00Z");

  it("is active before the expiry and when not revoked", () => {
    expect(linkStatus({ expiresAt: future, revokedAt: null }, now)).toBe("ACTIVE");
  });

  it("expires exactly at the expiry time", () => {
    expect(linkStatus({ expiresAt: now, revokedAt: null }, now)).toBe("EXPIRED");
    expect(linkStatus({ expiresAt: past, revokedAt: null }, now)).toBe("EXPIRED");
  });

  it("lets revoked beat expired", () => {
    expect(linkStatus({ expiresAt: future, revokedAt: past }, now)).toBe("REVOKED");
    expect(linkStatus({ expiresAt: past, revokedAt: past }, now)).toBe("REVOKED");
  });
});

describe("expiryDate", () => {
  it("adds whole days", () => {
    const now = new Date("2026-10-10T00:00:00Z");
    expect(expiryDate(7, now)).toEqual(new Date("2026-10-17T00:00:00Z"));
    expect(expiryDate(90, now)).toEqual(new Date("2027-01-08T00:00:00Z"));
  });
});

describe("includedLabels", () => {
  it("lists the sections switched on by default", () => {
    expect(includedLabels(DEFAULT_SETTINGS)).toEqual([
      "Headline",
      "Skills and their status",
      "Passed practice tasks",
      "Summary",
    ]);
  });

  it("lists nothing when everything is off", () => {
    const off = Object.fromEntries(Object.keys(DEFAULT_SETTINGS).map((k) => [k, false]));
    expect(includedLabels(off as typeof DEFAULT_SETTINGS)).toEqual([]);
  });
});