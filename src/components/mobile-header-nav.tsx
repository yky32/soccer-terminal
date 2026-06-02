"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { glassFocus, glassInset, glassStrong } from "@/components/glass-surface";
import { mainNav } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const MOBILE_INLINE_NAV_LIMIT = 3;

function navItemActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

type MobileHeaderNavProps = {
  pathname: string;
  className?: string;
};

export function MobileHeaderNav({ pathname, className }: MobileHeaderNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const useMenu = mainNav.length > MOBILE_INLINE_NAV_LIMIT;

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  if (!useMenu) {
    return (
      <nav
        className={cn("flex shrink-0 items-center", className)}
        aria-label="Main navigation"
      >
        {mainNav.map((item, index) => {
          const isActive = navItemActive(pathname, item.href);

          return (
            <Fragment key={item.href}>
              {index > 0 ? (
                <span
                  className="px-1.5 text-[0.8125rem] font-medium text-neutral-300"
                  aria-hidden
                >
                  |
                </span>
              ) : null}
              <Link
                href={item.href}
                className={cn(
                  glassFocus,
                  "rounded-sm px-0.5 text-[0.8125rem] font-medium tracking-[-0.01em] transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted hover:text-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {item.shortLabel}
              </Link>
            </Fragment>
          );
        })}
      </nav>
    );
  }

  return (
    <div className={cn("relative shrink-0", className)}>
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        aria-expanded={menuOpen}
        aria-controls="mobile-main-nav"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        className={cn(
          glassInset,
          glassFocus,
          "flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 transition-colors hover:text-neutral-950",
        )}
      >
        {menuOpen ? (
          <X className="h-[1.125rem] w-[1.125rem]" strokeWidth={2.25} aria-hidden />
        ) : (
          <Menu className="h-[1.125rem] w-[1.125rem]" strokeWidth={2.25} aria-hidden />
        )}
      </button>

      {menuOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            id="mobile-main-nav"
            className={cn(
              glassStrong,
              "absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[10.5rem] overflow-hidden rounded-xl border border-black/[0.06] py-1 shadow-[0_12px_32px_rgba(15,23,42,0.12)]",
            )}
            aria-label="Main navigation"
          >
            {mainNav.map((item) => {
              const isActive = navItemActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    glassFocus,
                    "block px-3.5 py-2.5 text-[0.8125rem] font-medium tracking-[-0.01em] transition-colors",
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted hover:bg-white/60 hover:text-foreground",
                  )}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </>
      ) : null}
    </div>
  );
}
