"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";
import { toast } from "sonner";

import {
  CartDocument,
  type CartQuery,
  useMoveWishlistItemToCartMutation,
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
    items: data?.wishlist ?? previousData?.wishlist ?? [],
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
              product_id: productId,
              is_wishlisted: !wasWishlisted,
              wishlist_count: nextIds.length,
            },
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

export function useMoveToCart() {
  const [mutate, { loading }] = useMoveWishlistItemToCartMutation();
  const moveToCart = useCallback(
    (productId: number, productName: string) => {
      void mutate({
        variables: { productId },
        update: (cache, { data }) => {
          if (!data) return;
          cache.writeQuery<CartQuery>({
            query: CartDocument,
            data: { cart: data.moveWishlistItemToCart },
          });
          const ids =
            cache.readQuery<WishlistIdsQuery>({ query: WishlistIdsDocument })
              ?.wishlistIds ?? [];
          cache.writeQuery<WishlistIdsQuery>({
            query: WishlistIdsDocument,
            data: { wishlistIds: ids.filter((id) => id !== productId) },
          });
          const list = cache.readQuery<WishlistQuery>({
            query: WishlistDocument,
          });
          if (list)
            cache.writeQuery<WishlistQuery>({
              query: WishlistDocument,
              data: {
                wishlist: list.wishlist.filter((item) => item.id !== productId),
              },
            });
        },
      })
        .then(() => toast.success(`${productName} moved to your cart`))
        .catch((error: unknown) =>
          toast.error(
            error instanceof Error
              ? error.message
              : "Could not move this piece",
          ),
        );
    },
    [mutate],
  );
  return { moveToCart, isMoving: loading };
}
