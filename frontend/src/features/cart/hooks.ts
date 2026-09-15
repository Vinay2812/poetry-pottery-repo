"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";

import {
  type AddToCartInput,
  type CartFieldsFragment,
  CartDocument,
  type CartQuery,
  useAddToCartMutation,
  useCartQuery,
  useClearCartMutation,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from "@/graphql/generated/graphql";

import { useRequireAuth } from "@/features/auth";

export type CartData = CartFieldsFragment;

// Signed-out visitors have no cart; the query is skipped rather than failing auth.
export function useCart() {
  const { isSignedIn, isLoaded } = useAuth();
  const { data, previousData, loading, error } = useCartQuery({
    skip: !isSignedIn,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
  return {
    cart: isSignedIn ? (data?.cart ?? previousData?.cart ?? null) : null,
    isLoading: !isLoaded || (loading && !data && !previousData),
    hasError: Boolean(error),
    isSignedIn: Boolean(isSignedIn),
  };
}

export function useCartCount(): number {
  return useCart().cart?.item_count ?? 0;
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}

export function useAddToCart() {
  const router = useRouter();
  const requireAuth = useRequireAuth();
  const [mutate, { loading }] = useAddToCartMutation({
    update: (cache, { data }) => {
      if (data)
        cache.writeQuery<CartQuery>({
          query: CartDocument,
          data: { cart: data.addToCart },
        });
    },
  });

  const addToCart = useCallback(
    (input: AddToCartInput, productName: string) => {
      requireAuth(() => {
        void mutate({ variables: { input } })
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
    [mutate, requireAuth, router],
  );

  return { addToCart, isAdding: loading };
}

export function useCartMutations(cart: CartData | null) {
  const [updateItem] = useUpdateCartItemMutation();
  const [removeItem] = useRemoveCartItemMutation();
  const [clear] = useClearCartMutation();

  // Optimistic responses patch the cached cart so the stepper feels instant; totals settle on reply.
  const optimistic = useCallback(
    (items: CartData["items"]): CartData & { __typename: "Cart" } => {
      const available = items.filter((item) => item.is_available);
      const subtotal = available.reduce(
        (sum, item) => sum + item.line_total,
        0,
      );
      const freeAbove = cart?.free_shipping_above ?? null;
      const flatFee = cart?.shipping_fee ?? 0;
      const shipping_fee =
        subtotal === 0 || (freeAbove !== null && subtotal >= freeAbove)
          ? 0
          : flatFee;
      return {
        __typename: "Cart",
        items,
        item_count: items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal,
        shipping_fee,
        free_shipping_above: freeAbove,
        total: subtotal + shipping_fee,
      };
    },
    [cart],
  );

  const setQuantity = useCallback(
    (id: number, quantity: number) => {
      if (!cart) return;
      const items = cart.items
        .map((item) =>
          item.id === id
            ? { ...item, quantity, line_total: item.unit_price * quantity }
            : item,
        )
        .filter((item) => item.quantity > 0);
      void updateItem({
        variables: { id, quantity },
        optimisticResponse: { updateCartItem: optimistic(items) },
        update: (cache, { data }) => {
          if (data)
            cache.writeQuery<CartQuery>({
              query: CartDocument,
              data: { cart: data.updateCartItem },
            });
        },
      }).catch((error: unknown) => toast.error(toErrorMessage(error)));
    },
    [cart, optimistic, updateItem],
  );

  const remove = useCallback(
    (id: number) => {
      if (!cart) return;
      const items = cart.items.filter((item) => item.id !== id);
      void removeItem({
        variables: { id },
        optimisticResponse: { removeCartItem: optimistic(items) },
        update: (cache, { data }) => {
          if (data)
            cache.writeQuery<CartQuery>({
              query: CartDocument,
              data: { cart: data.removeCartItem },
            });
        },
      }).catch((error: unknown) => toast.error(toErrorMessage(error)));
    },
    [cart, optimistic, removeItem],
  );

  const clearAll = useCallback(() => {
    void clear({
      optimisticResponse: { clearCart: optimistic([]) },
      update: (cache, { data }) => {
        if (data)
          cache.writeQuery<CartQuery>({
            query: CartDocument,
            data: { cart: data.clearCart },
          });
      },
    }).catch((error: unknown) => toast.error(toErrorMessage(error)));
  }, [clear, optimistic]);

  return { setQuantity, remove, clearAll };
}
