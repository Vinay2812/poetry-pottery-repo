"use client";

import { useCartContext } from "@/features/cart/containers/CartProvider";
import type { CartData } from "@/features/cart/types";

export type { CartData };

export function useCart() {
  const { cart, isLoading, hasError, isSignedIn } = useCartContext();
  return { cart, isLoading, hasError, isSignedIn };
}

export function useCartCount(): number {
  return useCartContext().cart?.item_count ?? 0;
}

export function useAddToCart() {
  const { addToCart, isAdding } = useCartContext();
  return { addToCart, isAdding };
}

export function useCartMutations() {
  const { setQuantity, remove, clearAll } = useCartContext();
  return { setQuantity, remove, clearAll };
}
