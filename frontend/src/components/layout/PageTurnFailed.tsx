export interface PageTurnFailedProps {
  page: number;
  onRetry: () => void;
}

// Sits by the pager when another page did not arrive; the rows above are still the ones it names.
export function PageTurnFailed({ page, onRetry }: PageTurnFailedProps) {
  return (
    <p role="alert" className="text-center text-[13px] text-muted-foreground">
      Page {page} did not load.{" "}
      <button
        type="button"
        onClick={onRetry}
        className="border-b border-ink pb-0.5 text-ink hover:border-primary hover:text-primary"
      >
        Try again
      </button>
    </p>
  );
}
