"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireCandidate } from "@/lib/candidate";

const PATH = "/candidate/profile";

function parseDates(formData: FormData) {
  const start = String(formData.get("startDate") ?? "");
  const end = String(formData.get("endDate") ?? "");
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : null;
  if (isNaN(startDate.getTime())) return null;
  if (endDate && (isNaN(endDate.getTime()) || endDate < startDate)) return null;
  return { startDate, endDate };
}

export async function updateHeadline(formData: FormData) {
  const profile = await requireCandidate();
  const headline = String(formData.get("headline") ?? "").trim().slice(0, 140);
  await prisma.candidateProfile.update({
    where: { id: profile.id },
    data: { headline: headline || null },
  });
  revalidatePath(PATH);
}

const historySchema = z.object({
  jobTitle: z.string().trim().min(1).max(100),
  company: z.string().trim().min(1).max(100),
  description: z.string().trim().max(2000).optional(),
});

export async function addCareerHistory(formData: FormData) {
  const profile = await requireCandidate();
  const text = historySchema.safeParse(Object.fromEntries(formData));
  if (!text.success) redirect(`${PATH}?error=invalid`);
  const dates = parseDates(formData);
  if (!dates) redirect(`${PATH}?error=dates`);

  await prisma.careerHistory.create({
    data: {
      candidateId: profile.id,
      jobTitle: text.data.jobTitle,
      company: text.data.company,
      description: text.data.description || null,
      ...dates,
    },
  });
  revalidatePath(PATH);
}

export async function deleteCareerHistory(formData: FormData) {
  const profile = await requireCandidate();
  const id = String(formData.get("id") ?? "");
  await prisma.careerHistory.deleteMany({
    where: { id, candidateId: profile.id },
  });
  revalidatePath(PATH);
}

export async function addCareerBreak(formData: FormData) {
  const profile = await requireCandidate();
  const dates = parseDates(formData);
  if (!dates) redirect(`${PATH}?error=dates`);

  await prisma.careerBreak.create({
    data: { candidateId: profile.id, ...dates },
  });
  revalidatePath(PATH);
}

export async function deleteCareerBreak(formData: FormData) {
  const profile = await requireCandidate();
  const id = String(formData.get("id") ?? "");
  await prisma.careerBreak.deleteMany({
    where: { id, candidateId: profile.id },
  });
  revalidatePath(PATH);
}