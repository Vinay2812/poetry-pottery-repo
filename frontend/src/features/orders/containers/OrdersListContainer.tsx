"use client";

import { useClerk } from "@clerk/nextjs";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import { LoadFailed } from "@/components/layout/LoadFailed";
import { PageShell } from "@/components/layout/PageShell";
import { PastLastPage } from "@/components/layout/PastLastPage";
import { PageTurnFailed } from "@/components/layout/PageTurnFailed";
import { formatDate } from "@/lib/format";
import { isPastLastPage, PAGE_CODEC } from "@/lib/page-turn";
import { useFocusAfterTurn } from "@/lib/use-focus-after-turn";
import { useUrlState } from "@/lib/use-url-state";
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
  const {
    value: page,
    isPending: isTurning,
    dispatch: goToPage,
  } = useUrlState(PAGE_CODEC);
  const {
    orders,
    pageInfo,
    shownPage,
    failedPage,
    isLoading,
    isPaging,
    hasError,
    isSignedIn,
    refetch,
  } = useOrders(page);
  const pageCount = pageInfo ? Math.ceil(pageInfo.total / pageInfo.limit) : 1;
  const { openSignIn } = useClerk();
  const { headingRef, startTurn } = useFocusAfterTurn<HTMLHeadingElement>(
    !isPaging && !isTurning,
    shownPage,
    failedPage,
  );

  // The buttons sit under the list, so a new page starts back at the heading.
  // Asking again for the page that failed reads it again rather than doing nothing.
  const handleTurnPage = useCallback(
    (next: number) => {
      if (next === page) void refetch();
      else goToPage(next, { history: "push" });
      startTurn();
    },
    [goToPage, page, refetch, startTurn],
  );

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
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-heading text-3xl tracking-tight focus:outline-none md:text-5xl"
      >
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
      ) : isPastLastPage(page, orders.length, pageInfo?.total) ? (
        <PastLastPage
          message="There are no orders this far back."
          actionLabel="See your latest orders"
          onLatest={() => handleTurnPage(1)}
        />
      ) : orders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <>
          {/* A page turn scrolls back to the heading, so the notice sits right under it. */}
          {failedPage !== null && (
            <PageTurnFailed
              page={failedPage}
              onRetry={() => handleTurnPage(failedPage)}
            />
          )}
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
                disabled={shownPage <= 1}
                onClick={() => handleTurnPage(shownPage - 1)}
              >
                Newer
              </Button>
              <span className="text-sm text-muted-foreground tnum">
                Page {shownPage} of {pageCount}
              </span>
              <Button
                variant="outline"
                disabled={shownPage >= pageCount}
                onClick={() => handleTurnPage(shownPage + 1)}
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
