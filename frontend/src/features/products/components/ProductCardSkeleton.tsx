export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5" aria-hidden="true">
      <div className="aspect-square animate-pulse bg-ash" />
      <div className="h-4 w-3/4 animate-pulse bg-ash" />
      <div className="h-3 w-1/3 animate-pulse bg-ash/70" />
    </div>
  );
}
