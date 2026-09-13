"use client";

import { useCallback, useId, useState } from "react";

import { cn } from "@/lib/utils";

export interface ExpandableTextProps {
  text: string;
  name: string;
}

/** Opening a message is a reading choice, so it stays local and out of the URL. */
export function ExpandableText({ text, name }: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const textId = useId();

  const handleToggle = useCallback(() => {
    setIsExpanded((expanded) => !expanded);
  }, []);

  return (
    <div className="flex max-w-[44ch] flex-col items-start gap-1">
      <p
        id={textId}
        className={cn("whitespace-pre-line", !isExpanded && "line-clamp-2")}
      >
        {text}
      </p>
      <button
        type="button"
        aria-controls={textId}
        aria-expanded={isExpanded}
        onClick={handleToggle}
        className="text-[11px] tracking-[0.08em] text-muted-foreground uppercase underline-offset-4 hover:text-foreground hover:underline"
      >
        {isExpanded ? "Less" : "More"}
        <span className="sr-only"> of the message from {name}</span>
      </button>
    </div>
  );
}
