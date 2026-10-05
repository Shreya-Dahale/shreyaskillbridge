export const MIN_MESSAGE_CHARS = 20;
export const MAX_MESSAGE_CHARS = 500;
export const DAILY_INVITATION_LIMIT = 10;
export const INVITATION_EXPIRY_DAYS = 14;

const DAY_MS = 24 * 60 * 60 * 1000;

const SCHEME = /\b(?:https?|ftp):\/\//i;
const WWW = /\bwww\./i;
const DOMAIN =
  /\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|net|org|io|co|in|dev|app|ai|me|ly|xyz|info|biz|link|site|online|tech)\b/i;
const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;

export type MessageCheck = { ok: true; message: string } | { ok: false; reason: string };

function hasControlCharacters(text: string): boolean {
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if ((code < 32 && code !== 10 && code !== 9) || code === 127) return true;
  }
  return false;
}

export function looksLikeLink(text: string): boolean {
  return SCHEME.test(text) || WWW.test(text) || DOMAIN.test(text);
}

/** Checks and cleans an invitation message. The message must be plain text without links or email addresses. */
export function validateInvitationMessage(raw: string): MessageCheck {
  const message = raw.replace(/\r\n/g, "\n").trim();

  if (message.length < MIN_MESSAGE_CHARS) {
    return {
      ok: false,
      reason: `Please write at least ${MIN_MESSAGE_CHARS} characters, so the candidate knows why you are writing.`,
    };
  }
  if (message.length > MAX_MESSAGE_CHARS) {
    return { ok: false, reason: `Please keep the message to ${MAX_MESSAGE_CHARS} characters or fewer.` };
  }
  if (hasControlCharacters(message)) {
    return { ok: false, reason: "The message contains characters that can't be sent." };
  }
  if (looksLikeLink(message)) {
    return {
      ok: false,
      reason: "Please remove links and web addresses. Candidates reply to you through SkillBridge.",
    };
  }
  if (EMAIL.test(message)) {
    return {
      ok: false,
      reason: "Please remove email addresses. If the candidate accepts, they can share their contact details with you.",
    };
  }
  return { ok: true, message };
}

export type InvitationState = "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";

/** A pending invitation past its expiry counts as expired. Nothing needs to run in the background. */
export function invitationState(
  invitation: { status: "PENDING" | "ACCEPTED" | "DECLINED"; expiresAt: Date },
  now: Date = new Date()
): InvitationState {
  if (invitation.status === "PENDING" && invitation.expiresAt.getTime() <= now.getTime()) return "EXPIRED";
  return invitation.status;
}

export function invitationExpiry(now: Date = new Date()): Date {
  return new Date(now.getTime() + INVITATION_EXPIRY_DAYS * DAY_MS);
}

export function invitationsRemaining(sentInLast24Hours: number): number {
  return Math.max(0, DAILY_INVITATION_LIMIT - sentInLast24Hours);
}