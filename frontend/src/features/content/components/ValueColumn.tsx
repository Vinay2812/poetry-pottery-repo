export interface ValueColumnProps {
  title: string;
  body: string;
}

export function ValueColumn({ title, body }: ValueColumnProps) {
  return (
    <div className="flex flex-col gap-2 border-t border-ash pt-5">
      <h3 className="text-base">{title}</h3>
      <p className="text-[15px] leading-relaxed text-muted-foreground">
        {body}
      </p>
    </div>
  );
}
