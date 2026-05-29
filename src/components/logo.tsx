import Link from "next/link";
import { LogoIcon } from "@/components/logo-icon";

type LogoProps = {
  showText?: boolean;
};

export function Logo({ showText = true }: LogoProps) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-3.5">
      <LogoIcon className="h-10 w-10 shrink-0" />
      {showText ? (
        <span className="text-label font-semibold tracking-[-0.03em] text-foreground">
          Soccer Monitor
        </span>
      ) : null}
    </Link>
  );
}
