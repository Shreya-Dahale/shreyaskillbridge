import type { PrismaClient } from "@prisma/client";
import { getOrCreateSkill } from "../src/lib/skills/resolve";

const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY_MS);
const d = (s: string) => new Date(`${s}T00:00:00Z`);
const MARKER = "// seeded demo submission";

type DemoCandidate = {
  email: string;
  name: string;
  headline: string;
  code: string;
  enabled: boolean;
  settings?: Partial<{
    includeHeadline: boolean;
    includeSkills: boolean;
    includeAssessments: boolean;
    includeSummary: boolean;
    includeRoles: boolean;
    includeBreak: boolean;
  }>;
  skills: { name: string; years: number; last: number }[];
  roles: { jobTitle: string; company: string; start: string; end: string }[];
  careerBreakStart?: string;
  passed: { task: string; daysAgo: number }[];
  failed: { task: string; daysAgo: number }[];
};

const DEMO: DemoCandidate[] = [
  {
    // Recent evidence for 3 of the 5 required skills.
    email: "meera@example.com",
    name: "Meera Iyer",
    headline: "Backend engineer returning after maternity leave",
    code: "K3M9QT",
    enabled: true,
    settings: { includeRoles: true, includeBreak: true },
    skills: [
      { name: "Java", years: 5, last: 2022 },
      { name: "Spring Boot", years: 4, last: 2022 },
      { name: "SQL", years: 4, last: 2022 },
      { name: "REST APIs", years: 3, last: 2022 },
      { name: "Docker", years: 2, last: 2021 },
      { name: "Git", years: 5, last: 2022 },
    ],
    roles: [{ jobTitle: "Backend Engineer", company: "Finwave Labs", start: "2017-06-01", end: "2022-03-31" }],
    careerBreakStart: "2022-04-01",
    passed: [
      { task: "java-average", daysAgo: 12 },
      { task: "rest-user-api", daysAgo: 9 },
      { task: "sql-department-totals", daysAgo: 5 },
    ],
    failed: [{ task: "java-average", daysAgo: 20 }],
  },
  {
    // Recent evidence for 2 of the 5.
    email: "rohan@example.com",
    name: "Rohan Desai",
    headline: "Java developer, ready to return",
    code: "7HPW2D",
    enabled: true,
    skills: [
      { name: "Java", years: 6, last: 2021 },
      { name: "MySQL", years: 5, last: 2021 },
      { name: "Spring", years: 4, last: 2021 },
      { name: "Maven", years: 5, last: 2021 },
    ],
    roles: [{ jobTitle: "Senior Developer", company: "Orchid Systems", start: "2015-01-01", end: "2021-09-30" }],
    careerBreakStart: "2021-10-01",
    passed: [
      { task: "java-palindromes", daysAgo: 20 },
      { task: "sql-customers-without-orders", daysAgo: 14 },
    ],
    failed: [],
  },
  {
    // Recent evidence for 1 of the 5, and a Java task in progress.
    email: "sunita@example.com",
    name: "Sunita Rao",
    headline: "Software engineer rebuilding her Java skills",
    code: "R4XNB8",
    enabled: true,
    skills: [
      { name: "Java", years: 4, last: 2023 },
      { name: "Spring MVC", years: 3, last: 2023 },
      { name: "PostgreSQL", years: 3, last: 2023 },
      { name: "REST APIs", years: 3, last: 2023 },
    ],
    roles: [{ jobTitle: "Software Engineer", company: "Lotus Tech", start: "2019-02-01", end: "2023-05-31" }],
    careerBreakStart: "2023-06-01",
    passed: [{ task: "rest-paginated-list", daysAgo: 7 }],
    failed: [{ task: "java-average", daysAgo: 3 }],
  },
  {
    // Experience on record, no practice tasks yet.
    email: "kavya@example.com",
    name: "Kavya Nair",
    headline: "Developer returning after a career break",
    code: "E9TC5Y",
    enabled: true,
    skills: [
      { name: "Java", years: 3, last: 2022 },
      { name: "SQL", years: 2, last: 2022 },
      { name: "Git", years: 3, last: 2022 },
    ],
    roles: [{ jobTitle: "Developer", company: "Banyan Soft", start: "2019-07-01", end: "2022-06-30" }],
    careerBreakStart: "2022-07-01",
    passed: [],
    failed: [],
  },
  {
    // Nothing relevant to the Acme job.
    email: "arjun@example.com",
    name: "Arjun Mehta",
    headline: "Data analyst returning to work",
    code: "W2ZJ6F",
    enabled: true,
    skills: [
      { name: "Python", years: 5, last: 2024 },
      { name: "Excel", years: 6, last: 2024 },
      { name: "Pandas", years: 3, last: 2024 },
    ],
    roles: [{ jobTitle: "Analyst", company: "Delta Metrics", start: "2016-08-01", end: "2024-02-29" }],
    careerBreakStart: "2024-03-01",
    passed: [],
    failed: [],
  },
  {
    // Strong evidence, but has not switched discovery on.
    email: "lakshmi@example.com",
    name: "Lakshmi Pillai",
    headline: "Senior backend developer",
    code: "N8VG3A",
    enabled: false,
    skills: [
      { name: "Java", years: 7, last: 2022 },
      { name: "Spring Boot", years: 5, last: 2022 },
      { name: "SQL", years: 6, last: 2022 },
      { name: "REST APIs", years: 5, last: 2022 },
      { name: "Docker", years: 3, last: 2022 },
    ],
    roles: [{ jobTitle: "Senior Developer", company: "Cedar Works", start: "2014-03-01", end: "2022-08-31" }],
    careerBreakStart: "2022-09-01",
    passed: [
      { task: "java-average", daysAgo: 30 },
      { task: "java-inventory", daysAgo: 28 },
      { task: "sql-top-customers", daysAgo: 25 },
      { task: "rest-user-api", daysAgo: 22 },
    ],
    failed: [],
  },
  {
    // Discoverable, but shares only a headline, so there is nothing to match on.
    email: "neha@example.com",
    name: "Neha Kulkarni",
    headline: "Engineer open to roles",
    code: "Q5HD7S",
    enabled: true,
    settings: { includeSkills: false, includeAssessments: false, includeSummary: false },
    skills: [
      { name: "Java", years: 6, last: 2023 },
      { name: "SQL", years: 5, last: 2023 },
      { name: "REST APIs", years: 4, last: 2023 },
    ],
    roles: [{ jobTitle: "Engineer", company: "Maple Data", start: "2017-05-01", end: "2023-08-31" }],
    careerBreakStart: "2023-09-01",
    passed: [{ task: "java-inventory", daysAgo: 10 }],
    failed: [],
  },
];

