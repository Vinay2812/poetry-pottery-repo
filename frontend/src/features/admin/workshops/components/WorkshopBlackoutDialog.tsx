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
  type WorkshopBlackoutFormValues,
  workshopBlackoutSchema,
} from "@/lib/validations/admin/workshop";

import { AdminField } from "@/features/admin/ui";

export interface WorkshopBlackoutDialogProps {
  isOpen: boolean;
  isEditing: boolean;
  startsAt: string;
  endsAt: string;
  reason: string;
  timezoneLabel: string;
  isBusy: boolean;
  onSubmit: (values: WorkshopBlackoutFormValues) => void;
  onOpenChange: (isOpen: boolean) => void;
}

export function WorkshopBlackoutDialog({
  isOpen,
  isEditing,
  startsAt,
  endsAt,
  reason,
  timezoneLabel,
  isBusy,
  onSubmit,
  onOpenChange,
}: WorkshopBlackoutDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkshopBlackoutFormValues>({
    resolver: zodResolver(workshopBlackoutSchema),
    defaultValues: { starts_at: startsAt, ends_at: endsAt, reason },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit a closed spell" : "Close a stretch"}
          </DialogTitle>
          <DialogDescription>
            Times are read in {timezoneLabel}.
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          id="workshop-blackout-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <AdminField
            id="blackout-starts"
            label="From"
            hint={null}
            error={errors.starts_at?.message}
          >
            <Input
              id="blackout-starts"
              type="datetime-local"
              className="h-9 text-[13px]"
              aria-invalid={Boolean(errors.starts_at)}
              {...register("starts_at")}
            />
          </AdminField>
          <AdminField
            id="blackout-ends"
            label="To"
            hint={null}
            error={errors.ends_at?.message}
          >
            <Input
              id="blackout-ends"
              type="datetime-local"
              className="h-9 text-[13px]"
              aria-invalid={Boolean(errors.ends_at)}
              {...register("ends_at")}
            />
          </AdminField>
          <AdminField
            id="blackout-reason"
            label="Reason"
            hint="Optional, shown on the calendar"
            error={errors.reason?.message}
          >
            <Input
              id="blackout-reason"
              className="h-9 text-[13px]"
              aria-invalid={Boolean(errors.reason)}
              {...register("reason")}
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
            form="workshop-blackout-form"
            disabled={isBusy}
          >
            {isBusy ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
