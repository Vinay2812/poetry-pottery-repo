import Link from "next/link";

export interface OrderCareGuideProps {
  lines: string[];
}

// Shown once the parcel has landed: the care lines of the pieces that are actually in it.
export function OrderCareGuide({ lines }: OrderCareGuideProps) {
  return (
    <section className="flex flex-col gap-5">
      <h3 className="border-b border-ash pb-3 font-heading text-xl tracking-tight">
        Caring for these pieces
      </h3>
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
