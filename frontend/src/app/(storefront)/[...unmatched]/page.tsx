import { notFound } from "next/navigation";

// Unmatched URLs land here so the 404 keeps the storefront header and footer.
export default function UnmatchedPage(): never {
  notFound();
}
