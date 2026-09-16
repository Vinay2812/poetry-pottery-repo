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

export interface FreeShippingProgress {
  hasEarnedIt: boolean;
  percent: number;
  label: string;
}

// One sentence and one number, so the meter never has to be read off a bar.
export function toFreeShippingProgress(
  subtotal: number,
  threshold: number,
  format: (amount: number) => string,
): FreeShippingProgress {
  const remaining = Math.max(0, threshold - subtotal);
  if (threshold <= 0 || remaining === 0) {
    return {
      hasEarnedIt: true,
      percent: 100,
      label: "Shipping is free on this order.",
    };
  }
  return {
    hasEarnedIt: false,
    percent: Math.min(
      100,
      Math.max(0, Math.round((subtotal / threshold) * 100)),
    ),
    label: `${format(remaining)} more for free shipping.`,
  };
}

export type CartData = CartFieldsFragment;

// Both the badge and the lines are server-owned totals, so every write reads them back.
export const CART_REFETCH = {
  refetchQueries: ["Cart", "CartCount"],
  awaitRefetchQueries: true,
};

export function toCartErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}

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
