export type DiscoveryForm = {
  enabled: boolean;
  includeHeadline: boolean;
  includeSkills: boolean;
  includeAssessments: boolean;
  includeSummary: boolean;
  includeRoles: boolean;
  includeBreak: boolean;
};

// Discovery starts off, with the same section defaults as share links.
export const DEFAULT_DISCOVERY: DiscoveryForm = {
  enabled: false,
  includeHeadline: true,
  includeSkills: true,
  includeAssessments: true,
  includeSummary: true,
  includeRoles: false,
  includeBreak: false,
};

/** Reads the settings form. Only the exact value "on" counts, and an unticked box is simply absent. */
export function parseDiscoveryForm(form: { get(name: string): unknown }): DiscoveryForm {
  const on = (key: string) => form.get(key) === "on";
  return {
    enabled: on("enabled"),
    includeHeadline: on("includeHeadline"),
    includeSkills: on("includeSkills"),
    includeAssessments: on("includeAssessments"),
    includeSummary: on("includeSummary"),
    includeRoles: on("includeRoles"),
    includeBreak: on("includeBreak"),
  };
}

export function hasAnySection(f: DiscoveryForm): boolean {
  return (
    f.includeHeadline ||
    f.includeSkills ||
    f.includeAssessments ||
    f.includeSummary ||
    f.includeRoles ||
    f.includeBreak
  );
}

/** Skills and passed tasks are what an employer's search can match on. */
export function canBeMatched(f: DiscoveryForm): boolean {
  return f.includeSkills || f.includeAssessments;
}