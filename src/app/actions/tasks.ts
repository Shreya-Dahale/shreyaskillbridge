"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCandidate } from "@/lib/candidate";
import { gradeSubmission } from "@/lib/grading/grade";
import { DEMO_MODE } from "@/lib/demo";

const MAX_CODE_CHARS = 20_000;
const MAX_SUBMISSIONS_PER_HOUR = 30;

export async function submitCode(formData: FormData) {
  const profile = await requireCandidate();
  const slug = String(formData.get("slug") ?? "");
  const code = String(formData.get("code") ?? "");
  const back = `/candidate/tasks/${encodeURIComponent(slug)}`;
  if (DEMO_MODE) redirect(`${back}?error=demo`);

  const task = await prisma.task.findFirst({
    where: { slug, active: true, kind: { in: ["JAVA_CODE", "SQL"] } },
    select: { id: true, _count: { select: { testCases: true } } },
  });
  if (!task) redirect("/candidate/tasks");

  if (code.trim().length === 0) redirect(`${back}?error=empty`);
  if (code.includes("\u0000")) redirect(`${back}?error=invalid`);
  if (code.length > MAX_CODE_CHARS) redirect(`${back}?error=size`);

  const since = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await prisma.submission.count({
    where: { candidateId: profile.id, createdAt: { gte: since } },
  });
  if (recent >= MAX_SUBMISSIONS_PER_HOUR) redirect(`${back}?error=limit`);

  const submission = await prisma.submission.create({
    data: {
      candidateId: profile.id,
      taskId: task.id,
      code,
      totalCount: task._count.testCases,
    },
    select: { id: true },
  });

  await gradeSubmission(submission.id, profile.id);

  revalidatePath(back);
  revalidatePath("/candidate/tasks");
  redirect(`${back}?submitted=1`);
}

export async function regradeSubmission(formData: FormData) {
  if (DEMO_MODE) redirect("/candidate/tasks");
  const profile = await requireCandidate();
  const id = String(formData.get("id") ?? "");

  const submission = await prisma.submission.findFirst({
    where: { id, candidateId: profile.id },
    select: { id: true, task: { select: { slug: true } } },
  });
  if (!submission) redirect("/candidate/tasks");

  await gradeSubmission(submission.id, profile.id);

  const back = `/candidate/tasks/${encodeURIComponent(submission.task.slug)}`;
  revalidatePath(back);
  revalidatePath("/candidate/tasks");
  redirect(back);
}