import { GiSoccerBall } from "react-icons/gi";
import { cn } from "@/lib/utils";

export function FootballIcon({ className }: { className?: string }) {
  return <GiSoccerBall className={cn("shrink-0", className)} aria-hidden />;
}
