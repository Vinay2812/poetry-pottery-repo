export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

/** "3 hours · 2 people" reads faster in a row than two columns would. */
export function describeBooking(hours: number, participants: number): string {
  const hourLabel = hours === 1 ? "1 hour" : `${hours} hours`;
  const peopleLabel =
    participants === 1 ? "1 person" : `${participants} people`;
  return `${hourLabel} · ${peopleLabel}`;
}

export function describeItems(count: number): string {
  return count === 1 ? "1 piece" : `${count} pieces`;
}

/** Under three left is worth a nudge; the storefront says the same thing to shoppers. */
export function stockTone(stock: number): "warn" | "quiet" {
  return stock <= 3 ? "warn" : "quiet";
}

export function describeStock(stock: number): string {
  if (stock === 0) return "Sold out";
  return stock === 1 ? "1 left" : `${stock} left`;
}

export function clampDelta(value: number, stock: number): number {
  return Math.max(value, -stock);
}
