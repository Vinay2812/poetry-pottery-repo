"use client";

import { useAuth } from "@clerk/nextjs";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useOptimistic,
  useState,
  type PropsWithChildren,
} from "react";
import { toast } from "sonner";

import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import {
  ToggleWishlistDocument,
  WishlistIdsDocument,
} from "@/graphql/generated/graphql";

import { useOptimisticAction } from "@/lib/use-optimistic-action";

import { useRequireAuth } from "@/features/auth";
import { applyWishlistToggle } from "@/features/wishlist/types";

interface WishlistValue {
  ids: readonly number[];
  isSignedIn: boolean;
  isSaving: boolean;
  // Pass `wishlisted` to set a state rather than flip it.
  toggle: (
    productId: number,
    productName: string,
    wishlisted?: boolean,
  ) => void;
  // The saved pieces page already holds every id, so it lends them and the second query stops.
  adoptIds: (ids: readonly number[] | null) => void;
}

interface WishlistToggle {
  productId: number;
  productName: string;
  isWishlisted: boolean;
}

// The reply only carries a count, so the refetched lists become the new baseline.
const WISHLIST_QUERIES = ["WishlistIds", "Wishlist"];

const WishlistContext = createContext<WishlistValue | null>(null);

// Every heart on the site reads this one list, so a toggle anywhere shows everywhere at once.
export function WishlistProvider({ children }: PropsWithChildren) {
  const { isSignedIn } = useAuth();
  const [lentIds, setLentIds] = useState<readonly number[] | null>(null);
  const { data, previousData } = useQuery(WishlistIdsDocument, {
    skip: !isSignedIn || lentIds !== null,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
  const ids = useMemo(() => {
    if (!isSignedIn) return [];
    return lentIds ?? data?.wishlistIds ?? previousData?.wishlistIds ?? [];
  }, [data, isSignedIn, lentIds, previousData]);

  const [optimisticIds, applyToggle] = useOptimistic(ids, applyWishlistToggle);
  const [mutate] = useMutation(ToggleWishlistDocument);
  const client = useApolloClient();
  const requireAuth = useRequireAuth();

  const { execute, isPending: isSaving } = useOptimisticAction({
    patch: (change: WishlistToggle) => applyToggle(change),
    // The heart sends what it shows, so a stale tab sets that state instead of flipping the server's.
    run: (change) =>
      mutate({
        variables: {
          productId: change.productId,
          wishlisted: change.isWishlisted,
        },
      }),
    refresh: () => client.refetchQueries({ include: WISHLIST_QUERIES }),
    messages: { success: null, failure: "Could not update your wishlist" },
    onSuccess: ({ data: reply }, change) => {
      const isSaved =
        reply?.toggleWishlist.is_wishlisted ?? change.isWishlisted;
      toast(
        isSaved
          ? `${change.productName} saved to your wishlist`
          : `${change.productName} removed from your wishlist`,
      );
    },
  });

  const toggle = useCallback(
    (productId: number, productName: string, wishlisted?: boolean) => {
      requireAuth(() => {
        const isWishlisted = wishlisted ?? !optimisticIds.includes(productId);
        execute({ productId, productName, isWishlisted });
      });
    },
    [execute, optimisticIds, requireAuth],
  );

  const value = useMemo<WishlistValue>(
    () => ({
      ids: optimisticIds,
      isSignedIn: Boolean(isSignedIn),
      isSaving,
      toggle,
      adoptIds: setLentIds,
    }),
    [isSaving, isSignedIn, optimisticIds, toggle],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlistContext(): WishlistValue {
  const value = useContext(WishlistContext);
  if (!value) {
    throw new Error("useWishlistContext needs a WishlistProvider above it");
  }
  return value;
}
