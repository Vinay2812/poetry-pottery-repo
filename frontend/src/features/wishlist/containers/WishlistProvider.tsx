"use client";

import { useAuth } from "@clerk/nextjs";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useOptimistic,
  useState,
  useTransition,
  type PropsWithChildren,
} from "react";
import { toast } from "sonner";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  ToggleWishlistDocument,
  WishlistIdsDocument,
} from "@/graphql/generated/graphql";

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
  const [isSaving, startTransition] = useTransition();
  const [mutate] = useMutation(ToggleWishlistDocument);
  const requireAuth = useRequireAuth();

  const toggle = useCallback(
    (productId: number, productName: string, wishlisted?: boolean) => {
      requireAuth(() => {
        const isWishlisted = wishlisted ?? !optimisticIds.includes(productId);
        startTransition(async () => {
          applyToggle({ productId, isWishlisted });
          try {
            // The reply only carries a count, so the refetched lists become the new baseline.
            // The heart sends what it shows, so a stale tab sets that state instead of flipping the server's.
            const { data } = await mutate({
              variables: { productId, wishlisted: isWishlisted },
              refetchQueries: ["WishlistIds", "Wishlist"],
              awaitRefetchQueries: true,
            });
            const isSaved = data?.toggleWishlist.is_wishlisted ?? isWishlisted;
            toast(
              isSaved
                ? `${productName} saved to your wishlist`
                : `${productName} removed from your wishlist`,
            );
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "Could not update your wishlist",
            );
          }
        });
      });
    },
    [applyToggle, mutate, optimisticIds, requireAuth],
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
