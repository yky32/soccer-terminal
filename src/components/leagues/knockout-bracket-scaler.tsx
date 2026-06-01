"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type KnockoutBracketScalerProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Scales the bracket down so the full tree fits the container width (no horizontal scroll).
 */
export function KnockoutBracketScaler({ children, className }: KnockoutBracketScalerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({ scale: 1, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const measure = () => {
      const available = container.clientWidth;
      const needed = content.scrollWidth;
      const naturalHeight = content.scrollHeight;
      const scale = needed > 0 ? Math.min(1, available / needed) : 1;

      setLayout({
        scale,
        height: Math.ceil(naturalHeight * scale),
      });
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(content);

    return () => observer.disconnect();
  }, [children]);

  return (
    <div ref={containerRef} className={cn("w-full", className)}>
      <div className="relative w-full" style={{ height: layout.height || undefined }}>
        <div
          ref={contentRef}
          className="absolute left-1/2 top-0 w-max origin-top"
          style={{
            transform: `translateX(-50%) scale(${layout.scale})`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
