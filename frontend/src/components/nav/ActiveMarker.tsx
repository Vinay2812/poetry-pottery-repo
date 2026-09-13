import { cn } from "@/lib/utils";

export interface ActiveMarkerProps {
  isActive: boolean;
  className?: string;
}

// A 6px square that only changes colour, so switching tabs never moves the row.
export function ActiveMarker({ isActive, className }: ActiveMarkerProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "size-1.5 shrink-0 transition-colors",
        isActive ? "bg-ink" : "bg-transparent",
        className,
      )}
    />
  );
}
