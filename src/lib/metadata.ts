import type { Metadata } from "next";

export const PRODUCT_NAME = "Soccer Terminal";

export const TITLE_TEMPLATE = `%s - ${PRODUCT_NAME}`;

export const SITE_DESCRIPTION =
  "Live football map and scores worldwide — league standings, fixtures, lineups, and match stats in one terminal.";

/** Public AdSense publisher ID (site verification + ad units). */
export const ADSENSE_PUBLISHER_ID = "ca-pub-6625924027167786";

const PRODUCTION_SITE_URL = "https://www.soccer-terminal.app";

/** Resolve public site origin for canonical URLs, OG, and sitemap. */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (process.env.VERCEL_ENV === "production") {
    return PRODUCTION_SITE_URL;
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }

  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_SITE_URL;
  }

  return "http://localhost:3000";
}

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function pageTitle(pageName: string) {
  return `${pageName} - ${PRODUCT_NAME}`;
}

export function shareTitle(pageName: string) {
  return pageTitle(pageName);
}

type BuildPageMetadataOptions = {
  /** Segment for document title (template adds product name). */
  title: string;
  description?: string;
  /** Canonical path, e.g. `/leagues/premier-league`. */
  path?: string;
  index?: boolean;
  openGraph?: Metadata["openGraph"];
  twitter?: Metadata["twitter"];
};

export function buildPageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path,
  index = true,
  openGraph,
  twitter,
}: BuildPageMetadataOptions): Metadata {
  const url = path ? absoluteUrl(path) : undefined;
  const sharedTitle = shareTitle(title);

  return {
    title,
    description,
    alternates: url ? { canonical: url } : undefined,
    openGraph: {
      type: "website",
      siteName: PRODUCT_NAME,
      title: sharedTitle,
      description,
      url,
      locale: "en_US",
      ...openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: sharedTitle,
      description,
      ...twitter,
    },
    ...(index ? {} : { robots: { index: false, follow: false } }),
  };
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: PRODUCT_NAME,
    template: TITLE_TEMPLATE,
  },
  description: SITE_DESCRIPTION,
  applicationName: PRODUCT_NAME,
  keywords: [
    "football",
    "soccer",
    "live scores",
    "fixtures",
    "league standings",
    "match map",
    "match stats",
    "team stats",
    "player stats",
    "world football",
    "live football",
  ],
  authors: [{ name: PRODUCT_NAME }],
  creator: PRODUCT_NAME,
  icons: {
    icon: [
      { url: "/icon", sizes: "48x48", type: "image/png" },
      { url: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: PRODUCT_NAME,
    title: PRODUCT_NAME,
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: PRODUCT_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "a_vlY6eLbppnrZvc2o3IHYmSK3DekIpEJ_erQ3tq00c",
  },
  other: {
    "google-adsense-account": ADSENSE_PUBLISHER_ID,
  },
};
