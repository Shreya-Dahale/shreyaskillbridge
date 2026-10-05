"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { badgeText } from "./badge";
import { ICONS } from "./icons";
import { isActive } from "./is-active";
import type { NavItem } from "./nav-types";

export function NavLinks({
  items,
  badges,
  onNavigate,
}: {
  items: NavItem[];
  badges?: Record<string, number>;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active = isActive(pathname, item.href, item.exact);
        const badge = badgeText(badges?.[item.href] ?? 0);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.label}
              {badge && (
                <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium leading-none text-primary-foreground">
                  {badge}
                  <span className="sr-only"> unread</span>
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}