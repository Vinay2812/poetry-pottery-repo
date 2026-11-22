"use client";

import { useClerk } from "@clerk/nextjs";

import { LoadFailed } from "@/components/layout/LoadFailed";
import { PageShell } from "@/components/layout/PageShell";

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
    hasError,
    isSignedIn,
    isSaving,
    refetch,
    closeForm,
    openEdit,
    openNew,
    remove,
    setDefault,
    submit,
  } = useAddressBook();
  const { openSignIn } = useClerk();

  return (
    <PageShell column="narrow" className="flex flex-col gap-6 py-8 md:py-12">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl tracking-tight md:text-5xl">
          Your addresses
        </h1>
        {isSignedIn && (
          <p className="text-[15px] text-muted-foreground">
            The default is picked for you at checkout.
          </p>
        )}
      </div>
      {isLoading ? (
        <div className="flex flex-col gap-4" aria-busy="true">
          {[0, 1].map((index) => (
            <div key={index} className="h-32 animate-pulse bg-ash" />
          ))}
        </div>
      ) : hasError ? (
        <LoadFailed
          heading="Your addresses did not load"
          onRetry={() => void refetch()}
        />
      ) : !isSignedIn || (addresses.length === 0 && !isFormOpen) ? (
        <EmptyAddresses
          isSignedIn={isSignedIn}
          onAddClick={openNew}
          onSignIn={() => openSignIn()}
        />
      ) : (
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
                onSubmit={(values) => submit(values)}
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
      )}
    </PageShell>
  );
}
