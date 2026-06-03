import {
  absoluteUrl,
  PRODUCT_NAME,
  SITE_DESCRIPTION,
} from "@/lib/metadata";

type JsonLdNode = Record<string, unknown>;

/** Site-wide Organization + WebSite graph for the root layout. */
export function buildSiteJsonLdGraph(): JsonLdNode {
  const siteUrl = absoluteUrl("/");
  const organizationId = `${siteUrl}#organization`;
  const websiteId = `${siteUrl}#website`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: PRODUCT_NAME,
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/icon.svg"),
        },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: siteUrl,
        name: PRODUCT_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: "en",
        publisher: { "@id": organizationId },
      },
      {
        "@type": "WebApplication",
        "@id": `${siteUrl}#app`,
        name: PRODUCT_NAME,
        url: siteUrl,
        description: SITE_DESCRIPTION,
        applicationCategory: "SportsApplication",
        operatingSystem: "Web",
        browserRequirements: "Requires JavaScript",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        publisher: { "@id": organizationId },
        isPartOf: { "@id": websiteId },
      },
    ],
  };
}
