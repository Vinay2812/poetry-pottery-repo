import { Button } from "@/components/ui/button";

export interface EmptyAddressesProps {
  onAddClick: () => void;
}

export function EmptyAddresses({ onAddClick }: EmptyAddressesProps) {
  return (
    <div className="flex flex-col items-start gap-4 border-t border-ash py-16">
      <h2 className="font-heading text-2xl tracking-tight">
        No addresses saved yet
      </h2>
      <p className="max-w-sm text-[15px] text-muted-foreground">
        Add where your pieces should go and we will keep it for next time.
      </p>
      <Button variant="outline" onClick={onAddClick}>
        Add an address
      </Button>
    </div>
  );
}
