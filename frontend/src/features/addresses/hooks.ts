"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  type AddressInput,
  useAddressesQuery,
  useCreateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
  useUpdateAddressMutation,
} from "@/graphql/generated/graphql";

import type { AddressFormValues } from "@/lib/validations/address";

import {
  applyAddressAction,
  type SavedAddress,
  sortByDefaultFirst,
  toAddressInput,
} from "./types";

// The address book is server-ordered apart from the default, which always leads.
const REFETCH = {
  refetchQueries: ["Addresses"],
  awaitRefetchQueries: true,
};

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}

// Signed-out visitors have no address book; the query is skipped rather than failing auth.
export function useAddresses() {
  const { isSignedIn, isLoaded } = useAuth();
  const { data, previousData, loading, error } = useAddressesQuery({
    skip: !isSignedIn,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
  const saved = data?.addresses ?? previousData?.addresses ?? [];
  return {
    addresses: isSignedIn ? sortByDefaultFirst(saved) : [],
    isLoading: !isLoaded || (loading && !data && !previousData),
    hasError: Boolean(error),
    isSignedIn: Boolean(isSignedIn),
  };
}

export function useAddressMutations() {
  const [createMutation, { loading: isCreating }] = useCreateAddressMutation();
  const [updateMutation, { loading: isUpdating }] = useUpdateAddressMutation();
  const [removeMutation] = useDeleteAddressMutation();
  const [setDefaultMutation] = useSetDefaultAddressMutation();

  const create = useCallback(
    async (input: AddressInput): Promise<SavedAddress | null> => {
      try {
        const { data } = await createMutation({
          variables: { input },
          ...REFETCH,
        });
        toast.success("Address saved");
        return data?.createAddress ?? null;
      } catch (error) {
        toast.error(toErrorMessage(error));
        return null;
      }
    },
    [createMutation],
  );

  const update = useCallback(
    async (id: number, input: AddressInput): Promise<SavedAddress | null> => {
      try {
        const { data } = await updateMutation({
          variables: { id, input },
          ...REFETCH,
        });
        toast.success("Address updated");
        return data?.updateAddress ?? null;
      } catch (error) {
        toast.error(toErrorMessage(error));
        return null;
      }
    },
    [updateMutation],
  );

  const remove = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await removeMutation({ variables: { id }, ...REFETCH });
        toast.success("Address removed");
        return true;
      } catch (error) {
        toast.error(toErrorMessage(error));
        return false;
      }
    },
    [removeMutation],
  );

  const setDefault = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await setDefaultMutation({ variables: { id }, ...REFETCH });
        toast.success("Default address updated");
        return true;
      } catch (error) {
        toast.error(toErrorMessage(error));
        return false;
      }
    },
    [setDefaultMutation],
  );

  return {
    create,
    update,
    remove,
    setDefault,
    isSaving: isCreating || isUpdating,
  };
}

// One address book's worth of state: which form is open and what saving it does.
// Deleting a card and moving the default show at once; the refetched list settles behind them.
export function useAddressBook() {
  const { addresses, isLoading } = useAddresses();
  const { create, update, remove, setDefault, isSaving } =
    useAddressMutations();
  const [optimisticAddresses, applyAction] = useOptimistic(
    addresses,
    applyAddressAction,
  );
  const [, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleRemove = useCallback(
    (id: number) => {
      startTransition(async () => {
        applyAction({ kind: "delete", id });
        await remove(id);
      });
    },
    [applyAction, remove],
  );

  const handleSetDefault = useCallback(
    (id: number) => {
      startTransition(async () => {
        applyAction({ kind: "default", id });
        await setDefault(id);
      });
    },
    [applyAction, setDefault],
  );

  const openNew = useCallback(() => {
    setEditingId(null);
    setIsAdding(true);
  }, []);

  const openEdit = useCallback((id: number) => {
    setIsAdding(false);
    setEditingId(id);
  }, []);

  const closeForm = useCallback(() => {
    setIsAdding(false);
    setEditingId(null);
  }, []);

  const submit = useCallback(
    async (values: AddressFormValues): Promise<SavedAddress | null> => {
      const input = toAddressInput(values);
      const saved =
        editingId === null
          ? await create(input)
          : await update(editingId, input);
      if (saved) closeForm();
      return saved;
    },
    [closeForm, create, editingId, update],
  );

  const editing =
    optimisticAddresses.find((address) => address.id === editingId) ?? null;

  return {
    addresses: optimisticAddresses,
    editing,
    editingId,
    isFormOpen: isAdding || editingId !== null,
    isLoading,
    isSaving,
    closeForm,
    openEdit,
    openNew,
    remove: handleRemove,
    setDefault: handleSetDefault,
    submit,
  };
}
