import { formatDateTime } from "@/lib/format";

// The progress timeline shared by orders, wheel sessions and event bookings. Each feature
// owns its stage list; this file only knows how stages turn into what the visitor reads.

// One stage, worded twice: as it reads once it has happened and as a promise while it is
// still ahead.
export interface TimelineStage<Key extends string = string> {
  key: Key;
  label: string;
  description: string;
  // The first stage is always reached, so it never needs one.
  upcoming?: string;
}

export interface TimelineStep {
  key: string;
  label: string;
  date: string | null;
  note: string | null;
  state: "done" | "current" | "upcoming";
}

// The status may be one no stage carries (cancelled, refunded, rejected).
export interface TimelineInput<Key extends string> {
  stages: readonly TimelineStage<Key>[];
  status: Key;
  // Keyed by the same status enum as the stages, so a misspelt key fails to compile.
  dates: Readonly<Partial<Record<Key, string | null>>>;
  isClosed: boolean;
}

// Closed statuses are not stages of their own, so a closed item stops at the last stage
// that carries a date.
function toReachedIndex<Key extends string>({
  stages,
  status,
  dates,
}: TimelineInput<Key>): number {
  const index = stages.findIndex((stage) => stage.key === status);
  if (index !== -1) return index;
  return stages.reduce(
    (reached, stage, at) => (dates[stage.key] ? at : reached),
    0,
  );
}

// Reached stages show only their date, the furthest one also says what it means, and later
// ones say what will happen. A closed item shows only the stages it actually reached.
export function toTimelineSteps<Key extends string>(
  input: TimelineInput<Key>,
): TimelineStep[] {
  const reached = toReachedIndex(input);
  const visible = input.isClosed
    ? input.stages.slice(0, reached + 1)
    : input.stages;
  return visible.map((stage, index) => {
    if (index > reached) {
      return {
        key: stage.key,
        label: stage.label,
        date: null,
        note: stage.upcoming ?? null,
        state: "upcoming",
      };
    }
    // The furthest stage of an open item explains itself; once it is the last stage the
    // item is finished, so it reads as done rather than in progress.
    const isFurthest = index === reached && !input.isClosed;
    const isFinished = index === input.stages.length - 1;
    return {
      key: stage.key,
      label: stage.label,
      date: input.dates[stage.key] ?? null,
      note: isFurthest ? stage.description : null,
      state: isFurthest && !isFinished ? "current" : "done",
    };
  });
}

// How a stage's timestamp reads on the timeline; a stage that has not happened has none.
export function toTimelineDate(iso: string | null | undefined): string | null {
  return iso ? formatDateTime(iso) : null;
}

// "Cancelled on 16 Sept · Travelling that week": what closed it, when, and why if we know.
export function toClosedLabel(
  statusLabel: string,
  closedOn: string | null,
  reason: string | null,
): string {
  return [
    closedOn ? `${statusLabel} on ${closedOn}` : statusLabel,
    reason?.trim() || null,
  ]
    .filter(Boolean)
    .join(" · ");
}
