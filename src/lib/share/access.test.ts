import { describe, it, expect } from "vitest";
import { decideAccess } from "./access";
import { isValidTokenFormat, generateToken } from "./token";

const anon = { loggedIn: false, isEmployer: false };
const candidate = { loggedIn: true, isEmployer: false };
const employer = { loggedIn: true, isEmployer: true };

describe("decideAccess", () => {
  it("shows an open link to anyone, logged in or not", () => {
    for (const viewer of [anon, candidate, employer]) {
      expect(decideAccess({ linkActive: true, audience: "ANYONE", ...viewer })).toBe("SHOW");
    }
  });

  it("shows an employers-only link to employers only", () => {
    expect(decideAccess({ linkActive: true, audience: "EMPLOYERS", ...employer })).toBe("SHOW");
    expect(decideAccess({ linkActive: true, audience: "EMPLOYERS", ...candidate })).toBe("HIDE");
    expect(decideAccess({ linkActive: true, audience: "EMPLOYERS", ...anon })).toBe("LOGIN");
  });

  it("never shows an inactive link, whatever the audience", () => {
    for (const audience of ["EMPLOYERS", "ANYONE"] as const) {
      expect(decideAccess({ linkActive: false, audience, ...employer })).toBe("HIDE");
      expect(decideAccess({ linkActive: false, audience, ...anon })).toBe("LOGIN");
    }
  });

  it("treats a link that does not exist like any inactive one", () => {
    expect(decideAccess({ linkActive: false, audience: null, ...anon })).toBe("LOGIN");
    expect(decideAccess({ linkActive: false, audience: null, ...employer })).toBe("HIDE");
  });

  it("gives an anonymous visitor the same answer for a revoked link and an unknown one", () => {
    const revoked = decideAccess({ linkActive: false, audience: "EMPLOYERS", ...anon });
    const unknown = decideAccess({ linkActive: false, audience: null, ...anon });
    expect(revoked).toBe(unknown);
  });
});

describe("isValidTokenFormat", () => {
  it("accepts generated tokens", () => {
    for (let i = 0; i < 50; i++) expect(isValidTokenFormat(generateToken())).toBe(true);
  });

  it("rejects anything else", () => {
    for (const bad of ["", "abc", "x".repeat(42), "x".repeat(44), `${"x".repeat(42)}!`, `${"x".repeat(42)} `]) {
      expect(isValidTokenFormat(bad)).toBe(false);
    }
  });
});