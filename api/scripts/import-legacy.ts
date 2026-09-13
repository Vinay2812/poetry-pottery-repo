import { PrismaPg } from "@prisma/adapter-pg";
import {
  OptionGroupKind,
  PrismaClient,
  type Prisma,
  RegistrationStatus,
  UserRole,
} from "@prisma/client";
import { Client, type QueryResultRow, types } from "pg";

import { env } from "@/config/env";

// Copies the legacy production database into the new schema: `pnpm import:legacy [--dry-run]`.
// The legacy connection is opened read-only; the new database is upserted so re-runs are safe.

interface LegacyUser {
  id: number;
  auth_id: string;
  email: string;
  phone: string | null;
  name: string | null;
  image: string | null;
  role: "ADMIN" | "USER";
  subscribed_to_newsletter: boolean;
  newsletter_subscribed_at: Date | null;
  created_at: Date;
}

interface LegacyAddress {
  user_id: number;
  address_line_1: string;
  address_line_2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  zip: string;
  contact_number: string | null;
  name: string;
}

interface LegacyCollection {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  starts_at: Date | null;
  ends_at: Date | null;
}

interface LegacyProduct {
  id: number;
  name: string;
  description: string | null;
  instructions: string[] | null;
  color_code: string;
  color_name: string;
  material: string;
  available_quantity: number;
  is_active: boolean;
  price: number;
  image_urls: string[] | null;
  collection_id: number | null;
  created_at: Date;
  categories: string[];
}

interface LegacyCustomizeCategory {
  id: number;
  category: string;
  base_price: number;
  image_url: string | null;
  is_active: boolean;
  options: { name: string; value: string; price_modifier: number }[];
}

interface LegacyWorkshopConfig {
  name: string;
  description: string | null;
  is_active: boolean;
  timezone: string;
  opening_hour: number;
  closing_hour: number;
  slot_duration_minutes: number;
  slot_capacity: number;
  booking_window_days: number;
  tiers: {
    hours: number;
    price_per_person: number;
    pieces_per_person: number;
  }[];
}

interface LegacyBooking {
  id: string;
  user_id: number;
  participants: number;
  total_hours: number;
  price_per_person: number;
  pieces_per_person: number;
  base_amount: number;
  discount: number;
  final_amount: number;
  status: RegistrationStatus | "PAID";
  approved_at: Date | null;
  confirmed_at: Date | null;
  cancelled_at: Date | null;
  cancelled_reason: string | null;
  created_at: Date;
  slot_start_at: Date | null;
  slot_end_at: Date | null;
}

interface LegacyCartItem {
  user_id: number;
  product_id: number;
  quantity: number;
}

interface LegacyAbout {
  storyTitle?: string;
  storySubtitle?: string;
  storyContent?: string[];
  values?: { title: string; description: string }[];
  processSteps?: { title: string; description: string }[];
}

interface LegacyContactInfo {
  email?: string;
  hours?: string;
  phone?: string;
  address?: string;
}

const LEGACY_URL = process.env.LEGACY_DATABASE_URL;
const isDryRun = process.argv.includes("--dry-run");
const FALLBACK_DESCRIPTION =
  "Thrown and glazed by hand in the Sangli studio. Small variations in shape and colour are part of each piece.";

// Legacy timestamps are naive UTC, so they must not be read as local wall time.
types.setTypeParser(types.builtins.TIMESTAMP, (value) => new Date(`${value}Z`));

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
});

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function toDescription(value: string | null): string {
  const text = (value ?? "").trim();
  return text.length > 3 ? text : FALLBACK_DESCRIPTION;
}

// The legacy form stored palette indexes in the hex field; only real colours are kept.
function toColorCode(value: string): string | null {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : null;
}

function toBookingStatus(status: LegacyBooking["status"]): RegistrationStatus {
  return status === "PAID" ? RegistrationStatus.CONFIRMED : status;
}

