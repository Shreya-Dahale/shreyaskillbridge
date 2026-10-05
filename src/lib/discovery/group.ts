import type { CandidateMatch, MatchGroup } from "./match";

export const GROUP_ORDER: Exclude<MatchGroup, "NONE">[] = ["ALL_RECENT", "SOME_RECENT", "EXPERIENCE_ONLY"];

export const GROUP_LABEL: Record<Exclude<MatchGroup, "NONE">, string> = {
  ALL_RECENT: "Every required skill has recent evidence",
  SOME_RECENT: "Some required skills have recent evidence",
  EXPERIENCE_ONLY: "Relevant experience, no recent evidence yet",
};

/**
 * A stable pseudo-random sort key (FNV-1a) from the candidate's public code and the job.
 * It depends on nothing about the candidate except her code, so it can never encode a ranking.
 */
export function stableOrderKey(code: string, salt: string): number {
  let hash = 0x811c9dc5;
  for (const ch of `${salt}:${code}`) {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Groups matches in a fixed order, drops candidates with nothing relevant, and orders each group stably. */
export function groupCandidates<T extends { code: string; match: CandidateMatch }>(
  items: T[],
  salt: string
): { group: Exclude<MatchGroup, "NONE">; label: string; items: T[] }[] {
  return GROUP_ORDER.map((group) => ({
    group,
    label: GROUP_LABEL[group],
    items: items
      .filter((item) => item.match.group === group)
      .sort((a, b) => {
        const diff = stableOrderKey(a.code, salt) - stableOrderKey(b.code, salt);
        if (diff !== 0) return diff;
        return a.code < b.code ? -1 : a.code > b.code ? 1 : 0;
      }),
  })).filter((g) => g.items.length > 0);
}