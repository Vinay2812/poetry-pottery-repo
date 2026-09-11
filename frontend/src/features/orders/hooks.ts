"use client";

import { useCallback } from "react";
import { toast } from "sonner";

import {
  OrderDocument,
  type OrderQuery,
  useCancelOrderMutation,
  useOrderQuery,
  useOrdersQuery,
} from "@/graphql/generated/graphql";

export function useOrders(page: number) {
  const { data, previousData, loading, error, refetch } = useOrdersQuery({
    variables: { page, limit: 12 },
    notifyOnNetworkStatusChange: true,
  });
  const result = data?.orders ?? previousData?.orders;
  return {
    orders: result?.items ?? [],
    pageInfo: result?.page_info ?? null,
    isLoading: loading && !result,
    hasError: Boolean(error) && !result,
    refetch,
  };
}

export function useOrder(id: string) {
  const { data, loading, error, refetch } = useOrderQuery({
    variables: { id },
  });
  return {
    order: data?.order ?? null,
    isLoading: loading && !data,
    hasError: Boolean(error) && !data,
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
