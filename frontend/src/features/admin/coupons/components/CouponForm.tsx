"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { CouponKind } from "@/graphql/generated/graphql";

import {
  type AdminCouponFormValues,
  adminCouponSchema,
  COUPON_CODE_MAX,
} from "@/lib/validations/admin/coupon";

import { formatEnumLabel } from "@/features/admin/shell";
import { AdminField } from "@/features/admin/ui";

import { EMPTY_COUPON_FORM } from "@/features/admin/coupons/types";

const SELECT_CLASS =
  "h-9 w-full border border-ash bg-transparent px-2 text-[13px] outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary";

export interface CouponFormProps {
  idPrefix: string;
  defaultValues?: AdminCouponFormValues;
  isSaving: boolean;
  submitLabel: string;
  onSubmit: (values: AdminCouponFormValues) => void;
  onCancel: () => void;
}

export function CouponForm({
  idPrefix,
  defaultValues,
  isSaving,
  submitLabel,
  onSubmit,
  onCancel,
}: CouponFormProps) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AdminCouponFormValues>({
    resolver: zodResolver(adminCouponSchema),
    defaultValues: defaultValues ?? EMPTY_COUPON_FORM,
  });
  const kind = useWatch({ control, name: "kind" });
  const isActive = useWatch({ control, name: "is_active" });

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField
          id={`${idPrefix}-code`}
          label="Code"
          hint={`Letters, digits and dashes, up to ${COUPON_CODE_MAX} characters.`}
          error={errors.code?.message}
        >
          <Input
            id={`${idPrefix}-code`}
            autoCapitalize="characters"
            className="h-9 text-[13px] tracking-[0.08em] uppercase"
            aria-invalid={Boolean(errors.code)}
            {...register("code")}
          />
        </AdminField>
        <AdminField
          id={`${idPrefix}-kind`}
          label="Kind"
          hint={null}
          error={errors.kind?.message}
        >
          <select
            id={`${idPrefix}-kind`}
            className={SELECT_CLASS}
            aria-invalid={Boolean(errors.kind)}
            {...register("kind")}
          >
            {Object.values(CouponKind).map((member) => (
              <option key={member} value={member}>
                {formatEnumLabel(member)}
              </option>
            ))}
          </select>
        </AdminField>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <AdminField
          id={`${idPrefix}-value`}
          label={kind === CouponKind.Percent ? "Percentage off" : "Rupees off"}
          hint={
            kind === CouponKind.Percent
              ? "Between 1 and 100."
              : "Whole rupees, at least 1."
          }
          error={errors.value?.message}
        >
          <Input
            id={`${idPrefix}-value`}
            inputMode="numeric"
            className="h-9 text-[13px] tnum"
            aria-invalid={Boolean(errors.value)}
            {...register("value")}
          />
        </AdminField>
        <AdminField
          id={`${idPrefix}-min-order`}
          label="Minimum order"
          hint="Zero means the code works on any order."
          error={errors.min_order?.message}
        >
          <Input
            id={`${idPrefix}-min-order`}
            inputMode="numeric"
            className="h-9 text-[13px] tnum"
            aria-invalid={Boolean(errors.min_order)}
            {...register("min_order")}
          />
        </AdminField>
        <AdminField
          id={`${idPrefix}-max-uses`}
          label="Maximum uses"
          hint="Leave empty for no limit."
          error={errors.max_uses?.message}
        >
          <Input
            id={`${idPrefix}-max-uses`}
            inputMode="numeric"
            className="h-9 text-[13px] tnum"
            aria-invalid={Boolean(errors.max_uses)}
            {...register("max_uses")}
          />
        </AdminField>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField
          id={`${idPrefix}-starts-at`}
          label="Starts"
          hint="Leave empty to let it work straight away."
          error={errors.starts_at?.message}
        >
          <Input
            id={`${idPrefix}-starts-at`}
            type="datetime-local"
            className="h-9 text-[13px] tnum"
            aria-invalid={Boolean(errors.starts_at)}
            {...register("starts_at")}
          />
        </AdminField>
        <AdminField
          id={`${idPrefix}-expires-at`}
          label="Expires"
          hint="Leave empty to let it run on."
          error={errors.expires_at?.message}
        >
          <Input
            id={`${idPrefix}-expires-at`}
            type="datetime-local"
            className="h-9 text-[13px] tnum"
            aria-invalid={Boolean(errors.expires_at)}
            {...register("expires_at")}
          />
        </AdminField>
      </div>
      <Label
        htmlFor={`${idPrefix}-is-active`}
        className="w-fit gap-2.5 text-[13px]"
      >
        <Checkbox
          id={`${idPrefix}-is-active`}
          checked={isActive}
          onCheckedChange={(checked) =>
            setValue("is_active", checked === true, { shouldDirty: true })
          }
        />
        Shoppers can use this code
      </Label>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={isSaving}>
          {isSaving ? "Saving…" : submitLabel}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isSaving}
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
