import { JsonLdScript } from "@/components/seo/json-ld-script";
import { buildSiteJsonLdGraph } from "@/lib/seo/json-ld";

export function SiteJsonLd() {
  return <JsonLdScript data={buildSiteJsonLdGraph()} />;
}
