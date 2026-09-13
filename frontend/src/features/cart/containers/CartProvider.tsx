"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useOptimistic,
  useTransition,
  type PropsWithChildren,
} from "react";
import { toast } from "sonner";

import {
  type AddToCartInput,
  useAddToCartMutation,
  useCartQuery,
  useClearCartMutation,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from "@/graphql/generated/graphql";

import { useRequireAuth } from "@/features/auth";
import { applyCartAction, type CartData } from "@/features/cart/types";

// The cart is a computed object with no id of its own, so the refetched cart is the baseline.
const REFETCH = { refetchQueries: ["Cart"], awaitRefetchQueries: true };

interface CartValue {
  cart: CartData | null;
  isLoading: boolean;
  hasError: boolean;
  isSignedIn: boolean;
  isAdding: boolean;
  addToCart: (input: AddToCartInput, productName: string) => void;
  setQuantity: (id: number, quantity: number) => void;
  remove: (id: number) => void;
  clearAll: () => void;
}

const CartContext = createContext<CartValue | null>(null);

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}

// The header count and the cart page read one cart, so a stepper click moves both at once.
export function CartProvider({ children }: PropsWithChildren) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const requireAuth = useRequireAuth();
  const { data, previousData, loading, error } = useCartQuery({
    skip: !isSignedIn,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
  const cart = isSignedIn ? (data?.cart ?? previousData?.cart ?? null) : null;

  const [optimisticCart, applyAction] = useOptimistic(cart, applyCartAction);
  const [, startTransition] = useTransition();
  const [add, { loading: isAdding }] = useAddToCartMutation();
  const [updateItem] = useUpdateCartItemMutation();
  const [removeItem] = useRemoveCartItemMutation();
  const [clear] = useClearCartMutation();

  const addToCart = useCallback(
    (input: AddToCartInput, productName: string) => {
      requireAuth(() => {
        // Stock is the server's call, so the button waits rather than promising a piece.
        void add({ variables: { input }, ...REFETCH })
          .then(() => {
            toast.success(`${productName} added to cart`, {
              action: {
                label: "View cart",
                onClick: () => router.push("/cart"),
              },
            });
          })
          .catch((error: unknown) => toast.error(toErrorMessage(error)));
      });
    },
    [add, requireAuth, router],
  );

  const setQuantity = useCallback(
    (id: number, quantity: number) => {
      startTransition(async () => {
        applyAction({ kind: "quantity", id, quantity });
        try {
          await updateItem({ variables: { id, quantity }, ...REFETCH });
        } catch (error) {
          toast.error(toErrorMessage(error));
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
          await removeItem({ variables: { id }, ...REFETCH });
        } catch (error) {
          toast.error(toErrorMessage(error));
        }
      });
    },
    [applyAction, removeItem],
  );

  const clearAll = useCallback(() => {
    startTransition(async () => {
      applyAction({ kind: "clear" });
      try {
        await clear({ ...REFETCH });
      } catch (error) {
        toast.error(toErrorMessage(error));
      }
    });
  }, [applyAction, clear]);

  const value = useMemo<CartValue>(
    () => ({
      cart: optimisticCart,
      isLoading: !isLoaded || (loading && !data && !previousData),
      hasError: Boolean(error),
      isSignedIn: Boolean(isSignedIn),
      isAdding,
      addToCart,
      setQuantity,
      remove,
      clearAll,
    }),
    [
      addToCart,
      clearAll,
      data,
      error,
      isAdding,
      isLoaded,
      isSignedIn,
      loading,
      optimisticCart,
      previousData,
      remove,
      setQuantity,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext(): CartValue {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error("useCartContext needs a CartProvider above it");
  }
  return value;
}
