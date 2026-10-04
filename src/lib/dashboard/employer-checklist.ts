import type { ChecklistItem } from "./checklist";

export type EmployerChecklistCounts = {
  companyComplete: boolean;
  jobs: number;
  jobsWithRequirements: number;
  publishedEver: number; // jobs that are published or have been closed
};

export function buildEmployerChecklist(c: EmployerChecklistCounts): ChecklistItem[] {
  return [
    { key: "company", label: "Complete your company profile", href: "/employer/company", done: c.companyComplete },
    { key: "job", label: "Create a job", href: "/employer/jobs/new", done: c.jobs > 0 },
    { key: "review", label: "Review a job's requirements", href: "/employer/jobs", done: c.jobsWithRequirements > 0 },
    { key: "publish", label: "Publish a job", href: "/employer/jobs", done: c.publishedEver > 0 },
  ];
}