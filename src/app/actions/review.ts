"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SkillSource } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireCandidate } from "@/lib/candidate";
import { resumeExtractionSchema } from "@/lib/ai/schemas";
import { slugify } from "@/lib/skills/slug";

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const checked = (fd: FormData, key: string) => fd.get(key) === "on";

function count(fd: FormData, key: string, max: number) {
  const n = parseInt(text(fd, key), 10);
  return Number.isFinite(n) && n >= 0 ? Math.min(n, max) : 0;
}

/** Blank -> null, valid date -> Date, anything else -> "invalid". */
function dateField(value: string): Date | null | "invalid" {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? "invalid" : d;
}

export async function confirmReview(formData: FormData) {
  const profile = await requireCandidate();
  const resumeId = text(formData, "resumeId");
  const back = `/candidate/review/${resumeId}`;

  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, candidateId: profile.id },
  });
  if (!resume) redirect("/candidate/resume");

  const draft = resumeExtractionSchema.safeParse(resume.extractionJson);
  if (!draft.success) redirect("/candidate/resume?error=ai");
  const original = draft.data.skills;

  const roleCount = count(formData, "roleCount", 30);
  const skillCount = count(formData, "skillCount", 100);
  const gapCount = count(formData, "gapCount", 20);
  const thisYear = new Date().getFullYear();

  // Roles
  const roles: {
    jobTitle: string;
    company: string;
    startDate: Date;
    endDate: Date | null;
    description: string | null;
  }[] = [];

  for (let i = 0; i < roleCount; i++) {
    if (!checked(formData, `role.${i}.include`)) continue;
    const jobTitle = text(formData, `role.${i}.jobTitle`);
    const company = text(formData, `role.${i}.company`);
    const start = dateField(text(formData, `role.${i}.startDate`));
    const end = dateField(text(formData, `role.${i}.endDate`));

    if (!jobTitle || !company || jobTitle.length > 100 || company.length > 100) {
      redirect(`${back}?error=invalid`);
    }
    if (start === null || start === "invalid" || end === "invalid" || (end && end < start)) {
      redirect(`${back}?error=dates`);
    }
    roles.push({
      jobTitle,
      company,
      startDate: start,
      endDate: end,
      description: text(formData, `role.${i}.description`).slice(0, 2000) || null,
    });
  }

  // Skills
  const skills: {
    name: string;
    years?: number;
    last?: number;
    source: SkillSource;
  }[] = [];

  for (let i = 0; i < skillCount; i++) {
    const name = text(formData, `skill.${i}.name`);
    const isDraft = i < original.length;
    if (isDraft ? !checked(formData, `skill.${i}.include`) : !name) continue;

    if (!name || name.length > 60 || !slugify(name)) redirect(`${back}?error=skills`);

    const yearsRaw = text(formData, `skill.${i}.years`);
    const lastRaw = text(formData, `skill.${i}.last`);
    const years = yearsRaw === "" ? undefined : Number(yearsRaw);
    const last = lastRaw === "" ? undefined : Number(lastRaw);

    if (years !== undefined && (!Number.isFinite(years) || years < 0 || years > 60)) {
      redirect(`${back}?error=skills`);
    }
    if (last !== undefined && (!Number.isInteger(last) || last < 1980 || last > thisYear + 1)) {
      redirect(`${back}?error=skills`);
    }

    let source: SkillSource = SkillSource.USER_ADDED;
    if (isDraft) {
      const o = original[i];
      const unchanged =
        o.name.trim().toLowerCase() === name.toLowerCase() &&
        o.yearsExperience === years &&
        o.lastUsedYear === last;
      source = unchanged ? SkillSource.EXTRACTED : SkillSource.USER_EDITED;
    }
    skills.push({ name, years, last, source });
  }

  // Suggested career breaks (only the ones the candidate ticked)
  const gaps: { startDate: Date; endDate: Date | null }[] = [];

  for (let i = 0; i < gapCount; i++) {
    if (!checked(formData, `gap.${i}.include`)) continue;
    const start = dateField(text(formData, `gap.${i}.startDate`));
    const end = dateField(text(formData, `gap.${i}.endDate`));
    if (!(start instanceof Date) || end === "invalid" || (end && end < start)) {
      redirect(`${back}?error=dates`);
    }
    gaps.push({ startDate: start, endDate: end });
  }

  if (roles.length === 0 && skills.length === 0 && gaps.length === 0) {
    redirect(`${back}?error=empty`);
  }

  await prisma.$transaction(async (tx) => {
    for (const r of roles) {
      const exists = await tx.careerHistory.findFirst({
        where: {
          candidateId: profile.id,
          startDate: r.startDate,
          jobTitle: { equals: r.jobTitle, mode: "insensitive" },
          company: { equals: r.company, mode: "insensitive" },
        },
      });
      if (!exists) {
        await tx.careerHistory.create({ data: { candidateId: profile.id, ...r } });
      }
    }

    for (const s of skills) {
      const slug = slugify(s.name);
      const skill = await tx.skill.upsert({
        where: { slug },
        update: {},
        create: { slug, name: s.name },
      });
      const values = {
        yearsExperience: s.years ?? null,
        lastUsedYear: s.last ?? null,
        source: s.source,
      };
      await tx.candidateSkill.upsert({
        where: { candidateId_skillId: { candidateId: profile.id, skillId: skill.id } },
        update: values,
        create: { candidateId: profile.id, skillId: skill.id, ...values },
      });
    }

    for (const g of gaps) {
      const exists = await tx.careerBreak.findFirst({
        where: { candidateId: profile.id, startDate: g.startDate },
      });
      if (!exists) {
        await tx.careerBreak.create({ data: { candidateId: profile.id, ...g } });
      }
    }
  });

  revalidatePath("/candidate/profile");
  revalidatePath("/candidate/skills");
  redirect("/candidate/skills?imported=1");
}