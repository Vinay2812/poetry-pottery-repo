import type { Metadata } from "next";

import { getCustomProducts } from "@/lib/data/catalog";
import { getSiteSettings } from "@/lib/data/site-settings";
import { toAbsoluteUrl } from "@/lib/site-url";

import { buildWhatsAppUrl } from "@/features/layout";
import {
  ProductCardContainer,
  ProductGrid,
  StudioAskLine,
} from "@/features/products";

export const metadata: Metadata = {
  title: "Made to order",
  description:
    "Tell us the size, the glaze and the words, and we throw the piece for you.",
};

export default async function CustomPage() {
  const [products, settings, pageUrl] = await Promise.all([
    getCustomProducts(),
    getSiteSettings(),
    toAbsoluteUrl("/custom"),
  ]);
  const askUrl = settings.whatsapp_number
    ? buildWhatsAppUrl(
        settings.whatsapp_number,
        `Hi, I would like something made to order. (${pageUrl})`,
      )
    : null;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 md:px-8 md:py-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl md:text-5xl">Made to order</h1>
        <p className="max-w-2xl text-muted-foreground">
          Pick a piece, choose the size and glaze, tell us the words, and we
          throw it fresh for you in about ten days.
        </p>
      </header>

      {products.length > 0 && (
        <ProductGrid>
          {products.map((product, index) => (
            <ProductCardContainer
              key={product.id}
              product={product}
              isPriority={index < 4}
            />
          ))}
        </ProductGrid>
      )}

      <StudioAskLine
        text="Something else in mind?"
        linkLabel="Message the studio."
        askUrl={askUrl}
      />
    </div>
  );
}
