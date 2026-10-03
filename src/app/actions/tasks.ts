"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCandidate } from "@/lib/candidate";

const MAX_CODE_CHARS = 20_000;
const MAX_SUBMISSIONS_PER_HOUR = 30;

export async function submitCode(formData: FormData) {
  const profile = await requireCandidate();
  const slug = String(formData.get("slug") ?? "");
  const code = String(formData.get("code") ?? "");
  const back = `/candidate/tasks/${encodeURIComponent(slug)}`;

  const task = await prisma.task.findFirst({
    where: { slug, active: true, kind: "JAVA_CODE" },
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

  await prisma.submission.create({
    data: {
      candidateId: profile.id,
      taskId: task.id,
      code,
      totalCount: task._count.testCases,
    },
  });

  revalidatePath(back);
  redirect(`${back}?submitted=1`);
}