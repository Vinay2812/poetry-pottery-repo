import type { ReactNode } from "react";

export interface AdminTableFrameProps {
  caption: string;
  isBusy: boolean;
  children: ReactNode;
}

/**
 * Every console table shares this frame: hairline rows, a sticky header and a
 * thin bar while the next page loads, so results stay legible instead of
 * fading or flashing to a skeleton. The scroll box is focusable so a keyboard
 * can reach a wide table on a narrow screen.
 */
export function AdminTableFrame({
  caption,
  isBusy,
  children,
}: AdminTableFrameProps) {
  return (
    <div className="relative w-full border border-ash">
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 z-20 h-0.5 bg-primary transition-opacity duration-150 ${
          isBusy ? "animate-pulse opacity-100" : "opacity-0"
        }`}
      />
      <div
        role="region"
        aria-label={caption}
        aria-busy={isBusy}
        tabIndex={0}
        className="max-h-[70svh] w-full overflow-auto outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
      >
        <table className="w-full border-collapse text-[13px]">
          <caption className="sr-only">{caption}</caption>
          {children}
        </table>
      </div>
    </div>
  );
}

export const ADMIN_TH =
  "sticky top-0 z-10 border-b border-ash bg-background px-3 py-2 text-left text-[11px] font-normal tracking-[0.14em] text-muted-foreground uppercase";

export const ADMIN_TD = "border-b border-ash px-3 py-2 align-middle";

export const ADMIN_TR = "transition-colors hover:bg-secondary/60";
