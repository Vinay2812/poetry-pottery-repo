export interface JsonLdProps {
  json: string;
}

// Takes pre-serialised JSON from serializeJsonLd, which escapes the markup-breaking characters.
export function JsonLd({ json }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
