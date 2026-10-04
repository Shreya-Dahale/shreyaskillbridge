export type AccessDecision = "SHOW" | "LOGIN" | "HIDE";

/**
 * SHOW  - display the profile.
 * LOGIN - send an anonymous visitor to the login page. Used for invalid links too, so nothing is revealed.
 * HIDE  - show the neutral "not available" page to someone who is logged in.
 */
export function decideAccess(input: {
  linkActive: boolean;
  audience: "EMPLOYERS" | "ANYONE" | null;
  loggedIn: boolean;
  isEmployer: boolean;
}): AccessDecision {
  if (input.linkActive && input.audience === "ANYONE") return "SHOW";
  if (input.linkActive && input.audience === "EMPLOYERS" && input.isEmployer) return "SHOW";
  return input.loggedIn ? "HIDE" : "LOGIN";
}