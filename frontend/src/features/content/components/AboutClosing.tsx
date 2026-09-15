import Link from "next/link";

export function AboutClosing() {
  return (
    <section className="flex flex-wrap items-center gap-6 border-t border-ash py-12 md:py-16">
      <Link
        href="/products"
        className="border-b border-ink pb-0.5 text-sm hover:border-primary hover:text-primary"
      >
        Shop the shelf
      </Link>
      <Link
        href="/workshops"
        className="border-b border-ink pb-0.5 text-sm hover:border-primary hover:text-primary"
      >
        Book a wheel session
      </Link>
    </section>
  );
}
