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

const LOW_STOCK_THRESHOLD = 3;

// Said only when it changes a decision: a batch nearly gone is worth knowing before checkout.
export function toStockNotice(
  stock: number,
  isCustomizable: boolean,
): string | null {
  if (isCustomizable || stock <= 0 || stock > LOW_STOCK_THRESHOLD) return null;
  return stock === 1 ? "Only 1 left" : `Only ${stock} left`;
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

// A quiet fact under the shipping row, never a meter: said only while a fee applies. The server
// ships free once the subtotal reaches the threshold, so the amount itself qualifies.
export function toShippingNote(
  shippingFee: number,
  freeShippingAbove: number | null,
  format: (amount: number) => string,
): string | null {
  if (
    shippingFee === 0 ||
    freeShippingAbove === null ||
    freeShippingAbove <= 0
  ) {
    return null;
  }
  return `Free on orders of ${format(freeShippingAbove)} or more.`;
}

export type CartData = CartFieldsFragment;

// Both the badge and the lines are server-owned totals, so every write reads them back.
export const CART_QUERIES = ["Cart", "CartCount"];

export type CartAction =
  | { kind: "quantity"; id: number; quantity: number }
  | { kind: "remove"; id: number }
  | { kind: "clear" };

// Re-totals the cart the way the server does, so the summary moves with the stepper.
// When the shipping fee cannot be worked out from what the cart reports, nothing moves and
// the server answers instead.
export function applyCartAction(
  cart: CartData | null,
  action: CartAction,
): CartData | null {
  if (!cart) return cart;
  const items =
    action.kind === "clear"
      ? []
      : action.kind === "remove"
        ? cart.items.filter((item) => item.id !== action.id)
        : cart.items
            .map((item) =>
              item.id === action.id
                ? {
                    ...item,
                    quantity: action.quantity,
                    line_total: item.unit_price * action.quantity,
                  }
                : item,
            )
            .filter((item) => item.quantity > 0);

  const subtotal = items
    .filter((item) => item.is_available)
    .reduce((sum, item) => sum + item.line_total, 0);
  if (!canPredictShipping(cart.subtotal, subtotal, cart.free_shipping_above)) {
    return cart;
  }
  const shippingFee =
    subtotal === 0 ||
    (cart.free_shipping_above !== null && subtotal >= cart.free_shipping_above)
      ? 0
      : cart.shipping_fee;
  return {
    ...cart,
    items,
    item_count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    shipping_fee: shippingFee,
    total: subtotal + shippingFee,
  };
}
