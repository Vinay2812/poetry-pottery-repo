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
