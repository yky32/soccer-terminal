import { ImageResponse } from "next/og";
import { BrandIconImage } from "@/lib/brand-icon-image";

/** Google Search favicon minimum — 48×48 PNG from nav logo mark. */
export const size = { width: 48, height: 48 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<BrandIconImage size={48} />, { ...size });
}
