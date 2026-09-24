"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useOptimistic, useState } from "react";

import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import {
  AddressesDocument,
  type AddressInput,
  CreateAddressDocument,
  DeleteAddressDocument,
  SetDefaultAddressDocument,
  UpdateAddressDocument,
} from "@/graphql/generated/graphql";

import { useOptimisticAction } from "@/lib/use-optimistic-action";
import type { AddressFormValues } from "@/lib/validations/address";

import {
  type AddressAction,
  applyAddressAction,
  type SavedAddress,
  sortByDefaultFirst,
  toAddressInput,
} from "./types";

// The address book is server-ordered apart from the default, which always leads.
const ADDRESS_QUERIES = ["Addresses"];

interface AddressSave {
  id: number | null;
  input: AddressInput;
  onSaved: (address: SavedAddress | null) => void;
}

// Signed-out visitors have no address book; the query is skipped rather than failing auth.
export function useAddresses() {
  const { isSignedIn, isLoaded } = useAuth();
  const { data, previousData, loading, error } = useQuery(AddressesDocument, {
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

// Every write reads the book back, so the refetched list is the baseline.
export function useAddressMutations(
  applyAction?: (action: AddressAction) => void,
) {
  const client = useApolloClient();
  const [createMutation] = useMutation(CreateAddressDocument);
  const [updateMutation] = useMutation(UpdateAddressDocument);
  const [removeMutation] = useMutation(DeleteAddressDocument);
  const [setDefaultMutation] = useMutation(SetDefaultAddressDocument);

  const refreshAddresses = useCallback(
    () => client.refetchQueries({ include: ADDRESS_QUERIES }),
    [client],
  );

  const { execute: save, isPending: isSaving } = useOptimisticAction({
    run: (draft: AddressSave) =>
      draft.id === null
        ? createMutation({ variables: { input: draft.input } }).then(
            ({ data }) => data?.createAddress ?? null,
          )
        : updateMutation({
            variables: { id: draft.id, input: draft.input },
          }).then(({ data }) => data?.updateAddress ?? null),
    refresh: refreshAddresses,
    messages: {
      success: (draft) =>
        draft.id === null ? "Address saved" : "Address updated",
      failure: "The address could not be saved",
    },
    onSuccess: (saved, draft) => draft.onSaved(saved),
  });

  const { execute: remove } = useOptimisticAction({
    patch: (id: number) => applyAction?.({ kind: "delete", id }),
    run: (id) => removeMutation({ variables: { id } }),
    refresh: refreshAddresses,
    messages: {
      success: "Address removed",
      failure: "The address could not be removed",
    },
  });

  const { execute: setDefault } = useOptimisticAction({
    patch: (id: number) => applyAction?.({ kind: "default", id }),
    run: (id) => setDefaultMutation({ variables: { id } }),
    refresh: refreshAddresses,
    messages: {
      success: "Default address updated",
      failure: "The default address could not be changed",
    },
  });

  return { save, remove, setDefault, isSaving };
}

// One address book's worth of state: which form is open and what saving it does.
// Deleting a card and moving the default show at once; the refetched list settles behind them.
export function useAddressBook() {
  const { addresses, isLoading } = useAddresses();
  const [optimisticAddresses, applyAction] = useOptimistic(
    addresses,
    applyAddressAction,
  );
  const { save, remove, setDefault, isSaving } =
    useAddressMutations(applyAction);
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

  // A refused save keeps the form open with what was typed; only a saved address is handed on.
  const submit = useCallback(
    (values: AddressFormValues, onSaved?: (saved: SavedAddress) => void) => {
      save({
        id: editingId,
        input: toAddressInput(values),
        onSaved: (saved) => {
          if (!saved) return;
          closeForm();
          onSaved?.(saved);
        },
      });
    },
    [closeForm, editingId, save],
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
    remove,
    setDefault,
    submit,
  };
}
