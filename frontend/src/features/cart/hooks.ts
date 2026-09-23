"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useOptimistic, useTransition } from "react";
import { toast } from "sonner";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  CartDocument,
  ClearCartDocument,
  RemoveCartItemDocument,
  UpdateCartItemDocument,
} from "@/graphql/generated/graphql";

import { useCartContext } from "@/features/cart/containers/CartProvider";
import {
  applyCartAction,
  CART_REFETCH,
  type CartData,
  toCartErrorMessage,
} from "@/features/cart/types";

interface CartDetail {
  cart: CartData | null;
  isLoading: boolean;
  hasError: boolean;
  isSignedIn: boolean;
  setQuantity: (id: number, quantity: number) => void;
  remove: (id: number) => void;
  clearAll: () => void;
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
  const [, startTransition] = useTransition();
  const [updateItem] = useMutation(UpdateCartItemDocument);
  const [removeItem] = useMutation(RemoveCartItemDocument);
  const [clear] = useMutation(ClearCartDocument);

  const setQuantity = useCallback(
    (id: number, quantity: number) => {
      startTransition(async () => {
        applyAction({ kind: "quantity", id, quantity });
        try {
          await updateItem({ variables: { id, quantity }, ...CART_REFETCH });
        } catch (error) {
          toast.error(toCartErrorMessage(error));
        }
      });
    },
    [applyAction, updateItem],
  );

  const remove = useCallback(
    (id: number) => {
      startTransition(async () => {
        applyAction({ kind: "remove", id });
        try {
          await removeItem({ variables: { id }, ...CART_REFETCH });
        } catch (error) {
          toast.error(toCartErrorMessage(error));
        }
      });
    },
    [applyAction, removeItem],
  );

  const clearAll = useCallback(() => {
    startTransition(async () => {
      applyAction({ kind: "clear" });
      try {
        await clear({ ...CART_REFETCH });
      } catch (error) {
        toast.error(toCartErrorMessage(error));
      }
    });
  }, [applyAction, clear]);

  return {
    cart: optimisticCart,
    isLoading: !isLoaded || (loading && !data && !previousData),
    hasError: Boolean(error),
    isSignedIn: Boolean(isSignedIn),
    setQuantity,
    remove,
    clearAll,
  };
}

export function useCartCount(): number {
  return useCartContext().count;
}

export function useAddToCart() {
  const { addToCart, isAdding } = useCartContext();
  return { addToCart, isAdding };
}
