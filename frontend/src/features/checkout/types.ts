export const GIFT_NOTE_MAX_LENGTH = 200;
// The server keeps the first 500 characters of the order note.
export const ORDER_NOTE_MAX_LENGTH = 500;

export interface GiftView {
  gift_note: string | null;
  hide_prices: boolean;
}

// Unticking "this is a gift" must leave nothing behind on the order.
export function toGiftView(
  isGift: boolean,
  note: string,
  hasHiddenPrices: boolean,
): GiftView {
  if (!isGift) return { gift_note: null, hide_prices: false };
  const trimmed = note.trim().slice(0, GIFT_NOTE_MAX_LENGTH);
  return {
    gift_note: trimmed.length > 0 ? trimmed : null,
    hide_prices: hasHiddenPrices,
  };
}

export interface CouponView {
  code: string | null;
  discount: number;
  isApplied: boolean;
  isPending: boolean;
}

export interface CouponViewInput {
  code: string | null;
  quoteCode: string | null;
  quoteDiscount: number;
}

// The server quote is the baseline: a code shows an amount only once the quote was built with it,
// so an optimistic code reads as pending and a removed one drops to nothing at once.
export function toCouponView({
  code,
  quoteCode,
  quoteDiscount,
}: CouponViewInput): CouponView {
  const isSettled = code !== null && code === quoteCode;
  return {
    code,
    discount: isSettled ? quoteDiscount : 0,
    isApplied: code !== null,
    isPending: code !== null && !isSettled,
  };
}

export type QuoteState = "checking" | "ready" | "failed";

// Only a quote that came back for the current cart and coupon may be billed.
export function toQuoteState(
  hasQuote: boolean,
  hasError: boolean,
  isLoading: boolean,
): QuoteState {
  if (isLoading) return "checking";
  return hasQuote && !hasError ? "ready" : "failed";
}

export interface CheckoutBlockInput {
  hasAddress: boolean;
  itemCount: number;
  problemCount: number;
  quoteState: QuoteState;
}

export const QUOTE_FAILED_REASON = "We could not check your total just now.";

// Why Place order is off, most pressing first; null when nothing stands in the way.
export function toBlockedReason({
  hasAddress,
  itemCount,
  problemCount,
  quoteState,
}: CheckoutBlockInput): string | null {
  if (quoteState === "failed") return QUOTE_FAILED_REASON;
  if (!hasAddress) return "Choose a delivery address to continue.";
  if (itemCount === 0) return "Your cart is empty.";
  if (problemCount > 0) {
    return "Remove the unavailable pieces from your cart first.";
  }
  return null;
}
