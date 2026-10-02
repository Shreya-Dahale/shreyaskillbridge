"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { SkillImportance } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireEmployer } from "@/lib/employer";
import { slugify } from "@/lib/skills/slug";

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

function toInt(fd: FormData, key: string, max: number) {
  const n = parseInt(text(fd, key), 10);
  return Number.isFinite(n) && n >= 0 ? Math.min(n, max) : 0;
}

type Requirement = { name: string; importance: SkillImportance; minYears: number | null };

export async function saveRequirements(formData: FormData) {
  const profile = await requireEmployer();
  const jobId = text(formData, "jobId");
  const back = `/employer/jobs/${jobId}/review`;

  const job = await prisma.job.findFirst({
    where: { id: jobId, employerId: profile.id },
  });
  if (!job) redirect("/employer/jobs");

  const rowCount = toInt(formData, "rowCount", 60);
  const prefillCount = Math.min(toInt(formData, "prefillCount", 60), rowCount);

  const bySlug = new Map<string, Requirement>();

  for (let i = 0; i < rowCount; i++) {
    const name = text(formData, `skill.${i}.name`);
    const isPrefilled = i < prefillCount;
    if (isPrefilled ? formData.get(`skill.${i}.include`) !== "on" : !name) continue;

    const slug = slugify(name);
    if (!name || name.length > 60 || !slug) redirect(`${back}?error=skills`);

    const importance = text(formData, `skill.${i}.importance`);
    if (importance !== "REQUIRED" && importance !== "PREFERRED") {
      redirect(`${back}?error=skills`);
    }

    const yearsRaw = text(formData, `skill.${i}.years`);
    const years = yearsRaw === "" ? null : Number(yearsRaw);
    if (years !== null && (!Number.isFinite(years) || years < 0 || years > 60)) {
      redirect(`${back}?error=skills`);
    }

    // If the same skill appears twice, keep it once: required wins over preferred.
    const existing = bySlug.get(slug);
    if (existing) {
      bySlug.set(slug, {
        name: existing.name,
        importance: existing.importance === "REQUIRED" || importance === "REQUIRED" ? "REQUIRED" : "PREFERRED",
        minYears: existing.minYears ?? years,
      });
    } else {
      bySlug.set(slug, { name, importance, minYears: years });
    }
  }

  const hasRequired = [...bySlug.values()].some((s) => s.importance === "REQUIRED");

  await prisma.$transaction(async (tx) => {
    await tx.jobSkill.deleteMany({ where: { jobId: job.id } });

    for (const [slug, req] of bySlug) {
      const skill = await tx.skill.upsert({
        where: { slug },
        update: {},
        create: { slug, name: req.name },
      });
      await tx.jobSkill.create({
        data: {
          jobId: job.id,
          skillId: skill.id,
          importance: req.importance,
          minYears: req.minYears,
        },
      });
    }

    if (job.status === "PUBLISHED" && !hasRequired) {
      await tx.job.update({ where: { id: job.id }, data: { status: "DRAFT" } });
    }
  });

  revalidatePath(`/employer/jobs/${job.id}`);
  redirect(`/employer/jobs/${job.id}?saved=1`);
}

const statusSchema = z.enum(["DRAFT", "PUBLISHED", "CLOSED"]);

export async function setJobStatus(formData: FormData) {
  const profile = await requireEmployer();
  const id = text(formData, "id");

  const status = statusSchema.safeParse(text(formData, "status"));
  if (!status.success) return;

  const job = await prisma.job.findFirst({
    where: { id, employerId: profile.id },
    include: { skills: { select: { importance: true } } },
  });
  if (!job) return;

  if (status.data === "PUBLISHED" && !job.skills.some((s) => s.importance === "REQUIRED")) {
    redirect(`/employer/jobs/${job.id}?error=norequired`);
  }

  await prisma.job.update({ where: { id: job.id }, data: { status: status.data } });
  revalidatePath(`/employer/jobs/${job.id}`);
  revalidatePath("/employer/jobs");
}