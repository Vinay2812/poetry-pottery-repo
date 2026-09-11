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