async function readLegacy(): Promise<{
  users: LegacyUser[];
  addresses: LegacyAddress[];
  collections: LegacyCollection[];
  products: LegacyProduct[];
  customize: LegacyCustomizeCategory[];
  workshop: LegacyWorkshopConfig | null;
  bookings: LegacyBooking[];
  cart: LegacyCartItem[];
  about: LegacyAbout | null;
  aboutHero: string | null;
  contact: LegacyContactInfo;
}> {
  const client = new Client({ connectionString: LEGACY_URL });
  await client.connect();
  await client.query("set default_transaction_read_only = on");
  try {
    const rows = async <T extends QueryResultRow>(sql: string): Promise<T[]> =>
      (await client.query<T>(sql)).rows;
    const users = await rows<LegacyUser>("select * from users order by id");
    const addresses = await rows<LegacyAddress>(
      "select * from user_addresses order by id",
    );
    const collections = await rows<LegacyCollection>(
      "select * from collections order by id",
    );
    const products = await rows<LegacyProduct>(
      `select p.*, coalesce(array_agg(c.category) filter (where c.category is not null), '{}') as categories
         from products p left join product_categories c on c.product_id = p.id
         group by p.id order by p.id`,
    );
    const customize = await rows<LegacyCustomizeCategory>(
      `select c.*, coalesce(json_agg(json_build_object('name', o.name, 'value', o.value, 'price_modifier', o.price_modifier) order by o.sort_order, o.id)
           filter (where o.id is not null and o.is_active), '[]') as options
         from customize_categories c left join customization_options o on o.customize_category_id = c.id
         group by c.id order by c.id`,
    );
    const configs = await rows<LegacyWorkshopConfig>(
      `select c.*, coalesce(json_agg(json_build_object('hours', t.hours, 'price_per_person', t.price_per_person, 'pieces_per_person', t.pieces_per_person) order by t.hours)
           filter (where t.id is not null and t.is_active), '[]') as tiers
         from daily_workshop_configs c left join daily_workshop_pricing_tiers t on t.config_id = c.id
         where c.is_active group by c.id order by c.id limit 1`,
    );
    const bookings = await rows<LegacyBooking>(
      `select r.*, min(s.slot_start_at) as slot_start_at, max(s.slot_end_at) as slot_end_at
         from daily_workshop_registrations r left join daily_workshop_registration_slots s on s.registration_id = r.id
         group by r.id order by r.created_at`,
    );
    const cart = await rows<LegacyCartItem>(
      "select user_id, product_id, quantity from carts",
    );
    const pages = await rows<{ content: LegacyAbout }>(
      "select content from content_pages where slug = 'about' and is_active",
    );
    const settings = await rows<{ key: string; value: LegacyContactInfo }>(
      "select key, value from site_settings where key = 'contact_info'",
    );
    const heroes = await rows<{ value: Record<string, string> }>(
      "select value from site_settings where key = 'hero_images'",
    );
    return {
      users,
      addresses,
      collections,
      products,
      customize,
      workshop: configs[0] ?? null,
      bookings,
      cart,
      about: pages[0]?.content ?? null,
      aboutHero: heroes[0]?.value.about ?? null,
      contact: settings[0]?.value ?? {},
    };
  } finally {
    await client.end();
  }
}

async function importUsers(
  users: LegacyUser[],
  addresses: LegacyAddress[],
): Promise<Map<number, number>> {
  const ids = new Map<number, number>();
  for (const user of users) {
    const data = {
      email: user.email,
      name: cleanText(user.name) || null,
      phone: cleanText(user.phone) || null,
      image: user.image,
      role: user.role === "ADMIN" ? UserRole.ADMIN : UserRole.USER,
    };
    const row = await prisma.user.upsert({
      where: { auth_id: user.auth_id },
      create: { auth_id: user.auth_id, created_at: user.created_at, ...data },
      update: data,
    });
    ids.set(user.id, row.id);
    if (user.subscribed_to_newsletter) {
      await prisma.newsletterSubscriber.upsert({
        where: { email: user.email },
        create: {
          email: user.email,
          user_id: row.id,
          created_at: user.newsletter_subscribed_at ?? user.created_at,
        },
        update: { user_id: row.id, is_active: true, unsubscribed_at: null },
      });
    }
  }

  for (const address of addresses) {
    const user_id = ids.get(address.user_id);
    if (!user_id) continue;
    const owner = users.find((user) => user.id === address.user_id);
    const data = {
      name: cleanText(address.name),
      phone: cleanText(address.contact_number) || cleanText(owner?.phone),
      line1: cleanText(address.address_line_1),
      line2: cleanText(address.address_line_2) || null,
      landmark: cleanText(address.landmark) || null,
      city: cleanText(address.city),
      state: cleanText(address.state),
      pincode: cleanText(address.zip),
    };
    // Addresses have no stable key across schemas, so an identical line is not duplicated.
    const existing = await prisma.address.findFirst({
      where: { user_id, line1: data.line1, pincode: data.pincode },
    });
    if (existing) {
      await prisma.address.update({ where: { id: existing.id }, data });
    } else {
      await prisma.address.create({ data: { user_id, ...data } });
    }
  }
  return ids;
}

