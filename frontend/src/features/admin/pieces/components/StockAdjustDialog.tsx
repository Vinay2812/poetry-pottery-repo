"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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

import {
  type StockAdjustFormValues,
  stockAdjustSchema,
} from "@/lib/validations/admin/product";

import { AdminField } from "@/features/admin/ui";

export interface StockAdjustDialogProps {
  isOpen: boolean;
  pieceName: string;
  stockLabel: string;
  isBusy: boolean;
  onSubmit: (delta: number, reason: string) => void;
  onOpenChange: (isOpen: boolean) => void;
}

export function StockAdjustDialog({
  isOpen,
  pieceName,
  stockLabel,
  isBusy,
  onSubmit,
  onOpenChange,
}: StockAdjustDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StockAdjustFormValues>({
    resolver: zodResolver(stockAdjustSchema),
    defaultValues: { delta: 1, reason: "" },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust stock</DialogTitle>
          <DialogDescription>
            {pieceName} has {stockLabel} on the shelf.
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          className="flex flex-col gap-4"
          onSubmit={handleSubmit((values) =>
            onSubmit(values.delta, values.reason.trim()),
          )}
        >
          <AdminField
            id="stock-delta"
            label="Change"
            hint="Use a minus sign to take pieces off the shelf."
            error={errors.delta?.message}
          >
            <Input
              id="stock-delta"
              type="number"
              step={1}
              inputMode="numeric"
              aria-invalid={Boolean(errors.delta)}
              {...register("delta", { valueAsNumber: true })}
            />
          </AdminField>
          <AdminField
            id="stock-reason"
            label="Reason"
            hint={null}
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
              {isBusy ? "Saving…" : "Save change"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
