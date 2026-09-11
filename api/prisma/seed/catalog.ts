export interface SeedCategory {
  slug: string;
  name: string;
  icon: string;
  image_url: string;
}

export const categories: SeedCategory[] = [
  {
    slug: "mugs",
    name: "Mugs",
    icon: "coffee",
    image_url:
      "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
  },
  {
    slug: "bowls",
    name: "Bowls",
    icon: "bowl",
    image_url:
      "https://images.pexels.com/photos/15028227/pexels-photo-15028227.jpeg",
  },
  {
    slug: "plates",
    name: "Plates",
    icon: "plate",
    image_url:
      "https://images.pexels.com/photos/8696759/pexels-photo-8696759.jpeg",
  },
  {
    slug: "vases",
    name: "Vases",
    icon: "flower",
    image_url:
      "https://images.pexels.com/photos/18635393/pexels-photo-18635393.jpeg",
  },
  {
    slug: "planters",
    name: "Planters",
    icon: "plant",
    image_url:
      "https://images.pexels.com/photos/2325307/pexels-photo-2325307.jpeg",
  },
  {
    slug: "serveware",
    name: "Serveware",
    icon: "serving",
    image_url:
      "https://images.pexels.com/photos/19400090/pexels-photo-19400090.jpeg",
  },
  {
    slug: "accessories",
    name: "Accessories",
    icon: "sparkles",
    image_url:
      "https://images.pexels.com/photos/6030460/pexels-photo-6030460.jpeg",
  },
];

export interface SeedCollection {
  slug: string;
  name: string;
  description: string;
  image_url: string;
  ends_at?: string;
}

export const collections: SeedCollection[] = [
  {
    slug: "morning-table",
    name: "Morning Table",
    description:
      "Mugs, bowls and plates glazed in soft greys and sage, made for slow breakfasts.",
    image_url:
      "https://images.pexels.com/photos/2162938/pexels-photo-2162938.jpeg",
  },
  {
    slug: "monsoon-greens",
    name: "Monsoon Greens",
    description: "A limited run of forest and olive glazes fired this season.",
    image_url:
      "https://images.pexels.com/photos/3094218/pexels-photo-3094218.jpeg",
    ends_at: "2026-12-31T23:59:59.000Z",
  },
  {
    slug: "studio-classics",
    name: "Studio Classics",
    description:
      "The pieces we throw every week, and the ones people come back for.",
    image_url:
      "https://images.pexels.com/photos/2424235/pexels-photo-2424235.jpeg",
  },
  {
    slug: "quiet-forms",
    name: "Quiet Forms",
    description:
      "Unglazed and matte finishes for people who like their shelves calm.",
    image_url:
      "https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg",
  },
];

export interface SeedProduct {
  slug: string;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  material: string;
  color_name: string;
  color_code: string;
  dimensions: string;
  stock: number;
  categories: string[];
  collection?: string;
  images: string[];
  is_featured?: boolean;
  is_customizable?: boolean;
  sales_count?: number;
}

