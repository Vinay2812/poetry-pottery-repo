"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

import {
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
import { toCouponView } from "@/features/checkout/types";
import { toOrderPath } from "@/features/orders/types";

export function CheckoutContainer() {
  const router = useRouter();
  const { openSignIn } = useClerk();
  const { cart, isLoading: isCartLoading, isSignedIn } = useCart();
  const [addressId, setAddressId] = useState<number | null>(null);
  const [couponDraft, setCouponDraft] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  // The code shows on the summary straight away; the quote that comes back decides whether it stays.
  const [optimisticCoupon, applyOptimisticCoupon] =
    useOptimistic(appliedCoupon);
  const [isCouponPending, startCouponUpdate] = useTransition();
  // Only the newest coupon check may commit; a late reply from an earlier one is dropped.
  const couponRequestId = useRef(0);
  // A failed quote refetch must end in a toast, not in the route's error boundary.
  const startCouponTransition = useCallback((action: () => Promise<void>) => {
    startCouponUpdate(async () => {
      try {
        await action();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not update the coupon",
        );
      }
    });
  }, []);
  const [note, setNote] = useState("");

  const {
    data: quoteData,
    previousData: previousQuote,
    loading: isQuoting,
    refetch: refetchQuote,
  } = useCheckoutQuoteQuery({
    variables: { input: { coupon_code: appliedCoupon } },
    skip: !isSignedIn,
    fetchPolicy: "network-only",
    // The refetch that checked the code already wrote its quote, so committing the
    // code reads that back instead of asking for the same answer a second time.
    nextFetchPolicy: (currentPolicy, { reason }) =>
      reason === "variables-changed" ? "cache-first" : currentPolicy,
  });
  const quote =
    quoteData?.checkoutQuote ?? previousQuote?.checkoutQuote ?? null;
  const coupon = toCouponView({
    code: optimisticCoupon,
    quoteCode: quote?.coupon_code ?? null,
    quoteDiscount: quote?.discount ?? 0,
  });

  // Placing an order empties the cart and adds a row to the orders list; both are fetched again.
  // A refetch that fails must not swallow an order the server already saved.
  const [placeOrder, { loading: isPlacing }] = usePlaceOrderMutation({
    refetchQueries: ["Cart", "Orders"],
    awaitRefetchQueries: true,
    onQueryUpdated: (query) =>
      query
        .refetch()
        .retain()
        .catch(() => {
          toast.warning("Order saved, but your account could not refresh.");
        }),
  });

  const handleApplyCoupon = useCallback(() => {
    const code = couponDraft.trim().toUpperCase();
    if (!code || code === appliedCoupon) return;
    const requestId = ++couponRequestId.current;
    startCouponTransition(async () => {
      applyOptimisticCoupon(code);
      const { data } = await refetchQuote({ input: { coupon_code: code } });
      if (couponRequestId.current !== requestId) return;
      const checked = data?.checkoutQuote;
      if (checked?.coupon_code === code) {
        setAppliedCoupon(code);
        return;
      }
      toast.error(checked?.coupon_message ?? `${code} did not work`);
      await refetchQuote({ input: { coupon_code: appliedCoupon } });
    });
  }, [
    appliedCoupon,
    applyOptimisticCoupon,
    couponDraft,
    refetchQuote,
    startCouponTransition,
  ]);

  const handleRemoveCoupon = useCallback(() => {
    const requestId = ++couponRequestId.current;
    startCouponTransition(async () => {
      applyOptimisticCoupon(null);
      setCouponDraft("");
      await refetchQuote({ input: { coupon_code: null } });
      if (couponRequestId.current !== requestId) return;
      setAppliedCoupon(null);
    });
  }, [applyOptimisticCoupon, refetchQuote, startCouponTransition]);

  const handlePlaceOrder = useCallback(() => {
    if (addressId === null) return;
    void placeOrder({
      variables: {
        input: {
          address_id: addressId,
          coupon_code: quote?.coupon_code ?? null,
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
  }, [addressId, note, placeOrder, quote, router]);

  const items = cart?.items.filter((item) => item.is_available) ?? [];
  const availableItemCount = items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
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
        className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-12"
        aria-busy="true"
      >
        <div className="h-8 w-40 animate-pulse bg-ash" />
        <div className="mt-8 h-64 animate-pulse bg-ash" />
      </div>
    );
  }

  if (!isSignedIn || (cart?.items.length ?? 0) === 0) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8 md:py-12">
        <h1 className="font-heading text-3xl md:text-5xl">Checkout</h1>
        <EmptyCart isSignedIn={isSignedIn} onSignIn={() => openSignIn()} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8 md:py-12">
      <h1 className="font-heading text-3xl md:text-5xl">Checkout</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <h2 className="border-b border-ash pb-3 font-heading text-xl tracking-tight">
              Deliver to
            </h2>
            <AddressPickerContainer
              selectedId={addressId}
              onSelect={setAddressId}
            />
          </section>
          <section className="flex flex-col gap-4">
            <h2 className="border-b border-ash pb-3 font-heading text-xl tracking-tight">
              Your pieces
            </h2>
            <ul className="flex flex-col">
              {items.map((item) => (
                <CheckoutLineItem
                  key={item.id}
                  name={item.product.name}
                  imageUrl={item.product.image_urls[0] ?? null}
                  quantity={item.quantity}
                  lineTotal={item.line_total}
                  selectionSummary={toSelectionSummary(item.selections)}
                  referenceImageUrls={item.reference_image_urls}
                />
              ))}
            </ul>
            <OrderNoteField value={note} onChange={setNote} />
          </section>
        </div>
        <div className="lg:sticky lg:top-24">
          <CheckoutSummary
            itemCount={quote?.item_count ?? availableItemCount}
            subtotal={quote?.subtotal ?? cart?.subtotal ?? 0}
            discount={coupon.discount}
            couponCode={coupon.code}
            shippingFee={quote?.shipping_fee ?? cart?.shipping_fee ?? 0}
            total={quote?.total ?? cart?.total ?? 0}
            problems={quote?.problems ?? []}
            isDiscountPending={coupon.isPending}
            isQuotePending={isCouponPending}
            canPlaceOrder={
              blockedReason === null && !isQuoting && !isCouponPending
            }
            isPlacing={isPlacing}
            blockedReason={blockedReason}
            onPlaceOrder={handlePlaceOrder}
            coupon={
              <CouponField
                value={couponDraft}
                message={
                  coupon.isApplied && !coupon.isPending
                    ? (quote?.coupon_message ?? null)
                    : null
                }
                isApplied={coupon.isApplied}
                isChecking={isCouponPending}
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
