import { PotteryIcon, type PotteryIconKind } from "@/components/icons/pottery";
import { cn } from "@/lib/utils";

export interface PlaceholderImageProps {
  kind: PotteryIconKind;
  size?: "default" | "hero";
  className?: string;
}

// Stands in wherever a photo is missing, in the same drawn language as the icons.
export function PlaceholderImage({
  kind,
  size = "default",
  className,
}: PlaceholderImageProps) {
  if (size === "hero") {
    return (
      <span
        className={cn(
          "relative flex size-full items-center justify-center bg-clay-white text-ink",
          className,
        )}
      >
        <PotteryIcon kind={kind} className="h-[60%] w-auto" />
        <span className="absolute inset-x-0 bottom-[10%] text-center font-script text-[13px] italic">
          Photo coming
        </span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "flex size-full flex-col items-center justify-center gap-2 bg-clay-white text-ink",
        className,
      )}
    >
      <PotteryIcon kind={kind} className="size-10" />
      <span className="font-script text-[13px] italic">Photo coming</span>
    </span>
  );
}
