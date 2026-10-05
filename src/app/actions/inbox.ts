"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCandidate } from "@/lib/candidate";
import { prisma } from "@/lib/db";

const PATH = "/candidate/invitations";
const field = (fd: FormData, key: string) => String(fd.get(key) ?? "");

/** Accepting is the only moment her name and email are copied onto an invitation. */
export async function acceptInvitation(formData: FormData) {
  const profile = await requireCandidate();
  const id = field(formData, "id");

  const user = await prisma.user.findUnique({
    where: { id: profile.userId },
    select: { name: true, email: true },
  });
  if (!user) redirect("/login");

  const now = new Date();
  // One atomic update: it succeeds only for her own invitation that is still pending and not expired.
  const result = await prisma.invitation.updateMany({
    where: { id, candidateId: profile.id, status: "PENDING", expiresAt: { gt: now } },
    data: {
      status: "ACCEPTED",
      respondedAt: now,
      contactName: user.name,
      contactEmail: user.email,
      candidateReadAt: now,
    },
  });

  revalidatePath(PATH);
  redirect(result.count === 1 ? `${PATH}?accepted=1` : `${PATH}?error=unavailable`);
}

export async function declineInvitation(formData: FormData) {
  const profile = await requireCandidate();
  const id = field(formData, "id");

  const now = new Date();
  const result = await prisma.invitation.updateMany({
    where: { id, candidateId: profile.id, status: "PENDING", expiresAt: { gt: now } },
    data: { status: "DECLINED", respondedAt: now, candidateReadAt: now },
  });

  revalidatePath(PATH);
  redirect(result.count === 1 ? `${PATH}?declined=1` : `${PATH}?error=unavailable`);
}

/** Blocks the company behind an invitation and declines everything it still has open with her. */
export async function blockCompany(formData: FormData) {
  const profile = await requireCandidate();
  const id = field(formData, "id");

  const invitation = await prisma.invitation.findFirst({
    where: { id, candidateId: profile.id },
    select: { employerId: true },
  });
  if (!invitation) redirect(`${PATH}?error=unavailable`);

  const now = new Date();
  await prisma.$transaction([
    prisma.companyBlock.upsert({
      where: { candidateId_employerId: { candidateId: profile.id, employerId: invitation.employerId } },
      update: {},
      create: { candidateId: profile.id, employerId: invitation.employerId },
    }),
    prisma.invitation.updateMany({
      where: { candidateId: profile.id, employerId: invitation.employerId, status: "PENDING" },
      data: { status: "DECLINED", respondedAt: now, candidateReadAt: now },
    }),
  ]);

  revalidatePath(PATH);
  redirect(`${PATH}?blocked=1`);
}

export async function unblockCompany(formData: FormData) {
  const profile = await requireCandidate();
  const id = field(formData, "id");

  await prisma.companyBlock.deleteMany({ where: { id, candidateId: profile.id } });

  revalidatePath(PATH);
  redirect(`${PATH}?unblocked=1`);
}