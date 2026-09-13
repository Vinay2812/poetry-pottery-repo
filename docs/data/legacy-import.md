# Legacy production data import

`pnpm import:legacy` (in `api/`) copies the old app's production database into the new schema. The source connection comes from `LEGACY_DATABASE_URL` in the gitignored `api/.env`, is opened read-only, and every write to the new database is an upsert keyed by slug, auth id, or legacy id, so the script can be re-run after `pnpm db:reset`. Use `--dry-run` to only print counts. Run `pnpm search:reindex` afterwards so imported products get embeddings.

## What the studio actually has

| Legacy table | Rows | Lands in |
| --- | --- | --- |
| products | 21 (13 active) | `products`, slug rebuilt from the name (old slugs were "D S M ", "MultanJuice Glasses") |
| product_categories | 6 names | `categories` by slug: mugs, serveware, accessories, bowls, planters, wood-fired |
| collections | 6 | `collections` with their cover photos and windows |
| customize_categories + customization_options | 3 + 2 | one made-to-order product each: `custom-mug` (Size: Espresso 30 ml, Short 150 ml +₹50), `custom-serveware`, `custom-bowl`, all with a free-text "Notes for the potter" group |
| users | 8 (5 admins) | `users` by Clerk auth id, roles kept; newsletter flag becomes a `newsletter_subscribers` row |
| user_addresses | 3 | `addresses` (zip → pincode, contact number falls back to the user's phone) |
| carts | 1 | `cart_items` |
| daily_workshop_configs + pricing_tiers | 1 + 5 | the seeded `open-studio` config gets the real hours (1 pm to 7 pm, 60 min slots, 6 wheels, 90 day window) and the real tiers (1 h ₹1,100 · 2 h ₹2,000 · 3 h ₹2,700 · 10 h ₹7,500 · 13 h ₹12,000) |
| daily_workshop_registrations + slots | 2 | `workshop_bookings` with the same ids, both still PENDING from June 2026 |
| content_pages (about) | 1 | the `about` page: story paragraphs, four values, six process steps |
| site_settings.contact_info | 1 | `site_settings` phone, WhatsApp, email, address, hours |
| events, orders, reviews, wishlists | 0 | nothing to import |

Legacy `timestamp without time zone` columns held UTC wall time, so the script parses them as UTC instead of local time.

## How the real data fits the new design

- **Photos are the studio's own.** All 21 pieces and 6 collections have CDN photos, mostly square-ish phone shots. They sit well in the square product cards; a few would benefit from a re-crop once the admin uploader enforces the 1:1 spec.
- **Stock is tiny by design.** Most active pieces have 1 to 3 units and eight are at 0. The batch-style stock copy ("Only 1", "Sold out · next batch soon") reads honestly here, and made-to-order pieces give people a path when a shelf is empty.
- **Descriptions are poems.** Eight pieces carry four-line verses, five have a one-line note, the rest were empty ("." or blank) and now use a short studio fallback line. The product page keeps the verse as the single block of copy, which suits the little-text direction.
- **Colour codes were never hex.** The old form stored palette indexes ("3", "12"), so only real `#rrggbb` values are kept; the colour name is what the page shows.
- **Categories.** "Wood Fired" is a process, not a form, and has one piece; it is imported as a category so nothing is lost, but the admin can fold it into a collection later. Plates and vases exist only in the seed demo data.
- **Prices span ₹300 to ₹25,000.** The wall piece and drip vases are one-offs; the card grid shows them without badges, which matches the "no urgency" rule.
- **Workshop prices differ from the seed.** The imported tiers replace the seeded 1/2/3 hour tiers and add 10 and 13 hour courses; the booking calendar renders those as multi-day requests handled on WhatsApp, which the reserve copy already explains.
- **Legacy customisation was thin** (only mug sizes). The option-group model covers it and leaves room for glaze and carved-text groups per piece.
- **Content.** The published About story ("Where Clay Meets Verses", founded February 2025, poetry open mics) maps cleanly onto the story / values / process sections; the old team block with stock portraits was dropped on purpose.
