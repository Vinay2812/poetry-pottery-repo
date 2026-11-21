"use client";

import { useCallback, useEffect, useState } from "react";

import { ContentIndex } from "@/features/content/components/ContentIndex";
import { pickActiveSection } from "@/features/content/types";

interface ContentIndexEntry {
  id: string;
  heading: string;
}

export interface ContentIndexContainerProps {
  label: string;
  entries: ContentIndexEntry[];
}

// A thin reading line a fifth of the way down the screen decides which section is current.
const READING_LINE = "-20% 0px -79% 0px";
// A couple of pixels of slack, since fractional zoom rarely lands exactly on the last pixel.
const BOTTOM_SLACK_PX = 2;

function isScrolledToBottom(): boolean {
  const { scrollHeight } = document.documentElement;
  return window.innerHeight + window.scrollY >= scrollHeight - BOTTOM_SLACK_PX;
}

export function ContentIndexContainer({
  label,
  entries,
}: ContentIndexContainerProps) {
  const [activeId, setActiveId] = useState<string | null>(
    entries[0]?.id ?? null,
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // On phones the list folds away once a section is picked, so the text is what is on screen.
  const handleJump = useCallback(() => setIsMenuOpen(false), []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const orderedIds = entries.map((entry) => entry.id);
    const visibleIds = new Set<string>();
    const update = () =>
      setActiveId((previousId) =>
        pickActiveSection({
          orderedIds,
          visibleIds,
          isAtBottom: isScrolledToBottom(),
          previousId,
        }),
      );

    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          if (record.isIntersecting) visibleIds.add(record.target.id);
          else visibleIds.delete(record.target.id);
        }
        update();
      },
      { rootMargin: READING_LINE },
    );
    for (const id of orderedIds) {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    }
    // Reaching the foot of the page crosses no section, so the observer alone would miss it.
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
    };
  }, [entries]);

  return (
    <ContentIndex
      label={label}
      entries={entries}
      activeId={activeId}
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      onJump={handleJump}
    />
  );
}
