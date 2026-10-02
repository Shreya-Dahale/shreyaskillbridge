import { z } from "zod";

export const extractedRoleSchema = z.object({
  jobTitle: z.string().describe("Job title exactly as written"),
  company: z.string().describe("Employer name exactly as written"),
  startDate: z
    .string()
    .optional()
    .describe("Start date as YYYY-MM if the month is known, YYYY if only the year is known. Omit if not stated."),
  endDate: z
    .string()
    .optional()
    .describe("End date as YYYY-MM or YYYY, or the word 'present' if the role is current. Omit if not stated."),
  description: z
    .string()
    .optional()
    .describe("One or two sentences summarising the responsibilities"),
});

export const extractedSkillSchema = z.object({
  name: z.string().describe("Technical skill or tool, e.g. 'Java', 'Spring MVC', 'MySQL'"),
  yearsExperience: z
    .number()
    .optional()
    .describe("Years of experience, only if stated or clearly derivable from role dates. Omit otherwise."),
  lastUsedYear: z
    .number()
    .int()
    .optional()
    .describe("Year the skill was last used, based on the end date of the latest role that mentions it. Omit if unknown."),
});

export const resumeExtractionSchema = z.object({
  roles: z.array(extractedRoleSchema).max(30),
  skills: z.array(extractedSkillSchema).max(80),
});

export type ResumeExtraction = z.infer<typeof resumeExtractionSchema>;

export const extractedRequirementSchema = z.object({
  name: z.string().describe("Skill, tool or technology, e.g. 'Java', 'Spring Boot', 'Docker'"),
  importance: z
    .enum(["required", "preferred"])
    .describe("'required' for must-haves, 'preferred' for nice-to-haves"),
  minYears: z
    .number()
    .optional()
    .describe("Minimum years of experience with this specific skill, only if the posting states it. Omit otherwise."),
});

export const jobExtractionSchema = z.object({
  skills: z.array(extractedRequirementSchema).max(40),
});

export type JobExtraction = z.infer<typeof jobExtractionSchema>;