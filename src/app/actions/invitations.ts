"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { loadCandidateListing, loadDiscoveryJob } from "@/lib/discovery/load";
import { requireEmployer } from "@/lib/employer";
import {
  DAILY_INVITATION_LIMIT,
  invitationExpiry,
  invitationsRemaining,
  validateInvitationMessage,
} from "@/lib/invitations/rules";

export type InviteResult = { error?: string; sent?: boolean };

// One message for every reason, so nobody can tell a block from a missing or paused candidate.
const UNAVAILABLE = "This candidate can't be invited for this job right now.";

export async function sendInvitation(_prev: InviteResult, formData: FormData): Promise<InviteResult> {
  const employer = await requireEmployer();
  const jobId = String(formData.get("jobId") ?? "");
  const code = String(formData.get("code") ?? "");

  const checked = validateInvitationMessage(String(formData.get("message") ?? ""));
  if (!checked.ok) return { error: checked.reason };

  const job = await loadDiscoveryJob(jobId, employer.id);
  if (!job) return { error: UNAVAILABLE };

  // The same check as opening her listing: discoverable, not blocked, and relevant to this job.
  const listing = await loadCandidateListing(job, employer.id, code);
  if (!listing) return { error: UNAVAILABLE };

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const sent = await prisma.invitation.count({
    where: { employerId: employer.id, createdAt: { gte: since } },
  });
  if (invitationsRemaining(sent) === 0) {
    return {
      error: `You have reached the limit of ${DAILY_INVITATION_LIMIT} invitations in 24 hours. Please try again later.`,
    };
  }

  try {
    await prisma.invitation.create({
      data: {
        employerId: employer.id,
        jobId: job.id,
        candidateId: listing.candidateId,
        companyName: employer.companyName,
        jobTitle: job.title,
        message: checked.message,
        expiresAt: invitationExpiry(),
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "You have already invited this candidate for this job." };
    }
    throw e;
  }

  revalidatePath(`/employer/jobs/${job.id}/candidates/${listing.code}`);
  return { sent: true };
}