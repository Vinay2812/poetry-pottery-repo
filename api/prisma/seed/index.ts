import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "@prisma/client";

import { env } from "@/config/env";
import {
  careNotes,
  categories,
  collections,
  customMugOptions,
  products,
} from "./catalog";
import {
  contentPages,
  coupons,
  events,
  siteSettings,
  workshopConfig,
} from "./content";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
});

function hoursFromNow(days: number, hour: number): Date {
  const date = new Date();
  date.setUTCHours(hour - 5, 30, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

async function seedCatalog(): Promise<void> {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: category,
      update: category,
    });
  }

  for (const collection of collections) {
    const data = {
      slug: collection.slug,
      name: collection.name,
      description: collection.description,
      image_url: collection.image_url,
      ends_at: collection.ends_at ? new Date(collection.ends_at) : null,
    };
    await prisma.collection.upsert({
      where: { slug: collection.slug },
      create: data,
      update: data,
    });
  }

  for (const product of products) {
    const data: Prisma.ProductUpsertArgs["create"] = {
      slug: product.slug,
      name: product.name,
      description: product.description,
      price: product.price,
      compare_at_price: product.compare_at_price ?? null,
      material: product.material,
      color_name: product.color_name,
      color_code: product.color_code,
      dimensions: product.dimensions,
      care_notes: careNotes,
      image_urls: product.images,
      stock: product.stock,
      is_featured: product.is_featured ?? false,
      is_customizable: product.is_customizable ?? false,
      sales_count: product.sales_count ?? 0,
      collection: product.collection
        ? { connect: { slug: product.collection } }
        : undefined,
      categories: {
        connect: product.categories.map((slug) => ({ slug })),
      },
    };
    const row = await prisma.product.upsert({
      where: { slug: product.slug },
      create: data,
      update: {
        ...data,
        categories: { set: product.categories.map((slug) => ({ slug })) },
      },
    });

    if (product.is_customizable) {
      await prisma.productOptionGroup.deleteMany({
        where: { product_id: row.id },
      });
      for (const [index, group] of customMugOptions.entries()) {
        await prisma.productOptionGroup.create({
          data: {
            product_id: row.id,
            name: group.name,
            kind: group.kind,
            is_required: group.is_required,
            price_modifier: group.price_modifier ?? 0,
            max_length: group.max_length ?? null,
            sort_order: index,
            options: group.options
              ? {
                  create: group.options.map((option, optionIndex) => ({
                    name: option.name,
                    price_modifier: option.price_modifier,
                    sort_order: optionIndex,
                  })),
                }
              : undefined,
          },
        });
      }
    }
  }
}

async function seedEvents(): Promise<void> {
  for (const event of events) {
    const starts_at = hoursFromNow(event.days_from_now, 15);
    const ends_at = new Date(
      starts_at.getTime() + event.duration_hours * 3_600_000,
    );
    const data = {
      slug: event.slug,
      title: event.title,
      description: event.description,
      event_type: event.event_type,
      status: event.status,
      level: event.level ?? null,
      starts_at,
      ends_at,
      location: event.location,
      address: event.address,
      price: event.price,
      total_seats: event.total_seats,
      available_seats: event.total_seats - event.booked_seats,
      instructor: event.instructor ?? null,
      image_url: event.image_url,
      gallery: event.gallery,
      includes: event.includes,
      highlights: event.highlights,
      performers: event.performers,
    };
    await prisma.event.upsert({
      where: { slug: event.slug },
      create: data,
      update: data,
    });
  }
}

async function seedWorkshop(): Promise<void> {
  const { tiers, ...config } = workshopConfig;
  const row = await prisma.workshopConfig.upsert({
    where: { slug: config.slug },
    create: config,
    update: config,
  });
  for (const tier of tiers) {
    await prisma.workshopPricingTier.upsert({
      where: { config_id_hours: { config_id: row.id, hours: tier.hours } },
      create: { config_id: row.id, ...tier },
      update: tier,
    });
  }
}

async function seedContent(): Promise<void> {
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1, ...siteSettings },
    update: siteSettings,
  });

  for (const page of contentPages) {
    const data = {
      title: page.title,
      subtitle: page.subtitle,
      hero_image_url: page.hero_image_url || null,
      sections: page.sections,
    };
    await prisma.contentPage.upsert({
      where: { slug: page.slug },
      create: { slug: page.slug, ...data },
      update: data,
    });
  }

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      create: coupon,
      update: coupon,
    });
  }
}

async function main(): Promise<void> {
  await seedCatalog();
  await seedEvents();
  await seedWorkshop();
  await seedContent();
  process.stdout.write(
    `Seeded ${products.length} products, ${events.length} events, ${contentPages.length} pages\n`,
  );
}

main()
  .catch((error: unknown) => {
    process.stderr.write(
      `${error instanceof Error ? error.stack : String(error)}\n`,
    );
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
