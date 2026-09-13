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

export const FOOTER_SHOP_LINKS: NavLink[] = [
  { href: "/products", label: "All pieces" },
  { href: "/products?sort=NEWEST", label: "New arrivals" },
  { href: "/products?sort=BEST_SELLING", label: "Best sellers" },
  { href: "/custom", label: "Made to order" },
  { href: "/products?view=archive", label: "Archive" },
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

export function buildWhatsAppUrl(number: string, text: string): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function formatBadgeCount(count: number): string {
  return count > 9 ? "9+" : String(count);
}
