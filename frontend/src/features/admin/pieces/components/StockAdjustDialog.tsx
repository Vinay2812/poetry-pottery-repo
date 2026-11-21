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
  stockAdjustSchema,
} from "@/lib/validations/admin/product";

import { AdminField } from "@/features/admin/ui";

import {
  describeStockAfter,
  type StockDirection,
  toStockDelta,
} from "@/features/admin/pieces/types";

const DIRECTIONS: { value: StockDirection; label: string }[] = [
  { value: "add", label: "Add to the shelf" },
  { value: "remove", label: "Take off the shelf" },
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
    setError,
    formState: { errors },
  } = useForm<StockAdjustFormValues>({
    resolver: zodResolver(stockAdjustSchema),
    defaultValues: { direction: "add", count: 1, reason: "" },
  });

  const direction = useWatch({ control, name: "direction" });
  const count = useWatch({ control, name: "count" });

  const handleValid = (values: StockAdjustFormValues) => {
    if (values.direction === "remove" && values.count > stock) {
      setError("count", {
        message: describeStockAfter(stock, values.direction, values.count),
      });
      return;
    }
    onSubmit(
      toStockDelta(values.direction, values.count),
      values.reason.trim(),
    );
  };

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
            <legend className="sr-only">Add or take off</legend>
            {DIRECTIONS.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center justify-center px-3 text-center text-[13px] transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-inset",
                  direction === option.value
                    ? "bg-ink text-background"
                    : "hover:bg-secondary",
                )}
              >
                <input
                  type="radio"
                  value={option.value}
                  className="sr-only"
                  {...register("direction")}
                />
                {option.label}
              </label>
            ))}
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
              {isBusy ? "Saving…" : "Save the count"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
