import { SectionLabel } from "@/components/layout/SectionLabel";

export interface PolicyPoint {
  term: string;
  detail: string;
}

export interface CancellationPolicyProps {
  points: readonly PolicyPoint[];
}

export function CancellationPolicy({ points }: CancellationPolicyProps) {
  return (
    <section className="flex flex-col gap-4 border-t border-ash pt-8">
      <SectionLabel>Cancellation policy</SectionLabel>
      {/* Each term sits tight on its detail so the pairs read as pairs on a phone. */}
      <dl className="flex max-w-3xl flex-col border-t border-ash text-[15px]">
        {points.map(({ term, detail }) => (
          <div
            key={term}
            className="grid gap-1 border-b border-ash py-4 md:grid-cols-[180px_1fr] md:gap-8"
          >
            <dt className="font-medium">{term}</dt>
            <dd className="text-muted-foreground">{detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
