import { prisma } from "@/lib/db";
import { tallyInvitations } from "@/lib/invitations/inbox";
import { topCounts } from "./counts";
import { buildEmployerChecklist } from "./employer-checklist";

const WINDOW_DAYS = 30;

/** Everything the employer dashboard shows. All of it is a count or a status. */
export async function loadEmployerDashboard(employerId: string) {
  const now = new Date();
  const since = new Date(now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const [employer, jobs, withRequirements, requirementSkills, recentJobs, profilesViewed, invitations] =
    await Promise.all([
      prisma.employerProfile.findUnique({
        where: { id: employerId },
        select: { website: true, about: true },
      }),
      prisma.job.findMany({ where: { employerId }, select: { status: true }, take: 1000 }),
      prisma.job.count({ where: { employerId, skills: { some: {} } } }),
      prisma.jobSkill.findMany({
        where: { job: { employerId } },
        select: { skill: { select: { name: true } } },
        take: 2000,
      }),
      prisma.job.findMany({
        where: { employerId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          _count: { select: { skills: true } },
        },
      }),
      prisma.shareView.count({ where: { viewerEmployerId: employerId, viewedAt: { gte: since } } }),
      prisma.invitation.findMany({
        where: { employerId },
        select: { status: true, expiresAt: true },
        take: 1000,
      }),
    ]);

  const counts = {
    published: jobs.filter((j) => j.status === "PUBLISHED").length,
    draft: jobs.filter((j) => j.status === "DRAFT").length,
    closed: jobs.filter((j) => j.status === "CLOSED").length,
  };

  return {
    counts,
    profilesViewed,
    windowDays: WINDOW_DAYS,
    topSkills: topCounts(
      requirementSkills.map((s) => s.skill.name),
      8
    ),
    recentJobs,
    invitations: tallyInvitations(invitations, now),
    checklist: buildEmployerChecklist({
      companyComplete: Boolean(employer?.website || employer?.about),
      jobs: jobs.length,
      jobsWithRequirements: withRequirements,
      publishedEver: counts.published + counts.closed,
    }),
  };
}