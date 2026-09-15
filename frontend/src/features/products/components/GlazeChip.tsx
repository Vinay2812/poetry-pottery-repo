export interface GlazeChipProps {
  colorCode: string | null;
  colorName: string | null;
  material: string;
}

// A potter's test tile: the glaze swatch next to its name and clay body.
export function GlazeChip({ colorCode, colorName, material }: GlazeChipProps) {
  return (
    <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
      {colorCode && (
        <span
          aria-hidden="true"
          className="size-3 shrink-0 rounded-full ring-1 ring-black/10 ring-inset"
          style={{ backgroundColor: colorCode }}
        />
      )}
      <span className="truncate">
        {colorName ? `${colorName} · ${material}` : material}
      </span>
    </span>
  );
}
