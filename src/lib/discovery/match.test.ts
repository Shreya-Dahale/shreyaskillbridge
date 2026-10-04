import { describe, it, expect } from "vitest";
import { matchCandidate } from "./match";
import type { ProfileSource } from "../profile/types";
import type { RelationInput, RequirementInput } from "../skills/gap-engine";

const d = (s: string) => new Date(`${s}T00:00:00Z`);
const now = d("2026-10-10");

const requirements: RequirementInput[] = [
  { skillId: "java", name: "Java", importance: "REQUIRED", minYears: 3 },
  { skillId: "springboot", name: "Spring Boot", importance: "REQUIRED", minYears: null },
  { skillId: "rest", name: "REST APIs", importance: "REQUIRED", minYears: null },
  { skillId: "sql", name: "SQL", importance: "REQUIRED", minYears: null },
  { skillId: "docker", name: "Docker", importance: "REQUIRED", minYears: null },
  { skillId: "git", name: "Git", importance: "PREFERRED", minYears: null },
];

const relations: RelationInput[] = [
  { fromId: "spring", toId: "springboot", kind: "RELATED" },
  { fromId: "springboot", toId: "spring", kind: "IMPLIES" },
  { fromId: "mysql", toId: "sql", kind: "IMPLIES" },
];

const BOTH = { includeSkills: true, includeAssessments: true };

const base: ProfileSource = {
  displayName: "Meera Iyer",
  headline: "Backend engineer returning after maternity leave",
  skills: [
    { skillId: "java", name: "Java", yearsExperience: 5, lastUsedYear: 2022 },
    { skillId: "springboot", name: "Spring Boot", yearsExperience: 4, lastUsedYear: 2022 },
    { skillId: "rest", name: "REST APIs", yearsExperience: 3, lastUsedYear: 2022 },
    { skillId: "sql", name: "SQL", yearsExperience: 4, lastUsedYear: 2022 },
    { skillId: "docker", name: "Docker", yearsExperience: 2, lastUsedYear: 2021 },
    { skillId: "git", name: "Git", yearsExperience: 5, lastUsedYear: 2022 },
  ],
  roles: [{ jobTitle: "Backend Engineer", company: "Finwave Labs", startDate: d("2017-06-01"), endDate: d("2022-03-31") }],
  careerBreaks: [{ startDate: d("2022-04-01"), endDate: null }],
  evidence: [
    { skillId: "java", skillName: "Java", kind: "PASSED", date: d("2026-10-01") },
    { skillId: "rest", skillName: "REST APIs", kind: "PASSED", date: d("2026-10-02") },
    { skillId: "sql", skillName: "SQL", kind: "PASSED", date: d("2026-10-05") },
  ],
  submissions: [],
  relations,
};

const run = (source: ProfileSource, exposure = BOTH) => matchCandidate({ requirements, source, exposure, now });
const row = (m: ReturnType<typeof run>, id: string) => m.rows.find((r) => r.skillId === id)!;

describe("matchCandidate: a candidate with recent evidence for some skills", () => {
  const m = run(base);

  it("marks demonstrated skills with a tick", () => {
    for (const id of ["java", "rest", "sql"]) {
      expect(row(m, id).status).toBe("DEMONSTRATED");
      expect(row(m, id).mark).toBe("TICK");
      expect(row(m, id).text).toBe("Recently demonstrated");
    }
  });

  it("marks skills with history only with a warning", () => {
    for (const id of ["springboot", "docker"]) {
      expect(row(m, id).status).toBe("NEEDS_REFRESH");
      expect(row(m, id).mark).toBe("WARN");
      expect(row(m, id).text).toBe("Experience on record, no recent evidence");
    }
  });

  it("counts required skills and puts her in the 'some' group", () => {
    expect(m.requiredTotal).toBe(5);
    expect(m.requiredDemonstrated).toBe(3);
    expect(m.group).toBe("SOME_RECENT");
  });

  it("lists required skills before preferred ones", () => {
    expect(m.rows.map((r) => r.name)).toEqual(["Java", "Spring Boot", "REST APIs", "SQL", "Docker", "Git"]);
  });
});

