import { Button } from "@/components/ui/button";

export interface EmptyAddressesProps {
  onAddClick: () => void;
}

export function EmptyAddresses({ onAddClick }: EmptyAddressesProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-cream px-6 py-16 text-center">
      <p className="font-script text-3xl text-clay-dark italic">
        No addresses saved yet
      </p>
      <p className="max-w-sm text-sm text-clay-dark">
        Add where your pieces should travel to, and we will keep it here for
        next time.
      </p>
      <Button className="rounded-full" onClick={onAddClick}>
        Add an address
      </Button>
    </div>
  );
}
