import type { ShareSettings } from "./types";

// The approved defaults: nothing about her roles, career break or name unless she turns it on.
export const DEFAULT_SETTINGS: ShareSettings = {
  showName: false,
  includeHeadline: true,
  includeSkills: true,
  includeAssessments: true,
  includeSummary: true,
  includeRoles: false,
  includeBreak: false,
};

export const SETTING_FIELDS: { key: keyof ShareSettings; label: string; hint?: string }[] = [
  { key: "showName", label: "Show my name", hint: "Otherwise you appear as “Candidate”." },
  { key: "includeHeadline", label: "Headline" },
  { key: "includeSkills", label: "Skills and their status" },
  { key: "includeAssessments", label: "Passed practice tasks" },
  { key: "includeSummary", label: "Summary" },
  { key: "includeRoles", label: "Roles (titles, companies, dates)" },
  { key: "includeBreak", label: "Career break dates", hint: "Dates only. There is no field for a reason." },
];

type Params = Record<string, string | string[] | undefined>;

/** Reads the preview form. Without preview=1 the defaults apply. Unticked checkboxes are simply absent. */
export function settingsFromSearchParams(params: Params): ShareSettings {
  if (params.preview !== "1") return DEFAULT_SETTINGS;
  const on = (key: keyof ShareSettings) => params[key] === "on";
  return {
    showName: on("showName"),
    includeHeadline: on("includeHeadline"),
    includeSkills: on("includeSkills"),
    includeAssessments: on("includeAssessments"),
    includeSummary: on("includeSummary"),
    includeRoles: on("includeRoles"),
    includeBreak: on("includeBreak"),
  };
}

/** The labels of the sections a link includes, for showing in a list. */
export function includedLabels(settings: ShareSettings): string[] {
  return SETTING_FIELDS.filter((f) => settings[f.key]).map((f) => f.label);
}

/** Copies exactly the share settings from a stored link, ignoring everything else on it. */
export function settingsFromLink(link: ShareSettings): ShareSettings {
  return {
    showName: link.showName,
    includeHeadline: link.includeHeadline,
    includeSkills: link.includeSkills,
    includeAssessments: link.includeAssessments,
    includeSummary: link.includeSummary,
    includeRoles: link.includeRoles,
    includeBreak: link.includeBreak,
  };
}

/** Discovery never shows a name, so the name setting is always off. */
export function discoveryToShareSettings(d: Omit<ShareSettings, "showName">): ShareSettings {
  return {
    showName: false,
    includeHeadline: d.includeHeadline,
    includeSkills: d.includeSkills,
    includeAssessments: d.includeAssessments,
    includeSummary: d.includeSummary,
    includeRoles: d.includeRoles,
    includeBreak: d.includeBreak,
  };
}