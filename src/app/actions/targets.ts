"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireCandidate } from "@/lib/candidate";

const MAX_TARGETS = 5;
const LIST = "/candidate/jobs";

export async function addTarget(formData: FormData) {
  const profile = await requireCandidate();
  const jobId = String(formData.get("jobId") ?? "");

  const job = await prisma.job.findFirst({
    where: { id: jobId, status: "PUBLISHED" },
    select: { id: true },
  });
  if (!job) redirect(`${LIST}?error=unavailable`);

  const existing = await prisma.targetJob.findUnique({
    where: { candidateId_jobId: { candidateId: profile.id, jobId: job.id } },
  });

  if (!existing) {
    const count = await prisma.targetJob.count({ where: { candidateId: profile.id } });
    if (count >= MAX_TARGETS) redirect(`${LIST}?error=max`);
    await prisma.targetJob.create({
      data: { candidateId: profile.id, jobId: job.id },
    });
  }

  revalidatePath(LIST);
  redirect(LIST);
}

export async function removeTarget(formData: FormData) {
  const profile = await requireCandidate();
  const jobId = String(formData.get("jobId") ?? "");

  await prisma.targetJob.deleteMany({
    where: { candidateId: profile.id, jobId },
  });

  revalidatePath(LIST);
  redirect(LIST);
}