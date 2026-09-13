"use client";

import { useCallback, useEffect } from "react";

import { AddressCard } from "@/features/addresses/components/AddressCard";
import { AddressForm } from "@/features/addresses/components/AddressForm";
import { AddressPicker } from "@/features/addresses/components/AddressPicker";
import { EmptyAddresses } from "@/features/addresses/components/EmptyAddresses";
import { useAddressBook } from "@/features/addresses/hooks";
import { toFormValues, toPreferredAddressId } from "@/features/addresses/types";
import type { AddressFormValues } from "@/lib/validations/address";

export interface AddressPickerContainerProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function AddressPickerContainer({
  selectedId,
  onSelect,
}: AddressPickerContainerProps) {
  const {
    addresses,
    editing,
    editingId,
    isFormOpen,
    isLoading,
    isSaving,
    closeForm,
    openEdit,
    openNew,
    remove,
    setDefault,
    submit,
  } = useAddressBook();

  const preferredId = toPreferredAddressId(addresses);
  const hasSelection = addresses.some((address) => address.id === selectedId);

  // The default (or the only address) is picked for you, and a deleted one falls back the same way.
  useEffect(() => {
    if (!hasSelection && preferredId !== null) {
      onSelect(preferredId);
    }
  }, [hasSelection, onSelect, preferredId]);

  const handleSubmit = useCallback(
    (values: AddressFormValues) => {
      void submit(values).then((saved) => {
        if (saved) onSelect(saved.id);
      });
    },
    [onSelect, submit],
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        {[0, 1].map((index) => (
          <div key={index} className="h-28 animate-pulse bg-ash" />
        ))}
      </div>
    );
  }

  if (addresses.length === 0 && !isFormOpen) {
    return <EmptyAddresses onAddClick={openNew} />;
  }

  return (
    <AddressPicker
      isEmpty={addresses.length === 0}
      isAdding={isFormOpen}
      onAddClick={openNew}
      form={
        isFormOpen ? (
          <AddressForm
            key={editingId ?? "new"}
            defaultValues={editing ? toFormValues(editing) : undefined}
            isSubmitting={isSaving}
            submitLabel={editing ? "Save changes" : "Save address"}
            onSubmit={handleSubmit}
            onCancel={closeForm}
          />
        ) : null
      }
    >
      {addresses
        .filter((address) => address.id !== editingId)
        .map((address) => (
          <AddressCard
            key={address.id}
            name={address.name}
            phone={address.phone}
            line1={address.line1}
            line2={address.line2}
            landmark={address.landmark}
            city={address.city}
            state={address.state}
            pincode={address.pincode}
            isDefault={address.is_default}
            isSelected={address.id === selectedId}
            isSelectable
            onSelect={() => onSelect(address.id)}
            onEdit={() => openEdit(address.id)}
            onDelete={() => void remove(address.id)}
            onMakeDefault={() => void setDefault(address.id)}
          />
        ))}
    </AddressPicker>
  );
}
