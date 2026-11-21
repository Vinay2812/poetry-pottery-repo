"use client";

import { useCallback, useEffect, useState } from "react";

import { ContentIndex } from "@/features/content/components/ContentIndex";
import {
  pickActiveSection,
  toSectionHeadingId,
} from "@/features/content/types";

interface ContentIndexEntry {
  id: string;
  heading: string;
}

export interface ContentIndexContainerProps {
  label: string;
  entries: ContentIndexEntry[];
}

// A section is current once its top passes a line a fifth of the way down the screen.
const READING_LINE_RATIO = 0.2;
// A couple of pixels of slack, since fractional zoom rarely lands exactly on the last pixel.
const BOTTOM_SLACK_PX = 2;

export function ContentIndexContainer({
  label,
  entries,
}: ContentIndexContainerProps) {
  const [activeId, setActiveId] = useState<string | null>(
    entries[0]?.id ?? null,
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // On phones the list folds away once a section is picked, so the text is what is on screen.
  // The link that had focus folds away with it, so focus moves to the section it opened;
  // the link still sets the fragment and scrolls.
  const handleJump = useCallback((id: string) => {
    setIsMenuOpen(false);
    window.requestAnimationFrame(() =>
      document
        .getElementById(toSectionHeadingId(id))
        ?.focus({ preventScroll: true }),
    );
  }, []);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const sections = entries.map((entry) => ({
        id: entry.id,
        top:
          document.getElementById(entry.id)?.getBoundingClientRect().top ??
          Number.POSITIVE_INFINITY,
      }));
      const isAtBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - BOTTOM_SLACK_PX;
      setActiveId(
        pickActiveSection({
          sections,
          readingLine: window.innerHeight * READING_LINE_RATIO,
          isAtBottom,
        }),
      );
    };
    // One measurement per frame, however fast the scroll events come.
    const schedule = () => {
      if (frame === 0) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
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
