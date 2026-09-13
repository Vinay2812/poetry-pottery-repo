import type { CartFieldsFragment } from "@/graphql/generated/graphql";

type CartSelection = CartFieldsFragment["items"][number]["selections"][number];

export function toSelectionSummary(selections: CartSelection[]): string | null {
  if (selections.length === 0) return null;
  return selections
    .map(
      (selection) =>
        `${selection.group_name}: ${selection.text ?? selection.option_name ?? ""}`,
    )
    .join(" · ");
}

export function toMaxQuantity(
  stock: number,
  isCustomizable: boolean,
  cap = 10,
): number {
  return isCustomizable ? cap : Math.max(1, Math.min(cap, stock));
}

// The cart only reports the fee it is charging, so a cart that already ships free hides the
// flat fee. Guessing it would show the wrong total for a frame when the subtotal drops back
// under the threshold, so the optimistic update is skipped and the server answers instead.
export function canPredictShipping(
  currentSubtotal: number,
  nextSubtotal: number,
  freeShippingAbove: number | null,
): boolean {
  if (freeShippingAbove === null) return true;
  const shipsFreeNow = currentSubtotal >= freeShippingAbove;
  const shipsFreeNext = nextSubtotal <= 0 || nextSubtotal >= freeShippingAbove;
  return !shipsFreeNow || shipsFreeNext;
}
