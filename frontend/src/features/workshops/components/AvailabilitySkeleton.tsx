export function AvailabilitySkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <div className="h-7 w-40 animate-pulse bg-ash" />
      <div className="grid grid-cols-7 gap-px bg-ash">
        {Array.from({ length: 35 }, (_, index) => (
          <span
            key={index}
            className="aspect-square animate-pulse bg-background"
          />
        ))}
      </div>
    </div>
  );
}
