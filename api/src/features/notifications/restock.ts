// A piece only "comes out of the kiln" on the edge from nothing to something; every
// other stock move, including topping up a shelf that was not empty, is silent.
export function cameBackInStock(before: number, after: number): boolean {
  return before <= 0 && after > 0;
}
