export interface GlazeChipProps {
  colorCode: string | null;
  colorName: string | null;
  material: string;
}

// A potter's test tile: the glaze swatch next to its name and clay body.
export function GlazeChip({ colorCode, colorName, material }: GlazeChipProps) {
  return (
    <span className="flex min-w-0 items-center gap-2 text-[13px] text-muted-foreground">
      {colorCode && (
        <span
          aria-hidden="true"
          className="size-3 shrink-0 border border-ink/15"
          style={{ backgroundColor: colorCode }}
        />
      )}
      <span className="truncate">
        {colorName ? `${colorName} · ${material}` : material}
      </span>
    </span>
  );
}
