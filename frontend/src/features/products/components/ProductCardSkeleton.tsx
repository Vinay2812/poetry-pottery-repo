// Reserves exactly what a card takes, so the real pieces land without moving anything.
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5" aria-hidden="true">
      <div className="aspect-square animate-pulse bg-ash" />
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex min-h-10 items-start">
          <div className="h-4 w-3/4 animate-pulse bg-ash" />
        </div>
        <div className="min-h-5">
          <div className="h-3 w-1/3 animate-pulse bg-ash/70" />
        </div>
      </div>
    </div>
  );
}
