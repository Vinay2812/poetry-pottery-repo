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
  type WorkshopTierFormValues,
  workshopTierSchema,
} from "@/lib/validations/admin/workshop";

import { AdminField } from "@/features/admin/ui";

export interface WorkshopTierDialogProps {
  isOpen: boolean;
  isEditing: boolean;
  hours: number;
  pricePerPerson: number;
  piecesPerPerson: number;
  isBusy: boolean;
  onSubmit: (values: WorkshopTierFormValues) => void;
  onOpenChange: (isOpen: boolean) => void;
}

export function WorkshopTierDialog({
  isOpen,
  isEditing,
  hours,
  pricePerPerson,
  piecesPerPerson,
  isBusy,
  onSubmit,
  onOpenChange,
}: WorkshopTierDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkshopTierFormValues>({
    resolver: zodResolver(workshopTierSchema),
    defaultValues: {
      hours,
      price_per_person: pricePerPerson,
      pieces_per_person: piecesPerPerson,
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit a length" : "Add a length"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Hours name the row, so they stay as they are."
              : "Hours name the row. Saving the same hours again replaces that row."}
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          id="workshop-tier-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <AdminField
            id="tier-hours"
            label="Hours"
            hint={null}
            error={errors.hours?.message}
          >
            <Input
              id="tier-hours"
              type="number"
              inputMode="numeric"
              min={1}
              readOnly={isEditing}
              className="h-9 text-[13px] tnum"
              aria-invalid={Boolean(errors.hours)}
              {...register("hours", { valueAsNumber: true })}
            />
          </AdminField>
          <AdminField
            id="tier-price"
            label="Price per person"
            hint="Whole rupees"
            error={errors.price_per_person?.message}
          >
            <Input
              id="tier-price"
              type="number"
              inputMode="numeric"
              min={0}
              className="h-9 text-[13px] tnum"
              aria-invalid={Boolean(errors.price_per_person)}
              {...register("price_per_person", { valueAsNumber: true })}
            />
          </AdminField>
          <AdminField
            id="tier-pieces"
            label="Pieces per person"
            hint="How many pieces they take home"
            error={errors.pieces_per_person?.message}
          >
            <Input
              id="tier-pieces"
              type="number"
              inputMode="numeric"
              min={0}
              className="h-9 text-[13px] tnum"
              aria-invalid={Boolean(errors.pieces_per_person)}
              {...register("pieces_per_person", { valueAsNumber: true })}
            />
          </AdminField>
        </form>
        <DialogFooter>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            form="workshop-tier-form"
            disabled={isBusy}
          >
            {isBusy ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
