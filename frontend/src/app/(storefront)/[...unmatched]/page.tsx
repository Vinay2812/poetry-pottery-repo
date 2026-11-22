import type { Metadata } from "next";
import { notFound } from "next/navigation";

// The tab names the miss too; the not-found boundary's own metadata does not reach this route.
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

// Unmatched URLs land here so the 404 keeps the storefront header and footer.
export default function UnmatchedPage(): never {
  notFound();
}
