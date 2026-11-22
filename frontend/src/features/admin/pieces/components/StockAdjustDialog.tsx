"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  type StockAdjustFormValues,
  stockAdjustSchemaFor,
} from "@/lib/validations/admin/product";

import { AdminField } from "@/features/admin/ui";

import {
  describeStockAfter,
  type StockDirection,
  toStockDelta,
} from "@/features/admin/pieces/types";

const DIRECTIONS: { value: StockDirection; label: string }[] = [
  { value: "add", label: "Add pieces" },
  { value: "remove", label: "Remove pieces" },
];

export interface StockAdjustDialogProps {
  isOpen: boolean;
  pieceName: string;
  stock: number;
  isBusy: boolean;
  onSubmit: (delta: number, reason: string) => void;
  onOpenChange: (isOpen: boolean) => void;
}

export function StockAdjustDialog({
  isOpen,
  pieceName,
  stock,
  isBusy,
  onSubmit,
  onOpenChange,
}: StockAdjustDialogProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StockAdjustFormValues>({
    // The dialog remounts each time it opens, so the stock it was built from is current.
    resolver: zodResolver(stockAdjustSchemaFor(stock)),
    defaultValues: { direction: "add", count: 1, reason: "" },
  });

  const direction = useWatch({ control, name: "direction" });
  const count = useWatch({ control, name: "count" });

  const handleValid = (values: StockAdjustFormValues) =>
    onSubmit(
      toStockDelta(values.direction, values.count),
      values.reason.trim(),
    );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change the stock</DialogTitle>
          <DialogDescription>{pieceName}</DialogDescription>
        </DialogHeader>
        <form
          noValidate
          className="flex flex-col gap-4"
          onSubmit={handleSubmit(handleValid)}
        >
          <fieldset className="grid grid-cols-2 border border-ash">
            <legend className="sr-only">Add or remove</legend>
            {DIRECTIONS.map((option) => {
              // An empty shelf has nothing to remove, so that half is off.
              const isDisabled = option.value === "remove" && stock === 0;
              return (
                <label
                  key={option.value}
                  title={isDisabled ? "Nothing in stock to remove" : undefined}
                  className={cn(
                    "flex min-h-11 items-center justify-center px-3 text-center text-[13px] transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-inset",
                    isDisabled
                      ? "cursor-not-allowed text-muted-foreground"
                      : "cursor-pointer",
                    direction === option.value
                      ? "bg-ink text-background"
                      : !isDisabled && "hover:bg-secondary",
                  )}
                >
                  <input
                    type="radio"
                    value={option.value}
                    disabled={isDisabled}
                    className="sr-only"
                    {...register("direction")}
                  />
                  {option.label}
                  {isDisabled && (
                    <span className="sr-only">
                      , nothing in stock to remove
                    </span>
                  )}
                </label>
              );
            })}
          </fieldset>
          <AdminField
            id="stock-count"
            label="How many"
            hint={describeStockAfter(stock, direction, count)}
            error={errors.count?.message}
          >
            <Input
              id="stock-count"
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              className="tnum"
              aria-invalid={Boolean(errors.count)}
              {...register("count", { valueAsNumber: true })}
            />
          </AdminField>
          <AdminField
            id="stock-reason"
            label="Reason"
            hint="A few words, like a new batch or a breakage."
            error={errors.reason?.message}
          >
            <Input
              id="stock-reason"
              type="text"
              placeholder="New batch out of the kiln"
              aria-invalid={Boolean(errors.reason)}
              {...register("reason")}
            />
          </AdminField>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isBusy}>
              {isBusy ? "Saving…" : "Update stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
