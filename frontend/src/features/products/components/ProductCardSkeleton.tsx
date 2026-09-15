export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5" aria-hidden="true">
      <div className="aspect-square animate-pulse rounded-2xl bg-primary-light" />
      <div className="h-4 w-3/4 animate-pulse rounded-full bg-primary-light" />
      <div className="h-3 w-1/2 animate-pulse rounded-full bg-primary-light/70" />
      <div className="h-4 w-1/3 animate-pulse rounded-full bg-primary-light" />
    </div>
  );
}
