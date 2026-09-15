export function EventCardSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl bg-card p-3 shadow-soft"
      aria-hidden="true"
    >
      <div className="aspect-4/3 animate-pulse rounded-xl bg-primary-light" />
      <div className="h-5 w-24 animate-pulse rounded-full bg-primary-light/70" />
      <div className="h-5 w-3/4 animate-pulse rounded-full bg-primary-light" />
      <div className="h-3 w-1/2 animate-pulse rounded-full bg-primary-light/70" />
      <div className="flex items-center justify-between pt-1">
        <div className="h-4 w-20 animate-pulse rounded-full bg-primary-light" />
        <div className="h-9 w-24 animate-pulse rounded-full bg-primary-light" />
      </div>
    </div>
  );
}
