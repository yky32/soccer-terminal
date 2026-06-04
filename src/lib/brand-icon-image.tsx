import { brandLogoMarkDataUrl } from "@/lib/brand-logo-mark";

type BrandIconImageProps = {
  size: number;
  padding?: number;
  background?: string;
};

/** Raster-friendly logo tile for next/og ImageResponse (favicon + apple-icon). */
export function BrandIconImage({
  size,
  padding = 0,
  background = "transparent",
}: BrandIconImageProps) {
  const inner = size - padding * 2;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={brandLogoMarkDataUrl()}
        alt=""
        width={inner}
        height={inner}
        style={{ display: "block" }}
      />
    </div>
  );
}
