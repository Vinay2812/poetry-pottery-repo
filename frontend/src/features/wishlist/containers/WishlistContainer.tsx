"use client";

import { useClerk } from "@clerk/nextjs";

import { LoadFailed } from "@/components/layout/LoadFailed";
import { PageShell } from "@/components/layout/PageShell";
import { pluralize } from "@/lib/format";

import { ProductCardContainer } from "@/features/products/containers/ProductCardContainer";
import { ProductCardSkeleton } from "@/features/products/components/ProductCardSkeleton";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { EmptyWishlist } from "@/features/wishlist/components/EmptyWishlist";
import { useWishlist } from "@/features/wishlist/hooks";

export function WishlistContainer() {
  const { items, isLoading, hasError, isSignedIn, refetch } = useWishlist();
  const { openSignIn } = useClerk();

  return (
    <PageShell className="flex flex-col gap-6 py-8 md:py-12">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl tracking-tight md:text-5xl">
          Saved pieces
        </h1>
        {items.length > 0 && (
          <p className="text-[15px] text-muted-foreground">
            {pluralize(items.length, "piece")} kept for later.
          </p>
        )}
      </div>
      {isLoading ? (
        <ProductGrid>
          {[0, 1, 2, 3].map((index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </ProductGrid>
      ) : hasError ? (
        <LoadFailed
          heading="Your saved pieces did not load"
          onRetry={() => void refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyWishlist isSignedIn={isSignedIn} onSignIn={() => openSignIn()} />
      ) : (
        <ProductGrid>
          {items.map((product) => (
            <ProductCardContainer key={product.id} product={product} />
          ))}
        </ProductGrid>
      )}
    </PageShell>
  );
}
