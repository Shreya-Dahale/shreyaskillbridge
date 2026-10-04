import { describe, it, expect } from "vitest";
import { buildSharedProfile } from "./build-profile";
import { buildSummary } from "./summary";
import { formatDate, joinList } from "./format";
import type { ProfileSource, ShareSettings } from "./types";

const d = (s: string) => new Date(`${s}T00:00:00Z`);
const now = d("2026-10-10");

const DEFAULTS: ShareSettings = {
  showName: false,
  includeHeadline: true,
  includeSkills: true,
  includeAssessments: true,
  includeSummary: true,
  includeRoles: false,
  includeBreak: false,
};
const ALL_ON: ShareSettings = {
  showName: true,
  includeHeadline: true,
  includeSkills: true,
  includeAssessments: true,
  includeSummary: true,
  includeRoles: true,
  includeBreak: true,
};
const ALL_OFF: ShareSettings = {
  showName: false,
  includeHeadline: false,
  includeSkills: false,
  includeAssessments: false,
  includeSummary: false,
  includeRoles: false,
  includeBreak: false,
};

const source: ProfileSource = {
  displayName: "Aditi Sharma",
  headline: "Java developer returning after a career break",
  skills: [
    { skillId: "java", name: "Java", yearsExperience: 4, lastUsedYear: 2023 },
    { skillId: "spring", name: "Spring", yearsExperience: 3, lastUsedYear: 2023 },
    { skillId: "sql", name: "SQL", yearsExperience: 3, lastUsedYear: 2023 },
    { skillId: "rest", name: "REST APIs", yearsExperience: 2, lastUsedYear: 2023 },
    { skillId: "git", name: "Git", yearsExperience: 3, lastUsedYear: 2023 },
  ],
  roles: [
    { jobTitle: "Junior Java Developer", company: "Nimbus Software", startDate: d("2019-09-01"), endDate: d("2021-08-31") },
    { jobTitle: "Java Developer", company: "Kestrel Systems", startDate: d("2021-09-01"), endDate: d("2023-09-30") },
  ],
  careerBreaks: [{ startDate: d("2023-10-01"), endDate: null }],
  evidence: [
    { skillId: "java", skillName: "Java", kind: "PASSED", date: d("2026-10-01") },
    { skillId: "sql", skillName: "SQL", kind: "PASSED", date: d("2026-10-05") },
    { skillId: "rest", skillName: "REST APIs", kind: "IN_PROGRESS", date: d("2026-10-06") },
  ],
  submissions: [
    { taskId: "t-java", taskTitle: "Fix the average calculator", skillNames: ["Java"], status: "FAILED", createdAt: d("2026-09-28"), gradedAt: d("2026-09-28") },
    { taskId: "t-java", taskTitle: "Fix the average calculator", skillNames: ["Java"], status: "ERROR", createdAt: d("2026-09-29"), gradedAt: null },
    { taskId: "t-java", taskTitle: "Fix the average calculator", skillNames: ["Java"], status: "FAILED", createdAt: d("2026-09-30"), gradedAt: d("2026-09-30") },
    { taskId: "t-java", taskTitle: "Fix the average calculator", skillNames: ["Java"], status: "PASSED", createdAt: d("2026-10-01"), gradedAt: d("2026-10-01") },
    { taskId: "t-sql", taskTitle: "Department headcount and payroll", skillNames: ["SQL"], status: "PASSED", createdAt: d("2026-10-05"), gradedAt: new Date("2026-10-05T10:00:00Z") },
    { taskId: "t-rest", taskTitle: "Fix the user API", skillNames: ["REST APIs"], status: "FAILED", createdAt: d("2026-10-06"), gradedAt: d("2026-10-06") },
  ],
  relations: [],
};

