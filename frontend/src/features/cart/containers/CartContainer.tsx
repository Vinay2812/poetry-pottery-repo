"use client";

import { useClerk } from "@clerk/nextjs";
import { useCallback } from "react";

import { PageShell } from "@/components/layout/PageShell";

import { CartLineItem } from "@/features/cart/components/CartLineItem";
import { CartSummary } from "@/features/cart/components/CartSummary";
import { EmptyCart } from "@/features/cart/components/EmptyCart";
import { FreeShippingNudge } from "@/features/cart/components/FreeShippingNudge";
import { useCart } from "@/features/cart/hooks";
import {
  toMaxQuantity,
  toSelectionSummary,
  toStockNotice,
} from "@/features/cart/types";
import { toProductPath } from "@/features/products/types";
import { useToggleWishlist } from "@/features/wishlist/hooks";

export function CartContainer() {
  const { cart, isLoading, isSignedIn, setQuantity, remove } = useCart();
  const { toggle } = useToggleWishlist();
  const { openSignIn } = useClerk();

  const handleSaveForLater = useCallback(
    (itemId: number, productId: number, productName: string) => {
      toggle(productId, productName, true);
      remove(itemId);
    },
    [remove, toggle],
  );

  if (isLoading) {
    return (
      <PageShell column="wide" className="py-8 md:py-12" isBusy>
        <div className="h-8 w-40 animate-pulse bg-ash" />
        <div className="mt-8 flex flex-col gap-4">
          {[0, 1, 2].map((index) => (
            <div key={index} className="h-28 animate-pulse bg-ash" />
          ))}
        </div>
      </PageShell>
    );
  }

  const items = cart?.items ?? [];
  const available = items.filter((item) => item.is_available);

  return (
    <PageShell column="wide" className="flex flex-col gap-6 py-8 md:py-12">
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
                stockNotice={toStockNotice(
                  item.product.stock,
                  item.product.is_customizable,
                )}
                referenceImageUrls={item.reference_image_urls}
                isAvailable={item.is_available}
                canAdjustQuantity={
                  item.is_available ||
                  (item.product.stock > 0 && item.quantity > item.product.stock)
                }
                unavailableReason={item.unavailable_reason}
                onQuantityChange={(quantity) => setQuantity(item.id, quantity)}
                onRemove={() => remove(item.id)}
                // The wishlist holds a piece, not its choices, so a customised line would lose them.
                onSaveForLater={
                  item.selections.length > 0 ||
                  item.reference_image_urls.length > 0
                    ? null
                    : () =>
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
            {cart && (
              <CartSummary
                meter={
                  cart.free_shipping_above !== null ? (
                    <FreeShippingNudge
                      subtotal={cart.subtotal}
                      threshold={cart.free_shipping_above}
                    />
                  ) : undefined
                }
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
    </PageShell>
  );
}
