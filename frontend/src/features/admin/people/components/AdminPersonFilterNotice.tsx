import { X } from "lucide-react";

export interface AdminPersonFilterNoticeProps {
  line: string;
  onClear: () => void;
}

// Sits between the toolbar and the table so a list narrowed to one person says so.
export function AdminPersonFilterNotice({
  line,
  onClear,
}: AdminPersonFilterNoticeProps) {
  return (
    <div className="flex items-center gap-3 border-y border-ash py-2 text-[13px]">
      <span>{line}</span>
      <button
        type="button"
        onClick={onClear}
        className="flex items-center gap-1 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        <X className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
        Show everyone
      </button>
    </div>
  );
}