async function importCatalog(
  collections: LegacyCollection[],
  products: LegacyProduct[],
): Promise<Map<number, number>> {
  const categoryNames = new Set(
    products.flatMap((product) => product.categories),
  );
  let sortOrder = 0;
  for (const name of categoryNames) {
    const slug = slugify(name);
    await prisma.category.upsert({
      where: { slug },
      create: { slug, name: cleanText(name), sort_order: sortOrder++ },
      update: { name: cleanText(name) },
    });
  }

  const collectionIds = new Map<number, number>();
  for (const collection of collections) {
    const data = {
      name: cleanText(collection.name),
      description: cleanText(collection.description) || null,
      image_url: collection.image_url,
      starts_at: collection.starts_at,
      ends_at: collection.ends_at,
    };
    const row = await prisma.collection.upsert({
      where: { slug: slugify(collection.slug) },
      create: { slug: slugify(collection.slug), ...data },
      update: data,
    });
    collectionIds.set(collection.id, row.id);
  }

  const productIds = new Map<number, number>();
  const usedSlugs = new Set<string>();
  for (const product of products) {
    let slug = slugify(product.name);
    if (usedSlugs.has(slug)) slug = `${slug}-${product.id}`;
    usedSlugs.add(slug);
    const collection_id = product.collection_id
      ? collectionIds.get(product.collection_id)
      : undefined;
    const data: Prisma.ProductUpsertArgs["create"] = {
      slug,
      name: cleanText(product.name),
      description: toDescription(product.description),
      price: product.price,
      material: cleanText(product.material) || "Stoneware",
      color_name: cleanText(product.color_name) || null,
      color_code: toColorCode(product.color_code),
      care_notes: product.instructions ?? [],
      image_urls: product.image_urls ?? [],
      stock: Math.max(product.available_quantity, 0),
      is_active: product.is_active,
      created_at: product.created_at,
      collection: collection_id
        ? { connect: { id: collection_id } }
        : undefined,
      categories: {
        connect: product.categories.map((name) => ({ slug: slugify(name) })),
      },
    };
    const row = await prisma.product.upsert({
      where: { slug },
      create: data,
      update: {
        ...data,
        categories: {
          set: product.categories.map((name) => ({ slug: slugify(name) })),
        },
      },
    });
    productIds.set(product.id, row.id);
  }
  return productIds;
}

// Each legacy "customize category" becomes one made-to-order product with its size options.
async function importCustomPieces(
  customize: LegacyCustomizeCategory[],
): Promise<number> {
  for (const entry of customize) {
    const category = cleanText(entry.category);
    const singular = category.endsWith("s") ? category.slice(0, -1) : category;
    const slug = `custom-${slugify(singular)}`;
    const data = {
      name: `Custom ${singular.toLowerCase()}`,
      description: `A ${singular.toLowerCase()} thrown to your brief. Pick a size, tell us the glaze and any words you want carved, and we will send a sketch before it goes on the wheel.`,
      price: entry.base_price,
      material: "Stoneware",
      image_urls: entry.image_url ? [entry.image_url] : [],
      stock: 0,
      is_active: entry.is_active,
      is_customizable: true,
      categories: { connect: [{ slug: slugify(category) }] },
    };
    const row = await prisma.product.upsert({
      where: { slug },
      create: { slug, ...data },
      update: { ...data, categories: { set: [{ slug: slugify(category) }] } },
    });
    await prisma.productOptionGroup.deleteMany({
      where: { product_id: row.id },
    });
    if (entry.options.length > 0) {
      await prisma.productOptionGroup.create({
        data: {
          product_id: row.id,
          name: "Size",
          kind: OptionGroupKind.CHOICE,
          is_required: true,
          sort_order: 0,
          options: {
            create: entry.options.map((option, index) => ({
              name: `${cleanText(option.name)} (${cleanText(option.value)})`,
              price_modifier: option.price_modifier,
              sort_order: index,
            })),
          },
        },
      });
    }
    await prisma.productOptionGroup.create({
      data: {
        product_id: row.id,
        name: "Notes for the potter",
        kind: OptionGroupKind.TEXT,
        is_required: false,
        max_length: 200,
        sort_order: 1,
      },
    });
  }
  return customize.length;
}

