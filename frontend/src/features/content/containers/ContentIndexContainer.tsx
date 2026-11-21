"use client";

import { useEffect, useState } from "react";

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

export function ContentIndexContainer({
  label,
  entries,
}: ContentIndexContainerProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const ids = entries.map((entry) => entry.id);
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          if (record.isIntersecting) visible.add(record.target.id);
          else visible.delete(record.target.id);
        }
        // Between two sections nothing crosses the line, so the last one stays lit.
        const next = pickActiveSection(ids, visible);
        if (next !== null) setActiveId(next);
      },
      { rootMargin: READING_LINE },
    );
    for (const id of ids) {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, [entries]);

  return <ContentIndex label={label} entries={entries} activeId={activeId} />;
}
