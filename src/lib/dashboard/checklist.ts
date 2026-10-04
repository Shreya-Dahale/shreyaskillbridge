export type ChecklistItem = { key: string; label: string; href: string; done: boolean };

export type ChecklistCounts = {
  roles: number;
  skills: number;
  targets: number;
  passedTasks: number;
  linksCreated: number;
};

/** The steps of getting started, in the order a candidate would naturally do them. */
export function buildChecklist(c: ChecklistCounts): ChecklistItem[] {
  return [
    { key: "history", label: "Add your career history", href: "/candidate/profile", done: c.roles > 0 },
    { key: "resume", label: "Upload your resume and review your skills", href: "/candidate/resume", done: c.skills > 0 },
    { key: "target", label: "Choose a target job", href: "/candidate/jobs", done: c.targets > 0 },
    { key: "task", label: "Pass a practice task", href: "/candidate/tasks", done: c.passedTasks > 0 },
    { key: "share", label: "Create a share link", href: "/candidate/share", done: c.linksCreated > 0 },
  ];
}