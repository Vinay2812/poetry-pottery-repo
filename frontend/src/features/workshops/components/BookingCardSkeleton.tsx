export function BookingCardSkeleton() {
  return (
    <div
      className="flex flex-col gap-2 border-b border-ash py-4"
      aria-hidden="true"
    >
      <div className="h-3 w-1/3 animate-pulse bg-ash/70" />
      <div className="h-4 w-2/3 animate-pulse bg-ash" />
      <div className="h-3 w-1/2 animate-pulse bg-ash/70" />
    </div>
  );
}
