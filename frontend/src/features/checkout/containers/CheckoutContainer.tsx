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

import { useMutation, useQuery } from "@apollo/client/react";
import {
  CheckoutQuoteDocument,
  PlaceOrderDocument,
  type PlaceOrderInput,
} from "@/graphql/generated/graphql";

import { describeError } from "@/lib/apollo/errors";
import { formatInr } from "@/lib/format";
import { toTermsError } from "@/lib/terms";
import { useOptimisticAction } from "@/lib/use-optimistic-action";

import { PageShell } from "@/components/layout/PageShell";
import { TermsAgreement } from "@/components/legal/TermsAgreement";

import { AddressPickerContainer } from "@/features/addresses";
import { CartLoadFailed, EmptyCart, useCart } from "@/features/cart";
import { toSelectionSummary, toShippingNote } from "@/features/cart/types";
import { CheckoutLayout } from "@/features/checkout/components/CheckoutLayout";
import { CheckoutLineItem } from "@/features/checkout/components/CheckoutLineItem";
import { CheckoutSection } from "@/features/checkout/components/CheckoutSection";
import { CheckoutSkeleton } from "@/features/checkout/components/CheckoutSkeleton";
import { CheckoutSummary } from "@/features/checkout/components/CheckoutSummary";
import { CouponField } from "@/features/checkout/components/CouponField";
import { GiftNoteField } from "@/features/checkout/components/GiftNoteField";
import { OrderNoteField } from "@/features/checkout/components/OrderNoteField";
import {
  toBlockedReason,
  toCouponView,
  toGiftView,
  toQuoteState,
} from "@/features/checkout/types";
import { toOrderPath } from "@/features/orders/types";

