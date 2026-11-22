import { cn } from "@/lib/utils";

import { ASIDE_COLUMNS } from "@/features/content/types";

export interface DefinitionRowProps {
  title: string;
  paragraphs: string[];
}

export function DefinitionRow({ title, paragraphs }: DefinitionRowProps) {
  return (
    <div
      className={cn(
        "grid gap-1.5 border-t border-ash py-4 md:gap-6",
        ASIDE_COLUMNS,
      )}
    >
      <dt className="text-[15px] font-medium">{title}</dt>
      <dd className="flex max-w-prose flex-col gap-3 text-[15px] leading-relaxed text-muted-foreground">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </dd>
    </div>
  );
}
