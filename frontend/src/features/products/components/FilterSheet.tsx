"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export interface FilterSheetProps {
  isOpen: boolean;
  resultCount: number;
  isLoading?: boolean;
  activeFilterCount: number;
  onOpenChange: (isOpen: boolean) => void;
  onClear: () => void;
  children: React.ReactNode;
}

export function FilterSheet({
  isOpen,
  resultCount,
  isLoading = false,
  activeFilterCount,
  onOpenChange,
  onClear,
  children,
}: FilterSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        // Full width on phones so long glaze and collection names never squeeze.
        className="flex h-dvh flex-col data-[side=right]:w-full data-[side=right]:sm:max-w-sm"
      >
        <SheetHeader>
          <div className="flex items-baseline justify-between gap-3 pr-10">
            <SheetTitle className="font-heading text-xl tracking-tight">
              Filters
            </SheetTitle>
            <button
              type="button"
              onClick={onClear}
              inert={activeFilterCount === 0}
              className={cn(
                "text-[13px] underline-offset-4 hover:text-primary hover:underline",
                activeFilterCount === 0 && "invisible",
              )}
            >
              Clear all
            </button>
          </div>
          <SheetDescription>Narrow the shelf down.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-2">{children}</div>
        <SheetFooter>
          <Button size="lg" onClick={() => onOpenChange(false)}>
            {isLoading
              ? "Finding pieces\u2026"
              : `Show ${resultCount} ${resultCount === 1 ? "piece" : "pieces"}`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
