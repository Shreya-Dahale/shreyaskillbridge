import { analyzeGaps, EVIDENCE_FRESH_MONTHS, type SkillStatus } from "../skills/gap-engine";
import { compareNames } from "./format";
import { buildSummary } from "./summary";
import type {
  ProfileSource,
  SharedAssessment,
  SharedProfile,
  SharedSkill,
  ShareSettings,
} from "./types";

const STATUS_ORDER: Record<SkillStatus, number> = {
  DEMONSTRATED: 0,
  DEVELOPING: 1,
  NEEDS_REFRESH: 2,
  NOT_YET_DEMONSTRATED: 3,
};

function buildSkills(source: ProfileSource, now: Date): SharedSkill[] {
  // Every skill she lists, plus any skill shown by a task even if it is not on her profile.
  const names = new Map<string, string>();
  for (const s of source.skills) names.set(s.skillId, s.name);
  for (const e of source.evidence) if (!names.has(e.skillId)) names.set(e.skillId, e.skillName);

  const gaps = analyzeGaps({
    requirements: Array.from(names, ([skillId, name]) => ({
      skillId,
      name,
      importance: "REQUIRED" as const,
      minYears: null,
    })),
    candidateSkills: source.skills,
    evidence: source.evidence.map((e) => ({ skillId: e.skillId, kind: e.kind, date: e.date })),
    relations: source.relations,
    now,
  });

  return gaps
    .map((g) => ({
      name: g.name,
      status: g.status,
      // Years only count when the skill is on her own profile, never borrowed from a related one.
      yearsSelfReported: g.match.kind === "DIRECT" ? g.candidateYears : null,
      lastUsedYear: g.match.kind === "DIRECT" ? g.lastUsedYear : null,
    }))
    .sort(
      (a, b) =>
        STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
        (b.yearsSelfReported ?? -1) - (a.yearsSelfReported ?? -1) ||
        compareNames(a.name, b.name)
    );
}

function buildAssessments(source: ProfileSource): SharedAssessment[] {
  const byTask = new Map<string, ProfileSource["submissions"]>();
  for (const sub of source.submissions) {
    const list = byTask.get(sub.taskId) ?? [];
    list.push(sub);
    byTask.set(sub.taskId, list);
  }

  const out: SharedAssessment[] = [];
  for (const subs of byTask.values()) {
    // Only graded tries count. A grader outage (ERROR) is never held against the candidate.
    const graded = subs
      .filter((s) => (s.status === "PASSED" || s.status === "FAILED") && s.gradedAt !== null)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    const firstPass = graded.findIndex((s) => s.status === "PASSED");
    if (firstPass === -1) continue; // failed attempts are never shared

    const passes = graded.filter((s) => s.status === "PASSED");
    const latest = passes[passes.length - 1];
    out.push({
      taskTitle: latest.taskTitle,
      skills: Array.from(new Set(latest.skillNames)).sort(compareNames),
      passedOn: latest.gradedAt as Date,
      attempts: firstPass + 1,
    });
  }

  return out.sort(
    (a, b) => b.passedOn.getTime() - a.passedOn.getTime() || compareNames(a.taskTitle, b.taskTitle)
  );
}

/** Builds exactly what the share settings allow. An excluded section does not exist in the result. */
export function buildSharedProfile(
  source: ProfileSource,
  settings: ShareSettings,
  now: Date = new Date()
): SharedProfile {
  const profile: SharedProfile = {
    name: settings.showName ? source.displayName : "Candidate",
    notices: [],
    generatedAt: now,
  };

  const skills = settings.includeSkills ? buildSkills(source, now) : undefined;
  const assessments = settings.includeAssessments ? buildAssessments(source) : undefined;

  if (settings.includeHeadline && source.headline) profile.headline = source.headline;
  if (skills) profile.skills = skills;
  if (assessments) profile.assessments = assessments;

  if (settings.includeSummary) {
    const summary = buildSummary(skills, assessments);
    if (summary) profile.summary = summary;
  }

  if (settings.includeRoles) {
    profile.roles = [...source.roles]
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
      .map((r) => ({
        jobTitle: r.jobTitle,
        company: r.company,
        startDate: r.startDate,
        endDate: r.endDate,
      }));
  }

  if (settings.includeBreak) {
    profile.careerBreaks = [...source.careerBreaks]
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
      .map((b) => ({ startDate: b.startDate, endDate: b.endDate }));
  }

  if (settings.includeSkills || settings.includeRoles) {
    profile.notices.push(
      "Years of experience and roles come from the candidate's own career history and are self-reported."
    );
  }
  if (settings.includeSkills) {
    profile.notices.push(
      `Demonstrated means a practice task was passed in the last ${EVIDENCE_FRESH_MONTHS} months. Developing means a task has been started. Needs refresh means experience is on record but there is no recent evidence.`
    );
  }
  if (settings.includeAssessments) {
    profile.notices.push(
      "Assessment results come from practice tasks completed independently, without supervision."
    );
  }

  return profile;
}