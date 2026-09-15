"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";
import { toast } from "sonner";

import {
  OrderDocument,
  type OrderQuery,
  useCancelOrderMutation,
  useOrderQuery,
  useOrdersQuery,
} from "@/graphql/generated/graphql";

// Signed-out visitors get a sign-in prompt instead of an auth error from the API.
export function useOrders(page: number) {
  const { isSignedIn, isLoaded } = useAuth();
  const { data, previousData, loading, error, refetch } = useOrdersQuery({
    variables: { page, limit: 12 },
    skip: !isSignedIn,
    notifyOnNetworkStatusChange: true,
  });
  const result = isSignedIn
    ? (data?.orders ?? previousData?.orders)
    : undefined;
  return {
    orders: result?.items ?? [],
    pageInfo: result?.page_info ?? null,
    isLoading: !isLoaded || (loading && !result),
    hasError: Boolean(error) && !result,
    isSignedIn: Boolean(isSignedIn),
    refetch,
  };
}

export function useOrder(id: string) {
  const { isSignedIn, isLoaded } = useAuth();
  const { data, loading, error, refetch } = useOrderQuery({
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
  const [mutate, { loading }] = useCancelOrderMutation();
  const cancel = useCallback(
    async (id: string, reason: string): Promise<boolean> => {
      try {
        await mutate({
          variables: { id, reason: reason.trim() || null },
          update: (cache, { data }) => {
            if (data)
              cache.writeQuery<OrderQuery>({
                query: OrderDocument,
                variables: { id },
                data: { order: data.cancelOrder },
              });
          },
        });
        toast.success("Order cancelled");
        return true;
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not cancel the order",
        );
        return false;
      }
    },
    [mutate],
  );
  return { cancel, isCancelling: loading };
}
