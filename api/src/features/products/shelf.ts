// The three facts that decide whether a shopper can put a piece in the cart right now.
export interface ShelfState {
  is_active: boolean;
  stock: number;
  is_customizable: boolean;
}

export const shelfSelect = {
  id: true,
  is_active: true,
  stock: true,
  is_customizable: true,
} as const;

export function isBuyable(piece: ShelfState): boolean {
  return piece.is_active && (piece.is_customizable || piece.stock > 0);
}

// "Back in stock" is the edge from not buyable to buyable, whichever fact moved; topping up a
// shelf that was never bare, or restocking an archived piece, is silent.
export function becameBuyable(before: ShelfState, after: ShelfState): boolean {
  return !isBuyable(before) && isBuyable(after);
}
