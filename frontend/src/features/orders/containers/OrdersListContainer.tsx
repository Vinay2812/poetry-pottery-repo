"use client";

import { useClerk } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { LoadFailed } from "@/components/layout/LoadFailed";
import { PageShell } from "@/components/layout/PageShell";
import { formatDate } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { cn } from "@/lib/utils";

import { SignInWall } from "@/features/auth/components/SignInWall";
import { EmptyOrders } from "@/features/orders/components/EmptyOrders";
import { OrderCard } from "@/features/orders/components/OrderCard";
import { useOrders } from "@/features/orders/hooks";
import {
  ORDERS_PAGE_CODEC,
  toOrderPath,
  toStatusLabel,
  toStatusTone,
} from "@/features/orders/types";

export function OrdersListContainer() {
  const {
    value: page,
    isPending: isTurning,
    dispatch: goToPage,
  } = useUrlState(ORDERS_PAGE_CODEC);
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
    <PageShell column="wide" className="flex flex-col gap-6 py-8 md:py-12">
      <h1 className="font-heading text-3xl tracking-tight md:text-5xl">
        Your orders
      </h1>
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2" aria-busy="true">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="h-40 animate-pulse bg-ash" />
          ))}
        </div>
      ) : hasError ? (
        <LoadFailed
          heading="Your orders did not load"
          onRetry={() => void refetch()}
        />
      ) : orders.length === 0 && page > 1 ? (
        <div className="flex flex-col items-start gap-4 border-t border-ash py-16">
          <p className="text-[15px] text-muted-foreground">
            There are no orders this far back.
          </p>
          <Button variant="outline" onClick={() => goToPage(1)}>
            See your latest orders
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <>
          <div
            aria-busy={isPaging || isTurning}
            className={cn(
              "grid gap-4 transition-opacity duration-200 md:grid-cols-2",
              (isPaging || isTurning) && "opacity-60",
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
          {pageCount > 1 && (
            <nav
              aria-label="Order pages"
              className="flex items-center justify-center gap-4 border-t border-ash pt-6"
            >
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
              >
                Newer
              </Button>
              <span className="text-sm text-muted-foreground tnum">
                Page {page} of {pageCount}
              </span>
              <Button
                variant="outline"
                disabled={page >= pageCount}
                onClick={() => goToPage(page + 1)}
              >
                Older
              </Button>
            </nav>
          )}
        </>
      )}
    </PageShell>
  );
}
