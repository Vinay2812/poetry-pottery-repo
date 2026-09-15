export interface WishlistToggle {
  productId: number;
  isWishlisted: boolean;
}

// The reducer behind the optimistic id list: one heart in or out, order kept.
export function applyWishlistToggle(
  ids: readonly number[],
  toggle: WishlistToggle,
): number[] {
  if (!toggle.isWishlisted) {
    return ids.filter((id) => id !== toggle.productId);
  }
  return ids.includes(toggle.productId) ? [...ids] : [...ids, toggle.productId];
}
