export interface SeedEvent {
  slug: string;
  title: string;
  description: string;
  event_type: "POTTERY_WORKSHOP" | "OPEN_MIC";
  status: "PUBLISHED" | "COMPLETED";
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";
  days_from_now: number;
  duration_hours: number;
  price: number;
  total_seats: number;
  booked_seats: number;
  location: string;
  address: string;
  instructor?: string;
  image_url: string;
  gallery: string[];
  includes: string[];
  highlights: string[];
  performers: string[];
}

const img = (id: number): string =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg`;

const STUDIO = "Poetry & Pottery Studio";
const STUDIO_ADDRESS = "12 Kala Nagar, Sangli, Maharashtra 416416";

export const events: SeedEvent[] = [
  {
    slug: "wheel-throwing-for-beginners",
    title: "Wheel Throwing for Beginners",
    description:
      "Three hours at the wheel with no experience needed. You will centre clay, pull up a cylinder and leave with two pieces we fire and glaze for you to collect in two weeks. Aprons, clay and tea are on us.",
    event_type: "POTTERY_WORKSHOP",
    status: "PUBLISHED",
    level: "BEGINNER",
    days_from_now: 6,
    duration_hours: 3,
    price: 1800,
    total_seats: 8,
    booked_seats: 3,
    location: STUDIO,
    address: STUDIO_ADDRESS,
    instructor: "Sandeep Manchekar",
    image_url: img(4207892),
    gallery: [img(3094218), img(2162938), img(4207892)],
    includes: [
      "All clay and tools",
      "Two fired and glazed pieces",
      "Chai and biscuits",
    ],
    highlights: [
      "Small group of eight",
      "Take home what you make",
      "No experience needed",
    ],
    performers: [],
  },
  {
    slug: "hand-building-planters",
    title: "Hand-building Planters",
    description:
      "A slower afternoon away from the wheel. Learn coil and slab building to make a planter with a drainage hole and a saucer. Good for anyone who likes working with their hands and does not mind mud under the nails.",
    event_type: "POTTERY_WORKSHOP",
    status: "PUBLISHED",
    level: "ALL_LEVELS",
    days_from_now: 13,
    duration_hours: 2.5,
    price: 1500,
    total_seats: 10,
    booked_seats: 6,
    location: STUDIO,
    address: STUDIO_ADDRESS,
    instructor: "Poetry & Pottery",
    image_url: img(2325307),
    gallery: [img(2325307), img(11424070)],
    includes: ["Clay and tools", "One fired planter with saucer", "Tea"],
    highlights: [
      "No wheel, no pressure",
      "Suitable for kids over twelve with an adult",
    ],
    performers: [],
  },
  {
    slug: "glaze-lab-intermediate",
    title: "Glaze Lab",
    description:
      "For people who have thrown before and want to understand what happens in the kiln. Mix test tiles, layer glazes and learn why the same green looks different on stoneware and porcelain. Bring two bisque-fired pieces of your own to glaze.",
    event_type: "POTTERY_WORKSHOP",
    status: "PUBLISHED",
    level: "INTERMEDIATE",
    days_from_now: 20,
    duration_hours: 4,
    price: 2400,
    total_seats: 6,
    booked_seats: 6,
    location: STUDIO,
    address: STUDIO_ADDRESS,
    instructor: "Sandeep Manchekar",
    image_url: img(3094218),
    gallery: [img(3094218), img(2424235)],
    includes: [
      "Glaze materials",
      "Firing for two pieces",
      "Printed glaze notes",
    ],
    highlights: ["Six seats only", "Bring your own bisque ware"],
    performers: [],
  },
  {
    slug: "verses-and-vases-evening",
    title: "Verses & Vases Evening",
    description:
      "An open mic in the studio, between the shelves. Poets, singers and storytellers get five minutes each. Come to perform or just to listen. Chai and light bites through the evening.",
    event_type: "OPEN_MIC",
    status: "PUBLISHED",
    days_from_now: 9,
    duration_hours: 3,
    price: 300,
    total_seats: 40,
    booked_seats: 22,
    location: STUDIO,
    address: STUDIO_ADDRESS,
    image_url: img(207474),
    gallery: [img(207474), img(13627258)],
    includes: [
      "Stage time if you sign up",
      "Chai and bites",
      "A seat among friendly people",
    ],
    highlights: ["First-timers welcome", "Sign up to perform at the door"],
    performers: ["Aarav Kulkarni", "Meera Joshi", "Open sign-ups"],
  },
  {
    slug: "spoken-word-saturday",
    title: "Spoken Word Saturday",
    description:
      "A quieter open mic for spoken word and short prose. We keep the lights low and the mic warm.",
    event_type: "OPEN_MIC",
    status: "PUBLISHED",
    days_from_now: 27,
    duration_hours: 2.5,
    price: 250,
    total_seats: 35,
    booked_seats: 4,
    location: STUDIO,
    address: STUDIO_ADDRESS,
    image_url: img(13627258),
    gallery: [img(13627258)],
    includes: ["Stage time", "Chai"],
    highlights: ["Spoken word and prose only", "Supportive room"],
    performers: ["Open sign-ups"],
  },
  {
    slug: "monsoon-wheel-weekend",
    title: "Monsoon Wheel Weekend",
    description:
      "Two mornings at the wheel during the rains. Everyone left with bowls, a few with mugs, and one with a vase that leaned but held.",
    event_type: "POTTERY_WORKSHOP",
    status: "COMPLETED",
    level: "BEGINNER",
    days_from_now: -40,
    duration_hours: 3,
    price: 1800,
    total_seats: 8,
    booked_seats: 8,
    location: STUDIO,
    address: STUDIO_ADDRESS,
    instructor: "Sandeep Manchekar",
    image_url: img(2162938),
    gallery: [img(2162938), img(4207892), img(3094218)],
    includes: ["Clay and tools", "Two fired pieces", "Chai"],
    highlights: ["Sold out", "Rain on the tin roof"],
    performers: [],
  },
  {
    slug: "clay-and-verse-showcase",
    title: "Clay & Verse Showcase",
    description:
      "Our biggest open mic so far. Twelve performers, a full room, and a poem about a broken kiln that nobody has forgotten.",
    event_type: "OPEN_MIC",
    status: "COMPLETED",
    days_from_now: -18,
    duration_hours: 3,
    price: 300,
    total_seats: 45,
    booked_seats: 41,
    location: STUDIO,
    address: STUDIO_ADDRESS,
    image_url: img(9106375),
    gallery: [img(9106375), img(207474)],
    includes: ["Stage time", "Chai and bites"],
    highlights: ["Twelve performers", "Full house"],
    performers: ["Aarav Kulkarni", "Meera Joshi", "Rhea D'Souza", "Kabir Sen"],
  },
];

export const workshopConfig = {
  slug: "open-studio",
  name: "Open Studio Sessions",
  description:
    "Book an hour or more at the wheel any afternoon. A potter is on hand to help, and everything you make is fired and ready to collect in two weeks.",
  image_url: img(2162938),
  timezone: "Asia/Kolkata",
  opening_minutes: 13 * 60,
  closing_minutes: 19 * 60,
  slot_minutes: 60,
  capacity_per_slot: 6,
  booking_window_days: 60,
  closed_weekdays: [1],
  tiers: [
    { hours: 1, price_per_person: 950, pieces_per_person: 1 },
    { hours: 2, price_per_person: 1700, pieces_per_person: 2 },
    { hours: 3, price_per_person: 2400, pieces_per_person: 3 },
  ],
};

export const siteSettings = {
  contact_phone: "+91 91234 56789",
  whatsapp_number: "919123456789",
  contact_email: "hello@poetryandpottery.in",
  address: STUDIO_ADDRESS,
  opening_hours: "Tuesday to Sunday, 1 pm to 7 pm",
  instagram_url: "https://instagram.com/poetryandpottery",
  facebook_url: "https://facebook.com/poetryandpottery",
  youtube_url: "",
  shipping_flat_fee: 150,
  free_shipping_above: 2500,
  announcement_text: "Free shipping on orders above ₹2,500",
  announcement_href: "/products",
  hero_heading: "Pottery made slowly, in Sangli",
  hero_subheading:
    "Wheel-thrown mugs, bowls and planters glazed in earthy greens and greys. Each piece is made by hand, so no two are quite the same.",
  hero_image_url: img(2162938),
  hero_cta_text: "Shop the collection",
  hero_cta_href: "/products",
};

export interface SeedContentPage {
  slug: string;
  title: string;
  subtitle: string;
  hero_image_url: string;
  sections: {
    heading: string;
    body: string;
    items: { title: string; body: string }[];
  }[];
}

export const contentPages: SeedContentPage[] = [
  {
    slug: "about",
    title: "Where clay meets soul",
    subtitle: "A weekend hobby that turned into a studio.",
    hero_image_url: img(3094208),
    sections: [
      {
        heading: "How it started",
        body: "It began as a weekend escape from college stress in a new city. I had a commerce and mass communication background and had never touched clay. Finding a studio was hard, but the first afternoon at the wheel was enough. I did not choose pottery, pottery chose me.\n\nPottery has been my teacher. It has taught me patience, trusting the process, and the beauty of letting go when a piece cracks in the kiln. I am not a potter, I am a student of pottery, and I will be forever.",
        items: [],
      },
      {
        heading: "What we believe",
        body: "",
        items: [
          {
            title: "Trust the process",
            body: "From wedging clay to the final glaze, every step takes the time it takes.",
          },
          {
            title: "Handmade with heart",
            body: "Each piece is shaped by hand and carries small variations, like handwritten notes.",
          },
          {
            title: "The beauty of letting go",
            body: "Not every piece survives the kiln. That is part of the art.",
          },
        ],
      },
      {
        heading: "How a piece is made",
        body: "",
        items: [
          {
            title: "Wedging",
            body: "Air bubbles are worked out of the clay so it fires evenly.",
          },
          {
            title: "Shaping",
            body: "Thrown on the wheel or built by hand from coils and slabs.",
          },
          {
            title: "Drying and bisque firing",
            body: "Pieces dry for a week, then go through a first firing.",
          },
          {
            title: "Glazing",
            body: "Our own glaze combinations, mixed in small batches.",
          },
        ],
      },
    ],
  },
  {
    slug: "faq",
    title: "Questions, answered",
    subtitle: "Everything you might want to know before you order or book.",
    hero_image_url: img(1610701),
    sections: [
      {
        heading: "Orders",
        body: "",
        items: [
          {
            title: "How does payment work?",
            body: "Place your order on the site and we will confirm it on WhatsApp within a day, along with UPI and bank details. Your order ships once payment is received.",
          },
          {
            title: "Can I cancel?",
            body: "Yes, from your orders page, any time before we mark it as paid. After that, message us on WhatsApp and we will do our best.",
          },
          {
            title: "Is every piece exactly like the photo?",
            body: "No. Glaze colours vary between firings and no two pieces are identical. That is the point of handmade.",
          },
        ],
      },
      {
        heading: "Workshops",
        body: "",
        items: [
          {
            title: "Do I need experience?",
            body: "Not for beginner or all-levels sessions. Intermediate sessions assume you have thrown before.",
          },
          {
            title: "When do I get my pieces?",
            body: "Everything you make is dried, fired and glazed by us. Collect from the studio in about two weeks, or ask us to ship them.",
          },
          {
            title: "What should I wear?",
            body: "Something you do not mind getting muddy. Aprons are provided, but clay finds a way.",
          },
        ],
      },
    ],
  },
  {
    slug: "shipping",
    title: "Shipping and returns",
    subtitle: "Packed by hand, shipped across India.",
    hero_image_url: img(4498135),
    sections: [
      {
        heading: "Shipping",
        body: "Orders ship within three working days of payment and usually arrive in five to seven days. Shipping is a flat ₹150, free above ₹2,500. Every piece is wrapped in paper and packed in a double-walled box.",
        items: [],
      },
      {
        heading: "Damages",
        body: "If something arrives broken, send us a photo on WhatsApp within 48 hours and we will replace it or refund you. We do not offer exchanges or returns for change of mind, since each piece is made in small batches.",
        items: [],
      },
    ],
  },
  {
    slug: "care",
    title: "Caring for your pottery",
    subtitle:
      "Stoneware is tough, but a few habits keep it looking good for years.",
    hero_image_url: img(1610701),
    sections: [
      {
        heading: "Everyday use",
        body: "All our glazed pieces are food safe, microwave safe and dishwasher safe on a gentle cycle. Hand washing keeps glazes bright for longer. Unglazed terracotta will absorb water, so keep those pieces for dry use or plants.",
        items: [],
      },
      {
        heading: "What to avoid",
        body: "",
        items: [
          {
            title: "Thermal shock",
            body: "Do not move a piece straight from the fridge into a hot oven, or pour boiling water into a cold mug.",
          },
          {
            title: "Abrasive scrubbers",
            body: "Steel wool scratches glaze. A soft sponge is enough.",
          },
          {
            title: "Open flame",
            body: "None of our pieces are made for the stovetop.",
          },
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy policy",
    subtitle: "Last updated September 2026.",
    hero_image_url: "",
    sections: [
      {
        heading: "What we collect",
        body: "Your name, email, phone number and shipping address when you create an account, place an order or book a workshop. We use Clerk for sign-in and do not store your password.",
        items: [],
      },
      {
        heading: "How we use it",
        body: "To fulfil orders, confirm bookings, and send you updates you have asked for. We never sell your data.",
        items: [],
      },
      {
        heading: "Contact",
        body: "Write to hello@poetryandpottery.in to see or delete what we hold about you.",
        items: [],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms of service",
    subtitle: "Last updated September 2026.",
    hero_image_url: "",
    sections: [
      {
        heading: "Orders",
        body: "An order is confirmed only after we accept it and receive payment. Prices are in Indian rupees and include GST.",
        items: [],
      },
      {
        heading: "Workshops",
        body: "Bookings can be cancelled up to 24 hours before the session for a full refund. Later cancellations can be rescheduled once.",
        items: [],
      },
      {
        heading: "Contact",
        body: "Questions about these terms can be sent to hello@poetryandpottery.in.",
        items: [],
      },
    ],
  },
];

export const coupons = [
  { code: "WELCOME10", kind: "PERCENT" as const, value: 10, min_order: 1000 },
  {
    code: "STUDIO500",
    kind: "FIXED" as const,
    value: 500,
    min_order: 3000,
    max_uses: 50,
  },
];
