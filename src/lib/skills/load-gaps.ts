import { prisma } from "@/lib/db";
import { analyzeGaps } from "./gap-engine";

/** Loads a candidate and a published job from the database, then runs the gap engine. */
export async function loadGapAnalysis(candidateId: string, jobId: string) {
  const job = await prisma.job.findFirst({
    where: { id: jobId, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      employer: { select: { companyName: true } },
      skills: {
        select: {
          importance: true,
          minYears: true,
          skill: { select: { id: true, name: true } },
        },
        orderBy: [{ importance: "asc" }, { skill: { name: "asc" } }],
      },
    },
  });
  if (!job) return null;

  const [candidateSkills, relations] = await Promise.all([
    prisma.candidateSkill.findMany({
      where: { candidateId },
      select: {
        yearsExperience: true,
        lastUsedYear: true,
        skill: { select: { id: true, name: true } },
      },
    }),
    prisma.skillRelation.findMany({
      select: { fromId: true, toId: true, kind: true },
    }),
  ]);

  const gaps = analyzeGaps({
    requirements: job.skills.map((js) => ({
      skillId: js.skill.id,
      name: js.skill.name,
      importance: js.importance,
      minYears: js.minYears,
    })),
    candidateSkills: candidateSkills.map((cs) => ({
      skillId: cs.skill.id,
      name: cs.skill.name,
      yearsExperience: cs.yearsExperience,
      lastUsedYear: cs.lastUsedYear,
    })),
    evidence: [], // Phase 4 adds assessment results here
    relations,
  });

  return { job, gaps, hasSkills: candidateSkills.length > 0 };
}