import { LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { NavLinks } from "./NavLinks";
import type { NavItem } from "./nav-types";

export function AppShell({
  section,
  items,
  badges,
  userName,
  children,
}: {
  section: string;
  items: NavItem[];
  badges?: Record<string, number>;
  userName?: string | null;
  children: React.ReactNode;
}) {
  const initial = userName?.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-background md:flex">
        <div className="flex h-16 items-center border-b px-6">
          <Logo />
        </div>
        <p className="px-6 pt-5 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {section}
        </p>
        <nav className="flex-1 overflow-y-auto px-4 pb-4">
          <NavLinks items={items} badges={badges} />
        </nav>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-8">
          <MobileNav items={items} badges={badges} />
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-8 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground"
            >
              {initial}
            </span>
            <span className="hidden text-sm font-medium sm:inline">{userName}</span>
            <form action={logout}>
              <Button variant="outline" size="sm">
                <LogOut /> Log out
              </Button>
            </form>
          </div>
        </header>

        <main className="mx-auto max-w-6xl p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}