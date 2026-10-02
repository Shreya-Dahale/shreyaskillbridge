"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireEmployer } from "@/lib/employer";
import { extractJobData } from "@/lib/ai/gemini";

const jobSchema = z.object({
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().min(50).max(10000),
});

export async function createJob(formData: FormData) {
  const profile = await requireEmployer();

  const parsed = jobSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/employer/jobs/new?error=invalid");

  const job = await prisma.job.create({
    data: {
      employerId: profile.id,
      title: parsed.data.title,
      description: parsed.data.description,
    },
  });

  revalidatePath("/employer/jobs");
  redirect(`/employer/jobs/${job.id}`);
}

export async function deleteJob(formData: FormData) {
  const profile = await requireEmployer();
  const id = String(formData.get("id") ?? "");

  await prisma.job.deleteMany({
    where: { id, employerId: profile.id },
  });

  revalidatePath("/employer/jobs");
  redirect("/employer/jobs");
}

export async function analyzeJob(formData: FormData) {
  const profile = await requireEmployer();
  const id = String(formData.get("id") ?? "");

  const job = await prisma.job.findFirst({
    where: { id, employerId: profile.id },
  });
  if (!job) return;

  const back = `/employer/jobs/${job.id}`;

  let result;
  try {
    result = await extractJobData(job.title, job.description);
  } catch (e) {
    console.error("Job analysis failed", e);
    redirect(`${back}?error=ai`);
  }

  await prisma.job.update({
    where: { id: job.id },
    data: {
      extractionJson: JSON.parse(JSON.stringify(result)),
      extractedAt: new Date(),
    },
  });
  revalidatePath(back);
}
