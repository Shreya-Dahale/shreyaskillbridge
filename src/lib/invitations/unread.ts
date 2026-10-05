import { prisma } from "@/lib/db";

/** Invitations waiting for a candidate that she has not opened yet. Expired ones do not count. */
export async function candidateUnreadInvitations(userId: string): Promise<number> {
  return prisma.invitation.count({
    where: {
      candidate: { userId },
      status: "PENDING",
      expiresAt: { gt: new Date() },
      candidateReadAt: null,
    },
  });
}

/** Answers (accepted or declined) that an employer has not opened yet. */
export async function employerUnreadResponses(userId: string): Promise<number> {
  return prisma.invitation.count({
    where: {
      employer: { userId },
      status: { in: ["ACCEPTED", "DECLINED"] },
      employerReadAt: null,
    },
  });
}