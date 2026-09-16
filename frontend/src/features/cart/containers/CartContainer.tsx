"use client";

import { useClerk } from "@clerk/nextjs";
import { useCallback } from "react";

import { CartLineItem } from "@/features/cart/components/CartLineItem";
import { CartSummary } from "@/features/cart/components/CartSummary";
import { EmptyCart } from "@/features/cart/components/EmptyCart";
import { FreeShippingNudge } from "@/features/cart/components/FreeShippingNudge";
import { useCart } from "@/features/cart/hooks";
import { toMaxQuantity, toSelectionSummary } from "@/features/cart/types";
import { toProductPath } from "@/features/products/types";
import { useToggleWishlist, useWishlistIds } from "@/features/wishlist/hooks";

export function CartContainer() {
  const { cart, isLoading, isSignedIn, setQuantity, remove } = useCart();
  const { toggle } = useToggleWishlist();
  const { isWishlisted } = useWishlistIds();
  const { openSignIn } = useClerk();

  const handleSaveForLater = useCallback(
    (itemId: number, productId: number, productName: string) => {
      if (!isWishlisted(productId)) toggle(productId, productName);
      remove(itemId);
    },
    [isWishlisted, remove, toggle],
  );

  if (isLoading) {
    return (
      <div
        className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-12"
        aria-busy="true"
      >
        <div className="h-8 w-40 animate-pulse bg-ash" />
        <div className="mt-8 flex flex-col gap-4">
          {[0, 1, 2].map((index) => (
            <div key={index} className="h-28 animate-pulse bg-ash" />
          ))}
        </div>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const available = items.filter((item) => item.is_available);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8 md:py-12">
      <h1 className="font-heading text-3xl md:text-5xl">Your cart</h1>
      {items.length === 0 ? (
        <EmptyCart isSignedIn={isSignedIn} onSignIn={() => openSignIn()} />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <ul className="border-t border-ash">
            {items.map((item) => (
              <CartLineItem
                key={item.id}
                href={toProductPath(item.product.slug)}
                name={item.product.name}
                imageUrl={item.product.image_urls[0] ?? null}
                unitPrice={item.unit_price}
                lineTotal={item.line_total}
                quantity={item.quantity}
                maxQuantity={toMaxQuantity(
                  item.product.stock,
                  item.product.is_customizable,
                )}
                selectionSummary={toSelectionSummary(item.selections)}
                referenceImageUrls={item.reference_image_urls}
                isAvailable={item.is_available}
                canAdjustQuantity={
                  item.is_available ||
                  (item.product.stock > 0 && item.quantity > item.product.stock)
                }
                unavailableReason={item.unavailable_reason}
                onQuantityChange={(quantity) => setQuantity(item.id, quantity)}
                onRemove={() => remove(item.id)}
                onSaveForLater={() =>
                  handleSaveForLater(
                    item.id,
                    item.product.id,
                    item.product.name,
                  )
                }
              />
            ))}
          </ul>
          <div className="flex flex-col gap-8 lg:sticky lg:top-24">
            {cart && cart.free_shipping_above !== null && (
              <FreeShippingNudge
                subtotal={cart.subtotal}
                threshold={cart.free_shipping_above}
              />
            )}
            {cart && (
              <CartSummary
                subtotal={cart.subtotal}
                shippingFee={cart.shipping_fee}
                total={cart.total}
                itemCount={available.reduce(
                  (sum, item) => sum + item.quantity,
                  0,
                )}
                canCheckout={available.length > 0}
                checkoutHref="/checkout"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
