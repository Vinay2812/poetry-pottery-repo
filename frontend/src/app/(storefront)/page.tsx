import type { Metadata } from "next";

import { formatDate, formatInr } from "@/lib/format";
import {
  getCategories,
  getCommissionPieces,
  getFeaturedProducts,
  getRecentReviews,
  getUpcomingEvents,
  getWorkshops,
} from "@/lib/data/catalog";
import { getSiteSettings } from "@/lib/data/site-settings";
import { pageMetadata, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";
import { serializeJsonLd, toStudioJsonLd } from "@/lib/structured-data";

import { PageShell } from "@/components/layout/PageShell";
import { JsonLd } from "@/components/seo/JsonLd";

import {
  AboutBlock,
  EventRow,
  HomeBand,
  HomeHero,
  HomeSection,
  StudioTeaser,
  toStudioSection,
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
    customPieces,
  ] = await Promise.all([
    getSiteSettings(),
    getCategories(),
    getFeaturedProducts(8),
    getUpcomingEvents(3),
    getRecentReviews(3),
    getWorkshops(),
    getCommissionPieces(1),
  ]);
  // A shape with nothing on the shelf would only lead to an empty page.
  const shapes = categories.filter((category) => category.product_count > 0);
  const customPiece = customPieces[0] ?? null;
  const wheel = workshops[0] ?? null;
  const hasEvents = upcomingEvents.length > 0;
  const studio = toStudioSection(wheel, hasEvents);

  return (
    <PageShell className="flex flex-col">
      <JsonLd json={serializeJsonLd(toStudioJsonLd(settings))} />
      <HomeHero
        heading={settings.hero_heading}
        subheading={settings.hero_subheading}
        shopHref={settings.hero_cta_href || "/products"}
        shopLabel={settings.hero_cta_text || "Shop the shelf"}
        sessionHref={studio.isBookable ? "/workshops" : undefined}
      />

      {shapes.length > 0 && (
        <HomeSection title="Shapes we throw">
          <div className="grid grid-cols-3 gap-6 lift-and-dim sm:grid-cols-4 md:grid-cols-7">
            {shapes.map((category) => (
              <CategoryTile
                key={category.id}
                href={`/products?category=${category.slug}`}
                slug={category.slug}
                name={category.name}
                icon={category.icon ?? null}
                imageUrl={category.image_url ?? null}
                productCount={category.product_count}
              />
            ))}
          </div>
        </HomeSection>
      )}

      {customPiece && (
        <HomeBand>
          <MadeToOrderBanner
            href="/custom"
            imageUrl={customPiece.image_urls[0] ?? null}
            priceLabel={formatInr(customPiece.price)}
          />
        </HomeBand>
      )}

      {featured.length > 0 && (
        <HomeBand isGroup>
          <ProductCarousel title="Pieces on the shelf" viewAllHref="/products">
            {featured.map((product, index) => (
              <ProductCardContainer
                key={product.id}
                product={product}
                isPriority={index < 2}
                hasPhotoCarousel={false}
              />
            ))}
          </ProductCarousel>
        </HomeBand>
      )}

      {/* An empty calendar hands the note and the link to the teaser below. */}
      <HomeSection
        title="At the studio"
        note={studio.note}
        linkHref={hasEvents ? "/events" : undefined}
        linkLabel={hasEvents ? "All dates" : undefined}
      >
        {studio.teaser ? (
          <StudioTeaser
            imageUrl={wheel?.image_url ?? null}
            line={studio.teaser.line}
            hoursLabel={studio.teaser.hoursLabel}
            daysLabel={studio.teaser.daysLabel}
            priceLabel={studio.teaser.priceLabel}
            href={studio.teaser.href}
            linkLabel={studio.teaser.linkLabel}
          />
        ) : (
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
          firstLine="It's not just another pottery studio."
          secondLine="It is Poetry & Pottery, where clay meets the soul."
          href="/about"
        />
      </HomeSection>
    </PageShell>
  );
}