describe("buildSharedProfile: privacy by construction", () => {
  it("applies the approved defaults", () => {
    const p = buildSharedProfile(source, DEFAULTS, now);
    expect(p.name).toBe("Candidate");
    expect(p.headline).toBe("Java developer returning after a career break");
    expect(p.skills).toBeDefined();
    expect(p.assessments).toBeDefined();
    expect(p.summary).toBeDefined();
    expect("roles" in p).toBe(false);
    expect("careerBreaks" in p).toBe(false);
  });

  it("leaks nothing the defaults exclude, even in the raw JSON", () => {
    const json = JSON.stringify(buildSharedProfile(source, DEFAULTS, now));
    for (const secret of ["Aditi", "Sharma", "Nimbus", "Kestrel", "Junior Java Developer", "2023-10-01"]) {
      expect(json, `leaked "${secret}"`).not.toContain(secret);
    }
  });

  it("contains nothing but the bare minimum when everything is off", () => {
    const p = buildSharedProfile(source, ALL_OFF, now);
    expect(Object.keys(p).sort()).toEqual(["generatedAt", "name", "notices"]);
    expect(p.name).toBe("Candidate");
    expect(p.notices).toEqual([]);
    const json = JSON.stringify(p);
    for (const secret of ["Aditi", "Java", "SQL", "Nimbus", "career break", "Fix the user API"]) {
      expect(json, `leaked "${secret}"`).not.toContain(secret);
    }
  });

  it("shows the name, roles and break only when asked", () => {
    const p = buildSharedProfile(source, ALL_ON, now);
    expect(p.name).toBe("Aditi Sharma");
    expect(p.roles?.map((r) => r.company)).toEqual(["Kestrel Systems", "Nimbus Software"]);
    expect(p.careerBreaks).toEqual([{ startDate: d("2023-10-01"), endDate: null }]);
  });

  it("leaves out the headline when it is switched off", () => {
    const p = buildSharedProfile(source, { ...DEFAULTS, includeHeadline: false }, now);
    expect("headline" in p).toBe(false);
  });

  it("never includes contact details or resume data, because the source does not hold them", () => {
    const json = JSON.stringify(buildSharedProfile(source, ALL_ON, now));
    expect(json).not.toMatch(/@|resume|email|phone/i);
  });
});

describe("buildSharedProfile: skills", () => {
  const p = buildSharedProfile(source, DEFAULTS, now);
  const by = Object.fromEntries((p.skills ?? []).map((s) => [s.name, s]));

  it("derives statuses from evidence with the gap-engine rules", () => {
    expect(by.Java.status).toBe("DEMONSTRATED");
    expect(by.SQL.status).toBe("DEMONSTRATED");
    expect(by["REST APIs"].status).toBe("DEVELOPING");
    expect(by.Spring.status).toBe("NEEDS_REFRESH");
    expect(by.Git.status).toBe("NEEDS_REFRESH");
  });

  it("labels years as self-reported and keeps last-used years", () => {
    expect(by.Java.yearsSelfReported).toBe(4);
    expect(by.Java.lastUsedYear).toBe(2023);
  });

  it("orders by status, then years, then name", () => {
    expect(p.skills?.map((s) => s.name)).toEqual(["Java", "SQL", "REST APIs", "Git", "Spring"]);
  });

  it("treats an old pass as needing refresh", () => {
    const old: ProfileSource = {
      ...source,
      evidence: [{ skillId: "java", skillName: "Java", kind: "PASSED", date: d("2025-01-01") }],
    };
    const skills = buildSharedProfile(old, DEFAULTS, now).skills ?? [];
    expect(skills.find((s) => s.name === "Java")?.status).toBe("NEEDS_REFRESH");
  });

  it("shows a skill demonstrated by a task even if it is not on her profile, with no years", () => {
    const onlyEvidence: ProfileSource = {
      ...source,
      skills: [],
      evidence: [{ skillId: "java", skillName: "Java", kind: "PASSED", date: d("2026-10-01") }],
    };
    const skills = buildSharedProfile(onlyEvidence, DEFAULTS, now).skills ?? [];
    expect(skills).toEqual([
      { name: "Java", status: "DEMONSTRATED", yearsSelfReported: null, lastUsedYear: null },
    ]);
  });
});

