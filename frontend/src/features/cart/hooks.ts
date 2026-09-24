"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useOptimistic } from "react";

import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import {
  CartDocument,
  ClearCartDocument,
  RemoveCartItemDocument,
  UpdateCartItemDocument,
} from "@/graphql/generated/graphql";

import { useOptimisticAction } from "@/lib/use-optimistic-action";

import { useCartContext } from "@/features/cart/containers/CartProvider";
import {
  applyCartAction,
  CART_QUERIES,
  type CartAction,
  type CartData,
} from "@/features/cart/types";

interface CartDetail {
  cart: CartData | null;
  isLoading: boolean;
  hasError: boolean;
  isSignedIn: boolean;
  setQuantity: (id: number, quantity: number) => void;
  remove: (id: number) => void;
  clearAll: () => void;
  resync: () => Promise<void>;
}

// The whole cart, only for the pages that show its lines. The cart is a computed object with
// no id of its own, so the refetched cart is the baseline.
export function useCart(): CartDetail {
  const { isSignedIn, isLoaded } = useAuth();
  const { data, previousData, loading, error } = useQuery(CartDocument, {
    skip: !isSignedIn,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
  const cart = isSignedIn ? (data?.cart ?? previousData?.cart ?? null) : null;

  const [optimisticCart, applyAction] = useOptimistic(cart, applyCartAction);
  const [updateItem] = useMutation(UpdateCartItemDocument);
  const [removeItem] = useMutation(RemoveCartItemDocument);
  const [clear] = useMutation(ClearCartDocument);
  const client = useApolloClient();

  // Both the badge and the lines are server-owned totals, so every write reads them back.
  const refreshCart = useCallback(
    () => client.refetchQueries({ include: CART_QUERIES }),
    [client],
  );
  const resync = useCallback(async () => {
    try {
      await refreshCart();
    } catch {
      // The caller already told the shopper; a reload still recovers.
    }
  }, [refreshCart]);

  const { execute } = useOptimisticAction({
    patch: applyAction,
    run: (action: CartAction) => {
      if (action.kind === "quantity") {
        return updateItem({
          variables: { id: action.id, quantity: action.quantity },
        });
      }
      if (action.kind === "remove") {
        return removeItem({ variables: { id: action.id } });
      }
      return clear();
    },
    refresh: refreshCart,
    messages: { success: null, failure: "The cart could not be updated" },
  });

  const setQuantity = useCallback(
    (id: number, quantity: number) =>
      execute({ kind: "quantity", id, quantity }),
    [execute],
  );
  const remove = useCallback(
    (id: number) => execute({ kind: "remove", id }),
    [execute],
  );
  const clearAll = useCallback(() => execute({ kind: "clear" }), [execute]);

  return {
    cart: optimisticCart,
    isLoading: !isLoaded || (loading && !data && !previousData),
    hasError: Boolean(error),
    isSignedIn: Boolean(isSignedIn),
    setQuantity,
    remove,
    clearAll,
    resync,
  };
}

export function useCartCount(): number {
  return useCartContext().count;
}

export function useAddToCart() {
  const { addToCart, isAdding } = useCartContext();
  return { addToCart, isAdding };
}
