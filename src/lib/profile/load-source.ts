import { prisma } from "@/lib/db";
import type { ProfileSource } from "./types";

/** Reads everything the profile builder needs. The builder then decides what may be shown. */
export async function loadProfileSource(candidateId: string): Promise<ProfileSource | null> {
  const profile = await prisma.candidateProfile.findUnique({
    where: { id: candidateId },
    select: {
      headline: true,
      user: { select: { name: true } },
      skills: {
        select: {
          yearsExperience: true,
          lastUsedYear: true,
          skill: { select: { id: true, name: true } },
        },
      },
      careerHistory: {
        select: { jobTitle: true, company: true, startDate: true, endDate: true },
      },
      careerBreaks: { select: { startDate: true, endDate: true } },
      evidence: {
        select: { kind: true, occurredAt: true, skill: { select: { id: true, name: true } } },
      },
      submissions: {
        orderBy: { createdAt: "asc" },
        select: {
          status: true,
          createdAt: true,
          gradedAt: true,
          task: {
            select: {
              id: true,
              title: true,
              skills: { select: { skill: { select: { name: true } } } },
            },
          },
        },
      },
    },
  });
  if (!profile) return null;

  const relations = await prisma.skillRelation.findMany({
    select: { fromId: true, toId: true, kind: true },
  });

  return {
    displayName: profile.user.name,
    headline: profile.headline,
    skills: profile.skills.map((s) => ({
      skillId: s.skill.id,
      name: s.skill.name,
      yearsExperience: s.yearsExperience,
      lastUsedYear: s.lastUsedYear,
    })),
    roles: profile.careerHistory,
    careerBreaks: profile.careerBreaks,
    evidence: profile.evidence.map((e) => ({
      skillId: e.skill.id,
      skillName: e.skill.name,
      kind: e.kind,
      date: e.occurredAt,
    })),
    submissions: profile.submissions.map((s) => ({
      taskId: s.task.id,
      taskTitle: s.task.title,
      skillNames: s.task.skills.map((t) => t.skill.name),
      status: s.status,
      createdAt: s.createdAt,
      gradedAt: s.gradedAt,
    })),
    relations,
  };
}