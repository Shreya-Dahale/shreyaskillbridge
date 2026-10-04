import type { ICONS } from "./icons";

export type IconName = keyof typeof ICONS;

export type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  exact?: boolean;
};