import { FaShirt } from "react-icons/fa6";
import { cn } from "@/lib/utils";

export function ShirtIcon({ className }: { className?: string }) {
  return <FaShirt className={cn("shrink-0", className)} aria-hidden />;
}
