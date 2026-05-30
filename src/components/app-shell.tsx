"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppChromeProvider, useAppChrome } from "@/components/app-chrome-context";
import { Logo } from "@/components/logo";
import { glassInset, glassStrong, glassSubtle } from "@/components/glass-surface";
import { PageBackdrop } from "@/components/page-backdrop";
import { NewsTicker } from "@/components/news/news-ticker";
import { NewsWireSlotProvider, useNewsWireSlot } from "@/components/news/news-wire-slot-context";
import { mainNav } from "@/lib/navigation";
import { cn } from "@/lib/utils";

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
      <NewsWireSlotProvider>
        <AppShellFrame>{children}</AppShellFrame>
      </NewsWireSlotProvider>
    </AppChromeProvider>
  );
}

function AppShellFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { headerHidden } = useAppChrome();
  const { wireHeadlines } = useNewsWireSlot();
  const isNewsPage = pathname.startsWith("/news");
  const showWire = isNewsPage && wireHeadlines && wireHeadlines.length > 0;

  return (
    <div className="flex min-h-full flex-col">
      {!headerHidden ? (
        <header
          className={`sticky top-0 z-50 ${glassStrong} rounded-none border-x-0 border-t-0 border-b border-black/[0.08]`}
        >
        <div
          className={`page-container flex h-[4.25rem] items-center gap-4 ${
            showWire ? "md:gap-5" : "justify-between gap-6"
          }`}
        >
          <Logo />

          {showWire ? (
            <div className="hidden min-w-0 flex-1 md:block">
              <NewsTicker embedded headlines={wireHeadlines} />
            </div>
          ) : null}

          <nav
            className={`hidden items-center gap-1 md:flex ${showWire ? "shrink-0" : ""}`}
          >
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
                    : cn(glassInset, "text-muted hover:text-foreground")
                }`}
                >
                  {item.shortLabel}
                </Link>
              );
            })}
          </nav>
        </div>

        {showWire ? (
          <div className="border-t border-black/[0.06] md:hidden">
            <div className="page-container py-2">
              <NewsTicker embedded headlines={wireHeadlines} />
            </div>
          </div>
        ) : null}

        <nav className="flex gap-2 overflow-x-auto border-t border-black/[0.06] px-5 py-3.5 md:hidden">
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
                    : cn(glassInset, "text-muted")
                }`}
              >
                {item.shortLabel}
              </Link>
            );
          })}
        </nav>
        </header>
      ) : null}

      <main className="app-page relative flex min-h-0 flex-1 flex-col">
        <PageBackdrop />
        <div className="relative z-[1] flex flex-1 flex-col">{children}</div>
      </main>

      <footer className={`${glassSubtle} rounded-none border-x-0 border-b-0 border-t border-black/[0.08]`}>
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
