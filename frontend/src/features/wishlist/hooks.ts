"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useMemo } from "react";

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
  const { ids, adoptIds } = useWishlistContext();
  const { data, previousData, loading, error } = useWishlistQuery({
    skip: !isSignedIn,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
  const saved = useMemo(
    () => data?.wishlist ?? previousData?.wishlist ?? null,
    [data, previousData],
  );
  const savedIds = useMemo(
    () => saved?.map((item) => item.id) ?? null,
    [saved],
  );

  // While this page is up it is the better source of ids, so the hearts read it instead.
  useEffect(() => {
    if (savedIds === null) return;
    adoptIds(savedIds);
    return () => adoptIds(null);
  }, [adoptIds, savedIds]);

  return {
    items:
      isSignedIn && saved ? saved.filter((item) => ids.includes(item.id)) : [],
    isLoading: !isLoaded || (loading && !data && !previousData),
    hasError: Boolean(error),
    isSignedIn: Boolean(isSignedIn),
  };
}

export function useToggleWishlist() {
  const { toggle } = useWishlistContext();
  return { toggle };
}
