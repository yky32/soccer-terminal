type JsonLdScriptProps = {
  data: Record<string, unknown>;
};

/** Renders schema.org JSON-LD for crawlers (Google rich results). */
export function JsonLdScript({ data }: JsonLdScriptProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
