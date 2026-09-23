import type { Metadata } from "next";

import { formatDate, formatInr } from "@/lib/format";
import {
  getCategories,
  getFeaturedProducts,
  getRecentReviews,
  getUpcomingEvents,
  getWorkshops,
} from "@/lib/data/catalog";
import { getSiteSettings } from "@/lib/data/site-settings";
import { pageMetadata, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";
import { serializeJsonLd, toStudioJsonLd } from "@/lib/structured-data";

import { Reveal } from "@/components/motion/Reveal";
import { PageShell } from "@/components/layout/PageShell";
import { JsonLd } from "@/components/seo/JsonLd";

import {
  AboutBlock,
  EventRow,
  HomeHero,
  HomeSection,
  StudioTeaser,
  toStudioDaysLabel,
  toStudioHoursLabel,
  toStudioPriceLabel,
} from "@/features/home";
import { ReviewColumn, toOneLine } from "@/features/reviews";
import { toEventPath, toSeatsLabel } from "@/features/events";
import {
  CategoryTile,
  MadeToOrderBanner,
  ProductCardContainer,
  ProductCarousel,
} from "@/features/products";

export const metadata: Metadata = pageMetadata({
  title: SITE_NAME,
  path: "/",
  description: SITE_DESCRIPTION,
  isTitleAbsolute: true,
});

export default async function HomePage() {
  const [
    settings,
    categories,
    featured,
    upcomingEvents,
    recentReviews,
    workshops,
  ] = await Promise.all([
    getSiteSettings(),
    getCategories(),
    getFeaturedProducts(8),
    getUpcomingEvents(3),
    getRecentReviews(3),
    getWorkshops(),
  ]);
  const customPiece =
    featured.find((product) => product.is_customizable) ?? null;
  const wheel = workshops[0] ?? null;
  const hasEvents = upcomingEvents.length > 0;

  return (
    <PageShell className="flex flex-col">
      <JsonLd json={serializeJsonLd(toStudioJsonLd(settings))} />
      <HomeHero
        heading={settings.hero_heading}
        subheading={settings.hero_subheading}
        shopHref={settings.hero_cta_href || "/products"}
        shopLabel={settings.hero_cta_text || "Shop the shelf"}
        sessionHref="/workshops"
      />

      {categories.length > 0 && (
        <HomeSection title="Shapes we throw">
          <div className="grid grid-cols-3 gap-6 lift-and-dim sm:grid-cols-4 md:grid-cols-7">
            {categories.map((category) => (
              <CategoryTile
                key={category.id}
                href={`/products?category=${category.slug}`}
                slug={category.slug}
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
          <Reveal isScrollLinked>
            <MadeToOrderBanner
              href="/custom"
              imageUrl={customPiece.image_urls[0] ?? null}
              priceLabel={formatInr(customPiece.price)}
            />
          </Reveal>
        </section>
      )}

      {featured.length > 0 && (
        <div className="border-t border-ash py-16 md:py-24">
          <Reveal isGroup>
            <ProductCarousel
              title="Pieces on the shelf"
              viewAllHref="/products"
            >
              {featured.map((product, index) => (
                <ProductCardContainer
                  key={product.id}
                  product={product}
                  isPriority={index < 2}
                  hasPhotoCarousel={false}
                />
              ))}
            </ProductCarousel>
          </Reveal>
        </div>
      )}

      {/* With nothing on the calendar the teaser carries the facts and the only link,
          so the heading row offers neither a note nor a second way to the same page. */}
      <HomeSection
        title="At the studio"
        note={
          hasEvents
            ? "Wheel sessions run every afternoon except Monday. Book an hour or three."
            : undefined
        }
        linkHref={hasEvents ? "/events" : undefined}
        linkLabel={hasEvents ? "All dates" : undefined}
      >
        {hasEvents ? (
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
        ) : (
          <StudioTeaser
            imageUrl={wheel?.image_url ?? null}
            line="Nothing is on the calendar this week, but the wheels are free most afternoons. Pick an hour and we will set one up for you."
            hoursLabel={
              wheel
                ? toStudioHoursLabel(
                    wheel.opening_minutes,
                    wheel.closing_minutes,
                  )
                : "Afternoons"
            }
            daysLabel={
              wheel
                ? toStudioDaysLabel(wheel.closed_weekdays)
                : "Every day but Monday"
            }
            priceLabel={wheel ? toStudioPriceLabel(wheel.tiers) : null}
            href="/workshops"
            linkLabel="Book a wheel session"
          />
        )}
      </HomeSection>

      {recentReviews.length > 0 && (
        <HomeSection title="From the table">
          <div className="grid gap-6 md:grid-cols-3 md:gap-0">
            {recentReviews.map((review) => (
              <ReviewColumn
                key={review.id}
                authorName={review.author.name}
                rating={review.rating}
                line={toOneLine(review.body)}
                subjectName={review.subject_name}
                href={review.subject_href}
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
    </PageShell>
  );
}
