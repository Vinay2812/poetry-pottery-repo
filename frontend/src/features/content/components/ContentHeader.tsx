export interface ContentHeaderProps {
  title: string;
  subtitle: string | null;
}

export function ContentHeader({ title, subtitle }: ContentHeaderProps) {
  return (
    <div className="flex max-w-2xl flex-col gap-3 py-12 md:py-16">
      <h1 className="font-heading text-4xl leading-tight tracking-tight md:text-6xl">
        {title}
      </h1>
      {subtitle && (
        <p className="text-[15px] text-muted-foreground md:text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
}