export function CheckoutContainer() {
  const router = useRouter();
  const { openSignIn } = useClerk();
  const {
    cart,
    isLoading: isCartLoading,
    hasError: hasCartError,
    isSignedIn,
    resync: resyncCart,
  } = useCart();
  const [addressId, setAddressId] = useState<number | null>(null);
  const [couponDraft, setCouponDraft] = useState("");
  const [isCouponOpen, setIsCouponOpen] = useState(false);
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
        toast.error(describeError(error, "Could not update the coupon"));
      }
    });
  }, []);
  const [note, setNote] = useState("");
  const [isGift, setIsGift] = useState(false);
  const [giftNote, setGiftNote] = useState("");
  const [hasHiddenPrices, setHasHiddenPrices] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [hasTriedPlacing, setHasTriedPlacing] = useState(false);
  const termsRef = useRef<HTMLButtonElement>(null);

  const {
    data: quoteData,
    previousData: previousQuote,
    loading: isQuoting,
    error: quoteError,
    refetch: refetchQuote,
  } = useQuery(CheckoutQuoteDocument, {
    variables: { input: { coupon_code: appliedCoupon } },
    skip: !isSignedIn,
    fetchPolicy: "network-only",
    // The refetch that checked the code already wrote its quote, so committing the
    // code reads that back instead of asking for the same answer a second time.
    nextFetchPolicy: (currentPolicy, { reason }) =>
      reason === "variables-changed" ? "cache-first" : currentPolicy,
  });
  // The current quote is what gets billed; an older one only keeps the totals on screen.
  const currentQuote = quoteData?.checkoutQuote ?? null;
  const quote = currentQuote ?? previousQuote?.checkoutQuote ?? null;
  const quoteState = toQuoteState(
    currentQuote !== null,
    Boolean(quoteError),
    isQuoting,
  );
  const coupon = toCouponView({
    code: optimisticCoupon,
    quoteCode: quote?.coupon_code ?? null,
    quoteDiscount: quote?.discount ?? 0,
  });

  const [placeOrder] = useMutation(PlaceOrderDocument);

  // Placing an order empties the cart, so only the cart and quote mounted here are read again.
  // The orders list is not mounted on checkout and reads cache-and-network when it opens.
  // Set once the order exists, so the emptied cart never flashes before the order page opens.
  const [isPlaced, setIsPlaced] = useState(false);
  const { execute: submitOrder, isPending: isPlacing } = useOptimisticAction({
    run: (input: PlaceOrderInput) => placeOrder({ variables: { input } }),
    refresh: () => Promise.all([resyncCart(), refetchQuote()]),
    messages: { success: null, failure: "Could not place the order" },
    onSuccess: ({ data }) => {
      if (!data) return;
      setIsPlaced(true);
      router.push(`${toOrderPath(data.placeOrder.id)}?placed=1`);
    },
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

  const handleOpenCoupon = useCallback(() => setIsCouponOpen(true), []);

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

  const handleRetryQuote = useCallback(() => {
    // A failed retry leaves the error on the query, which keeps the retry on screen.
    refetchQuote().catch(() => undefined);
  }, [refetchQuote]);

  const handlePlaceOrder = useCallback(() => {
    if (addressId === null || quoteError || !currentQuote) return;
    if (!isTermsAccepted) {
      setHasTriedPlacing(true);
      termsRef.current?.focus();
      return;
    }
    const gift = toGiftView(isGift, giftNote, hasHiddenPrices);
    submitOrder({
      address_id: addressId,
      coupon_code: currentQuote.coupon_code,
      customer_note: note.trim() || null,
      gift_note: gift.gift_note,
      hide_prices: gift.hide_prices,
      expected_total: currentQuote.total,
      accepted_terms: isTermsAccepted,
    });
  }, [
    addressId,
    currentQuote,
    giftNote,
    hasHiddenPrices,
    isGift,
    isTermsAccepted,
    note,
    quoteError,
    submitOrder,
  ]);

  const items = cart?.items.filter((item) => item.is_available) ?? [];
  const availableItemCount = items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const blockedReason = toBlockedReason({
    hasAddress: addressId !== null,
    itemCount: items.length,
    problemCount: currentQuote?.problems.length ?? 0,
    quoteState,
  });

  const shippingFee = quote?.shipping_fee ?? cart?.shipping_fee ?? 0;

  if (isCartLoading || isPlaced) {
    return (
      <PageShell column="wide" className="py-8 md:py-12" isBusy>
        <CheckoutSkeleton />
      </PageShell>
    );
  }

  if (!isSignedIn || !cart || cart.items.length === 0) {
    return (
      <PageShell column="wide" className="flex flex-col gap-6 py-8 md:py-12">
        <h1 className="font-heading text-3xl md:text-5xl">Checkout</h1>
        {isSignedIn && hasCartError && !cart ? (
          <CartLoadFailed onRetry={() => void resyncCart()} />
        ) : (
          <EmptyCart isSignedIn={isSignedIn} onSignIn={() => openSignIn()} />
        )}
      </PageShell>
    );
  }

  return (
    <PageShell column="wide" className="flex flex-col gap-6 py-8 md:py-12">
      <h1 className="font-heading text-3xl md:text-5xl">Checkout</h1>
      <CheckoutLayout
        details={
          <>
            <CheckoutSection title="Deliver to">
              <AddressPickerContainer
                selectedId={addressId}
                onSelect={setAddressId}
              />
            </CheckoutSection>
            <CheckoutSection title="Your pieces">
              <ul className="flex flex-col">
                {items.map((item) => (
                  <CheckoutLineItem
                    key={item.id}
                    name={item.product.name}
                    imageUrl={item.product.image_urls[0] ?? null}
                    quantity={item.quantity}
                    unitPrice={item.unit_price}
                    lineTotal={item.line_total}
                    selectionSummary={toSelectionSummary(item.selections)}
                    referenceImageUrls={item.reference_image_urls}
                  />
                ))}
              </ul>
            </CheckoutSection>
            <CheckoutSection title="Gift and notes">
              <div className="flex flex-col gap-8">
                <GiftNoteField
                  isGift={isGift}
                  note={giftNote}
                  hasHiddenPrices={hasHiddenPrices}
                  onIsGiftChange={setIsGift}
                  onNoteChange={setGiftNote}
                  onHiddenPricesChange={setHasHiddenPrices}
                />
                <OrderNoteField value={note} onChange={setNote} />
              </div>
            </CheckoutSection>
          </>
        }
        summary={
          <CheckoutSummary
            itemCount={quote?.item_count ?? availableItemCount}
            subtotal={quote?.subtotal ?? cart.subtotal}
            discount={coupon.discount}
            couponCode={coupon.code}
            shippingFee={shippingFee}
            shippingNote={toShippingNote(
              shippingFee,
              cart.free_shipping_above,
              formatInr,
            )}
            total={quote?.total ?? cart.total}
            problems={quote?.problems ?? []}
            isDiscountPending={coupon.isPending}
            isQuotePending={isCouponPending}
            canPlaceOrder={
              blockedReason === null &&
              quoteState === "ready" &&
              !isCouponPending
            }
            isPlacing={isPlacing}
            blockedReason={blockedReason}
            onPlaceOrder={handlePlaceOrder}
            onRetryQuote={quoteState === "failed" ? handleRetryQuote : null}
            terms={
              <TermsAgreement
                ref={termsRef}
                id="checkout-terms"
                isChecked={isTermsAccepted}
                error={toTermsError(isTermsAccepted, hasTriedPlacing)}
                hasPaymentNote
                onCheckedChange={setIsTermsAccepted}
              />
            }
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
                isOpen={isCouponOpen}
                onChange={setCouponDraft}
                onApply={handleApplyCoupon}
                onRemove={handleRemoveCoupon}
                onOpen={handleOpenCoupon}
              />
            }
          />
        }
      />
    </PageShell>
  );
}
