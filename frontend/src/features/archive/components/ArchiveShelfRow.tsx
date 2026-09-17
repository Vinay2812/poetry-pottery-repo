export interface ArchiveShelfRowProps {
  collection: string;
  children: React.ReactNode;
}

// One named run inside a year: its name on a hairline, then the pieces it held.
export function ArchiveShelfRow({
  collection,
  children,
}: ArchiveShelfRowProps) {
  return (
    <section className="flex flex-col gap-5">
      <h3 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
        {collection}
      </h3>
      <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </section>
  );
}
