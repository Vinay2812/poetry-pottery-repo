"use client";

import type { ApolloCache } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import {
  AddressesDocument,
  type AddressesQuery,
  type AddressInput,
  useAddressesQuery,
  useCreateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
  useUpdateAddressMutation,
} from "@/graphql/generated/graphql";

import type { AddressFormValues } from "@/lib/validations/address";

import {
  afterDelete,
  type SavedAddress,
  sortByDefaultFirst,
  toAddressInput,
  toOptimisticDefault,
  withDefaultOn,
} from "./types";

function readAddresses(cache: ApolloCache): SavedAddress[] {
  return (
    cache.readQuery<AddressesQuery>({ query: AddressesDocument })?.addresses ??
    []
  );
}

function writeAddresses(cache: ApolloCache, addresses: SavedAddress[]): void {
  cache.writeQuery<AddressesQuery>({
    query: AddressesDocument,
    data: { addresses },
  });
}

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
  return {
    addresses: isSignedIn
      ? (data?.addresses ?? previousData?.addresses ?? [])
      : [],
    isLoading: !isLoaded || (loading && !data && !previousData),
    hasError: Boolean(error),
    isSignedIn: Boolean(isSignedIn),
  };
}

export function useAddressMutations() {
  const client = useApolloClient();
  const [createMutation, { loading: isCreating }] = useCreateAddressMutation();
  const [updateMutation, { loading: isUpdating }] = useUpdateAddressMutation();
  const [removeMutation] = useDeleteAddressMutation();
  const [setDefaultMutation] = useSetDefaultAddressMutation();

  const create = useCallback(
    async (input: AddressInput): Promise<SavedAddress | null> => {
      try {
        const { data } = await createMutation({
          variables: { input },
          update: (cache, result) => {
            const created = result.data?.createAddress;
            if (!created) return;
            const list = [
              created,
              ...readAddresses(cache).filter(
                (address) => address.id !== created.id,
              ),
            ];
            writeAddresses(
              cache,
              created.is_default
                ? withDefaultOn(list, created.id)
                : sortByDefaultFirst(list),
            );
          },
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
          update: (cache, result) => {
            const updated = result.data?.updateAddress;
            if (!updated) return;
            const list = readAddresses(cache).map((address) =>
              address.id === updated.id ? updated : address,
            );
            writeAddresses(
              cache,
              updated.is_default
                ? withDefaultOn(list, updated.id)
                : sortByDefaultFirst(list),
            );
          },
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

  // The card leaves straight away; Apollo puts it back if the delete is refused.
  const remove = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await removeMutation({
          variables: { id },
          optimisticResponse: { deleteAddress: true },
          update: (cache, result) => {
            if (!result.data?.deleteAddress) return;
            writeAddresses(cache, afterDelete(readAddresses(cache), id));
          },
        });
        toast.success("Address removed");
        return true;
      } catch (error) {
        toast.error(toErrorMessage(error));
        return false;
      }
    },
    [removeMutation],
  );

  // The Default mark moves on the click, because the whole address is already cached.
  const setDefault = useCallback(
    async (id: number): Promise<boolean> => {
      const target = readAddresses(client.cache).find(
        (address) => address.id === id,
      );
      try {
        await setDefaultMutation({
          variables: { id },
          ...(target
            ? {
                optimisticResponse: {
                  setDefaultAddress: toOptimisticDefault(target),
                },
              }
            : {}),
          update: (cache, result) => {
            const address = result.data?.setDefaultAddress;
            if (!address) return;
            writeAddresses(
              cache,
              withDefaultOn(readAddresses(cache), address.id),
            );
          },
        });
        toast.success("Default address updated");
        return true;
      } catch (error) {
        toast.error(toErrorMessage(error));
        return false;
      }
    },
    [client, setDefaultMutation],
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
export function useAddressBook() {
  const { addresses, isLoading } = useAddresses();
  const { create, update, remove, setDefault, isSaving } =
    useAddressMutations();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

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

  const editing = addresses.find((address) => address.id === editingId) ?? null;

  return {
    addresses,
    editing,
    editingId,
    isFormOpen: isAdding || editingId !== null,
    isLoading,
    isSaving,
    closeForm,
    openEdit,
    openNew,
    remove,
    setDefault,
    submit,
  };
}
