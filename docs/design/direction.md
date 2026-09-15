# Design direction

One studio, one voice. The site should feel like a quiet shelf in a working pottery: warm off-white walls, charcoal handwriting, a single green glaze. Everything else is the pieces themselves.

## Subject and job

A small wheel studio in Sangli making stoneware and terracotta, plus wheel sessions, workshops and open-mic evenings. The page has one job: make someone want to hold a piece, then let them buy it or book a seat without friction.

## Tokens

| Token      | Value     | Use                                                            |
| ---------- | --------- | -------------------------------------------------------------- |
| clay-white | `#F7F4EF` | page background                                                |
| ink        | `#1F1D1A` | text, rules on hover, primary button                           |
| sage       | `#4F6F52` | the only accent: links, focus rings, active states, "Add"      |
| kiln       | `#C4785A` | one hairline under the header and low-stock text, nothing else |
| smoke      | `#8A857D` | secondary text (passes 4.5:1 on clay-white)                    |
| ash        | `#E5E0D8` | hairline rules, dividers, skeletons                            |
| white      | `#FFFFFF` | product image backdrops, sheets                                |

- Radius: **0 everywhere.** No rounded corners on cards, images, buttons, inputs, chips, sheets, dialogs, toasts, avatars (avatars may stay circular, that is a person not a component).
- Shadows: none at rest. A sheet or dialog may use one soft ambient shadow. Cards never shadow; hover is a hairline `ink` border or an image crossfade.
- Type: DM Serif Display for headings (48–96px desktop, 34–44px mobile, `tracking-tight`, weight 400 only). DM Sans for everything else (15–16px body, 13px captions). Cormorant Garamond italic for one-line studio notes ("Fired last week", "No two alike"), never for UI controls. Prices in DM Sans, tabular numerals.
- Eyebrows: 11px DM Sans, uppercase, `tracking-[0.18em]`, smoke. Use only where a section needs a name; never decorate.

## Structure

- Full-bleed 1px `ash` rules separate sections. Sections are generous (`py-16 md:py-24`), internals tight.
- 12-column grid with 24px gutters on desktop, 16px on mobile, max width 1280px.
- Header: wordmark | thin vertical rule | nav links, with a full-width hairline under it (`kiln` on the home page, `ash` elsewhere). Sticky, opaque, no blur.
- Mobile bottom nav: four items, hairline top border, no fill, active item in sage with a 2px underline.

## Signature: the kiln label

The hero is a drawing, not a photo: one moon jar, rendered rather than outlined. The profile is generated from a spline through a handful of control points and carries a whisper of hand wobble, so it is smooth without looking machined; the same profile function generates everything painted on it. Light comes from the upper left. The body is a warm clay wash (`#F1EBE3` to `#D3C3B0`) with a soft highlight band on the lit third, a gradient terminator on the right, and cross-contour hatching: short arcs of the jar's own horizontal rings, evenly spaced and offset row to row, long and dark at the shaded edge and shortening to nothing as the wall turns into the light. The throwing rings are part of that shading, darker on the shadow side and fading into the highlight. A fine grain sits over the clay at low opacity so the surface reads as stoneware rather than paper.

The one accent is the glaze: a translucent sage band across the shoulder, its lower edge crawled unevenly as it dried, a pale highlight line along its top and one drip that thickens where it pooled. The mouth has depth (rim band, dark interior, the far inner wall seen over the near edge), the foot has its own contact shadow, and the piece stands on a hairline floor over three stacked ellipses that read as one soft shadow. A thumb dent on the right shoulder is the only asymmetry, and it is deliberate.

Four leader lines leave the drawing at the same 25 degree angle, each ending in a small dot exactly on the thing it names: "Glaze / fired at 1225°C" on the band, "Handmade / no two alike" on the thumb dent, "Stoneware / one clay body" on the bare wall, "Sangli / made in India" on the floor under the foot. Labels are real text inside the SVG coordinate space, so they hold their positions at every width. The studio's line, "where clay meets verses", sits under the piece in italic serif on a shallow arc, quiet enough not to compete with it.

On load the drawing builds itself over about 2.4s: the outline draws with stroke-dashoffset, the clay fills, the hatching fades in band by band from left to right, the glaze wash wipes on, the floor and shadow arrive, then the leaders draw and the labels and verse fade in. `prefers-reduced-motion: reduce` shows the finished piece at once. The product page reuses the label device on desktop: lines from the main photo to "Clay body", "Glaze", "Size". Nowhere else.