describe("buildSharedProfile: assessments", () => {
  const p = buildSharedProfile(source, DEFAULTS, now);

  it("lists only tasks she passed, newest first", () => {
    expect(p.assessments?.map((a) => a.taskTitle)).toEqual([
      "Department headcount and payroll",
      "Fix the average calculator",
    ]);
  });

  it("never shares a task she only failed", () => {
    expect(JSON.stringify(p)).not.toContain("Fix the user API");
  });

  it("counts graded tries up to the first pass, ignoring grader outages", () => {
    const java = p.assessments?.find((a) => a.taskTitle === "Fix the average calculator");
    expect(java?.attempts).toBe(3);
    const sql = p.assessments?.find((a) => a.taskTitle === "Department headcount and payroll");
    expect(sql?.attempts).toBe(1);
  });

  it("reports the most recent pass date", () => {
    const again: ProfileSource = {
      ...source,
      submissions: [
        ...source.submissions,
        { taskId: "t-java", taskTitle: "Fix the average calculator", skillNames: ["Java"], status: "PASSED", createdAt: d("2026-10-08"), gradedAt: d("2026-10-08") },
      ],
    };
    const java = buildSharedProfile(again, DEFAULTS, now).assessments?.find(
      (a) => a.taskTitle === "Fix the average calculator"
    );
    expect(java?.passedOn).toEqual(d("2026-10-08"));
    expect(java?.attempts).toBe(3);
  });
});

describe("buildSharedProfile: summary", () => {
  it("is built from the included facts", () => {
    const p = buildSharedProfile(source, DEFAULTS, now);
    expect(p.summary).toBe(
      "Previous experience, as reported in their career history: Java (4 years), Git (3 years), Spring (3 years). Has passed 2 practice tasks covering Java and SQL, most recently on 5 Oct 2026."
    );
  });

  it("does not mention skills when skills are not shared", () => {
    const p = buildSharedProfile(source, { ...DEFAULTS, includeSkills: false }, now);
    expect(p.summary).toBe("Has passed 2 practice tasks covering Java and SQL, most recently on 5 Oct 2026.");
    expect(p.summary).not.toContain("career history");
  });

  it("does not mention assessments when they are not shared", () => {
    const p = buildSharedProfile(source, { ...DEFAULTS, includeAssessments: false }, now);
    expect(p.summary).toBe(
      "Previous experience, as reported in their career history: Java (4 years), Git (3 years), Spring (3 years)."
    );
  });

  it("is absent when it has nothing to say", () => {
    const p = buildSharedProfile(source, { ...DEFAULTS, includeSkills: false, includeAssessments: false }, now);
    expect("summary" in p).toBe(false);
  });

  it("is absent when it is switched off", () => {
    const p = buildSharedProfile(source, { ...DEFAULTS, includeSummary: false }, now);
    expect("summary" in p).toBe(false);
  });

  it("handles one task and one year of experience", () => {
    const text = buildSummary(
      [{ name: "Java", status: "NEEDS_REFRESH", yearsSelfReported: 1, lastUsedYear: 2024 }],
      [{ taskTitle: "T", skills: ["Java"], passedOn: d("2026-01-02"), attempts: 1 }]
    );
    expect(text).toBe(
      "Previous experience, as reported in their career history: Java (1 year). Has passed 1 practice task covering Java, most recently on 2 Jan 2026."
    );
  });
});

describe("buildSharedProfile: notices", () => {
  it("explains the honesty rules for the sections that are shown", () => {
    const all = buildSharedProfile(source, DEFAULTS, now).notices.join(" ");
    expect(all).toMatch(/self-reported/);
    expect(all).toMatch(/Needs refresh/);
    expect(all).toMatch(/without supervision/);
  });

  it("only mentions what is shown", () => {
    const onlySkills = buildSharedProfile(
      source,
      { ...ALL_OFF, includeSkills: true },
      now
    ).notices.join(" ");
    expect(onlySkills).toMatch(/self-reported/);
    expect(onlySkills).not.toMatch(/without supervision/);
  });
});

describe("format helpers", () => {
  it("formats dates in UTC", () => {
    expect(formatDate(new Date("2026-10-05T23:59:00Z"))).toBe("5 Oct 2026");
  });

  it("joins lists in plain English", () => {
    expect(joinList([])).toBe("");
    expect(joinList(["A"])).toBe("A");
    expect(joinList(["A", "B"])).toBe("A and B");
    expect(joinList(["A", "B", "C"])).toBe("A, B and C");
  });
});