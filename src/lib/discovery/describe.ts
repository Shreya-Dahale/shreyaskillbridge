import { STALE_AFTER_YEARS, type GapNote } from "../skills/gap-engine";
import type { CandidateMatch } from "./match";

/** Plain-language notes shown beside a skill. Adjacent experience is already part of the main text. */
export function noteLabels(notes: GapNote[]): string[] {
  const out: string[] = [];
  if (notes.includes("STALE")) out.push(`last used ${STALE_AFTER_YEARS}+ years ago`);
  if (notes.includes("BELOW_MIN_YEARS")) out.push("below the minimum years asked (self-reported)");
  return out;
}

export function matchHeadline(m: CandidateMatch): string {
  const noun = m.requiredTotal === 1 ? "required skill" : "required skills";
  return `${m.requiredDemonstrated} of ${m.requiredTotal} ${noun} with recent evidence`;
}