const img = (id: number | string, ext = "jpeg"): string =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${ext}`;

const CARE = [
  "Dishwasher safe on a gentle cycle; hand wash to keep the glaze bright for longer.",
  "Microwave safe. Avoid sudden temperature changes, so no oven to fridge.",
  "Small variations in colour and shape are part of the piece, not defects.",
];

export const careNotes = CARE;

export const products: SeedProduct[] = [
  {
    slug: "slate-morning-mug",
    name: "Slate Morning Mug",
    description:
      "A wide-bellied mug with a pulled handle that fits three fingers. Holds 320 ml, which is one honest cup of chai or a generous pour-over. Glazed in slate grey with a speckled rim where the iron in the clay shows through.",
    price: 850,
    compare_at_price: 950,
    material: "Stoneware",
    color_name: "Slate Grey",
    color_code: "#6B7280",
    dimensions: "9 cm tall, 8.5 cm wide",
    stock: 24,
    categories: ["mugs"],
    collection: "morning-table",
    images: [img(18426654), img(18273390), img(13190545)],
    is_featured: true,
    sales_count: 48,
  },
  {
    slug: "forest-tea-cup",
    name: "Forest Tea Cup",
    description:
      "A handleless cup that warms your palms. Deep forest green outside, a soft cream inside so you can see the colour of your tea. Holds 180 ml.",
    price: 620,
    material: "Stoneware",
    color_name: "Forest Green",
    color_code: "#588157",
    dimensions: "7 cm tall, 7.5 cm wide",
    stock: 30,
    categories: ["mugs"],
    collection: "monsoon-greens",
    images: [img(15028227), img(18635395), img(8696529)],
    sales_count: 31,
  },
  {
    slug: "storm-grey-latte-mug",
    name: "Storm Grey Latte Mug",
    description:
      "Low and wide for flat whites and cappuccinos. The tapered foot keeps it steady on a crowded desk. Holds 260 ml.",
    price: 780,
    material: "Earthenware",
    color_name: "Storm Grey",
    color_code: "#4B5563",
    dimensions: "7.5 cm tall, 10 cm wide",
    stock: 18,
    categories: ["mugs"],
    images: [img(5591657), img(18426652), img(18376920)],
    sales_count: 22,
  },
  {
    slug: "jet-black-espresso-cup",
    name: "Jet Black Espresso Cup",
    description:
      "A small, heavy cup for a short, strong coffee. Matte black glaze with a satin finish that does not show fingerprints.",
    price: 480,
    material: "Stoneware",
    color_name: "Jet Black",
    color_code: "#1F2937",
    dimensions: "6 cm tall, 6 cm wide",
    stock: 40,
    categories: ["mugs"],
    collection: "quiet-forms",
    images: [img(3776950), img(18376920), img(8696759)],
    sales_count: 19,
  },
  {
    slug: "mist-stacking-mug",
    name: "Mist Stacking Mug",
    description:
      "Straight sides so a set of four stacks neatly. Pale mist glaze over a warm clay body. Holds 300 ml.",
    price: 720,
    material: "Stoneware",
    color_name: "Mist",
    color_code: "#C7D3D4",
    dimensions: "9.5 cm tall, 8 cm wide",
    stock: 36,
    categories: ["mugs"],
    collection: "morning-table",
    images: [img(34144284), img(12480291), img(2130137)],
    sales_count: 27,
  },
  {
    slug: "custom-name-mug",
    name: "Custom Name Mug",
    description:
      "Our morning mug, made to order with your name or a short line carved into the clay before it is fired. Pick a size and a glaze, tell us the text, and we will throw it fresh. Allow ten days.",
    price: 950,
    material: "Stoneware",
    color_name: "Your choice",
    color_code: "#A3B18A",
    dimensions: "9 to 11 cm tall depending on size",
    stock: 50,
    categories: ["mugs"],
    images: [img(18273390), img(993626), img(18273388)],
    is_customizable: true,
    is_featured: true,
    sales_count: 64,
  },

  {
    slug: "ramen-bowl-sand",
    name: "Sand Ramen Bowl",
    description:
      "Deep and generous for noodles, dal-chawal or a big salad. The flared rim is comfortable to hold with both hands. Holds about 900 ml.",
    price: 1450,
    material: "Terracotta",
    color_name: "Sand",
    color_code: "#F2E9DC",
    dimensions: "8.5 cm tall, 19 cm wide",
    stock: 16,
    categories: ["bowls"],
    collection: "studio-classics",
    images: [img(8951881), img(16509996), img(18646111)],
    is_featured: true,
    sales_count: 39,
  },
  {
    slug: "light-grey-breakfast-bowl",
    name: "Light Grey Breakfast Bowl",
    description:
      "Sized for porridge, poha or fruit. A shallow curve that makes the last spoonful easy to reach.",
    price: 980,
    material: "Ceramic",
    color_name: "Light Grey",
    color_code: "#D1D5DB",
    dimensions: "6 cm tall, 15 cm wide",
    stock: 28,
    categories: ["bowls"],
    collection: "morning-table",
    images: [img(15028227), img(3750665), img(6858632)],
    sales_count: 25,
  },
  {
    slug: "forest-serving-bowl",
    name: "Forest Serving Bowl",
    description:
      "A large bowl for the middle of the table. Glazed forest green outside with a bare clay foot ring.",
    price: 2400,
    compare_at_price: 2800,
    material: "Stoneware",
    color_name: "Forest Green",
    color_code: "#588157",
    dimensions: "10 cm tall, 24 cm wide",
    stock: 9,
    categories: ["bowls", "serveware"],
    collection: "monsoon-greens",
    images: [img(18635395), img(15028227), img(8696529)],
    sales_count: 14,
  },
  {
    slug: "blush-dessert-bowls-set",
    name: "Blush Dessert Bowls, Set of 4",
    description:
      "Four small bowls in blush clay for kheer, ice cream or dips. Each one is slightly different, which is the point.",
    price: 1800,
    material: "Porcelain",
    color_name: "Blush Clay",
    color_code: "#E8D5C4",
    dimensions: "5 cm tall, 11 cm wide each",
    stock: 12,
    categories: ["bowls"],
    images: [img(3187013), img(9440473)],
    sales_count: 17,
  },
  {
    slug: "charcoal-mixing-bowl",
    name: "Charcoal Mixing Bowl",
    description:
      "Heavy enough to stay put while you whisk. The wide mouth makes it a fine fruit bowl the rest of the week.",
    price: 2100,
    material: "Porcelain",
    color_name: "Charcoal",
    color_code: "#2F3E46",
    dimensions: "12 cm tall, 26 cm wide",
    stock: 7,
    categories: ["bowls"],
    collection: "quiet-forms",
    images: [img(19884207, "png"), img(9884561)],
    sales_count: 8,
  },
  {
    slug: "olive-noodle-bowl",
    name: "Olive Noodle Bowl",
    description:
      "A tall bowl with chopstick rests pinched into the rim. Dark olive glaze that pools darker at the base.",
    price: 1350,
    material: "Terracotta",
    color_name: "Dark Olive",
    color_code: "#3A5A40",
    dimensions: "9 cm tall, 17 cm wide",
    stock: 20,
    categories: ["bowls"],
    collection: "monsoon-greens",
    images: [img(12480291), img(18635393), img(8696759)],
    sales_count: 21,
  },

  {
    slug: "cloud-grey-dinner-plate",
    name: "Cloud Grey Dinner Plate",
    description:
      "A full-size dinner plate with a low rim that keeps sauces where they belong. Cloud grey with a hand-brushed edge.",
    price: 1200,
    material: "Ceramic",
    color_name: "Cloud Grey",
    color_code: "#9CA3AF",
    dimensions: "27 cm wide",
    stock: 22,
    categories: ["plates"],
    collection: "morning-table",
    images: [img(8696759), img(3750870), img(33868054)],
    is_featured: true,
    sales_count: 33,
  },
  {
    slug: "sage-side-plate",
    name: "Sage Side Plate",
    description:
      "For toast, snacks and the odd slice of cake. Sage green with a matte finish.",
    price: 680,
    material: "Terracotta",
    color_name: "Sage",
    color_code: "#A3B18A",
    dimensions: "19 cm wide",
    stock: 34,
    categories: ["plates"],
    images: [img(7559497), img(251336), img(3750709)],
    sales_count: 29,
  },
  {
    slug: "forest-platter",
    name: "Forest Platter",
    description:
      "An oval platter for biryani, roast vegetables or a spread of cheese. Forest green outside, cream inside.",
    price: 2900,
    material: "Terracotta",
    color_name: "Forest Green",
    color_code: "#588157",
    dimensions: "34 cm by 22 cm",
    stock: 6,
    categories: ["plates", "serveware"],
    collection: "monsoon-greens",
    images: [img(993626), img(2227817), img(18646117)],
    sales_count: 11,
  },
  {
    slug: "charcoal-quarter-plate",
    name: "Charcoal Quarter Plate",
    description:
      "A small plate in satin charcoal. Good for chutneys, pickles and desserts that deserve their own plate.",
    price: 520,
    material: "Porcelain",
    color_name: "Charcoal",
    color_code: "#2F3E46",
    dimensions: "15 cm wide",
    stock: 40,
    categories: ["plates"],
    collection: "quiet-forms",
    images: [img(19375004), img(18376920)],
    sales_count: 18,
  },
  {
    slug: "blush-dinner-plates-set",
    name: "Blush Dinner Plates, Set of 2",
    description:
      "A pair of dinner plates in blush clay, glazed thick so the colour reads warm under evening light.",
    price: 2200,
    compare_at_price: 2400,
    material: "Porcelain",
    color_name: "Blush Clay",
    color_code: "#E8D5C4",
    dimensions: "26 cm wide each",
    stock: 10,
    categories: ["plates"],
    images: [img(18646117), img(2130137), img(18646120)],
    sales_count: 15,
  },

  {
    slug: "olive-bud-vase",
    name: "Olive Bud Vase",
    description:
      "A narrow-necked vase for a single stem or a few sprigs from the garden. Dark olive with a glossy lip.",
    price: 890,
    material: "Porcelain",
    color_name: "Dark Olive",
    color_code: "#3A5A40",
    dimensions: "14 cm tall",
    stock: 26,
    categories: ["vases"],
    collection: "monsoon-greens",
    images: [img(18635393), img(16509996), img(18426654)],
    is_featured: true,
    sales_count: 36,
  },
  {
    slug: "sand-bottle-vase",
    name: "Sand Bottle Vase",
    description:
      "A bottle-shaped vase in unglazed terracotta, sanded smooth. Made for dried grasses and eucalyptus.",
    price: 1100,
    material: "Terracotta",
    color_name: "Sand",
    color_code: "#F2E9DC",
    dimensions: "22 cm tall",
    stock: 14,
    categories: ["vases"],
    collection: "quiet-forms",
    images: [img(8951881), img(16509996), img(18646111)],
    sales_count: 20,
  },
  {
    slug: "light-grey-tall-vase",
    name: "Light Grey Tall Vase",
    description:
      "Tall enough for lilies and long branches. Light grey glaze that drips slightly at the base, as it should.",
    price: 2600,
    material: "Terracotta",
    color_name: "Light Grey",
    color_code: "#D1D5DB",
    dimensions: "32 cm tall",
    stock: 8,
    categories: ["vases"],
    images: [img(18376920), img(608127)],
    sales_count: 9,
  },
  {
    slug: "blush-round-vase",
    name: "Blush Round Vase",
    description:
      "A round, low vase for a loose bunch of flowers. Blush clay with a satin finish.",
    price: 1500,
    material: "Porcelain",
    color_name: "Blush Clay",
    color_code: "#E8D5C4",
    dimensions: "16 cm tall, 18 cm wide",
    stock: 11,
    categories: ["vases"],
    images: [img(3187013), img(9440473)],
    sales_count: 13,
  },
  {
    slug: "cloud-grey-pitcher-vase",
    name: "Cloud Grey Pitcher Vase",
    description:
      "Shaped like a milk jug, used mostly for flowers. Cloud grey with a pulled handle.",
    price: 1650,
    material: "Terracotta",
    color_name: "Cloud Grey",
    color_code: "#9CA3AF",
    dimensions: "20 cm tall",
    stock: 13,
    categories: ["vases", "serveware"],
    images: [img(2130137), img(19859578)],
    sales_count: 12,
  },

  {
    slug: "blush-tabletop-planter",
    name: "Blush Tabletop Planter",
    description:
      "A small planter with a drainage hole and a matching saucer. Sized for succulents and herbs on a windowsill.",
    price: 950,
    material: "Porcelain",
    color_name: "Blush Clay",
    color_code: "#E8D5C4",
    dimensions: "11 cm tall, 12 cm wide",
    stock: 30,
    categories: ["planters"],
    images: [img(11424070, "png"), img(18646120), img(2568459)],
    is_featured: true,
    sales_count: 41,
  },
  {
    slug: "cloud-grey-hanging-planter",
    name: "Cloud Grey Hanging Planter",
    description:
      "Comes with a jute hanger. A wide mouth so trailing plants have room to spill over.",
    price: 1400,
    material: "Terracotta",
    color_name: "Cloud Grey",
    color_code: "#9CA3AF",
    dimensions: "13 cm tall, 16 cm wide",
    stock: 15,
    categories: ["planters"],
    images: [img(2325307), img(14775031), img(993626)],
    sales_count: 23,
  },
  {
    slug: "charcoal-floor-planter",
    name: "Charcoal Floor Planter",
    description:
      "A large planter for a fiddle-leaf fig or a monstera. Charcoal glaze outside, sealed terracotta inside.",
    price: 3800,
    material: "Earthenware",
    color_name: "Charcoal",
    color_code: "#2F3E46",
    dimensions: "30 cm tall, 28 cm wide",
    stock: 5,
    categories: ["planters"],
    collection: "quiet-forms",
    images: [img(12496758), img(12566547), img(2227817)],
    sales_count: 7,
  },
  {
    slug: "mist-herb-pots-set",
    name: "Mist Herb Pots, Set of 3",
    description:
      "Three small pots for basil, mint and coriander. Mist glaze with saucers included.",
    price: 1650,
    material: "Ceramic",
    color_name: "Mist",
    color_code: "#C7D3D4",
    dimensions: "9 cm tall, 9 cm wide each",
    stock: 18,
    categories: ["planters"],
    collection: "morning-table",
    images: [img(3776950), img(34299319), img(2480399)],
    sales_count: 26,
  },
  {
    slug: "jet-black-orchid-pot",
    name: "Jet Black Orchid Pot",
    description:
      "Slotted sides so orchid roots can breathe. Jet black with a matte finish.",
    price: 1250,
    material: "Ceramic",
    color_name: "Jet Black",
    color_code: "#1F2937",
    dimensions: "14 cm tall, 13 cm wide",
    stock: 12,
    categories: ["planters"],
    images: [img(2568459), img(34144284), img(6030460)],
    sales_count: 10,
  },

  {
    slug: "light-grey-serving-tray",
    name: "Light Grey Serving Tray",
    description:
      "A flat tray with raised edges for chai cups or a cheese board. Light grey glaze.",
    price: 1900,
    material: "Ceramic",
    color_name: "Light Grey",
    color_code: "#D1D5DB",
    dimensions: "30 cm by 18 cm",
    stock: 9,
    categories: ["serveware"],
    images: [img(2568459), img(3750665), img(18646120)],
    sales_count: 16,
  },
  {
    slug: "olive-dip-bowls-set",
    name: "Olive Dip Bowls, Set of 3",
    description:
      "Three tiny bowls for chutney, raita and pickle. Dark olive glaze.",
    price: 990,
    material: "Ceramic",
    color_name: "Dark Olive",
    color_code: "#3A5A40",
    dimensions: "4 cm tall, 8 cm wide each",
    stock: 24,
    categories: ["serveware", "bowls"],
    collection: "monsoon-greens",
    images: [img(18376920), img(18635389), img(8696759)],
    sales_count: 30,
  },
  {
    slug: "forest-butter-dish",
    name: "Forest Butter Dish",
    description:
      "A lidded dish that keeps butter soft and covered. Forest green with a knob handle.",
    price: 1150,
    material: "Porcelain",
    color_name: "Forest Green",
    color_code: "#588157",
    dimensions: "8 cm tall, 15 cm wide",
    stock: 14,
    categories: ["serveware"],
    images: [img(19400090), img(19375004), img(14122680)],
    sales_count: 19,
  },
  {
    slug: "slate-oil-pourer",
    name: "Slate Oil Pourer",
    description:
      "A pourer with a narrow spout that does not drip. Slate grey with a cork stopper. Holds 350 ml.",
    price: 1300,
    material: "Ceramic",
    color_name: "Slate Grey",
    color_code: "#6B7280",
    dimensions: "18 cm tall",
    stock: 16,
    categories: ["serveware", "accessories"],
    collection: "studio-classics",
    images: [img(14207081), img(16509996), img(34579318)],
    sales_count: 24,
  },
  {
    slug: "charcoal-salt-cellar",
    name: "Charcoal Salt Cellar",
    description:
      "A small lidded pot for flaky salt beside the stove. Charcoal glaze with a bare clay lid.",
    price: 740,
    material: "Ceramic",
    color_name: "Charcoal",
    color_code: "#2F3E46",
    dimensions: "7 cm tall, 8 cm wide",
    stock: 20,
    categories: ["serveware", "accessories"],
    images: [img(1724184), img(11424070, "png")],
    sales_count: 15,
  },

  {
    slug: "sage-incense-holder",
    name: "Sage Incense Holder",
    description:
      "A flat dish with a raised holder for a single stick. Catches the ash and looks fine doing nothing.",
    price: 450,
    material: "Porcelain",
    color_name: "Sage",
    color_code: "#A3B18A",
    dimensions: "12 cm long",
    stock: 45,
    categories: ["accessories"],
    images: [img(6030460), img(28835746)],
    is_featured: true,
    sales_count: 52,
  },
  {
    slug: "jet-black-ring-dish",
    name: "Jet Black Ring Dish",
    description:
      "A tiny dish for rings, keys or earrings by the door. Jet black glaze, cream rim.",
    price: 390,
    material: "Terracotta",
    color_name: "Jet Black",
    color_code: "#1F2937",
    dimensions: "9 cm wide",
    stock: 50,
    categories: ["accessories"],
    images: [img(9884561), img(14122680), img(6030460)],
    sales_count: 44,
  },
  {
    slug: "sand-candle-holder",
    name: "Sand Candle Holder",
    description:
      "Holds a standard taper candle. Unglazed sand terracotta with a smooth, chalky feel.",
    price: 560,
    material: "Terracotta",
    color_name: "Sand",
    color_code: "#F2E9DC",
    dimensions: "8 cm tall",
    stock: 28,
    categories: ["accessories"],
    collection: "quiet-forms",
    images: [img(34144284), img(18635389), img(34579318)],
    sales_count: 18,
  },
  {
    slug: "storm-grey-soap-dish",
    name: "Storm Grey Soap Dish",
    description:
      "Ridged so the soap dries between uses. Storm grey glaze that suits most bathrooms.",
    price: 620,
    material: "Earthenware",
    color_name: "Storm Grey",
    color_code: "#4B5563",
    dimensions: "12 cm by 8 cm",
    stock: 22,
    categories: ["accessories"],
    images: [img(5591657), img(18426652), img(18376920)],
    sales_count: 21,
  },
  {
    slug: "blush-spoon-rest",
    name: "Blush Spoon Rest",
    description:
      "A shallow rest for the spoon you keep reaching for. Blush clay with a satin glaze.",
    price: 480,
    material: "Earthenware",
    color_name: "Blush Clay",
    color_code: "#E8D5C4",
    dimensions: "14 cm long",
    stock: 0,
    categories: ["accessories"],
    images: [img(2168346, "png"), img(34579318)],
    sales_count: 12,
  },
];

export interface SeedOptionGroup {
  name: string;
  kind: "CHOICE" | "TEXT";
  is_required: boolean;
  price_modifier?: number;
  max_length?: number;
  options?: { name: string; price_modifier: number }[];
}

export const customMugOptions: SeedOptionGroup[] = [
  {
    name: "Size",
    kind: "CHOICE",
    is_required: true,
    options: [
      { name: "Regular (300 ml)", price_modifier: 0 },
      { name: "Large (400 ml)", price_modifier: 150 },
    ],
  },
  {
    name: "Glaze",
    kind: "CHOICE",
    is_required: true,
    options: [
      { name: "Sage", price_modifier: 0 },
      { name: "Slate Grey", price_modifier: 0 },
      { name: "Forest Green", price_modifier: 50 },
      { name: "Blush Clay", price_modifier: 50 },
    ],
  },
  {
    name: "Carved text",
    kind: "TEXT",
    is_required: true,
    price_modifier: 100,
    max_length: 24,
  },
];