export async function recordAttempt(
  prisma: PrismaClient,
  candidateId: string,
  slug: string,
  status: "PASSED" | "FAILED",
  ago: number
) {
  const task = await prisma.task.findUnique({
    where: { slug },
    select: {
      id: true,
      skills: { select: { skillId: true } },
      _count: { select: { testCases: true } },
    },
  });
  if (!task) throw new Error(`Unknown task: ${slug}`);

  const when = daysAgo(ago);
  const code = `${MARKER} (${status})`;
  const total = task._count.testCases;

  const exists = await prisma.submission.findFirst({
    where: { candidateId, taskId: task.id, code },
  });
  if (!exists) {
    await prisma.submission.create({
      data: {
        candidateId,
        taskId: task.id,
        code,
        status,
        passedCount: status === "PASSED" ? total : Math.floor(total / 3),
        totalCount: total,
        createdAt: when,
        gradedAt: when,
      },
    });
  }

  const kind = status === "PASSED" ? ("PASSED" as const) : ("IN_PROGRESS" as const);
  for (const { skillId } of task.skills) {
    const evidence = await prisma.evidence.findFirst({
      where: { candidateId, skillId, taskId: task.id, kind },
    });
    if (!evidence) {
      await prisma.evidence.create({
        data: { candidateId, skillId, taskId: task.id, kind, occurredAt: when },
      });
    }
  }
}

export async function seedDemoCandidates(prisma: PrismaClient, passwordHash: string) {
  for (const c of DEMO) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        name: c.name,
        email: c.email,
        passwordHash,
        role: "CANDIDATE",
        candidate: { create: { headline: c.headline } },
      },
      include: { candidate: true },
    });
    if (!user.candidate) throw new Error(`Candidate profile missing for ${c.email}`);
    const candidateId = user.candidate.id;

    for (const r of c.roles) {
      const startDate = d(r.start);
      const exists = await prisma.careerHistory.findFirst({
        where: { candidateId, jobTitle: r.jobTitle, startDate },
      });
      if (!exists) {
        await prisma.careerHistory.create({
          data: { candidateId, jobTitle: r.jobTitle, company: r.company, startDate, endDate: d(r.end) },
        });
      }
    }

    if (c.careerBreakStart) {
      const startDate = d(c.careerBreakStart);
      const exists = await prisma.careerBreak.findFirst({ where: { candidateId, startDate } });
      if (!exists) await prisma.careerBreak.create({ data: { candidateId, startDate, endDate: null } });
    }

    for (const s of c.skills) {
      const skill = await getOrCreateSkill(prisma, s.name);
      await prisma.candidateSkill.upsert({
        where: { candidateId_skillId: { candidateId, skillId: skill.id } },
        update: {},
        create: {
          candidateId,
          skillId: skill.id,
          yearsExperience: s.years,
          lastUsedYear: s.last,
          source: "EXTRACTED",
        },
      });
    }

    for (const t of c.failed) await recordAttempt(prisma, candidateId, t.task, "FAILED", t.daysAgo);
    for (const t of c.passed) await recordAttempt(prisma, candidateId, t.task, "PASSED", t.daysAgo);

    await prisma.discoverySettings.upsert({
      where: { candidateId },
      update: {},
      create: { candidateId, code: c.code, enabled: c.enabled, ...c.settings },
    });
  }
}
/** Aditi's practice evidence: Java, SQL and REST passed, so her gap page matches the project story. */
export async function seedAditiEvidence(prisma: PrismaClient) {
  const user = await prisma.user.findUnique({
    where: { email: "aditi@example.com" },
    include: { candidate: true },
  });
  if (!user?.candidate) return;
  const id = user.candidate.id;

  await recordAttempt(prisma, id, "java-average", "FAILED", 9);
  await recordAttempt(prisma, id, "java-average", "PASSED", 6);
  await recordAttempt(prisma, id, "sql-department-totals", "PASSED", 4);
  await recordAttempt(prisma, id, "rest-user-api", "PASSED", 3);
}