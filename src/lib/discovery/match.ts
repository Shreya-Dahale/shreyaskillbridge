import type { ProfileSource } from "../profile/types";
import {
  analyzeGaps,
  type GapNote,
  type RequirementInput,
  type SkillGap,
  type SkillStatus,
} from "../skills/gap-engine";

export type MatchExposure = { includeSkills: boolean; includeAssessments: boolean };

export type MatchMark = "TICK" | "PROGRESS" | "WARN" | "EMPTY";
export type MatchGroup = "ALL_RECENT" | "SOME_RECENT" | "EXPERIENCE_ONLY" | "NONE";

export type MatchRow = {
  skillId: string;
  name: string;
  importance: "REQUIRED" | "PREFERRED";
  minYears: number | null;
  status: SkillStatus;
  mark: MatchMark;
  text: string;
  notes: GapNote[];
};

export type CandidateMatch = {
  rows: MatchRow[];
  group: MatchGroup;
  requiredTotal: number;
  requiredDemonstrated: number;
};

function toRow(gap: SkillGap): MatchRow {
  const base = {
    skillId: gap.skillId,
    name: gap.name,
    importance: gap.importance,
    minYears: gap.minYears,
    status: gap.status,
    notes: gap.notes,
  };

  switch (gap.status) {
    case "DEMONSTRATED":
      return { ...base, mark: "TICK", text: "Recently demonstrated" };
    case "DEVELOPING":
      return { ...base, mark: "PROGRESS", text: "Practice started" };
    case "NEEDS_REFRESH":
      return {
        ...base,
        mark: "WARN",
        text:
          gap.match.kind === "RELATED"
            ? `Adjacent experience only (${gap.match.via})`
            : "Experience on record, no recent evidence",
      };
    case "NOT_YET_DEMONSTRATED":
      return { ...base, mark: "EMPTY", text: "Nothing shown for this skill" };
  }
}

/**
 * Matches one candidate against a job using ONLY what her discovery settings expose.
 * - Skill history (years, last used) counts only if she shares her skills.
 * - Passed practice tasks count if she shares her skills or her assessments.
 * - Tasks in progress count only if she shares her skills, because only the skills section shows them.
 * Nothing else about her (name, headline, roles, career break) is an input.
 */
export function matchCandidate(input: {
  requirements: RequirementInput[];
  source: ProfileSource;
  exposure: MatchExposure;
  now?: Date;
}): CandidateMatch {
  const { requirements, source, exposure } = input;

  const candidateSkills = exposure.includeSkills ? source.skills : [];
  const evidence = exposure.includeSkills
    ? source.evidence
    : exposure.includeAssessments
      ? source.evidence.filter((e) => e.kind === "PASSED")
      : [];

  const gaps = analyzeGaps({
    requirements,
    candidateSkills,
    evidence: evidence.map((e) => ({ skillId: e.skillId, kind: e.kind, date: e.date })),
    relations: source.relations,
    now: input.now,
  });

  const rows = gaps.map(toRow);
  const required = rows.filter((r) => r.importance === "REQUIRED");
  const preferred = rows.filter((r) => r.importance === "PREFERRED");
  const demonstrated = required.filter((r) => r.status === "DEMONSTRATED").length;

  let group: MatchGroup;
  if (required.length === 0) group = "NONE";
  else if (demonstrated === required.length) group = "ALL_RECENT";
  else if (demonstrated > 0) group = "SOME_RECENT";
  else if (required.some((r) => r.status !== "NOT_YET_DEMONSTRATED")) group = "EXPERIENCE_ONLY";
  else group = "NONE";

  return {
    rows: [...required, ...preferred],
    group,
    requiredTotal: required.length,
    requiredDemonstrated: demonstrated,
  };
}