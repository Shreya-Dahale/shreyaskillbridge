import { compareNames, formatDate, joinList, yearsText } from "./format";
import type { SharedAssessment, SharedSkill } from "./types";

/**
 * Builds the summary only from sections that are already included in the shared profile,
 * so it can never mention something the candidate chose not to share.
 */
export function buildSummary(skills?: SharedSkill[], assessments?: SharedAssessment[]): string | undefined {
  const parts: string[] = [];

  if (skills) {
    const experienced = skills
      .filter((s) => s.yearsSelfReported != null && s.yearsSelfReported > 0)
      .sort((a, b) => (b.yearsSelfReported ?? 0) - (a.yearsSelfReported ?? 0) || compareNames(a.name, b.name))
      .slice(0, 3);
    if (experienced.length > 0) {
      const list = experienced.map((s) => `${s.name} (${yearsText(s.yearsSelfReported ?? 0)})`).join(", ");
      parts.push(`Previous experience, as reported in their career history: ${list}.`);
    }
  }

  if (assessments && assessments.length > 0) {
    const covered = Array.from(new Set(assessments.flatMap((a) => a.skills))).sort(compareNames);
    const latest = assessments.reduce((max, a) => (a.passedOn > max ? a.passedOn : max), assessments[0].passedOn);
    const n = assessments.length;
    parts.push(
      `Has passed ${n} practice ${n === 1 ? "task" : "tasks"} covering ${joinList(covered)}, most recently on ${formatDate(latest)}.`
    );
  }

  return parts.length > 0 ? parts.join(" ") : undefined;
}