"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav } from "@/lib/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full flex-col lg:flex-row">
      <aside className="border-b border-border lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-4 lg:flex-col lg:items-start lg:px-5 lg:py-6">
          <Link href="/" className="text-sm font-semibold tracking-wide uppercase">
            Soccer World Monitor
          </Link>
          <span className="rounded-full border border-border px-2.5 py-0.5 text-[10px] text-muted lg:mt-3">
            Alpha
          </span>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-6">
          {mainNav.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm transition-colors lg:w-full ${
                  isActive
                    ? "bg-surface-elevated text-foreground"
                    : "text-muted hover:bg-surface hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
