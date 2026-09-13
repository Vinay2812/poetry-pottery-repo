import { formatDate, formatInr } from "@/lib/format";
import {
  getCategories,
  getFeaturedProducts,
  getUpcomingEvents,
} from "@/lib/data/catalog";
import { getSiteSettings } from "@/lib/data/site-settings";

import { Reveal } from "@/components/motion/Reveal";

import { AboutBlock, EventRow, HomeHero, HomeSection } from "@/features/home";
import { toEventPath, toSeatsLabel } from "@/features/events";
import {
  CategoryTile,
  MadeToOrderBanner,
  ProductCardContainer,
  ProductCarousel,
  toProductPath,
} from "@/features/products";

export default async function HomePage() {
  const [settings, categories, featured, upcomingEvents] = await Promise.all([
    getSiteSettings(),
    getCategories(),
    getFeaturedProducts(8),
    getUpcomingEvents(3),
  ]);
  const customPiece =
    featured.find((product) => product.is_customizable) ?? null;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-4 md:px-8">
      <HomeHero
        heading={settings.hero_heading}
        subheading={settings.hero_subheading}
        imageUrl={settings.hero_image_url || null}
        shopHref={settings.hero_cta_href || "/products"}
        shopLabel={settings.hero_cta_text || "Shop the shelf"}
        sessionHref="/workshops"
      />

      {categories.length > 0 && (
        <HomeSection title="Shapes we throw">
          <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-7">
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
        </HomeSection>
      )}

      {customPiece && (
        <section className="border-t border-ash py-16 md:py-24">
          <MadeToOrderBanner
            href={toProductPath(customPiece.slug)}
            imageUrl={customPiece.image_urls[0] ?? null}
            priceLabel={formatInr(customPiece.price)}
          />
        </section>
      )}

      {featured.length > 0 && (
        <div className="border-t border-ash py-16 md:py-24">
          <Reveal>
            <ProductCarousel
              title="Pieces on the shelf"
              viewAllHref="/products"
            >
              {featured.map((product, index) => (
                <ProductCardContainer
                  key={product.id}
                  product={product}
                  isPriority={index < 2}
                />
              ))}
            </ProductCarousel>
          </Reveal>
        </div>
      )}

      {upcomingEvents.length > 0 && (
        <HomeSection
          title="At the studio"
          note="Wheel sessions run every afternoon except Monday. Book an hour or three."
          linkHref="/events"
          linkLabel="All dates"
        >
          <div className="border-t border-ash">
            {upcomingEvents.map((event) => (
              <EventRow
                key={event.id}
                href={toEventPath(event.slug)}
                dateLabel={formatDate(event.starts_at)}
                title={event.title}
                seatsLabel={toSeatsLabel(
                  event.available_seats,
                  event.total_seats,
                )}
                isSoldOut={event.available_seats <= 0}
              />
            ))}
          </div>
        </HomeSection>
      )}

      <HomeSection title="A small studio in Sangli">
        <AboutBlock
          imageUrl={null}
          firstLine="We throw stoneware and terracotta on two wheels, glaze it by hand and fire it in small batches."
          secondLine="Because every piece is thrown one at a time, glaze and shape shift a little between them."
          href="/about"
        />
      </HomeSection>
    </div>
  );
}
