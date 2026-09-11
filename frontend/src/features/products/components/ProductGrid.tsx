export interface ProductGridProps {
  children: React.ReactNode;
}

export function ProductGrid({ children }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-5 md:gap-y-8 xl:grid-cols-4">
      {children}
    </div>
  );
}
