"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react";
import { toast } from "sonner";

import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import {
  AddToCartDocument,
  type AddToCartInput,
  CartCountDocument,
} from "@/graphql/generated/graphql";

import { useOptimisticAction } from "@/lib/use-optimistic-action";

import { useRequireAuth } from "@/features/auth";
import { CART_QUERIES } from "@/features/cart/types";

interface CartValue {
  count: number;
  isSignedIn: boolean;
  isAdding: boolean;
  addToCart: (input: AddToCartInput, productName: string) => void;
}

interface AddRequest {
  input: AddToCartInput;
  productName: string;
}

const CartContext = createContext<CartValue | null>(null);

// On every page, so it asks for the badge number alone; the cart page reads the whole cart.
export function CartProvider({ children }: PropsWithChildren) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const requireAuth = useRequireAuth();
  const client = useApolloClient();
  const { data, previousData } = useQuery(CartCountDocument, {
    skip: !isSignedIn,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
  const [add] = useMutation(AddToCartDocument);

  // Stock is the server's call, so the button waits rather than promising a piece.
  const { execute, isPending: isAdding } = useOptimisticAction({
    run: (request: AddRequest) => add({ variables: { input: request.input } }),
    refresh: () => client.refetchQueries({ include: CART_QUERIES }),
    messages: { success: null, failure: "That piece could not be added" },
    onSuccess: (_result, request) => {
      toast.success(`${request.productName} added to cart`, {
        action: { label: "View cart", onClick: () => router.push("/cart") },
      });
    },
  });

  const addToCart = useCallback(
    (input: AddToCartInput, productName: string) => {
      requireAuth(() => execute({ input, productName }));
    },
    [execute, requireAuth],
  );

  const value = useMemo<CartValue>(
    () => ({
      count: isSignedIn ? (data?.cartCount ?? previousData?.cartCount ?? 0) : 0,
      isSignedIn: Boolean(isSignedIn),
      isAdding,
      addToCart,
    }),
    [addToCart, data, isAdding, isSignedIn, previousData],
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
