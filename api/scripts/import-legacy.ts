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
  slots: { starts_at: string; ends_at: string }[];
}

interface LegacyCartItem {
  user_id: number;
  product_id: number;
  quantity: number;
}

interface LegacyAbout {
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
const STUDIO_CDN = "https://cdn.poetryandpottery.prodapp.club/";

// Legacy gallery shots where the piece is not the subject. Everything else the studio photographed is kept.
const DROPPED_PHOTOS: { slug: string; url: string; reason: string }[] = [
  {
    slug: "blue-blood-mug",
    url: `${STUDIO_CDN}products/1779350350171-ym7r7a-202522.jpg`,
    reason: "mug dropped in tall grass, the grass is the subject",
  },
  {
    slug: "blue-blood-mug",
    url: `${STUDIO_CDN}products/1779350349942-my3x0o-202526.jpg`,
    reason: "mug face down in grass and leaves",
  },
  {
    slug: "blue-blood-mug",
    url: `${STUDIO_CDN}products/1779350350199-27x5vd-202513.jpg`,
    reason: "photograph of a child balancing the mug on her head",
  },
  {
    slug: "drip-sip-mug",
    url: `${STUDIO_CDN}products/1770105998643-61exuv-1000045410.jpg`,
    reason: "portrait of a person, the mug is incidental",
  },
  {
    slug: "stripe-sipper",
    url: `${STUDIO_CDN}products/1770105652875-htbpt9-1000004765.jpg`,
    reason: "two people toasting, the cups are barely readable",
  },
  {
    slug: "stripe-sipper",
    url: `${STUDIO_CDN}products/1770105653393-cswaph-1000004755.jpg`,
    reason: "portrait of a person drinking",
  },
];

// Promoted to first where the clearest shot of the piece was not the legacy lead image.
const LEAD_PHOTOS: Record<string, string> = {
  "stripe-sipper": `${STUDIO_CDN}products/1770105651540-aixd99-1000004761.jpg`,
  "zebra-mug": `${STUDIO_CDN}products/1770036892017-b3921h-1000004738.jpg`,
};

// The legacy about heading was title case marketing copy; the house voice is plain and sentence case.
const ABOUT_TITLE = "Where clay meets verses";
const ABOUT_SUBTITLE = "A small studio in Sangli, throwing since 2025.";

// The legacy admin typed care notes by hand; this is the studio's vocabulary, keyed by what was typed.
const CARE_NOTES: Record<string, string> = {
  "microvave safe": "Microwave safe",
  "microwave safe": "Microwave safe",
  "dishwasher safe (top rack)": "Dishwasher safe (top rack)",
  "do not use abrasive scrubbers": "Do not use abrasive scrubbers",
  "avoid sudden temperature changes": "Avoid sudden temperature changes",
  "handwash recommended": "Handwash recommended",
};

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

function toCareNotes(notes: string[] | null): string[] {
  const kept: string[] = [];
  for (const note of notes ?? []) {
    const text = cleanText(note);
    const normalised = CARE_NOTES[text.toLowerCase()] ?? text;
    if (normalised.length > 0 && !kept.includes(normalised))
      kept.push(normalised);
  }
  return kept;
}

function toImageUrls(slug: string, urls: string[] | null): string[] {
  const dropped = DROPPED_PHOTOS.filter((photo) => photo.slug === slug).map(
    (photo) => photo.url,
  );
  const kept = (urls ?? []).filter((url) => !dropped.includes(url));
  const lead = LEAD_PHOTOS[slug];
  if (lead === undefined || !kept.includes(lead)) return kept;
  return [lead, ...kept.filter((url) => url !== lead)];
}

// Legacy hero images are stock photography; only a file on the studio's own CDN is a real photo.
function toStudioPhoto(url: string | null): string | null {
  return url !== null && url.startsWith(STUDIO_CDN) ? url : null;
}

// The legacy form stored palette indexes in the hex field; only real colours are kept.
function toColorCode(value: string): string | null {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : null;
}

interface GlazeNote {
  description: string;
  variation_note: string;
  color_code: string;
}

// What each glaze the studio has used actually does in the kiln, and how it varies.
// The legacy colour field held palette indexes rather than glaze colours, so the
// swatches are set here against the glaze name instead of read off the product.
const GLAZE_NOTES: Record<string, GlazeNote> = {
  "Baby Pink": {
    description:
      "A pale clay pink, matt to the touch, with the body showing faintly through it.",
    variation_note:
      "It takes the colour of the clay underneath, so a darker body makes a dustier pink.",
    color_code: "#AA8888",
  },
  "Forest Green": {
    description:
      "A matt green that breaks brown wherever the wall turns, so the throwing rings stay visible.",
    variation_note:
      "It breaks harder over a thin wall, so the pattern follows how the piece was thrown.",
    color_code: "#4F6F52",
  },
  "Forest Green and Transparent": {
    description:
      "Forest green over the lower half, with a clear glaze over bare clay above it.",
    variation_note:
      "The two meet in a soft edge that moves a centimetre either way in every firing.",
    color_code: "#5F7355",
  },
  Green: {
    description:
      "A plain leaf green, glossy where it runs thick and dry where it runs thin.",
    variation_note:
      "Thickness is judged by hand at the dipping bucket, so the gloss changes from pot to pot.",
    color_code: "#6B8F5A",
  },
  Maroon: {
    description:
      "A dark red that goes almost brown where it lies thick and pink where it thins over an edge.",
    variation_note:
      "Rims and handles come out lighter than the body nearly every time.",
    color_code: "#7B3F44",
  },
  Multan: {
    description:
      "Golden clay under a clear glaze, so the colour is the body itself rather than a coat over it.",
    variation_note:
      "Every load of clay comes out of the ground a little different, so the gold runs warmer or paler.",
    color_code: "#B07C4F",
  },
  "Ocean Blue": {
    description:
      "A deep blue that thins to grey on the rims and gathers dark in the throwing rings.",
    variation_note:
      "How dark it goes depends on where the piece stood in the kiln, so no two pots match.",
    color_code: "#3F6C8F",
  },
  "Reduction Brown": {
    description:
      "Fired with the kiln starved of air, which pulls the iron in the clay to the surface as brown.",
    variation_note:
      "Reduction is never even across a load; some pieces come out ruddy, some nearly grey.",
    color_code: "#6E4B34",
  },
  "Shades of Blue": {
    description:
      "Two blues poured over each other, so the wall moves from pale at the rim to deep near the foot.",
    variation_note:
      "The line where they meet is drawn by the firing, never by hand.",
    color_code: "#5C7FA3",
  },
  "Shades of Nature": {
    description:
      "Earth tones laid over one another, sand at the rim giving way to darker brown at the foot.",
    variation_note:
      "Where one tone hands over to the next is settled in the kiln.",
    color_code: "#9A8566",
  },
  Transparent: {
    description:
      "A clear glaze over bare clay: it seals the piece for daily use and lets the body do the colour.",
    variation_note:
      "Every mark left by the wheel and the trimming tool stays visible under it.",
    color_code: "#D9CDBB",
  },
  "Wood Brown": {
    description:
      "A warm brown that darkens into the throwing lines and lightens across the rim.",
    variation_note:
      "The grain follows the potter's fingers, so it lies differently on every wall.",
    color_code: "#7A5B42",
  },
  "Wood Fired": {
    description:
      "Fired with wood, so ash carried through the kiln lands on the piece and melts into the surface.",
    variation_note:
      "The side facing the firebox takes more ash, so each piece is given a front and a back.",
    color_code: "#8A6A4B",
  },
  Zebra: {
    description:
      "Black and white poured in bands and left to run into each other down the wall.",
    variation_note:
      "How far they run depends on the heat, so the stripes are never the same width twice.",
    color_code: "#4A4540",
  },
};

const GLAZE_FALLBACK: Omit<GlazeNote, "color_code"> = {
  description:
    "Mixed and dipped in the studio, then fired with the rest of the load.",
  variation_note:
    "Thickness is judged by hand, so the same glaze reads differently on every piece.",
};

const LOWERCASE_WORDS = new Set(["and", "of", "the"]);

// "Forest green and transparent " and "Forest Green And Transparent" are one glaze.
function toGlazeName(value: string): string {
  return cleanText(value)
    .toLowerCase()
    .split(" ")
    .map((word, index) =>
      index > 0 && LOWERCASE_WORDS.has(word)
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}

// The studio's name is "where clay meets verses": a description written as a verse
// belongs in the maker's note, not in the paragraph that says what the piece is.
function isVerse(description: string): boolean {
  const lines = description
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  return lines.length >= 3 && lines.every((line) => line.length <= 80);
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
      `select r.*, coalesce(json_agg(json_build_object('starts_at', s.slot_start_at, 'ends_at', s.slot_end_at) order by s.slot_start_at)
           filter (where s.id is not null), '[]') as slots
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

// One glaze per distinct colour the studio wrote on a piece, with what it does in the kiln.
async function importGlazes(
  products: LegacyProduct[],
): Promise<Map<string, number>> {
  const names = [
    ...new Set(
      products
        .map((product) => toGlazeName(product.color_name))
        .filter(Boolean),
    ),
  ].sort();
  const ids = new Map<string, number>();
  for (const name of names) {
    const note = GLAZE_NOTES[name];
    const data = {
      name,
      description: note?.description ?? GLAZE_FALLBACK.description,
      variation_note: note?.variation_note ?? GLAZE_FALLBACK.variation_note,
      color_code: note?.color_code ?? null,
    };
    const row = await prisma.glaze.upsert({
      where: { slug: slugify(name) },
      create: { slug: slugify(name), ...data },
      update: data,
    });
    ids.set(name, row.id);
  }
  return ids;
}

async function importCatalog(
  collections: LegacyCollection[],
  products: LegacyProduct[],
  glazeIds: Map<string, number>,
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
    const glaze_id = glazeIds.get(toGlazeName(product.color_name));
    const legacyText = (product.description ?? "").trim();
    const hasVerse = isVerse(legacyText);
    const data: Prisma.ProductUpsertArgs["create"] = {
      slug,
      name: cleanText(product.name),
      description: hasVerse
        ? FALLBACK_DESCRIPTION
        : toDescription(product.description),
      maker_note: hasVerse ? legacyText : null,
      price: product.price,
      material: cleanText(product.material) || "Stoneware",
      color_name: cleanText(product.color_name) || null,
      color_code: toColorCode(product.color_code),
      care_notes: toCareNotes(product.instructions),
      image_urls: toImageUrls(slug, product.image_urls),
      stock: Math.max(product.available_quantity, 0),
      is_active: product.is_active,
      created_at: product.created_at,
      collection: collection_id
        ? { connect: { id: collection_id } }
        : undefined,
      glaze: glaze_id ? { connect: { id: glaze_id } } : undefined,
      categories: {
        connect: product.categories.map((name) => ({ slug: slugify(name) })),
      },
    };
    const row = await prisma.product.upsert({
      where: { slug },
      create: data,
      update: {
        ...data,
        // A piece whose colour was cleared loses its glaze rather than keeping the old one.
        glaze: glaze_id ? { connect: { id: glaze_id } } : { disconnect: true },
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
    await prisma.category.upsert({
      where: { slug: slugify(category) },
      create: { slug: slugify(category), name: category },
      update: {},
    });
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
    // Legacy kept one row per booked hour; those rows become the booking's slots.
    // json_agg emits naive UTC text that bypasses the timestamp parser above.
    const slots = booking.slots.map((slot) => ({
      starts_at: new Date(`${slot.starts_at}Z`),
      ends_at: new Date(`${slot.ends_at}Z`),
    }));
    if (!user_id || slots.length === 0) continue;
    const row = {
      config_id: config.id,
      user_id,
      starts_at: slots[0]!.starts_at,
      ends_at: slots[slots.length - 1]!.ends_at,
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
      create: { id: booking.id, ...row, slots: { create: slots } },
      update: { ...row, slots: { deleteMany: {}, create: slots } },
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
      heading: "Our story",
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
      title: ABOUT_TITLE,
      subtitle: ABOUT_SUBTITLE,
      hero_image_url: toStudioPhoto(aboutHero),
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
  const glazeIds = await importGlazes(legacy.products);
  const productIds = await importCatalog(
    legacy.collections,
    legacy.products,
    glazeIds,
  );
  const custom = await importCustomPieces(legacy.customize);
  const bookings = await importWorkshop(
    legacy.workshop,
    legacy.bookings,
    userIds,
  );
  const cart = await importCart(legacy.cart, userIds, productIds);
  await importContent(legacy.about, legacy.aboutHero, legacy.contact);
  process.stdout.write(
    `Imported ${userIds.size} users, ${glazeIds.size} glazes, ${productIds.size} products, ${custom} custom pieces, ${bookings} bookings, ${cart} cart lines\n`,
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