async function importWorkshop(
  workshop: LegacyWorkshopConfig | null,
  bookings: LegacyBooking[],
  userIds: Map<number, number>,
): Promise<number> {
  if (!workshop) return 0;
  const data = {
    name: cleanText(workshop.name),
    description: cleanText(workshop.description) || undefined,
    is_active: workshop.is_active,
    timezone: workshop.timezone,
    opening_minutes: workshop.opening_hour * 60,
    closing_minutes: workshop.closing_hour * 60,
    slot_minutes: workshop.slot_duration_minutes,
    capacity_per_slot: workshop.slot_capacity,
    booking_window_days: workshop.booking_window_days,
  };
  // The seeded config keeps its slug and image; only the studio's real hours and prices come across.
  const config = await prisma.workshopConfig.upsert({
    where: { slug: "open-studio" },
    create: { slug: "open-studio", ...data },
    update: { ...data, name: undefined, description: undefined },
  });
  await prisma.workshopPricingTier.deleteMany({
    where: { config_id: config.id },
  });
  await prisma.workshopPricingTier.createMany({
    data: workshop.tiers.map((tier) => ({ config_id: config.id, ...tier })),
  });

  let imported = 0;
  for (const booking of bookings) {
    const user_id = userIds.get(booking.user_id);
    if (!user_id || !booking.slot_start_at || !booking.slot_end_at) continue;
    const row = {
      config_id: config.id,
      user_id,
      starts_at: booking.slot_start_at,
      ends_at: booking.slot_end_at,
      hours: booking.total_hours,
      participants: booking.participants,
      price_per_person: booking.price_per_person,
      pieces_per_person: booking.pieces_per_person,
      subtotal: booking.base_amount,
      discount: booking.discount,
      total: booking.final_amount,
      status: toBookingStatus(booking.status),
      cancel_reason: booking.cancelled_reason,
      approved_at: booking.approved_at,
      confirmed_at: booking.confirmed_at,
      cancelled_at: booking.cancelled_at,
      created_at: booking.created_at,
    };
    await prisma.workshopBooking.upsert({
      where: { id: booking.id },
      create: { id: booking.id, ...row },
      update: row,
    });
    imported++;
  }
  return imported;
}

async function importCart(
  cart: LegacyCartItem[],
  userIds: Map<number, number>,
  productIds: Map<number, number>,
): Promise<number> {
  let imported = 0;
  for (const item of cart) {
    const user_id = userIds.get(item.user_id);
    const product_id = productIds.get(item.product_id);
    if (!user_id || !product_id) continue;
    await prisma.cartItem.upsert({
      where: {
        user_id_product_id_selection_key: {
          user_id,
          product_id,
          selection_key: "",
        },
      },
      create: { user_id, product_id, quantity: item.quantity },
      update: { quantity: item.quantity },
    });
    imported++;
  }
  return imported;
}

function toAboutSections(about: LegacyAbout): PrismaJson.ContentSections {
  const sections: PrismaJson.ContentSections = [];
  if (about.storyContent?.length) {
    sections.push({
      heading: about.storyTitle ?? "Our story",
      body: about.storyContent.join("\n\n"),
      items: [],
    });
  }
  if (about.values?.length) {
    sections.push({
      heading: "What we believe",
      body: "",
      items: about.values.map((value) => ({
        title: value.title,
        body: value.description,
      })),
    });
  }
  if (about.processSteps?.length) {
    sections.push({
      heading: "How a piece is made",
      body: "",
      items: about.processSteps.map((step) => ({
        title: step.title,
        body: step.description,
      })),
    });
  }
  return sections;
}

async function importContent(
  about: LegacyAbout | null,
  aboutHero: string | null,
  contact: LegacyContactInfo,
): Promise<void> {
  if (about) {
    const data = {
      title: about.storyTitle ?? "About the studio",
      subtitle: about.storySubtitle ?? null,
      hero_image_url: aboutHero,
      sections: toAboutSections(about),
    };
    await prisma.contentPage.upsert({
      where: { slug: "about" },
      create: { slug: "about", ...data },
      update: data,
    });
  }
  const settings = {
    contact_phone: cleanText(contact.phone),
    whatsapp_number: cleanText(contact.phone).replace(/\D/g, ""),
    contact_email: cleanText(contact.email),
    address: cleanText(contact.address),
    opening_hours: cleanText(contact.hours),
  };
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1, ...settings },
    update: settings,
  });
}

async function main(): Promise<void> {
  if (!LEGACY_URL) throw new Error("LEGACY_DATABASE_URL is not set");
  const legacy = await readLegacy();
  const summary = [
    `${legacy.users.length} users, ${legacy.addresses.length} addresses`,
    `${legacy.collections.length} collections, ${legacy.products.length} products (${legacy.products.filter((p) => p.is_active).length} active)`,
    `${legacy.customize.length} custom piece types, ${legacy.bookings.length} wheel bookings, ${legacy.cart.length} cart lines`,
  ];
  process.stdout.write(`Legacy: ${summary.join("; ")}\n`);
  if (isDryRun) {
    process.stdout.write("Dry run, nothing written\n");
    return;
  }

  const userIds = await importUsers(legacy.users, legacy.addresses);
  const productIds = await importCatalog(legacy.collections, legacy.products);
  const custom = await importCustomPieces(legacy.customize);
  const bookings = await importWorkshop(
    legacy.workshop,
    legacy.bookings,
    userIds,
  );
  const cart = await importCart(legacy.cart, userIds, productIds);
  await importContent(legacy.about, legacy.aboutHero, legacy.contact);
  process.stdout.write(
    `Imported ${userIds.size} users, ${productIds.size} products, ${custom} custom pieces, ${bookings} bookings, ${cart} cart lines\n`,
  );
  process.stdout.write(
    "Run `pnpm search:reindex` to embed the imported products\n",
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
