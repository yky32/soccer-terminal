import Link from "next/link";
import { LogoIcon } from "@/components/logo-icon";

type LogoProps = {
  showText?: boolean;
};

export function Logo({ showText = true }: LogoProps) {
  return (
    <Link href="/" className="flex min-w-0 shrink items-center gap-2.5 sm:gap-3.5">
      <LogoIcon className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" />
      {showText ? (
        <span className="text-label truncate font-semibold tracking-[-0.03em] text-foreground">
          Soccer Monitor
        </span>
      ) : null}
    </Link>
  );
}
