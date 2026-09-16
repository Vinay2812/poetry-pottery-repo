import { cn } from "@/lib/utils";

// Skeletons are ash on clay-white and hairline thin: they stand in for the page
// that is coming, never for a card. The pulse is motion-safe only.
export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-skeleton bg-ash", className)}
    />
  );
}

export interface SkeletonHeadingProps {
  hasEyebrow?: boolean;
  hasDescription?: boolean;
}

export function SkeletonHeading({
  hasEyebrow = false,
  hasDescription = true,
}: SkeletonHeadingProps) {
  return (
    <div className="flex flex-col gap-4">
      {hasEyebrow && <SkeletonBlock className="h-3 w-24" />}
      <SkeletonBlock className="h-10 w-72 md:h-14 md:w-[26rem]" />
      {hasDescription && <SkeletonBlock className="h-3.5 w-64 md:w-96" />}
    </div>
  );
}

export interface SkeletonGridProps {
  count?: number;
  hasPrice?: boolean;
}

export function SkeletonGrid({
  count = 8,
  hasPrice = true,
}: SkeletonGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex flex-col gap-3">
          <SkeletonBlock className="aspect-square w-full" />
          <div className="flex items-baseline justify-between gap-4">
            <SkeletonBlock className="h-3 w-2/3" />
            {hasPrice && <SkeletonBlock className="h-3 w-10" />}
          </div>
        </div>
      ))}
    </div>
  );
}

export interface SkeletonRowsProps {
  count?: number;
  className?: string;
}

export function SkeletonRows({ count = 4, className }: SkeletonRowsProps) {
  return (
    <div className={cn("flex flex-col border-t border-ash", className)}>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-6 border-b border-ash py-6"
        >
          <SkeletonBlock className="h-3 w-40" />
          <SkeletonBlock className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}
