import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface ContentIndexEntry {
  id: string;
  heading: string;
}

export interface ContentIndexProps {
  label: string;
  entries: ContentIndexEntry[];
  activeId: string | null;
  isMenuOpen: boolean;
  onMenuOpenChange: (isOpen: boolean) => void;
  onJump: () => void;
}

interface IndexLinksProps {
  entries: ContentIndexEntry[];
  activeId: string | null;
  onJump: () => void;
}

function IndexLinks({ entries, activeId, onJump }: IndexLinksProps) {
  return (
    <ul className="flex flex-col">
      {entries.map((entry) => {
        const isActive = entry.id === activeId;
        return (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              aria-current={isActive ? "location" : undefined}
              onClick={onJump}
              className={cn(
                "-ml-px flex min-h-12 items-center border-l pl-4 text-[15px] leading-snug transition-colors md:min-h-0 md:py-1.5 md:text-[13px]",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {entry.heading}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

// Folded away above the text on phones; pinned beside it from md up.
export function ContentIndex({
  label,
  entries,
  activeId,
  isMenuOpen,
  onMenuOpenChange,
  onJump,
}: ContentIndexProps) {
  return (
    // top-24 clears the h-16 sticky site header with room to spare; move it if the header grows.
    <nav aria-label={label} className="md:sticky md:top-24 md:self-start">
      <details
        open={isMenuOpen}
        onToggle={(event) => onMenuOpenChange(event.currentTarget.open)}
        className="group border-b border-ash md:hidden"
      >
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between text-[11px] tracking-[0.18em] text-muted-foreground uppercase [&::-webkit-details-marker]:hidden">
          {label}
          <ChevronDownIcon
            aria-hidden
            className="size-4 transition-transform group-open:rotate-180"
          />
        </summary>
        <div className="border-l border-ash pb-4">
          <IndexLinks entries={entries} activeId={activeId} onJump={onJump} />
        </div>
      </details>
      <div className="hidden md:flex md:flex-col md:gap-4">
        <h2 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
          {label}
        </h2>
        <div className="border-l border-ash">
          <IndexLinks entries={entries} activeId={activeId} onJump={onJump} />
        </div>
      </div>
    </nav>
  );
}
