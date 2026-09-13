"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";

import { useWishlistQuery } from "@/graphql/generated/graphql";

import { useWishlistContext } from "@/features/wishlist/containers/WishlistProvider";

export function useWishlistIds() {
  const { ids } = useWishlistContext();
  const isWishlisted = useCallback(
    (productId: number) => ids.includes(productId),
    [ids],
  );
  return { ids, count: ids.length, isWishlisted };
}

// Un-hearting a piece drops its card straight away: the grid follows the optimistic id list.
export function useWishlist() {
  const { isSignedIn, isLoaded } = useAuth();
  const { ids } = useWishlistContext();
  const { data, previousData, loading, error } = useWishlistQuery({
    skip: !isSignedIn,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
  const saved = data?.wishlist ?? previousData?.wishlist ?? [];
  return {
    items: isSignedIn ? saved.filter((item) => ids.includes(item.id)) : [],
    isLoading: !isLoaded || (loading && !data && !previousData),
    hasError: Boolean(error),
    isSignedIn: Boolean(isSignedIn),
  };
}

export function useToggleWishlist() {
  const { toggle } = useWishlistContext();
  return { toggle };
}
