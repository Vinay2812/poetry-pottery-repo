export interface AdminNavLink {
  href: string;
  label: string;
}

export const ADMIN_NAV_LINKS: AdminNavLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/pieces", label: "Pieces" },
  { href: "/dashboard/catalog", label: "Categories" },
  { href: "/dashboard/glazes", label: "Glazes" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/people", label: "People" },
  { href: "/dashboard/events", label: "Events" },
  { href: "/dashboard/workshops", label: "Wheel sessions" },
  { href: "/dashboard/visits", label: "Visits" },
  { href: "/dashboard/commissions", label: "Commissions" },
  { href: "/dashboard/reviews", label: "Reviews" },
  { href: "/dashboard/content", label: "Content" },
  { href: "/dashboard/coupons", label: "Coupons" },
  { href: "/dashboard/inbox", label: "Inbox" },
  { href: "/dashboard/notifications", label: "Waiting list" },
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

export function toPageNumber(raw: string | undefined): number {
  const page = Number.parseInt(raw ?? "", 10);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function readPage(values: QueryValues): number {
  return toPageNumber(values.page);
}

/** Turns a GraphQL enum member into console copy: OPEN_MIC becomes "Open mic". */
export function formatEnumLabel(value: string): string {
  const words = value.toLowerCase().split("_").filter(Boolean);
  if (words.length === 0) return "";
  return words.join(" ").replace(/^./, (first) => first.toUpperCase());
}

// A page with no rows on it (an empty list, or one past the end) shows no count line.
export function formatRange(
  page: number,
  limit: number,
  total: number,
): string | null {
  const first = (page - 1) * limit + 1;
  if (first > total) return null;
  const last = Math.min(page * limit, total);
  return `${first}–${last} of ${total}`;
}

// A page past the end (rows approved away under it, or a stale link) steps back to the last real page.
export function toPreviousPage(
  page: number,
  limit: number,
  total: number,
): number {
  return Math.max(1, Math.min(page - 1, Math.ceil(total / limit)));
}

// A dirty editor holds in-app navigation and asks first; a clean one lets the link go.
export function toGuardedNavigate(
  isLeaveGuarded: boolean,
  href: string,
  onGuardedLeave: (href: string) => void,
): (event: { preventDefault: () => void }) => void {
  return (event) => {
    if (!isLeaveGuarded) return;
    event.preventDefault();
    onGuardedLeave(href);
  };
}
