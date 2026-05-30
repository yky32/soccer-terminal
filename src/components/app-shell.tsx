"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppChromeProvider, useAppChrome } from "@/components/app-chrome-context";
import { Logo } from "@/components/logo";
import { mainNav } from "@/lib/navigation";

function ChevronRight() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 text-muted-light transition-transform group-hover:translate-x-0.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppChromeProvider>
      <AppShellFrame>{children}</AppShellFrame>
    </AppChromeProvider>
  );
}

function AppShellFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { headerHidden } = useAppChrome();

  return (
    <div className="flex min-h-full flex-col">
      {!headerHidden ? (
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="page-container flex h-[4.25rem] items-center justify-between gap-6">
          <Logo />

          <nav className="hidden items-center gap-1 md:flex">
            {mainNav.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-label rounded-full px-4 py-2.5 font-medium transition-colors ${
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted hover:bg-surface hover:text-foreground"
                  }`}
                >
                  {item.shortLabel}
                </Link>
              );
            })}
          </nav>
        </div>

        <nav className="flex gap-2 overflow-x-auto border-t border-border px-5 py-3.5 md:hidden">
          {mainNav.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-label shrink-0 rounded-full px-4 py-2.5 font-medium transition-colors ${
                  isActive
                    ? "bg-foreground text-background"
                    : "bg-surface text-muted"
                }`}
              >
                {item.shortLabel}
              </Link>
            );
          })}
        </nav>
        </header>
      ) : null}

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-surface">
        <div className="page-container flex flex-col gap-4 py-9 sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <p className="text-body text-muted">
            Professional football intelligence
          </p>
        </div>
      </footer>
    </div>
  );
}

export { ChevronRight };
