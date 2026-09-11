"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import {
  CartDocument,
  type CartQuery,
  useCheckoutQuoteQuery,
  usePlaceOrderMutation,
} from "@/graphql/generated/graphql";

import { AddressPickerContainer } from "@/features/addresses";
import { EmptyCart } from "@/features/cart/components/EmptyCart";
import { useCart } from "@/features/cart/hooks";
import { toSelectionSummary } from "@/features/cart/types";
import { CheckoutLineItem } from "@/features/checkout/components/CheckoutLineItem";
import { CheckoutSummary } from "@/features/checkout/components/CheckoutSummary";
import { CouponField } from "@/features/checkout/components/CouponField";
import { OrderNoteField } from "@/features/checkout/components/OrderNoteField";
import { toOrderPath } from "@/features/orders/types";

export function CheckoutContainer() {
  const router = useRouter();
  const { openSignIn } = useClerk();
  const { cart, isLoading: isCartLoading, isSignedIn } = useCart();
  const [addressId, setAddressId] = useState<number | null>(null);
  const [couponDraft, setCouponDraft] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const {
    data: quoteData,
    previousData: previousQuote,
    loading: isQuoting,
  } = useCheckoutQuoteQuery({
    variables: { input: { coupon_code: appliedCoupon } },
    skip: !isSignedIn,
    fetchPolicy: "network-only",
  });
  const quote =
    quoteData?.checkoutQuote ?? previousQuote?.checkoutQuote ?? null;
  const isCouponApplied = Boolean(
    appliedCoupon && quote?.coupon_code === appliedCoupon,
  );

  const [placeOrder, { loading: isPlacing }] = usePlaceOrderMutation({
    update: (cache, { data }) => {
      if (!data) return;
      const current = cache.readQuery<CartQuery>({ query: CartDocument });
      if (current) {
        cache.writeQuery<CartQuery>({
          query: CartDocument,
          data: {
            cart: {
              ...current.cart,
              items: [],
              item_count: 0,
              subtotal: 0,
              shipping_fee: 0,
              total: 0,
            },
          },
        });
      }
    },
  });

  const handleApplyCoupon = useCallback(() => {
    const code = couponDraft.trim().toUpperCase();
    if (code) setAppliedCoupon(code);
  }, [couponDraft]);
  const handleRemoveCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponDraft("");
  }, []);

  const handlePlaceOrder = useCallback(() => {
    if (addressId === null) return;
    void placeOrder({
      variables: {
        input: {
          address_id: addressId,
          coupon_code: isCouponApplied ? appliedCoupon : null,
          customer_note: note.trim() || null,
        },
      },
    })
      .then(({ data }) => {
        if (data) router.push(`${toOrderPath(data.placeOrder.id)}?placed=1`);
      })
      .catch((error: unknown) =>
        toast.error(
          error instanceof Error ? error.message : "Could not place the order",
        ),
      );
  }, [addressId, appliedCoupon, isCouponApplied, note, placeOrder, router]);

  const items = cart?.items.filter((item) => item.is_available) ?? [];
  const blockedReason =
    addressId === null
      ? "Choose a delivery address to continue."
      : items.length === 0
        ? "Your cart is empty."
        : quote && quote.problems.length > 0
          ? "Remove the unavailable pieces from your cart first."
          : null;

  if (isCartLoading) {
    return (
      <div
        className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8"
        aria-busy="true"
      >
        <div className="h-8 w-40 animate-pulse rounded-full bg-primary-light" />
        <div className="mt-8 h-64 animate-pulse rounded-3xl bg-primary-light/70" />
      </div>
    );
  }

  if (!isSignedIn || (cart?.items.length ?? 0) === 0) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
        <h1 className="font-heading text-3xl md:text-5xl">Checkout</h1>
        <EmptyCart isSignedIn={isSignedIn} onSignIn={() => openSignIn()} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <h1 className="font-heading text-3xl md:text-5xl">Checkout</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <h2 className="text-xs font-semibold tracking-[0.12em] text-clay-dark uppercase">
              1 · Deliver to
            </h2>
            <AddressPickerContainer
              selectedId={addressId}
              onSelect={setAddressId}
            />
          </section>
          <section className="flex flex-col gap-4">
            <h2 className="text-xs font-semibold tracking-[0.12em] text-clay-dark uppercase">
              2 · Your pieces
            </h2>
            <ul className="divide-y divide-border rounded-3xl bg-card px-5 shadow-soft">
              {items.map((item) => (
                <CheckoutLineItem
                  key={item.id}
                  name={item.product.name}
                  imageUrl={item.product.image_urls[0] ?? null}
                  quantity={item.quantity}
                  lineTotal={item.line_total}
                  selectionSummary={toSelectionSummary(item.selections)}
                />
              ))}
            </ul>
            <OrderNoteField value={note} onChange={setNote} />
          </section>
        </div>
        <div className="lg:sticky lg:top-24">
          <CheckoutSummary
            itemCount={quote?.item_count ?? cart?.item_count ?? 0}
            subtotal={quote?.subtotal ?? cart?.subtotal ?? 0}
            discount={quote?.discount ?? 0}
            couponCode={isCouponApplied ? appliedCoupon : null}
            shippingFee={quote?.shipping_fee ?? cart?.shipping_fee ?? 0}
            total={quote?.total ?? cart?.total ?? 0}
            problems={quote?.problems ?? []}
            canPlaceOrder={blockedReason === null && !isQuoting}
            isPlacing={isPlacing}
            blockedReason={blockedReason}
            onPlaceOrder={handlePlaceOrder}
            coupon={
              <CouponField
                value={couponDraft}
                message={appliedCoupon ? (quote?.coupon_message ?? null) : null}
                isApplied={isCouponApplied}
                isChecking={isQuoting && Boolean(appliedCoupon)}
                onChange={setCouponDraft}
                onApply={handleApplyCoupon}
                onRemove={handleRemoveCoupon}
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
