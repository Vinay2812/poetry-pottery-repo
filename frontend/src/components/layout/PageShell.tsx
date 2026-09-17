import { cn } from "@/lib/utils";

// The one page shell. Header, footer and every route share this outer edge; a
// page that wants a narrower measure narrows inside it, never against it.
const SHELL = "mx-auto w-full max-w-7xl px-4 md:px-8";

const COLUMN = {
  full: "",
  wide: "max-w-5xl",
  narrow: "max-w-3xl",
} as const;

type PageColumn = keyof typeof COLUMN;

export interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  column?: PageColumn;
  isBusy?: boolean;
}

export function PageShell({
  children,
  className,
  column = "full",
  isBusy = false,
}: PageShellProps) {
  const busy = isBusy ? "true" : undefined;

  if (column === "full") {
    return (
      <div className={cn(SHELL, className)} aria-busy={busy}>
        {children}
      </div>
    );
  }

  return (
    <div className={SHELL}>
      <div className={cn("w-full", COLUMN[column], className)} aria-busy={busy}>
        {children}
      </div>
    </div>
  );
}
