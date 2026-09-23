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
const STUDIO_ADDRESS =
  "Plot no. 48, Above Shanti Kamal Bungalow, Ekta Colony, Sangli";

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
    image_url: img(6611264),
    gallery: [img(6611264), img(6611393), img(33878963)],
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
    image_url: img(29520386),
    gallery: [img(29520386), img(9396434), img(18449690)],
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
    image_url: img(33878971),
    gallery: [img(33878971), img(8063881), img(27850849)],
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
    image_url: img(13061472),
    gallery: [img(13061472), img(5020925)],
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
    image_url: img(5020925),
    gallery: [img(5020925)],
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
    image_url: img(6611393),
    gallery: [img(6611393), img(26733190), img(31875677)],
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
    image_url: img(3475853),
    gallery: [img(3475853), img(13061472)],
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
  image_url: "",
  timezone: "Asia/Kolkata",
  opening_minutes: 13 * 60,
  closing_minutes: 19 * 60,
  slot_minutes: 60,
  capacity_per_slot: 6,
  booking_window_days: 60,
  slot_span_days: 7,
  closed_weekdays: [1],
  tiers: [
    { hours: 1, price_per_person: 1100, pieces_per_person: 1 },
    { hours: 2, price_per_person: 2000, pieces_per_person: 2 },
    { hours: 3, price_per_person: 2700, pieces_per_person: 4 },
  ],
};

export const siteSettings = {
  contact_phone: "+91 8329026762",
  whatsapp_number: "918329026762",
  contact_email: "poetryandpottery.aj@gmail.com",
  address: STUDIO_ADDRESS,
  opening_hours: "Mon-Fri, 12 pm - 7 pm. Sat- Sun, 12 pm - 8 pm",
  instagram_url: "",
  facebook_url: "",
  youtube_url: "",
  shipping_flat_fee: 150,
  free_shipping_above: 2500,
  announcement_text: "Free shipping on orders of ₹2,500 and more",
  announcement_href: "/products",
  hero_heading: "Pottery made slowly, in Sangli",
  hero_subheading:
    "Wheel-thrown mugs, bowls and planters glazed in earthy greens and greys. Each piece is made by hand, so no two are quite the same.",
  hero_image_url: "",
  hero_cta_text: "Shop the shelf",
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
    hero_image_url: "",
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
    hero_image_url: "",
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
            title: "How long until it ships?",
            body: "Pieces on the shelf leave the studio within three working days of payment. Made-to-order pieces take two to three weeks, because they still have to be thrown, dried, fired twice and glazed.",
          },
          {
            title: "Do prices include GST, and do I get an invoice?",
            body: "Prices on the site are in rupees and include GST. The invoice goes out with the shipping confirmation; tell us on WhatsApp if you need it made out to a company.",
          },
        ],
      },
      {
        heading: "The pieces",
        body: "",
        items: [
          {
            title: "Is every piece exactly like the photo?",
            body: "No. We photograph one piece from a batch, and the one you get is its sibling rather than its twin.",
          },
          {
            title: "Why do two pieces in the same glaze look different?",
            body: "Glaze is mixed in small batches and a kiln has hotter and cooler shelves, so the same recipe can come out darker on one piece than the next. Thickness where the glaze was poured changes it again.",
          },
          {
            title: "Are they food safe?",
            body: "Yes. Every glaze we use is food safe and lead free, and glazed pieces are made for daily eating and drinking. Unglazed terracotta absorbs water, so those are for plants and dry use.",
          },
          {
            title: "Microwave and dishwasher?",
            body: "Both are fine for glazed stoneware, and the top rack is kinder to it. Hand washing keeps the glaze bright for longer.",
          },
          {
            title: "What counts as a fault?",
            body: "A stray glaze speck, a thumb dent or a slightly uneven rim is how a handmade piece looks. A crack, a chip or a piece that will not sit flat is a fault, so send us a photo.",
          },
        ],
      },
      {
        heading: "Shipping and returns",
        body: "",
        items: [
          {
            title: "What if it arrives broken?",
            body: "Send us a photo of the piece and the box on WhatsApp within 48 hours and we will replace it or refund you, shipping included. Keep the packaging until it is settled.",
          },
          {
            title: "How is it packed?",
            body: "Each piece is wrapped in paper, then bubble wrap, then packed into a double-walled box with the gaps filled. Nothing travels loose.",
          },
          {
            title: "Can I return a made-to-order piece?",
            body: "No. A piece thrown to your brief cannot go back on the shelf, so it is final once we start. If it arrives damaged or is not what we agreed, we remake it.",
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
          {
            title: "Can I cancel a workshop?",
            body: "Cancel up to 24 hours before the session and we refund you in full. Later than that we can move you to another date once.",
          },
        ],
      },
    ],
  },
  {
    slug: "shipping",
    title: "Shipping and returns",
    subtitle: "Packed by hand, shipped across India.",
    hero_image_url: "",
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
    hero_image_url: "",
    sections: [
      {
        heading: "The first wash",
        body: "Rinse a new piece in warm soapy water and dry it with a cloth before you use it. Nothing needs seasoning or soaking. The faint kiln smell some pieces carry goes after that first wash.",
        items: [],
      },
      {
        heading: "Everyday use",
        body: "All our glazed pieces are food safe, microwave safe and dishwasher safe on a gentle cycle. Hand washing keeps glazes bright for longer. Unglazed terracotta will absorb water, so keep those pieces for dry use or plants.",
        items: [],
      },
      {
        heading: "Heat and cold",
        body: "Stoneware minds sudden changes in temperature more than heat itself. Warm a mug with a little hot water before you pour boiling tea into it, and let a dish come up to room temperature before it goes into a hot oven. A piece taken from the fridge to the oven can crack straight through.",
        items: [],
      },
      {
        heading: "Tea and coffee stains",
        body: "The brown ring inside a well-used mug is tannin, not damage. Leave a paste of bicarbonate of soda and water in the mug for an hour, then wipe it out with a soft sponge. Scouring powder and steel wool will take the stain off and the shine with it.",
        items: [],
      },
      {
        heading: "Crazing is not a fault",
        body: "Fine lines across the glaze, like a cracked eggshell, are crazing: the glaze and the clay beneath it settle at slightly different rates as they cool. The piece is still sound and still holds water, and some glazes are made to do it. Tell us only if a crazed piece starts to weep or hold a smell.",
        items: [],
      },
      {
        heading: "Wood-fired pieces",
        body: "Ash lands on these in the kiln, so one side is usually darker and rougher than the other and the foot feels like stone. Wash them by hand and keep them off the dishwasher's hot cycle. They are happiest serving food and sitting out on a shelf.",
        items: [],
      },
      {
        heading: "Storing",
        body: "Do not hang mugs by the handle or stack them inside one another. Between stacked bowls, put a cloth or a paper napkin so the unglazed foot ring does not score the piece below. Planters go on a saucer, never straight onto wood.",
        items: [],
      },
      {
        heading: "What to avoid",
        body: "",
        items: [
          {
            title: "Abrasive scrubbers",
            body: "Steel wool scratches glaze. A soft sponge is enough.",
          },
          {
            title: "Open flame",
            body: "None of our pieces are made for the stovetop or an induction plate.",
          },
          {
            title: "Long soaking",
            body: "Leaving a piece in the sink overnight lets water into the unglazed foot. Wash it and dry it.",
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
        body: "Write to poetryandpottery.aj@gmail.com to see or delete what we hold about you.",
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
        body: "Questions about these terms can be sent to poetryandpottery.aj@gmail.com.",
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
