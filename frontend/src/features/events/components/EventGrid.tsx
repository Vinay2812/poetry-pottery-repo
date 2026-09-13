export interface EventGridProps {
  children: React.ReactNode;
}

export function EventGrid({ children }: EventGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-14">
      {children}
    </div>
  );
}