describe("matchCandidate: groups", () => {
  it("puts a candidate with every required skill demonstrated in the top group", () => {
    const all: ProfileSource = {
      ...base,
      evidence: ["java", "springboot", "rest", "sql", "docker"].map((id) => ({
        skillId: id,
        skillName: id,
        kind: "PASSED" as const,
        date: d("2026-10-03"),
      })),
    };
    const m = run(all);
    expect(m.group).toBe("ALL_RECENT");
    expect(m.requiredDemonstrated).toBe(5);
  });

  it("puts experience without recent evidence in the third group", () => {
    const history: ProfileSource = { ...base, evidence: [], skills: base.skills.slice(0, 1) };
    const m = run(history);
    expect(m.group).toBe("EXPERIENCE_ONLY");
    expect(m.requiredDemonstrated).toBe(0);
  });

  it("treats a started practice task as relevant, but not as a recent pass", () => {
    const started: ProfileSource = {
      ...base,
      skills: [],
      evidence: [{ skillId: "docker", skillName: "Docker", kind: "IN_PROGRESS", date: d("2026-10-08") }],
    };
    const m = run(started);
    expect(row(m, "docker").mark).toBe("PROGRESS");
    expect(m.group).toBe("EXPERIENCE_ONLY");
  });

  it("puts a candidate with nothing relevant in no group", () => {
    const unrelated: ProfileSource = {
      ...base,
      skills: [{ skillId: "python", name: "Python", yearsExperience: 5, lastUsedYear: 2024 }],
      evidence: [],
    };
    const m = run(unrelated);
    expect(m.group).toBe("NONE");
    expect(m.rows.every((r) => r.mark === "EMPTY")).toBe(true);
  });

  it("is in no group when the job has no required skills", () => {
    const m = matchCandidate({
      requirements: [{ skillId: "git", name: "Git", importance: "PREFERRED", minYears: null }],
      source: base,
      exposure: BOTH,
      now,
    });
    expect(m.group).toBe("NONE");
  });
});

describe("matchCandidate: adjacent experience and notes", () => {
  it("labels adjacent experience and says where it came from", () => {
    const adjacent: ProfileSource = {
      ...base,
      skills: [{ skillId: "spring", name: "Spring", yearsExperience: 3, lastUsedYear: 2023 }],
      evidence: [],
    };
    const r = row(run(adjacent), "springboot");
    expect(r.status).toBe("NEEDS_REFRESH");
    expect(r.mark).toBe("WARN");
    expect(r.text).toBe("Adjacent experience only (Spring)");
    expect(r.notes).toContain("ADJACENT_ONLY");
  });

  it("passes through the below-minimum-years note", () => {
    const short: ProfileSource = {
      ...base,
      skills: [{ skillId: "java", name: "Java", yearsExperience: 2, lastUsedYear: 2025 }],
      evidence: [],
    };
    expect(row(run(short), "java").notes).toEqual(["BELOW_MIN_YEARS"]);
  });

  it("counts an implied skill as experience (MySQL for SQL)", () => {
    const mysql: ProfileSource = {
      ...base,
      skills: [{ skillId: "mysql", name: "MySQL", yearsExperience: 3, lastUsedYear: 2024 }],
      evidence: [],
    };
    expect(row(run(mysql), "sql").status).toBe("NEEDS_REFRESH");
  });
});

describe("matchCandidate: only exposed data counts", () => {
  it("finds nothing when she shares neither skills nor assessments", () => {
    const m = run(base, { includeSkills: false, includeAssessments: false });
    expect(m.group).toBe("NONE");
    expect(m.requiredDemonstrated).toBe(0);
    expect(m.rows.every((r) => r.status === "NOT_YET_DEMONSTRATED")).toBe(true);
    expect(m.rows.every((r) => r.text === "Nothing shown for this skill")).toBe(true);
  });

  it("with assessments only, counts passed tasks but not her skill history", () => {
    const m = run(base, { includeSkills: false, includeAssessments: true });
    for (const id of ["java", "rest", "sql"]) expect(row(m, id).mark).toBe("TICK");
    for (const id of ["springboot", "docker", "git"]) expect(row(m, id).mark).toBe("EMPTY");
    expect(m.group).toBe("SOME_RECENT");
  });

  it("with assessments only, ignores tasks that are only in progress", () => {
    const inProgress: ProfileSource = {
      ...base,
      evidence: [{ skillId: "docker", skillName: "Docker", kind: "IN_PROGRESS", date: d("2026-10-08") }],
    };
    const m = run(inProgress, { includeSkills: false, includeAssessments: true });
    expect(row(m, "docker").mark).toBe("EMPTY");
    expect(m.group).toBe("NONE");
  });

  it("with skills only, counts her history and the statuses shown on her skills", () => {
    const m = run(base, { includeSkills: true, includeAssessments: false });
    expect(row(m, "springboot").mark).toBe("WARN");
    expect(row(m, "java").mark).toBe("TICK");
  });

  it("is not changed by her name, headline, roles, career break or submissions", () => {
    const different: ProfileSource = {
      ...base,
      displayName: "Someone Else Entirely",
      headline: "A completely different headline",
      roles: [],
      careerBreaks: [],
      submissions: [
        {
          taskId: "t1",
          taskTitle: "Anything",
          skillNames: ["Java"],
          status: "PASSED",
          createdAt: d("2026-09-01"),
          gradedAt: d("2026-09-01"),
        },
      ],
    };
    expect(run(different)).toEqual(run(base));
  });

  it("never contains her name or employer names in the result", () => {
    const json = JSON.stringify(run(base));
    for (const secret of ["Meera", "Iyer", "Finwave", "Backend engineer", "maternity"]) {
      expect(json, `leaked "${secret}"`).not.toContain(secret);
    }
  });
});