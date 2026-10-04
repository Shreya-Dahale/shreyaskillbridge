import type { SkillStatus } from "../skills/gap-engine";

export type ShareSettings = {
  showName: boolean;
  includeHeadline: boolean;
  includeSkills: boolean;
  includeAssessments: boolean;
  includeSummary: boolean;
  includeRoles: boolean;
  includeBreak: boolean;
};

// Everything we know about a candidate, before any sharing choices are applied.
export type ProfileSource = {
  displayName: string;
  headline: string | null;
  skills: {
    skillId: string;
    name: string;
    yearsExperience: number | null;
    lastUsedYear: number | null;
  }[];
  roles: { jobTitle: string; company: string; startDate: Date; endDate: Date | null }[];
  careerBreaks: { startDate: Date; endDate: Date | null }[];
  evidence: {
    skillId: string;
    skillName: string;
    kind: "PASSED" | "IN_PROGRESS";
    date: Date;
  }[];
  submissions: {
    taskId: string;
    taskTitle: string;
    skillNames: string[];
    status: "QUEUED" | "RUNNING" | "PASSED" | "FAILED" | "ERROR";
    createdAt: Date;
    gradedAt: Date | null;
  }[];
  relations: { fromId: string; toId: string; kind: "IMPLIES" | "RELATED" }[];
};

export type SharedSkill = {
  name: string;
  status: SkillStatus;
  yearsSelfReported: number | null;
  lastUsedYear: number | null;
};

export type SharedAssessment = {
  taskTitle: string;
  skills: string[];
  passedOn: Date; // the most recent pass
  attempts: number; // graded tries up to and including the first pass
};

export type SharedRole = {
  jobTitle: string;
  company: string;
  startDate: Date;
  endDate: Date | null;
};

export type SharedBreak = { startDate: Date; endDate: Date | null };

// A section the candidate excluded is absent (the key does not exist), never empty or hidden.
export type SharedProfile = {
  name: string;
  headline?: string;
  skills?: SharedSkill[];
  assessments?: SharedAssessment[];
  summary?: string;
  roles?: SharedRole[];
  careerBreaks?: SharedBreak[];
  notices: string[];
  generatedAt: Date;
};