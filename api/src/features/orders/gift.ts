export const GIFT_NOTE_MAX_LENGTH = 200;

export interface GiftWrapping {
  gift_note: string | null;
  hide_prices: boolean;
}

// The card is handwritten, so the note is trimmed to what fits on one; hiding prices
// is a separate wish and only ever applies to an order the customer called a gift.
export function readGift(
  note: string | null | undefined,
  hidePrices: boolean | null | undefined,
): GiftWrapping {
  const trimmed = note?.trim().slice(0, GIFT_NOTE_MAX_LENGTH) ?? "";
  const isGift = trimmed.length > 0 || hidePrices === true;
  return {
    gift_note: trimmed.length > 0 ? trimmed : null,
    hide_prices: isGift && hidePrices === true,
  };
}
