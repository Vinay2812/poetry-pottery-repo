export interface AdminStatTileProps {
  label: string;
  value: string;
  hint: string | null;
}

export function AdminStatTile({ label, value, hint }: AdminStatTileProps) {
  return (
    <div className="flex flex-col gap-1 border border-ash p-4">
      <span className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </span>
      <span className="font-display text-3xl leading-none tracking-tight tnum">
        {value}
      </span>
      {hint && (
        <span className="text-[13px] text-muted-foreground">{hint}</span>
      )}
    </div>
  );
}