## Product presentation

- Card: square image (white backdrop), then one line: name left, price right. Nothing else at rest. Hover or focus: image crossfades to the second photo and a small square "Add" button appears bottom-right inside the image. Sold out: 13px "Sold out" in smoke under the image, no badge. Made to order: 13px "Made to order" in sage.
- Grids: 2 columns on mobile with 12px gutters, 3 on tablet, 4 on desktop; no carousel arrows, no auto-scroll.
- Product page: gallery left (main image + thumbnails as a vertical strip), buy box right with name, price, glaze chip, one stock line, quantity, "Add to cart". Description is at most three sentences. The kiln card becomes a plain two-column fact list with hairline rows.
- Copy: one heading and one sentence per section, sentence case, no exclamation marks, no marketing words (elevate, curated, discover, premium).

## Motion

- Page load: hero image reveals with a clip-path wipe from left (700ms, cubic-bezier(0.22, 1, 0.36, 1)); kiln-label lines draw; title fades up 12px (500ms). Nothing else animates on load.
- Scroll: each section fades up 12px once when it enters the viewport (`Reveal` component, IntersectionObserver, threshold 0.15). Cards inside a grid stagger by 40ms, capped at 8.
- Hover: images scale to 1.02 over 900ms; buttons change background in 200ms; links get a 1px underline that grows from the left in 250ms.
- Sheets and dialogs slide or fade in 250ms and out in 180ms.
- `prefers-reduced-motion: reduce` removes transforms and clip-path wipes, keeps opacity changes under 150ms.
- No parallax, marquee, bounce, blur-in, or gradient shimmer.

## Imagery

Real photos where they exist. Where a photo is missing use a placeholder: a clay-white square with a thin hand-drawn line icon of the piece in ink at 1.5px stroke and the words "Photo coming" in Cormorant italic. Hand-drawn line icons (mug, bowl, plate, vase, planter, serving dish, small things) are the only illustrations on the site.

## Home page order

1. Header
2. Hero: kiln-label piece, "Pottery made slowly." plus one sentence, two text links: "Shop the shelf" and "Book a wheel session".
3. Rule. Categories: a row of drawn icons with names, one line each.
4. Rule. Made to order: image, "Your name, carved into a mug.", one line, link.
5. Rule. Pieces: a 4-up grid of eight featured pieces, "See everything" link.
6. Rule. At the studio: the next three events as rows (date | title | seats | reserve) and a one-line open-studio teaser.
7. Rule. About: wide landscape placeholder, two lines from the story, "Our story" link.
8. Footer: hairline columns, no tagline paragraph, newsletter as a single input plus button.

## Not mass production

Every surface should say "one pair of hands made this". Concretely:

- Stock reads as a batch, not inventory: on the product page "3 made in this batch" (from stock), on cards "Only 2" in smoke when stock ≤ 3. Sold out pieces say "Sold out · next batch soon", never a red badge.
- Made to order is a first-class path, not a special case: the home block, a "Made to order" filter in the shop, and on every product page a small "Want it in another glaze or size? Ask us" text link that opens WhatsApp with the product name prefilled.
- The maker is present: a short "How a piece is made" strip (wedge, throw, fire, glaze) with drawn icons on the about block, and the studio note "Each piece is thrown by hand, so expect small differences" under the add-to-cart button.
- Pieces are named like objects on a shelf ("Slate morning mug"), not SKUs; no ratings on cards, no "bestseller" labels, no urgency timers.

## Image specs (enforced by admin uploads)

| Purpose               | Ratio | Minimum              | Where it renders                           |
| --------------------- | ----- | -------------------- | ------------------------------------------ |
| product               | 1:1   | 1000 × 1000          | cards, gallery, cart lines                 |
| category              | 1:1   | 600 × 600            | category tiles                             |
| collection            | 3:2   | 1200 × 800           | collection rows                            |
| event                 | 4:3   | 1200 × 900           | event cards and detail                     |
| hero, about, workshop | 16:9  | 1600 × 900           | home hero, about landscape, workshop intro |
| review                | any   | 400 px shortest side | review photos                              |

All uploads: JPEG, PNG, WebP or AVIF, at most 8 MB. The admin uploader checks these before the upload (and offers a fixed-ratio crop); the API confirms them again after the upload by reading the stored file, and only confirmed files can be saved.
