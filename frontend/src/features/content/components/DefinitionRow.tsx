export interface DefinitionRowProps {
  title: string;
  body: string;
}

export function DefinitionRow({ title, body }: DefinitionRowProps) {
  return (
    <div className="grid gap-1 border-t border-ash py-4 md:grid-cols-[220px_1fr] md:gap-6">
      <dt className="text-[15px]">{title}</dt>
      <dd className="max-w-prose text-[15px] leading-relaxed text-muted-foreground">
        {body}
      </dd>
    </div>
  );
}
