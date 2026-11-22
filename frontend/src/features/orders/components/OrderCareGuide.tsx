import Link from "next/link";

import { SectionLabel } from "@/components/layout/SectionLabel";

export interface OrderCareGuideProps {
  lines: string[];
}

// Shown once the parcel has landed: the care lines of the pieces that are actually in it.
export function OrderCareGuide({ lines }: OrderCareGuideProps) {
  return (
    <section className="flex flex-col gap-4">
      <SectionLabel>Caring for these pieces</SectionLabel>
      <ul className="flex flex-col gap-2">
        {lines.map((line) => (
          <li key={line} className="flex gap-3 text-[15px]">
            <span aria-hidden className="text-muted-foreground">
              —
            </span>
            {line}
          </li>
        ))}
      </ul>
      <Link
        href="/care"
        className="w-fit border-b border-ink pb-0.5 text-sm hover:border-primary hover:text-primary"
      >
        The full care guide
      </Link>
    </section>
  );
}
