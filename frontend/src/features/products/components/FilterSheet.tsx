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
      <SheetContent side="bottom" className="max-h-[85dvh]">
        <SheetHeader>
          <SheetTitle className="font-heading text-xl tracking-tight">
            Filters
          </SheetTitle>
          <SheetDescription>Narrow the shelf down.</SheetDescription>
        </SheetHeader>
        <div className="overflow-y-auto px-4 pb-2">{children}</div>
        <SheetFooter>
          <Button size="lg" onClick={() => onOpenChange(false)}>
            Show {resultCount} {resultCount === 1 ? "piece" : "pieces"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
