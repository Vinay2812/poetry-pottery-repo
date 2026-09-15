import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatDate, formatInr } from "@/lib/format";
import {
  getCategories,
  getCollections,
  getFeaturedProducts,
} from "@/lib/data/catalog";
import { getSiteSettings } from "@/lib/data/site-settings";

import {
  CategoryTile,
  CollectionCard,
  MadeToOrderBanner,
  ProductCardContainer,
  ProductCarousel,
  toProductPath,
} from "@/features/products";

export default async function HomePage() {
  const [settings, categories, featured, collections] = await Promise.all([
    getSiteSettings(),
    getCategories(),
    getFeaturedProducts(8),
    getCollections(),
  ]);
  const customPiece =
    featured.find((product) => product.is_customizable) ?? null;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 py-8 md:gap-24 md:px-8 md:py-12">
      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div className="relative aspect-4/5 overflow-hidden rounded-[2rem] bg-primary-light md:order-2">
          {settings.hero_image_url && (
            <Image
              src={settings.hero_image_url}
              alt=""
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          )}
        </div>
        <div className="flex flex-col gap-5">
          <p className="text-xs font-semibold tracking-[0.14em] text-terracotta-dark uppercase">
            Handmade in Sangli
          </p>
          <h1 className="font-heading text-4xl leading-[1.05] text-balance md:text-6xl">
            {settings.hero_heading}
          </h1>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
            {settings.hero_subheading}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" className="rounded-full" asChild>
              <Link href={settings.hero_cta_href || "/products"}>
                {settings.hero_cta_text || "Shop the collection"}
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full"
              asChild
            >
              <Link href="/workshops">Book a wheel session</Link>
            </Button>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="flex flex-col gap-6">
          <h2 className="font-heading text-2xl md:text-4xl">Shop by shape</h2>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-7">
            {categories.map((category) => (
              <CategoryTile
                key={category.id}
                href={`/products?category=${category.slug}`}
                name={category.name}
                imageUrl={category.image_url}
                productCount={category.product_count}
              />
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <ProductCarousel
          title="Pieces people keep coming back for"
          eyebrow="Studio favourites"
          viewAllHref="/products?sort=BEST_SELLING"
        >
          {featured.map((product, index) => (
            <ProductCardContainer
              key={product.id}
              product={product}
              isPriority={index < 2}
            />
          ))}
        </ProductCarousel>
      )}

      {collections.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="flex items-end justify-between">
            <h2 className="font-heading text-2xl md:text-4xl">Collections</h2>
            <Link
              href="/products"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              All pieces
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {collections.slice(0, 4).map((collection) => (
              <CollectionCard
                key={collection.id}
                href={`/products?collection=${collection.slug}`}
                name={collection.name}
                description={collection.description}
                imageUrl={collection.image_url}
                productCount={collection.product_count}
                endsLabel={
                  collection.ends_at
                    ? `Until ${formatDate(collection.ends_at)}`
                    : null
                }
              />
            ))}
          </div>
        </section>
      )}

      {customPiece && (
        <MadeToOrderBanner
          href={toProductPath(customPiece.slug)}
          imageUrl={customPiece.image_urls[0] ?? null}
          priceLabel={formatInr(customPiece.price)}
        />
      )}
    </div>
  );
}
