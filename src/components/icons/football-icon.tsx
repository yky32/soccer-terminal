import { cn } from "@/lib/utils";

/** Classic black-and-white panel football, readable at small sizes. */
export function FootballIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("shrink-0", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9.5" className="fill-white stroke-neutral-300" strokeWidth="1.1" />
      <path
        className="fill-neutral-800"
        d="M12 7.25 14.65 9.55 13.85 12.85 10.15 12.85 9.35 9.55 12 7.25Z"
      />
      <path
        className="stroke-neutral-800"
        strokeWidth="1.05"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 7.25 14.65 9.55 18.1 10.35M13.85 12.85 15.55 16.45 12 18.75M10.15 12.85 8.45 16.45 12 18.75M9.35 9.55 5.9 10.35M14.65 9.55 16.35 6.15 12 4.85M9.35 9.55 7.65 6.15 12 4.85"
      />
    </svg>
  );
}
