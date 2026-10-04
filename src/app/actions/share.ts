"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCandidate } from "@/lib/candidate";
import { settingsFromSearchParams } from "@/lib/profile/settings";
import { generateToken, hashToken } from "@/lib/share/token";
import { EXPIRY_OPTIONS, MAX_ACTIVE_LINKS, expiryDate } from "@/lib/share/status";

export type CreateResult = { error?: string; token?: string };

const PATH = "/candidate/share";

export async function createShareLink(_prev: CreateResult, formData: FormData): Promise<CreateResult> {
  const profile = await requireCandidate();

  const params: Record<string, string> = { preview: "1" };
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") params[key] = value;
  }
  const settings = settingsFromSearchParams(params);

  const hasSection =
    settings.includeHeadline ||
    settings.includeSkills ||
    settings.includeAssessments ||
    settings.includeSummary ||
    settings.includeRoles ||
    settings.includeBreak;
  if (!hasSection) return { error: "Choose at least one section to include." };

  const days = parseInt(params.days ?? "", 10);
  if (!EXPIRY_OPTIONS.some((o) => o.days === days)) return { error: "Choose how long the link should last." };

  const audience = params.audience === "ANYONE" ? ("ANYONE" as const) : ("EMPLOYERS" as const);
  const label = (params.label ?? "").trim().slice(0, 60) || null;

  const now = new Date();
  const active = await prisma.shareLink.count({
    where: { candidateId: profile.id, revokedAt: null, expiresAt: { gt: now } },
  });
  if (active >= MAX_ACTIVE_LINKS) {
    return { error: `You can have up to ${MAX_ACTIVE_LINKS} active links. Revoke one to make another.` };
  }

  const token = generateToken();
  await prisma.shareLink.create({
    data: {
      candidateId: profile.id,
      label,
      tokenHash: hashToken(token),
      audience,
      ...settings,
      expiresAt: expiryDate(days, now),
    },
  });

  revalidatePath(PATH);
  return { token };
}

export async function revokeShareLink(formData: FormData) {
  const profile = await requireCandidate();
  const id = String(formData.get("id") ?? "");

  await prisma.shareLink.updateMany({
    where: { id, candidateId: profile.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  revalidatePath(PATH);
}