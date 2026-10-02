import { PrismaClient, type SkillImportance } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getOrCreateSkill } from "../src/lib/skills/resolve";
import { syncTaxonomy } from "../src/lib/skills/sync-taxonomy";

const prisma = new PrismaClient();

const d = (s: string) => new Date(`${s}T00:00:00Z`);

async function skillId(name: string) {
  const skill = await getOrCreateSkill(prisma, name);
  return skill.id;
}

const JOB_TITLE = "Java Backend Developer";

const JOB_DESCRIPTION = `Java Backend Developer

About the role
We are looking for a Java Backend Developer to join our platform team in Pune. You will design, build and maintain REST APIs that power our customer-facing applications.

Responsibilities
- Build and maintain backend services using Java and Spring Boot
- Design RESTful APIs and write clear API documentation
- Write and optimise SQL queries
- Containerise services with Docker and support deployments
- Write unit and integration tests, and take part in code reviews

Requirements
- 3+ years of professional experience with Java
- Strong experience with Spring Boot and REST API design
- Solid SQL skills
- Working knowledge of Docker

Nice to have
- Experience with Git workflows
- Familiarity with Kubernetes`;

const requirements: { name: string; importance: SkillImportance; minYears: number | null }[] = [
  { name: "Java", importance: "REQUIRED", minYears: 3 },
  { name: "Spring Boot", importance: "REQUIRED", minYears: null },
  { name: "REST APIs", importance: "REQUIRED", minYears: null },
  { name: "SQL", importance: "REQUIRED", minYears: null },
  { name: "Docker", importance: "REQUIRED", minYears: null },
  { name: "Git", importance: "PREFERRED", minYears: null },
  { name: "Kubernetes", importance: "PREFERRED", minYears: null },
];

async function seedCandidate(passwordHash: string) {
  const user = await prisma.user.upsert({
    where: { email: "aditi@example.com" },
    update: {},
    create: {
      name: "Aditi Sharma",
      email: "aditi@example.com",
      passwordHash,
      role: "CANDIDATE",
      candidate: { create: { headline: "Java developer returning after a career break" } },
    },
    include: { candidate: true },
  });
  if (!user.candidate) throw new Error("Candidate profile missing for aditi@example.com");
  const candidateId = user.candidate.id;

  const roles = [
    {
      jobTitle: "Junior Java Developer",
      company: "Nimbus Software",
      startDate: d("2019-09-01"),
      endDate: d("2021-08-31"),
      description: "Built and fixed backend features in Java with MySQL, and wrote JUnit tests.",
    },
    {
      jobTitle: "Java Developer",
      company: "Kestrel Systems",
      startDate: d("2021-09-01"),
      endDate: d("2023-09-30"),
      description: "Developed REST APIs with Spring MVC, optimised SQL queries, and reviewed code.",
    },
  ];
  for (const role of roles) {
    const exists = await prisma.careerHistory.findFirst({
      where: { candidateId, jobTitle: role.jobTitle, startDate: role.startDate },
    });
    if (!exists) await prisma.careerHistory.create({ data: { candidateId, ...role } });
  }

  const breakStart = d("2023-10-01");
  const hasBreak = await prisma.careerBreak.findFirst({
    where: { candidateId, startDate: breakStart },
  });
  if (!hasBreak) {
    await prisma.careerBreak.create({ data: { candidateId, startDate: breakStart, endDate: null } });
  }

  const skills = [
    { name: "Java", years: 4, last: 2023 },
    { name: "Spring", years: 3, last: 2023 },
    { name: "SQL", years: 3, last: 2023 },
    { name: "REST APIs", years: 2, last: 2023 },
    { name: "Git", years: 3, last: 2023 },
  ];
  for (const s of skills) {
    const id = await skillId(s.name);
    await prisma.candidateSkill.upsert({
      where: { candidateId_skillId: { candidateId, skillId: id } },
      update: {},
      create: {
        candidateId,
        skillId: id,
        yearsExperience: s.years,
        lastUsedYear: s.last,
        source: "EXTRACTED",
      },
    });
  }
}

async function seedEmployer(passwordHash: string) {
  const user = await prisma.user.upsert({
    where: { email: "hr@acme.example.com" },
    update: {},
    create: {
      name: "Acme HR",
      email: "hr@acme.example.com",
      passwordHash,
      role: "EMPLOYER",
      employer: {
        create: {
          companyName: "Acme Technologies",
          website: "https://acme.example.com/",
          about: "Acme builds software for logistics companies across India.",
        },
      },
    },
    include: { employer: true },
  });
  if (!user.employer) throw new Error("Employer profile missing for hr@acme.example.com");
  const employerId = user.employer.id;

  const existing = await prisma.job.findFirst({ where: { employerId, title: JOB_TITLE } });
  if (existing) return;

  const job = await prisma.job.create({
    data: {
      employerId,
      title: JOB_TITLE,
      description: JOB_DESCRIPTION,
      status: "PUBLISHED",
    },
  });
  for (const r of requirements) {
    await prisma.jobSkill.create({
      data: {
        jobId: job.id,
        skillId: await skillId(r.name),
        importance: r.importance,
        minYears: r.minYears,
      },
    });
  }
}

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);
  await syncTaxonomy(prisma);
  await seedCandidate(passwordHash);
  await seedEmployer(passwordHash);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());