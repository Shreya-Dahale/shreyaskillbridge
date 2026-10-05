import { prisma } from "@/lib/db";
import { buildSharedProfile } from "@/lib/profile/build-profile";
import { loadProfileSource } from "@/lib/profile/load-source";
import { discoveryToShareSettings } from "@/lib/profile/settings";
import type { RequirementInput } from "@/lib/skills/gap-engine";
import { displayCode, isValidDiscoveryCode } from "./code";
import { groupCandidates } from "./group";
import { matchCandidate, type CandidateMatch } from "./match";

const MAX_CANDIDATES = 200;

export type DiscoveryJob = { id: string; title: string; requirements: RequirementInput[] };

/** A job the employer owns and has published. Anything else returns null, so the page shows a 404. */
export async function loadDiscoveryJob(jobId: string, employerId: string): Promise<DiscoveryJob | null> {
  const job = await prisma.job.findFirst({
    where: { id: jobId, employerId, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      skills: {
        select: { importance: true, minYears: true, skill: { select: { id: true, name: true } } },
        orderBy: [{ importance: "asc" }, { skill: { name: "asc" } }],
      },
    },
  });
  if (!job) return null;

  return {
    id: job.id,
    title: job.title,
    requirements: job.skills.map((js) => ({
      skillId: js.skill.id,
      name: js.skill.name,
      importance: js.importance,
      minYears: js.minYears,
    })),
  };
}

/** Everyone discoverable who has shared something to match on, minus companies that blocked this employer. */
export async function loadMatches(job: DiscoveryJob, employerId: string) {
  const rows = await prisma.discoverySettings.findMany({
    where: {
      enabled: true,
      OR: [{ includeSkills: true }, { includeAssessments: true }],
      candidate: { blocks: { none: { employerId } } },
    },
    orderBy: { code: "asc" },
    take: MAX_CANDIDATES,
    select: { code: true, candidateId: true, includeSkills: true, includeAssessments: true },
  });

  const items = await Promise.all(
    rows.map(async (row) => {
      const source = await loadProfileSource(row.candidateId);
      if (!source) return null;
      const match = matchCandidate({
        requirements: job.requirements,
        source,
        exposure: { includeSkills: row.includeSkills, includeAssessments: row.includeAssessments },
      });
      return { code: row.code, match };
    })
  );

  return items.filter((x): x is { code: string; match: CandidateMatch } => x !== null);
}

export async function loadGroupedMatches(job: DiscoveryJob, employerId: string) {
  return groupCandidates(await loadMatches(job, employerId), job.id);
}

/**
 * One candidate's listing for one job. Returns null unless she is discoverable, has not blocked this
 * employer, and is relevant to this job, so codes cannot be probed for people who are not in the results.
 */
export async function loadCandidateListing(job: DiscoveryJob, employerId: string, code: string) {
  if (!isValidDiscoveryCode(code)) return null;

  const s = await prisma.discoverySettings.findFirst({
    where: { code, enabled: true, candidate: { blocks: { none: { employerId } } } },
    select: {
      candidateId: true,
      code: true,
      includeHeadline: true,
      includeSkills: true,
      includeAssessments: true,
      includeSummary: true,
      includeRoles: true,
      includeBreak: true,
    },
  });
  if (!s) return null;

  const source = await loadProfileSource(s.candidateId);
  if (!source) return null;

  const match = matchCandidate({
    requirements: job.requirements,
    source,
    exposure: { includeSkills: s.includeSkills, includeAssessments: s.includeAssessments },
  });
  if (match.group === "NONE") return null;

  const profile = {
    ...buildSharedProfile(
      source,
      discoveryToShareSettings({
        includeHeadline: s.includeHeadline,
        includeSkills: s.includeSkills,
        includeAssessments: s.includeAssessments,
        includeSummary: s.includeSummary,
        includeRoles: s.includeRoles,
        includeBreak: s.includeBreak,
      })
    ),
    name: displayCode(s.code),
  };

  return { candidateId: s.candidateId, code: s.code, match, profile };
}