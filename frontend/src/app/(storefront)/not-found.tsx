import type { Metadata } from "next";
import Link from "next/link";

import { getArchiveProducts } from "@/lib/data/catalog";

import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";

import { ProductCardContainer } from "@/features/products";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default async function NotFound() {
  const pieces = await getArchiveProducts(4);

  return (
    <PageShell className="flex flex-col gap-16 py-20 md:py-28">
      <div className="flex max-w-xl flex-col items-start gap-4">
        <p className="text-[13px] tracking-widest text-muted-foreground uppercase">
          404
        </p>
        <h1 className="font-heading text-4xl leading-tight tracking-tight md:text-6xl">
          This shelf is empty
        </h1>
        <p className="max-w-sm text-[15px] text-muted-foreground">
          The page you were looking for has been moved or never existed. The
          rest of the studio is still here.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link href="/products">Browse pieces</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to the studio</Link>
          </Button>
        </div>
      </div>

      {pieces.length > 0 && (
        <section className="flex flex-col gap-6 border-t border-ash pt-10">
          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-2xl leading-tight tracking-tight md:text-3xl">
              While you are here
            </h2>
            <p className="text-[15px] text-muted-foreground">
              Pieces we have made before. Ask us for one like them.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 lg:gap-x-6">
            {pieces.map((piece) => (
              <ProductCardContainer key={piece.id} product={piece} />
            ))}
          </div>
        </section>
      )}
    </PageShell>
  );
}
