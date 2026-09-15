"use client";

import { AddressCard } from "@/features/addresses/components/AddressCard";
import { AddressForm } from "@/features/addresses/components/AddressForm";
import { AddressPicker } from "@/features/addresses/components/AddressPicker";
import { EmptyAddresses } from "@/features/addresses/components/EmptyAddresses";
import { useAddressBook } from "@/features/addresses/hooks";
import { toFormValues } from "@/features/addresses/types";

export function AddressBookContainer() {
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
            onSubmit={(values) => void submit(values)}
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
            isSelected={false}
            isSelectable={false}
            onEdit={() => openEdit(address.id)}
            onDelete={() => void remove(address.id)}
            onMakeDefault={() => void setDefault(address.id)}
          />
        ))}
    </AddressPicker>
  );
}
