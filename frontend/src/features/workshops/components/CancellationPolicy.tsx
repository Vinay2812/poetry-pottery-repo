import { CANCELLING_RULE } from "@/features/workshops/types";
import { SectionLabel } from "@/features/workshops/components/SectionLabel";

const POLICY_POINTS = [
  {
    term: "Missed sessions",
    detail:
      "If you miss your session or don't turn up, we can't refund it or move it.",
  },
  {
    term: "Cancelling",
    detail: CANCELLING_RULE,
  },
  {
    term: "Sending someone else",
    detail:
      "If you can't make it, a friend or family member can take your seat.",
  },
  {
    term: "No postponing",
    detail: "A booking can't be moved to a later date.",
  },
  {
    term: "Breakage",
    detail:
      "We look after every student's piece, but clay is fragile and a piece can sometimes break in the kiln.",
  },
] as const;

export function CancellationPolicy() {
  return (
    <section className="flex flex-col gap-4 border-t border-ash pt-8">
      <SectionLabel>Cancellation policy</SectionLabel>
      {/* Each term sits tight on its detail so the pairs read as pairs on a phone. */}
      <dl className="flex max-w-3xl flex-col border-t border-ash text-[15px]">
        {POLICY_POINTS.map(({ term, detail }) => (
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
