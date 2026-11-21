const POLICY_POINTS = [
  {
    term: "Missed sessions",
    detail:
      "If you miss your session or don't turn up, we can't refund it or move it.",
  },
  {
    term: "Cancelling",
    detail:
      "Cancel at least 4 days before your session for a full refund. After that, we refund only if we can fill your seat from the waitlist or with someone you refer.",
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
      <h2 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
        Cancellation policy
      </h2>
      <dl className="grid max-w-3xl gap-x-8 gap-y-4 text-[15px] md:grid-cols-[180px_1fr]">
        {POLICY_POINTS.map(({ term, detail }) => (
          <div key={term} className="contents">
            <dt className="font-medium">{term}</dt>
            <dd className="text-muted-foreground">{detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
