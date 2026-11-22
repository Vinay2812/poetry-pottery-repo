"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, type UseFormRegisterReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { EMPTY_ADDRESS_FORM } from "@/features/addresses/types";
import {
  type AddressFormValues,
  addressSchema,
} from "@/lib/validations/address";

interface TextFieldProps {
  id: string;
  label: string;
  autoComplete: string;
  error: string | undefined;
  registration: UseFormRegisterReturn;
  type?: "text" | "tel";
  inputMode?: "text" | "tel" | "numeric";
  className?: string;
}

function TextField({
  id,
  label,
  autoComplete,
  error,
  registration,
  type = "text",
  inputMode,
  className,
}: TextFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id} className="text-[13px] text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...registration}
      />
      {error && (
        <p id={errorId} role="alert" className="text-[13px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export interface AddressFormProps {
  defaultValues?: AddressFormValues;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: (values: AddressFormValues) => void;
  onCancel: () => void;
}

export function AddressForm({
  defaultValues,
  isSubmitting,
  submitLabel,
  onSubmit,
  onCancel,
}: AddressFormProps) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: defaultValues ?? EMPTY_ADDRESS_FORM,
  });
  const isDefault = useWatch({ control, name: "is_default" });

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 border border-ash p-4 md:p-5"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          id="address-name"
          label="Full name"
          autoComplete="name"
          error={errors.name?.message}
          registration={register("name")}
        />
        <TextField
          id="address-phone"
          label="Phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          error={errors.phone?.message}
          registration={register("phone")}
        />
        <TextField
          id="address-line1"
          label="Flat, house or building"
          autoComplete="address-line1"
          error={errors.line1?.message}
          registration={register("line1")}
        />
        <TextField
          id="address-line2"
          label="Area or street (optional)"
          autoComplete="address-line2"
          error={errors.line2?.message}
          registration={register("line2")}
        />
        <TextField
          id="address-landmark"
          label="Landmark (optional)"
          autoComplete="off"
          error={errors.landmark?.message}
          registration={register("landmark")}
          className="md:col-span-2"
        />
      </div>
      {/* City takes a full row on a phone so State and the short PIN code can share one. */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <TextField
          id="address-city"
          label="City"
          autoComplete="address-level2"
          error={errors.city?.message}
          registration={register("city")}
          className="col-span-2 md:col-span-1"
        />
        <TextField
          id="address-state"
          label="State"
          autoComplete="address-level1"
          error={errors.state?.message}
          registration={register("state")}
        />
        <TextField
          id="address-pincode"
          label="PIN code"
          inputMode="numeric"
          autoComplete="postal-code"
          error={errors.pincode?.message}
          registration={register("pincode")}
        />
      </div>
      <Label htmlFor="address-default" className="w-fit gap-2.5 text-sm">
        <Checkbox
          id="address-default"
          checked={isDefault}
          onCheckedChange={(checked) =>
            setValue("is_default", checked === true, { shouldDirty: true })
          }
        />
        Deliver here by default
      </Label>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
