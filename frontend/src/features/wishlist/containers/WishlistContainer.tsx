"use client";

import { useClerk } from "@clerk/nextjs";

import { ProductCardContainer } from "@/features/products/containers/ProductCardContainer";
import { ProductCardSkeleton } from "@/features/products/components/ProductCardSkeleton";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { EmptyWishlist } from "@/features/wishlist/components/EmptyWishlist";
import { useWishlist } from "@/features/wishlist/hooks";

export function WishlistContainer() {
  const { items, isLoading, isSignedIn } = useWishlist();
  const { openSignIn } = useClerk();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8 md:py-12">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl md:text-5xl">Saved pieces</h1>
        {items.length > 0 && (
          <p className="text-[15px] text-muted-foreground">
            {items.length} {items.length === 1 ? "piece" : "pieces"} kept for
            later.
          </p>
        )}
      </div>
      {isLoading ? (
        <ProductGrid>
          {[0, 1, 2, 3].map((index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </ProductGrid>
      ) : items.length === 0 ? (
        <EmptyWishlist isSignedIn={isSignedIn} onSignIn={() => openSignIn()} />
      ) : (
        <ProductGrid>
          {items.map((product) => (
            <ProductCardContainer key={product.id} product={product} />
          ))}
        </ProductGrid>
      )}
    </div>
  );
}
