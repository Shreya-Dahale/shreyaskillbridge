import type { NavItem } from "./nav-types";

export const CANDIDATE_NAV: NavItem[] = [
  { href: "/candidate", label: "Dashboard", icon: "LayoutDashboard", exact: true },
  { href: "/candidate/profile", label: "Profile", icon: "User" },
  { href: "/candidate/resume", label: "Resume", icon: "FileText" },
  { href: "/candidate/skills", label: "Skills", icon: "Sparkles" },
  { href: "/candidate/jobs", label: "Jobs", icon: "Briefcase" },
  { href: "/candidate/tasks", label: "Practice tasks", icon: "ListChecks" },
  { href: "/candidate/evidence", label: "Evidence profile", icon: "BadgeCheck" },
  { href: "/candidate/share", label: "Sharing", icon: "Share2" },
];

export const EMPLOYER_NAV: NavItem[] = [
  { href: "/employer", label: "Dashboard", icon: "LayoutDashboard", exact: true },
  { href: "/employer/company", label: "Company", icon: "Building2" },
  { href: "/employer/jobs", label: "Jobs", icon: "Briefcase" },
];