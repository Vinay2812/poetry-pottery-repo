"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { AdminCouponFormValues } from "@/lib/validations/admin/coupon";

import { CouponForm } from "@/features/admin/coupons/components/CouponForm";

export interface CouponFormDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  formKey: string;
  defaultValues?: AdminCouponFormValues;
  isSaving: boolean;
  submitLabel: string;
  onSubmit: (values: AdminCouponFormValues) => void;
  onOpenChange: (isOpen: boolean) => void;
}

export function CouponFormDialog({
  isOpen,
  title,
  description,
  formKey,
  defaultValues,
  isSaving,
  submitLabel,
  onSubmit,
  onOpenChange,
}: CouponFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <CouponForm
          key={formKey}
          idPrefix={formKey}
          defaultValues={defaultValues}
          isSaving={isSaving}
          submitLabel={submitLabel}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
