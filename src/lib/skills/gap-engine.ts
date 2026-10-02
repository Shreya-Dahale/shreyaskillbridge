export const EVIDENCE_FRESH_MONTHS = 12;
export const STALE_AFTER_YEARS = 3;

export type SkillStatus = "DEMONSTRATED" | "DEVELOPING" | "NEEDS_REFRESH" | "NOT_YET_DEMONSTRATED";
export type MatchKind = "DIRECT" | "IMPLIED" | "RELATED" | "NONE";
export type GapNote = "ADJACENT_ONLY" | "STALE" | "BELOW_MIN_YEARS";

export type RequirementInput = {
  skillId: string;
  name: string;
  importance: "REQUIRED" | "PREFERRED";
  minYears: number | null;
};

export type CandidateSkillInput = {
  skillId: string;
  name: string;
  yearsExperience: number | null;
  lastUsedYear: number | null;
};

// Assessment results. Nothing produces these until Phase 4, so the list is empty for now.
export type EvidenceInput = {
  skillId: string;
  kind: "PASSED" | "IN_PROGRESS";
  date: Date;
};

// "from" counts toward a requirement for "to".
export type RelationInput = {
  fromId: string;
  toId: string;
  kind: "IMPLIES" | "RELATED";
};

export type SkillGap = {
  skillId: string;
  name: string;
  importance: "REQUIRED" | "PREFERRED";
  minYears: number | null;
  status: SkillStatus;
  match: { kind: MatchKind; via: string | null };
  candidateYears: number | null;
  lastUsedYear: number | null;
  notes: GapNote[];
};

export type AnalyzeInput = {
  requirements: RequirementInput[];
  candidateSkills: CandidateSkillInput[];
  evidence: EvidenceInput[];
  relations: RelationInput[];
  now?: Date;
};

function evidenceCutoff(now: Date) {
  const cutoff = new Date(now.getTime());
  cutoff.setUTCMonth(cutoff.getUTCMonth() - EVIDENCE_FRESH_MONTHS);
  return cutoff;
}

function best(skills: CandidateSkillInput[]): CandidateSkillInput | null {
  let top: CandidateSkillInput | null = null;
  for (const s of skills) {
    if (!top) {
      top = s;
      continue;
    }
    const a = s.yearsExperience ?? -1;
    const b = top.yearsExperience ?? -1;
    if (a > b || (a === b && (s.lastUsedYear ?? 0) > (top.lastUsedYear ?? 0))) top = s;
  }
  return top;
}

function findMatch(
  requirementId: string,
  byId: Map<string, CandidateSkillInput>,
  relations: RelationInput[]
): { kind: MatchKind; skill: CandidateSkillInput | null } {
  const direct = byId.get(requirementId);
  if (direct) return { kind: "DIRECT", skill: direct };

  const fromRelations = (kind: "IMPLIES" | "RELATED") =>
    relations
      .filter((r) => r.toId === requirementId && r.kind === kind)
      .map((r) => byId.get(r.fromId))
      .filter((s): s is CandidateSkillInput => !!s);

  const implied = best(fromRelations("IMPLIES"));
  if (implied) return { kind: "IMPLIED", skill: implied };

  const related = best(fromRelations("RELATED"));
  if (related) return { kind: "RELATED", skill: related };

  return { kind: "NONE", skill: null };
}

export function analyzeGaps(input: AnalyzeInput): SkillGap[] {
  const now = input.now ?? new Date();
  const thisYear = now.getUTCFullYear();
  const cutoff = evidenceCutoff(now);
  const byId = new Map(input.candidateSkills.map((s) => [s.skillId, s]));

  return input.requirements.map((req) => {
    const match = findMatch(req.skillId, byId, input.relations);

    // Evidence demonstrates a skill only if it is the skill itself, or a skill that implies it.
    const countsAsEvidenceFor = new Set<string>([req.skillId]);
    for (const r of input.relations) {
      if (r.toId === req.skillId && r.kind === "IMPLIES") countsAsEvidenceFor.add(r.fromId);
    }
    const relevant = input.evidence.filter((e) => countsAsEvidenceFor.has(e.skillId));

    const freshPass = relevant.some((e) => e.kind === "PASSED" && e.date >= cutoff);
    const inProgress = relevant.some((e) => e.kind === "IN_PROGRESS");
    const oldPass = relevant.some((e) => e.kind === "PASSED" && e.date < cutoff);

    let status: SkillStatus;
    if (freshPass) status = "DEMONSTRATED";
    else if (inProgress) status = "DEVELOPING";
    else if (match.kind !== "NONE" || oldPass) status = "NEEDS_REFRESH";
    else status = "NOT_YET_DEMONSTRATED";

    const matched = match.skill;
    const notes: GapNote[] = [];

    if (match.kind === "RELATED") notes.push("ADJACENT_ONLY");

    if (
      status !== "DEMONSTRATED" &&
      matched?.lastUsedYear != null &&
      thisYear - matched.lastUsedYear >= STALE_AFTER_YEARS
    ) {
      notes.push("STALE");
    }

    if (
      (match.kind === "DIRECT" || match.kind === "IMPLIED") &&
      req.minYears != null &&
      matched?.yearsExperience != null &&
      matched.yearsExperience < req.minYears
    ) {
      notes.push("BELOW_MIN_YEARS");
    }

    return {
      skillId: req.skillId,
      name: req.name,
      importance: req.importance,
      minYears: req.minYears,
      status,
      match: {
        kind: match.kind,
        via: match.kind === "IMPLIED" || match.kind === "RELATED" ? matched!.name : null,
      },
      candidateYears: matched?.yearsExperience ?? null,
      lastUsedYear: matched?.lastUsedYear ?? null,
      notes,
    };
  });
}