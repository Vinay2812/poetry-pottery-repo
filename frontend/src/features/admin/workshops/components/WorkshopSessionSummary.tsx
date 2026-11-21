export interface WorkshopSessionSummaryProps {
  // One line per day, e.g. "Wed, 25 Nov · 3–4 pm".
  sessionLines: string[];
  sizeLabel: string;
  totalLabel: string;
}

export function WorkshopSessionSummary({
  sessionLines,
  sizeLabel,
  totalLabel,
}: WorkshopSessionSummaryProps) {
  return (
    <div className="flex flex-col tnum">
      {sessionLines.map((line) => (
        <span key={line} className="whitespace-nowrap">
          {line}
        </span>
      ))}
      <span className="text-[12px] text-muted-foreground">
        {sizeLabel} · {totalLabel}
      </span>
    </div>
  );
}
