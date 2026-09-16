"use client";

import { useClerk } from "@clerk/nextjs";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

import { SignInWall } from "@/features/auth/components/SignInWall";
import { EmptyOrders } from "@/features/orders/components/EmptyOrders";
import { OrderCard } from "@/features/orders/components/OrderCard";
import { useOrders } from "@/features/orders/hooks";
import {
  toOrderPath,
  toStatusLabel,
  toStatusTone,
} from "@/features/orders/types";

export function OrdersListContainer() {
  const [page, setPage] = useState(1);
  const {
    orders,
    pageInfo,
    isLoading,
    isPaging,
    hasError,
    isSignedIn,
    refetch,
  } = useOrders(page);
  const pageCount = pageInfo ? Math.ceil(pageInfo.total / pageInfo.limit) : 1;
  const { openSignIn } = useClerk();

  // The wall is the whole page when it shows, so it carries the h1 rather than
  // sitting under a heading for a list that is not there.
  if (!isLoading && !isSignedIn) {
    return (
      <SignInWall
        message="Sign in to see your orders"
        onSignIn={() => openSignIn()}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 md:px-8 md:py-12">
      <h1 className="font-heading text-3xl md:text-5xl">Your orders</h1>
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2" aria-busy="true">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="h-40 animate-pulse bg-ash" />
          ))}
        </div>
      ) : hasError ? (
        <div className="flex flex-col items-start gap-4 border-t border-ash py-16">
          <h2 className="font-heading text-2xl tracking-tight">
            Your orders did not load
          </h2>
          <p className="max-w-sm text-[15px] text-muted-foreground">
            Something went wrong on our side.
          </p>
          <Button variant="outline" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <>
          <div
            aria-busy={isPaging}
            className={cn(
              "grid gap-4 transition-opacity duration-200 md:grid-cols-2",
              isPaging && "opacity-60",
            )}
          >
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                href={toOrderPath(order.id)}
                orderId={order.id}
                placedOn={formatDate(order.created_at)}
                statusLabel={toStatusLabel(order.status)}
                statusTone={toStatusTone(order.status)}
                total={order.total}
                itemCount={order.item_count}
                imageUrls={order.items
                  .map((item) => item.product_image)
                  .filter((url): url is string => Boolean(url))}
              />
            ))}
          </div>
          {pageInfo && pageInfo.total > pageInfo.limit && (
            <div className="flex items-center justify-center gap-4 border-t border-ash pt-6">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Newer
              </Button>
              <span className="text-sm text-muted-foreground tnum">
                Page {page} of {pageCount}
              </span>
              <Button
                variant="outline"
                disabled={page >= pageCount}
                onClick={() => setPage((current) => current + 1)}
              >
                Older
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
