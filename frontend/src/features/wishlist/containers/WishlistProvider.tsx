"use client";

import { useAuth } from "@clerk/nextjs";
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
  useToggleWishlistMutation,
  useWishlistIdsQuery,
} from "@/graphql/generated/graphql";

import { useRequireAuth } from "@/features/auth";
import { applyWishlistToggle } from "@/features/wishlist/types";

interface WishlistValue {
  ids: readonly number[];
  isSignedIn: boolean;
  isSaving: boolean;
  toggle: (productId: number, productName: string) => void;
}

const WishlistContext = createContext<WishlistValue | null>(null);

// Every heart on the site reads this one list, so a toggle anywhere shows everywhere at once.
export function WishlistProvider({ children }: PropsWithChildren) {
  const { isSignedIn } = useAuth();
  const { data, previousData } = useWishlistIdsQuery({
    skip: !isSignedIn,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
  const ids = useMemo(
    () =>
      isSignedIn ? (data?.wishlistIds ?? previousData?.wishlistIds ?? []) : [],
    [data, isSignedIn, previousData],
  );

  const [optimisticIds, applyToggle] = useOptimistic(ids, applyWishlistToggle);
  const [isSaving, startTransition] = useTransition();
  const [mutate] = useToggleWishlistMutation();
  const requireAuth = useRequireAuth();

  const toggle = useCallback(
    (productId: number, productName: string) => {
      requireAuth(() => {
        const isWishlisted = !optimisticIds.includes(productId);
        startTransition(async () => {
          applyToggle({ productId, isWishlisted });
          try {
            // The reply only carries a count, so the refetched lists become the new baseline.
            await mutate({
              variables: { productId },
              refetchQueries: ["WishlistIds", "Wishlist"],
              awaitRefetchQueries: true,
            });
            toast(
              isWishlisted
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
