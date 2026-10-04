import { z } from "zod";

export const VERDICTS = [
  "PASSED",
  "WRONG_ANSWER",
  "RUNTIME_ERROR",
  "SQL_ERROR",
  "LIMIT_EXCEEDED",
  "COMPILE_ERROR",
  "NOT_RUN",
] as const;

export type Verdict = (typeof VERDICTS)[number];

export const VERDICT_LABEL: Record<Verdict, string> = {
  PASSED: "Passed",
  WRONG_ANSWER: "Wrong answer",
  RUNTIME_ERROR: "Runtime error",
  SQL_ERROR: "Query error",
  LIMIT_EXCEEDED: "Time or memory limit exceeded",
  COMPILE_ERROR: "Didn't compile",
  NOT_RUN: "Not run",
};

export const gradeResultSchema = z.object({
  compileError: z.string().optional(),
  cases: z.array(
    z.object({
      label: z.string(),
      hidden: z.boolean(),
      verdict: z.enum(VERDICTS),
      actual: z.string().optional(),
      stderr: z.string().optional(),
    })
  ),
});

export type GradeResult = z.infer<typeof gradeResultSchema>;