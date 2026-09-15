"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";
import { toast } from "sonner";

import {
  type ToggleWishlistMutation,
  useToggleWishlistMutation,
  useWishlistIdsQuery,
  useWishlistQuery,
  WishlistDocument,
  WishlistIdsDocument,
  type WishlistIdsQuery,
  type WishlistQuery,
} from "@/graphql/generated/graphql";

import { useRequireAuth } from "@/features/auth";

export function useWishlistIds() {
  const { isSignedIn } = useAuth();
  const { data } = useWishlistIdsQuery({
    skip: !isSignedIn,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
  const ids = data?.wishlistIds ?? [];
  return {
    ids,
    count: ids.length,
    isWishlisted: (productId: number) => ids.includes(productId),
  };
}

export function useWishlist() {
  const { isSignedIn, isLoaded } = useAuth();
  const { data, previousData, loading, error } = useWishlistQuery({
    skip: !isSignedIn,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
  return {
    items: isSignedIn ? (data?.wishlist ?? previousData?.wishlist ?? []) : [],
    isLoading: !isLoaded || (loading && !data && !previousData),
    hasError: Boolean(error),
    isSignedIn: Boolean(isSignedIn),
  };
}

export function useToggleWishlist() {
  const requireAuth = useRequireAuth();
  const { ids } = useWishlistIds();
  const [mutate] = useToggleWishlistMutation();

  // The id list flips immediately; hearts everywhere read from that one cached list.
  const toggle = useCallback(
    (productId: number, productName: string) => {
      requireAuth(() => {
        const wasWishlisted = ids.includes(productId);
        const nextIds = wasWishlisted
          ? ids.filter((id) => id !== productId)
          : [...ids, productId];
        void mutate({
          variables: { productId },
          optimisticResponse: {
            toggleWishlist: {
              __typename: "WishlistToggleResult",
              product_id: productId,
              is_wishlisted: !wasWishlisted,
              wishlist_count: nextIds.length,
            } as ToggleWishlistMutation["toggleWishlist"],
          },
          update: (cache, { data }) => {
            if (!data) return;
            const current =
              cache.readQuery<WishlistIdsQuery>({ query: WishlistIdsDocument })
                ?.wishlistIds ?? ids;
            const updated = data.toggleWishlist.is_wishlisted
              ? [...new Set([...current, productId])]
              : current.filter((id) => id !== productId);
            cache.writeQuery<WishlistIdsQuery>({
              query: WishlistIdsDocument,
              data: { wishlistIds: updated },
            });
            if (!data.toggleWishlist.is_wishlisted) {
              const list = cache.readQuery<WishlistQuery>({
                query: WishlistDocument,
              });
              if (list) {
                cache.writeQuery<WishlistQuery>({
                  query: WishlistDocument,
                  data: {
                    wishlist: list.wishlist.filter(
                      (item) => item.id !== productId,
                    ),
                  },
                });
              }
            }
          },
        })
          .then(({ data }) => {
            if (data)
              toast(
                data.toggleWishlist.is_wishlisted
                  ? `${productName} saved to your wishlist`
                  : `${productName} removed from your wishlist`,
              );
          })
          .catch((error: unknown) =>
            toast.error(
              error instanceof Error
                ? error.message
                : "Could not update your wishlist",
            ),
          );
      });
    },
    [ids, mutate, requireAuth],
  );

  return { toggle };
}
