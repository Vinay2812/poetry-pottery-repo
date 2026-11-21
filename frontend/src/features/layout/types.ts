// Pages that sit content under the sticky SiteHeader find its live edge through this.
export const SITE_HEADER_SELECTOR = "[data-site-header]";

export interface NavLink {
  href: string;
  label: string;
}

// Labels follow the pages they open: /workshops books a wheel session, /events lists workshops and open mics.
export const NAV_LINKS: NavLink[] = [
  { href: "/products", label: "Shop" },
  { href: "/custom", label: "Made to order" },
  { href: "/workshops", label: "Wheel sessions" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "Our story" },
];

// The mobile sheet carries the full list; the desktop bar keeps the short one.
export const MOBILE_MENU_LINKS: NavLink[] = [
  { href: "/products", label: "Shop" },
  { href: "/archive", label: "Archive" },
  { href: "/custom", label: "Made to order" },
  { href: "/workshops", label: "Wheel sessions" },
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
];

// Small print, so it sits on the copyright line rather than in a column.
export const FOOTER_LEGAL_LINKS: NavLink[] = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

// Matches "/products" and "/products/slug" but not "/products-extra".
export function isActivePath(pathname: string, href: string): boolean {
  const base = href.split("?")[0] ?? href;
  if (base === "/") return pathname === "/";
  return pathname === base || pathname.startsWith(`${base}/`);
}

// Checkout keeps the wordmark and one way back; the cart keeps the full nav so shopping can continue.
export function toFocusedHeader(pathname: string): NavLink | null {
  if (pathname === "/checkout") return { href: "/cart", label: "Back to cart" };
  return null;
}

// Focused routes drop the nav and the phone tab bar, leaving one way back.
export function isFocusedPath(pathname: string): boolean {
  return toFocusedHeader(pathname) !== null;
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
