"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { mainNav } from "@/lib/navigation";
import { PRODUCT_NAME } from "@/lib/metadata";
import { cn } from "@/lib/utils";

function navActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SiteFooter() {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-black/[0.06]">
      <div className="page-container py-7 sm:py-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm space-y-3">
            <Logo size="compact" />
            <p className="text-[0.8125rem] leading-[1.55] text-neutral-500">
              Live matches on the map, league standings, and match-day insights — built for
              following football without the noise.
            </p>
          </div>

          <div className="flex flex-col gap-5 sm:items-start lg:items-end">
            <nav
              className="flex flex-wrap gap-x-1 gap-y-1"
              aria-label="Footer navigation"
            >
              {mainNav.map((item) => {
                const isActive = navActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-[0.8125rem] font-medium transition-colors",
                      isActive
                        ? "bg-foreground text-background"
                        : "text-neutral-600 hover:bg-black/[0.04] hover:text-neutral-950",
                    )}
                  >
                    {item.shortLabel}
                  </Link>
                );
              })}
            </nav>

            <p className="text-[0.6875rem] tabular-nums tracking-wide text-neutral-400">
              © {year} {PRODUCT_NAME}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
