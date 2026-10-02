import { describe, it, expect } from "vitest";
import {
  analyzeGaps,
  type CandidateSkillInput,
  type EvidenceInput,
  type RelationInput,
  type RequirementInput,
} from "./gap-engine";

const now = new Date("2026-10-01T00:00:00Z");
const d = (s: string) => new Date(`${s}T00:00:00Z`);

const need = (
  skillId: string,
  name: string,
  importance: "REQUIRED" | "PREFERRED" = "REQUIRED",
  minYears: number | null = null
): RequirementInput => ({ skillId, name, importance, minYears });

const have = (
  skillId: string,
  name: string,
  yearsExperience: number | null,
  lastUsedYear: number | null
): CandidateSkillInput => ({ skillId, name, yearsExperience, lastUsedYear });

const passed = (skillId: string, date: string): EvidenceInput => ({
  skillId,
  kind: "PASSED",
  date: d(date),
});

const relations: RelationInput[] = [
  { fromId: "spring", toId: "springboot", kind: "RELATED" },
  { fromId: "springboot", toId: "spring", kind: "IMPLIES" },
  { fromId: "mysql", toId: "sql", kind: "IMPLIES" },
];

function run(
  requirements: RequirementInput[],
  candidateSkills: CandidateSkillInput[],
  evidence: EvidenceInput[] = []
) {
  return analyzeGaps({ requirements, candidateSkills, evidence, relations, now });
}

describe("analyzeGaps: Aditi's story, before any assessments", () => {
  const gaps = run(
    [
      need("java", "Java", "REQUIRED", 3),
      need("springboot", "Spring Boot"),
      need("rest", "REST APIs"),
      need("sql", "SQL"),
      need("docker", "Docker"),
      need("git", "Git", "PREFERRED"),
      need("k8s", "Kubernetes", "PREFERRED"),
    ],
    [
      have("java", "Java", 4, 2023),
      have("spring", "Spring", 3, 2023),
      have("sql", "SQL", 3, 2023),
      have("rest", "REST APIs", 2, 2023),
      have("git", "Git", 3, 2023),
    ]
  );
  const by = Object.fromEntries(gaps.map((g) => [g.skillId, g]));

  it("never reaches Demonstrated or Developing without evidence", () => {
    expect(gaps.some((g) => g.status === "DEMONSTRATED" || g.status === "DEVELOPING")).toBe(false);
  });

  it("marks skills with history as Needs Refresh", () => {
    for (const id of ["java", "springboot", "rest", "sql", "git"]) {
      expect(by[id].status).toBe("NEEDS_REFRESH");
    }
  });

  it("marks skills with nothing on record as Not Yet Demonstrated", () => {
    expect(by.docker.status).toBe("NOT_YET_DEMONSTRATED");
    expect(by.k8s.status).toBe("NOT_YET_DEMONSTRATED");
  });

  it("labels Spring Boot as adjacent experience through Spring", () => {
    expect(by.springboot.match).toEqual({ kind: "RELATED", via: "Spring" });
    expect(by.springboot.notes).toEqual(["ADJACENT_ONLY", "STALE"]);
  });

  it("notes that skills last used in 2023 are stale", () => {
    expect(by.java.notes).toEqual(["STALE"]);
    expect(by.java.candidateYears).toBe(4);
    expect(by.java.lastUsedYear).toBe(2023);
  });

  it("keeps the importance of each requirement", () => {
    expect(by.git.importance).toBe("PREFERRED");
    expect(by.java.importance).toBe("REQUIRED");
  });
});

describe("analyzeGaps: evidence", () => {
  it("a recent pass makes a skill Demonstrated, without a stale note", () => {
    const [gap] = run([need("java", "Java")], [have("java", "Java", 4, 2023)], [passed("java", "2026-08-01")]);
    expect(gap.status).toBe("DEMONSTRATED");
    expect(gap.notes).toEqual([]);
  });

  it("a pass older than 12 months falls back to Needs Refresh", () => {
    const [gap] = run([need("java", "Java")], [have("java", "Java", 4, 2023)], [passed("java", "2025-06-01")]);
    expect(gap.status).toBe("NEEDS_REFRESH");
  });

  it("a pass exactly 12 months old still counts", () => {
    const [gap] = run([need("java", "Java")], [], [passed("java", "2025-10-01")]);
    expect(gap.status).toBe("DEMONSTRATED");
  });

  it("an in-progress task makes a skill Developing, even with no history", () => {
    const [gap] = run(
      [need("docker", "Docker")],
      [],
      [{ skillId: "docker", kind: "IN_PROGRESS", date: d("2026-09-20") }]
    );
    expect(gap.status).toBe("DEVELOPING");
  });

  it("evidence on an implying skill demonstrates the skill (MySQL for SQL)", () => {
    const [gap] = run([need("sql", "SQL")], [have("mysql", "MySQL", 2, 2023)], [passed("mysql", "2026-09-01")]);
    expect(gap.status).toBe("DEMONSTRATED");
  });

  it("evidence on a merely related skill does not demonstrate it (Spring for Spring Boot)", () => {
    const [gap] = run(
      [need("springboot", "Spring Boot")],
      [have("spring", "Spring", 3, 2023)],
      [passed("spring", "2026-09-01")]
    );
    expect(gap.status).toBe("NEEDS_REFRESH");
    expect(gap.match.kind).toBe("RELATED");
  });
});

describe("analyzeGaps: matching and notes", () => {
  it("counts an implied skill as experience (MySQL for SQL)", () => {
    const [gap] = run([need("sql", "SQL")], [have("mysql", "MySQL", 2, 2024)]);
    expect(gap.status).toBe("NEEDS_REFRESH");
    expect(gap.match).toEqual({ kind: "IMPLIED", via: "MySQL" });
    expect(gap.notes).toEqual([]);
  });

  it("prefers a direct match over implied or related ones", () => {
    const [gap] = run(
      [need("sql", "SQL")],
      [have("mysql", "MySQL", 5, 2025), have("sql", "SQL", 1, 2020)]
    );
    expect(gap.match.kind).toBe("DIRECT");
    expect(gap.candidateYears).toBe(1);
  });

  it("notes when years are below the stated minimum", () => {
    const [gap] = run([need("java", "Java", "REQUIRED", 3)], [have("java", "Java", 2, 2025)]);
    expect(gap.notes).toEqual(["BELOW_MIN_YEARS"]);
    expect(gap.status).toBe("NEEDS_REFRESH");
  });

  it("does not compare years for adjacent experience", () => {
    const [gap] = run([need("springboot", "Spring Boot", "REQUIRED", 3)], [have("spring", "Spring", 1, 2025)]);
    expect(gap.notes).toEqual(["ADJACENT_ONLY"]);
  });

  it("does not add notes when years or last-used are unknown", () => {
    const [gap] = run([need("java", "Java", "REQUIRED", 3)], [have("java", "Java", null, null)]);
    expect(gap.notes).toEqual([]);
    expect(gap.status).toBe("NEEDS_REFRESH");
  });

  it("does not call a skill stale at 2 years, but does at 3", () => {
    const [recent] = run([need("java", "Java")], [have("java", "Java", 4, 2024)]);
    const [old] = run([need("java", "Java")], [have("java", "Java", 4, 2023)]);
    expect(recent.notes).toEqual([]);
    expect(old.notes).toEqual(["STALE"]);
  });

  it("returns an empty list when the job has no requirements", () => {
    expect(run([], [have("java", "Java", 4, 2023)])).toEqual([]);
  });
});