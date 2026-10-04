import type { SkillGap, SkillStatus } from "./gap-engine";

export const STATUS_LABEL: Record<SkillStatus, string> = {
  DEMONSTRATED: "Demonstrated",
  DEVELOPING: "Developing",
  NEEDS_REFRESH: "Needs refresh",
  NOT_YET_DEMONSTRATED: "Not yet demonstrated",
};

export const STATUS_STYLE: Record<SkillStatus, string> = {
  DEMONSTRATED: "bg-green-100 text-green-800",
  DEVELOPING: "bg-blue-100 text-blue-800",
  NEEDS_REFRESH: "bg-amber-100 text-amber-800",
  NOT_YET_DEMONSTRATED: "bg-gray-100 text-gray-700",
};

/** Plain-language reasons for a status, so nothing is hidden in a number. */
export function explainGap(gap: SkillGap): { lines: string[]; hint: string | null } {
  const lines: string[] = [];
  const years = gap.candidateYears != null ? ` (${gap.candidateYears} yrs)` : "";

  if (gap.status === "DEMONSTRATED") lines.push("You recently showed this skill through an assessment.");
  if (gap.status === "DEVELOPING") lines.push("You have started working on this skill.");

  const hasEvidenceStatus = gap.status === "DEMONSTRATED" || gap.status === "DEVELOPING";

  switch (gap.match.kind) {
    case "DIRECT":
      lines.push(`Your profile lists ${gap.name}${years}.`);
      break;
    case "IMPLIED":
      lines.push(`Your ${gap.match.via} experience${years} counts toward ${gap.name}.`);
      break;
    case "RELATED":
      lines.push(
        `You have adjacent experience through ${gap.match.via}${years}. It is related to ${gap.name}, but not the same thing.`
      );
      break;
    case "NONE":
      if (!hasEvidenceStatus) lines.push(`Nothing on your profile covers ${gap.name} yet.`);
      break;
  }

  if (gap.notes.includes("STALE") && gap.lastUsedYear != null) {
    lines.push(`Last used in ${gap.lastUsedYear}.`);
  }
  if (gap.notes.includes("BELOW_MIN_YEARS") && gap.minYears != null && gap.candidateYears != null) {
    lines.push(`This job asks for ${gap.minYears}+ years; your profile shows ${gap.candidateYears}.`);
  }

  let hint: string | null = null;
  if (gap.status === "NEEDS_REFRESH") hint = "A recent practical task would show how current this skill is.";
  if (gap.status === "NOT_YET_DEMONSTRATED") hint = "A practical task could build evidence for this skill.";

  return { lines, hint };
}

/** The "experience on record" cell: what her profile says, in a few words. */
export function historyText(gap: SkillGap): string {
  const years = gap.candidateYears != null ? `${gap.candidateYears} yrs` : null;
  const last = gap.lastUsedYear != null ? `last used ${gap.lastUsedYear}` : null;
  const detail = [years, last].filter(Boolean).join(" · ");

  switch (gap.match.kind) {
    case "DIRECT":
      return detail || "On your profile";
    case "IMPLIED":
      return `Through ${gap.match.via}${detail ? ` (${detail})` : ""}`;
    case "RELATED":
      return `Adjacent: ${gap.match.via}${detail ? ` (${detail})` : ""}`;
    case "NONE":
      return "Nothing on record";
  }
}

/** The "recent evidence" cell: what practice tasks show, in a few words. */
export function evidenceText(status: SkillStatus): string {
  switch (status) {
    case "DEMONSTRATED":
      return "Passed a recent practice task";
    case "DEVELOPING":
      return "Practice task started";
    default:
      return "No recent evidence";
  }
}