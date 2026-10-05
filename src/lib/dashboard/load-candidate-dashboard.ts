import { prisma } from "@/lib/db";
import { buildSharedProfile } from "@/lib/profile/build-profile";
import { loadProfileSource } from "@/lib/profile/load-source";
import { bucketViewsByDay } from "@/lib/share/views";
import { buildChecklist } from "./checklist";

export const WINDOW_DAYS = 30;

/** Everything the candidate dashboard shows. All of it is a count or a status. */
export async function loadCandidateDashboard(candidateId: string) {
  const now = new Date();
  const since = new Date(now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const [
    roles,
    skills,
    targets,
    passed,
    linksCreated,
    views,
    submissions,
    source,
    invitationsWaiting,
    discovery,
    listingViews,
  ] = await Promise.all([
    prisma.careerHistory.count({ where: { candidateId } }),
    prisma.candidateSkill.count({ where: { candidateId } }),
    prisma.targetJob.count({ where: { candidateId } }),
    prisma.submission.findMany({
      where: { candidateId, status: "PASSED" },
      distinct: ["taskId"],
      select: { taskId: true },
    }),
    prisma.shareLink.count({ where: { candidateId } }),
    prisma.shareView.count({ where: { shareLink: { candidateId }, viewedAt: { gte: since } } }),
    prisma.submission.findMany({
      where: { candidateId, createdAt: { gte: since } },
      select: { createdAt: true },
      take: 2000,
    }),
    loadProfileSource(candidateId),
    prisma.invitation.count({
      where: { candidateId, status: "PENDING", expiresAt: { gt: now } },
    }),
    prisma.discoverySettings.findUnique({ where: { candidateId }, select: { enabled: true } }),
    prisma.discoveryView.count({ where: { candidateId, viewedAt: { gte: since } } }),
  ]);

  const skillStatuses = source
    ? (buildSharedProfile(
        source,
        {
          showName: false,
          includeHeadline: false,
          includeSkills: true,
          includeAssessments: false,
          includeSummary: false,
          includeRoles: false,
          includeBreak: false,
        },
        now
      ).skills ?? []
      ).map((s) => s.status)
    : [];

  return {
    stats: { skills, tasksPassed: passed.length, targets, views },
    checklist: buildChecklist({ roles, skills, targets, passedTasks: passed.length, linksCreated }),
    skillStatuses,
    practiceBuckets: bucketViewsByDay(
      submissions.map((s) => s.createdAt),
      WINDOW_DAYS,
      now
    ),
    practiceTotal: submissions.length,
    invitationsWaiting,
    discoveryEnabled: discovery?.enabled ?? false,
    listingViews,
  };
}