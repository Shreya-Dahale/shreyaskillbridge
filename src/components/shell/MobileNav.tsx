"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { NavLinks } from "./NavLinks";
import type { NavItem } from "./nav-types";

export function MobileNav({ items, badges }: { items: NavItem[]; badges?: Record<string, number> }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);

    // Stop the page behind the menu from scrolling while it is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
        <Menu />
      </Button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} aria-hidden="true" />
            <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-background shadow-xl">
              <div className="flex h-16 items-center justify-between border-b px-4">
                <Logo />
                <Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setOpen(false)}>
                  <X />
                </Button>
              </div>
              <nav className="overflow-y-auto p-4">
                <NavLinks items={items} badges={badges} onNavigate={() => setOpen(false)} />
              </nav>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}