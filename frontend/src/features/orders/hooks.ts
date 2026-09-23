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

export function useCancelOrder() {
  const [mutate, { loading }] = useMutation(CancelOrderDocument);
  const client = useApolloClient();
  const cancel = useCallback(
    async (id: string, reason: string): Promise<boolean> => {
      try {
        // The reply is the whole order, so Apollo's own normalisation is the new baseline.
        await mutate({ variables: { id, reason: reason.trim() || null } });
        toast.success("Order cancelled");
        return true;
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not cancel the order",
        );
        // A refusal usually means another tab or the studio moved the order, so show where it stands.
        await client
          .refetchQueries({ include: ["Order", "Orders"] })
          .catch(() => undefined);
        return false;
      }
    },
    [client, mutate],
  );
  return { cancel, isCancelling: loading };
}

// Puts a past order back in the cart and says which pieces could not come along.
export function useReorder() {
  const router = useRouter();
  const [mutate, { loading }] = useMutation(ReorderDocument, {
    refetchQueries: ["Cart", "CartCount"],
    awaitRefetchQueries: true,
  });
  const reorder = useCallback(
    async (orderId: string): Promise<void> => {
      try {
        const { data } = await mutate({ variables: { orderId } });
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
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not add these again",
        );
      }
    },
    [mutate, router],
  );
  return { reorder, isReordering: loading };
}
