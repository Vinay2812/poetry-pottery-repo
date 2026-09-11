import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export interface FilterSheetProps {
  isOpen: boolean;
  resultCount: number;
  onOpenChange: (isOpen: boolean) => void;
  children: React.ReactNode;
}

export function FilterSheet({
  isOpen,
  resultCount,
  onOpenChange,
  children,
}: FilterSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85dvh] rounded-t-3xl">
        <SheetHeader>
          <SheetTitle className="text-xl">Filters</SheetTitle>
          <SheetDescription>
            Narrow the shelf down to what you are after.
          </SheetDescription>
        </SheetHeader>
        <div className="overflow-y-auto px-4 pb-2">{children}</div>
        <SheetFooter>
          <Button
            size="lg"
            className="rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Show {resultCount} {resultCount === 1 ? "piece" : "pieces"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
