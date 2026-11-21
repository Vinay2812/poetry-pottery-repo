export interface DefinitionRowProps {
  title: string;
  paragraphs: string[];
}

export function DefinitionRow({ title, paragraphs }: DefinitionRowProps) {
  return (
    <div className="grid gap-1.5 border-t border-ash py-4 md:grid-cols-[minmax(0,14rem)_1fr] md:gap-6">
      <dt className="text-[15px] font-medium">{title}</dt>
      <dd className="flex max-w-prose flex-col gap-3 text-[15px] leading-relaxed text-muted-foreground">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </dd>
    </div>
  );
}
