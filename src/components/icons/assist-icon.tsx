import { TbShoe } from "react-icons/tb";
import { cn } from "@/lib/utils";

export function AssistIcon({ className }: { className?: string }) {
  return (
    <TbShoe
      className={cn("shrink-0 scale-[1.06] stroke-[2.5]", className)}
      aria-hidden
    />
  );
}
