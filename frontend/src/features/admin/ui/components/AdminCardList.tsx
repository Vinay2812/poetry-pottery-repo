import type { ReactNode } from "react";

export interface AdminCardListProps {
  caption: string;
  isBusy: boolean;
  isEmpty: boolean;
  emptyMessage: string;
  children: ReactNode;
}

/**
 * The narrow-screen twin of AdminTableFrame: one card per row, one column on
 * phones and two on tablets, with the same thin bar while the next page loads.
 */
export function AdminCardList({
  caption,
  isBusy,
  isEmpty,
  emptyMessage,
  children,
}: AdminCardListProps) {
  return (
    <div className="relative w-full border-x border-t border-ash">
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 z-10 h-0.5 bg-primary transition-opacity duration-150 ${
          isBusy ? "animate-pulse opacity-100" : "opacity-0"
        }`}
      />
      <ul
        aria-label={caption}
        aria-busy={isBusy}
        className="grid text-[13px] md:grid-cols-2"
      >
        {isEmpty ? (
          <li className="border-b border-ash px-4 py-10 text-center text-muted-foreground md:col-span-2">
            {emptyMessage}
          </li>
        ) : (
          children
        )}
      </ul>
    </div>
  );
}

// Two cards a row from tablet width; the left one draws the rule between them.
export const ADMIN_CARD =
  "flex flex-col gap-3 border-b border-ash px-4 py-4 md:odd:border-r";
