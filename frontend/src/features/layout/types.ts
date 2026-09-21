export interface NavLink {
  href: string;
  label: string;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/products", label: "Shop" },
  { href: "/custom", label: "Custom" },
  { href: "/workshops", label: "Workshops" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "Our story" },
];

// The mobile sheet carries the full list; the desktop bar keeps the short one.
export const MOBILE_MENU_LINKS: NavLink[] = [
  { href: "/products", label: "Shop" },
  { href: "/archive", label: "Archive" },
  { href: "/custom", label: "Custom" },
  { href: "/workshops", label: "Workshops" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "Our story" },
];

export const FOOTER_SHOP_LINKS: NavLink[] = [
  { href: "/products", label: "All pieces" },
  { href: "/products?sort=NEWEST", label: "New arrivals" },
  { href: "/products?sort=BEST_SELLING", label: "Best sellers" },
  { href: "/custom", label: "Made to order" },
  { href: "/archive", label: "Archive" },
];

export const FOOTER_STUDIO_LINKS: NavLink[] = [
  { href: "/workshops", label: "Book a wheel session" },
  { href: "/events", label: "Workshops and open mics" },
  { href: "/about", label: "Our story" },
  { href: "/contact", label: "Contact" },
];

export const FOOTER_HELP_LINKS: NavLink[] = [
  { href: "/shipping", label: "Shipping and returns" },
  { href: "/care", label: "Caring for pottery" },
  { href: "/faq", label: "FAQ" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

// Matches "/products" and "/products/slug" but not "/products-extra".
export function isActivePath(pathname: string, href: string): boolean {
  const base = href.split("?")[0] ?? href;
  if (base === "/") return pathname === "/";
  return pathname === base || pathname.startsWith(`${base}/`);
}

// The shelf and the archive share a path, so the view decides which of the two rows is lit.
export function isActiveLink(
  pathname: string,
  view: string | null,
  href: string,
): boolean {
  if (!isActivePath(pathname, href)) return false;
  const query = href.split("?")[1];
  const linkView = new URLSearchParams(query ?? "").get("view");
  return (linkView ?? null) === (view || null);
}

// Cart and checkout drop the nav so the only moves are finish or go back.
// Only checkout narrows the header; the cart keeps the full nav so shopping can continue.
export function toFocusedHeader(pathname: string): NavLink | null {
  if (pathname === "/checkout") return { href: "/cart", label: "Back to cart" };
  return null;
}

export function buildWhatsAppUrl(number: string, text: string): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function formatBadgeCount(count: number): string {
  return count > 9 ? "9+" : String(count);
}

// The badge is a number in the corner of an icon; this is what it says out loud.
export function toCartAnnouncement(count: number): string {
  if (count <= 0) return "Your cart is empty";
  return count === 1 ? "1 piece in your cart" : `${count} pieces in your cart`;
}

export function toWishlistAnnouncement(count: number): string {
  if (count <= 0) return "Nothing saved yet";
  return count === 1 ? "1 piece saved" : `${count} pieces saved`;
}

// The prefilled line lives in the wa.me link's text param; that is what gets recorded.
export function toWhatsAppBody(href: string): string | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  const text = url.searchParams.get("text")?.trim() ?? "";
  return text === "" ? null : text;
}
