import type { ReactNode } from "react";

export interface AdminCardListProps {
  caption: string;
  isBusy: boolean;
  isEmpty: boolean;
  emptyMessage: string;
  children: ReactNode;
}

/**
 * The narrow-screen twin of AdminTableFrame: one card per row, stacked, with the
 * same thin bar while the next page loads.
 */
export function AdminCardList({
  caption,
  isBusy,
  isEmpty,
  emptyMessage,
  children,
}: AdminCardListProps) {
  return (
    <div className="relative w-full border border-ash">
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 z-10 h-0.5 bg-primary transition-opacity duration-150 ${
          isBusy ? "animate-pulse opacity-100" : "opacity-0"
        }`}
      />
      <ul
        aria-label={caption}
        aria-busy={isBusy}
        className="divide-y divide-ash text-[13px]"
      >
        {isEmpty ? (
          <li className="px-4 py-10 text-center text-muted-foreground">
            {emptyMessage}
          </li>
        ) : (
          children
        )}
      </ul>
    </div>
  );
}

export const ADMIN_CARD = "flex flex-col gap-3 px-4 py-4";
