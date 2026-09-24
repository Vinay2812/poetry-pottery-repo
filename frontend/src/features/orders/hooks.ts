"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import {
  CancelOrderDocument,
  OrderDocument,
  OrdersDocument,
  ReorderDocument,
} from "@/graphql/generated/graphql";

import { useOptimisticAction } from "@/lib/use-optimistic-action";

import { CART_QUERIES } from "@/features/cart/types";
import type { OrderCancellation } from "@/features/orders/types";

const ORDER_QUERIES = ["Order", "Orders"];

interface CancelRequest {
  id: string;
  reason: string;
}

// Signed-out visitors get a sign-in prompt instead of an auth error from the API.
export function useOrders(page: number) {
  const { isSignedIn, isLoaded } = useAuth();
  const { data, previousData, loading, error, refetch } = useQuery(
    OrdersDocument,
    {
      variables: { page, limit: 12 },
      skip: !isSignedIn,
      // An order placed while this list was unmounted must not leave a stale page behind.
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: true,
    },
  );
  const result = isSignedIn
    ? (data?.orders ?? previousData?.orders)
    : undefined;
  return {
    orders: result?.items ?? [],
    pageInfo: result?.page_info ?? null,
    isLoading: !isLoaded || (loading && !result),
    isPaging: loading && Boolean(result),
    hasError: Boolean(error) && !result,
    isSignedIn: Boolean(isSignedIn),
    refetch,
  };
}

export function useOrder(id: string) {
  const { isSignedIn, isLoaded } = useAuth();
  const { data, loading, error, refetch } = useQuery(OrderDocument, {
    variables: { id },
    skip: !isSignedIn,
  });
  return {
    order: isSignedIn ? (data?.order ?? null) : null,
    isLoading: !isLoaded || (loading && !data),
    hasError: Boolean(error) && !data,
    isSignedIn: Boolean(isSignedIn),
    refetch,
  };
}

// The reply is the whole order, so Apollo's own normalisation is the new baseline; the read-back
// also catches a refusal that means another tab or the studio moved the order.
export function useCancelOrder(
  applyCancellation?: (cancellation: OrderCancellation) => void,
) {
  const [mutate] = useMutation(CancelOrderDocument);
  const client = useApolloClient();
  const { execute, isPending } = useOptimisticAction({
    patch: (request: CancelRequest) =>
      applyCancellation?.({
        reason: request.reason,
        at: new Date().toISOString(),
      }),
    run: (request) =>
      mutate({
        variables: { id: request.id, reason: request.reason.trim() || null },
      }),
    refresh: () => client.refetchQueries({ include: ORDER_QUERIES }),
    messages: {
      success: "Order cancelled",
      failure: "Could not cancel the order",
    },
  });
  const cancel = useCallback(
    (id: string, reason: string) => execute({ id, reason }),
    [execute],
  );
  return { cancel, isCancelling: isPending };
}

// Puts a past order back in the cart and says which pieces could not come along.
export function useReorder() {
  const router = useRouter();
  const client = useApolloClient();
  const [mutate] = useMutation(ReorderDocument);
  const { execute: reorder, isPending: isReordering } = useOptimisticAction({
    run: (orderId: string) => mutate({ variables: { orderId } }),
    refresh: () => client.refetchQueries({ include: CART_QUERIES }),
    messages: { success: null, failure: "Could not add these again" },
    onSuccess: ({ data }) => {
      const skipped = data?.reorder.skipped ?? [];
      const added = data?.reorder.cart.item_count ?? 0;
      if (added === 0) {
        toast.error("None of these pieces are on the shelf right now");
        return;
      }
      if (skipped.length > 0) {
        toast.warning(`Back in your cart, except ${skipped.join(", ")}`);
      } else {
        toast.success("Back in your cart");
      }
      router.push("/cart");
    },
  });
  return { reorder, isReordering };
}
