export interface AdminNavLink {
  href: string;
  label: string;
}

export const ADMIN_NAV_LINKS: AdminNavLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/pieces", label: "Pieces" },
  { href: "/dashboard/catalog", label: "Categories" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/people", label: "People" },
  { href: "/dashboard/events", label: "Events" },
  { href: "/dashboard/workshops", label: "Workshops" },
  { href: "/dashboard/reviews", label: "Reviews" },
  { href: "/dashboard/content", label: "Content" },
  { href: "/dashboard/coupons", label: "Coupons" },
  { href: "/dashboard/inbox", label: "Inbox" },
];

/** The dashboard root only lights up on an exact match; every other section owns its subtree. */
export function isNavLinkActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type QueryValues = Record<string, string>;

export type QueryPatch = Record<string, string | null>;

export function readQueryValues(search: URLSearchParams): QueryValues {
  const values: QueryValues = {};
  for (const [key, value] of search.entries()) {
    if (value !== "") values[key] = value;
  }
  return values;
}

/** Every change but an explicit page move sends the list back to page one. */
export function applyQueryPatch(
  values: QueryValues,
  patch: QueryPatch,
): QueryValues {
  const next: QueryValues = { ...values };
  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === "") {
      delete next[key];
    } else {
      next[key] = value;
    }
  }
  if (!("page" in patch)) {
    delete next.page;
  }
  return next;
}

export function toQueryString(values: QueryValues): string {
  const search = new URLSearchParams();
  for (const key of Object.keys(values).sort()) {
    search.set(key, values[key]);
  }
  return search.toString();
}

export function readPage(values: QueryValues): number {
  const page = Number.parseInt(values.page ?? "", 10);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

/** Turns a GraphQL enum member into console copy: OPEN_MIC becomes "Open mic". */
export function formatEnumLabel(value: string): string {
  const words = value.toLowerCase().split("_").filter(Boolean);
  if (words.length === 0) return "";
  return words.join(" ").replace(/^./, (first) => first.toUpperCase());
}

export function formatRange(
  page: number,
  limit: number,
  total: number,
): string {
  if (total === 0) return "Nothing here yet";
  const first = (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);
  return `${first}–${last} of ${total}`;
}
