import Link from "next/link";

import { GlazeSwatch } from "@/features/products/components/GlazeSwatch";

export interface GlazeNoteProps {
  name: string;
  colorCode: string | null;
  swatchUrl: string | null;
  description: string;
  variationNote: string | null;
  href: string;
}

// The glaze named as a material: what it does in the kiln, how it varies, and
// every other piece wearing it.
export function GlazeNote({
  name,
  colorCode,
  swatchUrl,
  description,
  variationNote,
  href,
}: GlazeNoteProps) {
  return (
    <section aria-label={`${name} glaze`} className="flex gap-4 pt-6">
      <GlazeSwatch name={name} colorCode={colorCode} swatchUrl={swatchUrl} />
      <div className="flex min-w-0 flex-col gap-1.5">
        <h3 className="text-sm">{name}</h3>
        <p className="text-[13px] text-muted-foreground">{description}</p>
        {variationNote && (
          <p className="text-[13px] text-muted-foreground">{variationNote}</p>
        )}
        <Link
          href={href}
          className="w-fit border-b border-ink pb-0.5 text-[13px] hover:border-primary hover:text-primary"
        >
          See everything in {name}
        </Link>
      </div>
    </section>
  );
}
