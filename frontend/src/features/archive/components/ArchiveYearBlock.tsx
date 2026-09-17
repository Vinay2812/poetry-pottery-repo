import { pluralize } from "@/lib/format";

export interface ArchiveYearBlockProps {
  year: string;
  count: number;
  children: React.ReactNode;
}

// The wall is dated: each year opens with its own rule and a count of what left the kiln.
export function ArchiveYearBlock({
  year,
  count,
  children,
}: ArchiveYearBlockProps) {
  return (
    <section className="flex flex-col gap-8 border-t border-ash pt-8">
      <header className="flex items-baseline justify-between gap-4">
        <h2 className="font-heading text-3xl tracking-tight tnum md:text-4xl">
          {year}
        </h2>
        <p className="text-[13px] text-muted-foreground tnum">
          {pluralize(count, "piece")}
        </p>
      </header>
      <div className="flex flex-col gap-12">{children}</div>
    </section>
  );
}
