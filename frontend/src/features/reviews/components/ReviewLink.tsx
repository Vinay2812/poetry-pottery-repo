export interface ReviewLinkProps {
  label: string;
  isDisabled?: boolean;
  onClick: () => void;
}

// The quiet text link that opens the review dialog from an order or booking line.
export function ReviewLink({
  label,
  isDisabled = false,
  onClick,
}: ReviewLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className="w-fit text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50"
    >
      {label}
    </button>
  );
}
