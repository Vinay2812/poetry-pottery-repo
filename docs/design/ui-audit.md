# Storefront UI audit

Date: 2026-09-17. Build: `feat/design-refresh` running on `localhost:3030` against the legacy production catalogue (`pnpm import:legacy`), so the photography and product copy below are the studio's real assets, not seed stand-ins.

Method: every storefront route walked at 1440×900 and 375×812, signed out and signed in as `maya+clerk_test@example.com` (admin), driven with `agent-browser --session audit`. Screenshots in `/tmp/audit/`, one hover recording at `/tmp/audit/card-hover.webm`. Measurements (gutters, font sizes, scroll widths, focus outlines) were read off the live DOM, not eyeballed. A parallel read-only code scan of `frontend/src` supplied the file and line references.

Verdict in one line: the writing, the restraint and the drawn hero are genuinely distinctive and better than most craft shops ship; the photography, the page-shell inconsistency and the account/auth surfaces are what stop it reading as world class. Nothing here needs a redesign. It needs one week of correction and one week of merchandising.

---

## 0. What the best studio sites do that we are measured against

Not sources, patterns. The ceramics and craft shops that feel expensive share the same handful of moves:

- **One light, one ground, one crop.** Every piece is shot on the same neutral sweep in the same soft light, square, product filling 70–80% of the frame. Variety comes from the pieces, never from the backgrounds. A second, styled "in use" shot lives at position 2 in the gallery, never at position 1.
- **Scale you can feel.** Capacity in ml, height in cm, weight in grams, and one shot with a hand or a table setting so you know what you are buying. Ceramics is the one category where "is this a mug or a cup" is a real purchase blocker.
- **The glaze is a named material, not a colour word.** A swatch, a name, a sentence about how it behaves in the kiln, and an honest note that it varies.
- **Made to order is a route, not a checkbox.** A page that shows past commissions, states the steps and the lead time as a numbered sequence, and asks for the brief in a structured form.
- **Checkout goes quiet.** Navigation drops away, the coupon field hides behind a link, one reassurance line sits under the button, and the confirmation page thanks you like a person.
- **Empty states are written, not templated.** They name what would be there, and offer the single next thing.
- **Type is one scale.** Two families, four sizes, and the same left edge on every page from the wordmark to the footer.

We already do the copy tone and the restraint. We fail the first three outright and the last one by accident.

---

## 1. Scorecard

Scale: 1 broken · 2 weak · 3 competent · 4 good · 5 best in class.
Axes: **Ty** typography · **Sp** spacing and rhythm · **Im** imagery · **Hi** hierarchy · **Mo** motion · **Mb** mobile · **A11y** accessibility · **Co** copy.

| Page | Ty | Sp | Im | Hi | Mo | Mb | A11y | Co |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Home | 5 | 2 | 3 | 3 | 4 | 3 | 3 | 5 |
| /products (shelf) | 4 | 4 | 2 | 4 | 4 | 3 | 3 | 4 |
| /products (archive) | 4 | 4 | 3 | 4 | 4 | 3 | 3 | 5 |
| /products filters open / category picked | 4 | 3 | 2 | 3 | 4 | 3 | 3 | 3 |
| /custom | 4 | 2 | 2 | 2 | 3 | 3 | 3 | 4 |
| PDP with photos | 4 | 4 | 1 | 4 | 4 | 2 | 3 | 4 |
| PDP made to order | 4 | 4 | 3 | 3 | 4 | 3 | 2 | 4 |
| /search | 4 | 3 | 2 | 3 | 3 | 3 | 3 | 4 |
| /cart empty | 4 | 2 | 1 | 3 | 2 | 3 | 3 | 2 |
| /cart with lines | 4 | 3 | 2 | 4 | 2 | 3 | 3 | 4 |
| /wishlist | 4 | 3 | 2 | 3 | 3 | 2 | 3 | 4 |
| /checkout | 4 | 3 | 2 | 3 | 2 | 3 | 3 | 4 |
| /orders | 3 | 2 | 1 | 2 | 1 | 2 | 2 | 2 |
| Order detail | 4 | 3 | 2 | 3 | 2 | 3 | 3 | 5 |
| /events (empty) | 4 | 2 | 1 | 2 | 2 | 3 | 3 | 3 |
| /workshops | 4 | 2 | 1 | 2 | 3 | 3 | 4 | 4 |
| /workshops/bookings | 3 | 2 | 1 | 2 | 1 | 3 | 3 | 2 |
| /account | 3 | 3 | 1 | 2 | 1 | 3 | 2 | 4 |
| /account/addresses | 4 | 4 | — | 4 | 2 | 3 | 4 | 4 |
| /about | 4 | 3 | 1 | 3 | 3 | 3 | 3 | 2 |
| /faq | 5 | 4 | — | 4 | 3 | 3 | 4 | 4 |
| /shipping, /care | 4 | 4 | 2 | 4 | 3 | 3 | 4 | 4 |
| /contact | 5 | 4 | — | 5 | 3 | 3 | 4 | 5 |
| 404 | 4 | 3 | — | 3 | 2 | 3 | 3 | 5 |
| Mobile menu | 3 | 2 | — | 2 | 3 | 2 | 3 | 3 |
| Sign-in dialog | 1 | 1 | — | 2 | 1 | 2 | 3 | 1 |
| Toasts | 4 | 4 | — | 3 | 3 | 3 | 2 | 4 |

### Reasons, one line per axis

**Home** — `/tmp/audit/home-1440.png`, `home-1440-y850.png`, `home-1440-y1700.png`, `home-1440-y2550.png`, `home-375.png`
- Ty: the 72px DM Serif hero against 15px DM Sans is the best type moment on the site.
- Sp: the about block is 930px tall for four lines and one small drawing; ~200px voids sit above three of five section headings.
- Im: one real photo (a garden snapshot with a hand) sits in a row of three ink drawings; two category icons are a generic sparkle.
- Hi: the two hero CTAs are undecorated 15px body text, so the page's primary action reads as a sentence.
- Mo: hero build, section reveals and 40ms grid stagger all land as specified in the animation study.
- Mb: kiln-label text renders at roughly 9px on a 375 screen and the sub-labels smaller than that.
- A11y: labels and roles are right, but the focus ring is a 1px 50%-opacity outline and there is no skip link.
- Co: "Pottery made slowly, in Sangli" and "Shapes we throw" are exactly the register the direction doc asks for.

**/products, shelf** — `products-1440.png`, `products-1440-y700.png`, `card-hover-1440.png`
- Ty: clean 48px h1, 13px stock line, tabular prices, nothing fights.
- Sp: 4-up grid with even gutters; the "Showing 9 of 9" line is centred while everything else is left-aligned.
- Im: three treatments in one row — full-bleed photo, inset drawing, dark on-location photo — so the grid has no visual rhythm.
- Hi: tabs, count, sort and filters are all where the eye expects them.
- Mo: card crossfade to the second photo plus scale(1.02) over 900ms is correct and pleasant (see recording).
- Mb: cards lose the wishlist heart entirely below 1024px while the Add button stays permanently visible.
- A11y: card buttons are labelled per product, but off-screen carousel slides stay tabbable.
- Co: "Every piece on the shelf / Thrown, glazed and fired by hand in small batches" is good; five of nine pieces reading "Only 1" makes the shop feel depleted.

**/products, archive** — `products-archive-1440.png`
- Ty: identical scale to the shelf, correct.
- Sp: same grid, works.
- Im: the archive photos are the most characterful images on the site and deserve better than a 4-up grid.
- Hi: tab pair with the count is clear.
- Mo: same reveal and stagger.
- Mb: same 2-up grid.
- A11y: archive cards drop the add/wishlist controls, which is right.
- Co: "Pieces that have sold, retired or closed with their collection. Ask us for one like it." is the best sentence on the site — but there is no "ask us" link to act on it.

**/products, filters open and a category picked** — `products-filtered-mugs-1440.png`
- Ty: 11px uppercase group labels read well.
- Sp: the facet rail runs 640px tall on a page with nine products.
- Im: unchanged.
- Hi: seven of twelve facets show a count of 0, and six collections are listed with equal weight to six categories.
- Mo: results stay visible during refetch instead of flashing skeletons, which is the right pattern.
- Mb: filters collapse into a sheet, good, but with no active-count badge.
- A11y: the two toggle switches are ash-on-ash and their state is not legible.
- Co: the h1 stays "Every piece on the shelf" after you filter to four mugs.

**/custom** — `custom-1440.png`
- Ty: fine.
- Sp: three cards, a one-line intro, and ~600px of empty page before the footer.
- Im: three drawings and no photograph of anything the studio has actually made to order.
- Hi: this is the differentiator page and it is a product grid with a subtitle; no process, no lead time, no past work.
- Mo: nothing happens.
- Mb: stacks acceptably.
- A11y: fine.
- Co: "Pick a piece, choose the size and glaze, tell us the words" promises a glaze choice the product pages do not offer.

**PDP with photos** — `pdp-photos-1440.png`, `pdp-photos-1440-y800.png`, `pdp-photos-375.png`
- Ty: eyebrow / 40px name / price / 13px notes is a good stack.
- Sp: buy column ends 170px above the image, leaving a clean shelf of white.
- Im: thumbnail 4 on `blue-blood-mug` is a photograph of a child; thumbnails 2 and 3 are grass and a leaf. The main shot is a hand holding the mug in a garden in hard sun.
- Hi: price, stock, quantity, add, studio note, WhatsApp ask, shipping line — the order is right.
- Mo: clip-path reveal on the main image, correct timing.
- Mb: the gallery overflows the viewport by 8px (`scrollWidth` 383 on a 375 screen), so the whole page scrolls sideways.
- A11y: gallery arrows and thumbs are labelled; off-screen slides are not inert.
- Co: "One made in this batch" and "Each piece is thrown by hand, so expect small differences" are exactly right; the care list says "Microvave safe".

**PDP made to order** — `pdp-mto-1440.png`, `pdp-mto-selected-1440.png`
- Ty: fine.
- Sp: fine.
- Im: the drawn mug with one kiln leader line is charming, but one lone label where the doc promises three looks unfinished, and the dot lands on the glaze band while the label says "Clay body".
- Hi: no size is preselected and Add to cart is enabled anyway; on my first pass an add with no size chosen produced no cart line and no message.
- Mo: fine.
- Mb: stacks.
- A11y: the size options are plain `<button>`s with no `aria-pressed` or radio semantics, so the choice is invisible to a screen reader.
- Co: "Notes for the potter / Type it as you want it carved" is lovely; the 200-character limit belongs to a message, not a carving.

**/search** — `search-q-mug-1440.png`, `search-dialog-results-1440.png`
- Ty: fine.
- Sp: the same 640px facet rail for four results.
- Im: mixed treatments again.
- Hi: the header search icon navigates to a full page instead of offering suggestions as you type.
- Mo: results update in place, no flash.
- Mb: fine.
- A11y: the field has an `aria-label` but no `role="search"` landmark.
- Co: "Search by name, glaze colour, clay body or what you want to use it for" sets an expectation the index does not meet (events and workshops are not searchable).

**/cart, empty** — `cart-1440.png`
- Ty: fine.
- Sp: content sits at a 176px gutter while the header and footer sit at 112px, so the page visibly jumps on navigation.
- Im: no illustration, on a site that owns a full set of drawn vessels.
- Hi: two identical outline buttons, no primary.
- Mo: none.
- Mb: fine.
- A11y: fine.
- Co: signed out it says "Sign in to see the pieces you saved", which is the wishlist's job, not the cart's.

**/cart with lines** — `cart-lines-1440.png`
- Ty: tabular numbers in the summary, correct.
- Sp: 176px gutter again.
- Im: 96px square crops of on-location photos are unreadable at that size.
- Hi: summary, total, CTA, reassurance in the right order.
- Mo: none; quantity changes have no motion at all.
- Mb: stacks.
- A11y: quantity stepper has a live region; the header count never announces.
- Co: "We confirm every order on WhatsApp before you pay" is a real trust cue. "Remove Save for later" run together as one phrase.

**/wishlist** — `wishlist-in-1440.png`
- Ty/Sp/Hi: same shell as the shelf, correct.
- Im: same mixed treatments.
- Mo: reveal only.
- Mb: the heart that fills this page does not exist on mobile cards, so on a phone the page can only ever be empty.
- A11y: fine.
- Co: "Nothing saved yet / Tap the heart on any piece to keep it here" is good, and wrong on mobile.

**/checkout** — `checkout-1440.png`
- Ty: fine.
- Sp: 176px gutter; 56px line thumbnails render the drawn placeholders illegibly.
- Im: as above.
- Hi: the coupon field is the first thing in the summary column, above the subtotal, with `WELCOME10` as its placeholder.
- Mo: none.
- Mb: stacks.
- A11y: the coupon is the one field in the app wired with `aria-describedby` to its live message; the rest of the app's errors are not.
- Co: "No payment now; we confirm on WhatsApp within a day and share UPI details" is excellent.

**/orders** — `orders-1440.png`
- Ty: fine.
- Sp: 240px gutter, a fifth distinct page width.
- Im: —
- Hi: the page renders "Your orders did not load / Something went wrong on our side" immediately after a successful order; "Try again" does not recover it. The dev log shows `Clerk: auth() was called but Clerk can't detect usage of clerkMiddleware()` thrown from `src/lib/apollo/rsc-client.ts:14`. The order detail route works, so this is the list query only.
- Mo: no skeleton, no `loading.tsx`.
- Mb: same failure.
- A11y: `aria-busy` flips with no live region to announce the outcome.
- Co: the error copy is fine; the error is not.

**Order detail** — `order-confirmation-1440.png`, `order-detail-1440-y850.png`
- Ty: the order id is set in DM Serif Display, which makes an alphanumeric code hard to read; it should be DM Sans tabular.
- Sp: the confirmation banner is a full-width bordered box with content in the left half and 700px of nothing in the right.
- Im: no piece thumbnails in the banner.
- Hi: two 40px serif headings stack ("Your order is in", then "Order PP-…").
- Mo: none.
- Mb: stacks.
- A11y: fine.
- Co: the five timeline steps ("Payment received. Wrapping every piece by hand.", "Enjoy. Tell us how it looks in your home.") are the warmest writing in the product.

**/events, empty** — `events-1440.png`
- Ty: 60px h1 against 48px elsewhere, a third heading size.
- Sp: two hairline rules sit 37px apart with nothing between them.
- Im: none.
- Hi: "Upcoming | Past" and "All | Workshops | Open mics" render on one line in identical styling with two active markers, so it reads as one confusing five-item row.
- Mo: reveal only.
- Mb: stacks.
- A11y: fine.
- Co: the empty state has no call to action at all when there are genuinely no events and no filters (`EmptyEvents.tsx:16-28` only renders a CTA when `hasFilters`).

**/workshops** — `workshops-1440.png`, `workshops-in-1440-y620.png`, `workshops-slots-1440.png`, `workshops-picked-1440.png`
- Ty: fine.
- Sp: a 16:9 placeholder drawing occupies 570px before the h1, pushing the page title below the fold on a booking page.
- Im: the placeholder is the only image, on the page most in need of a photograph of the studio.
- Hi: the hours-and-prices table and the "HOW LONG" chip row present the same five options twice; slot chips appear ~380px below the day you clicked with no scroll-into-view.
- Mo: day and slot selection states are clear ink fills.
- Mb: stacks.
- A11y: best-labelled component in the app (`"Thu, 17 Sept, 6 wheels free"`) — but every past day is labelled "studio closed".
- Co: "6 wheels" is studio jargon; after picking a slot, days outside the 7-day window grey out with nothing on screen explaining why.

**/workshops/bookings** — `bookings-1440.png`
- Ty: fine.
- Sp: a 296px gutter, a sixth page width.
- Im: none.
- Hi: six rows, all "Cancelled", rendered identically to an active booking with the status as a grey word at the end of a metadata line.
- Mo: none.
- Mb: stacks.
- A11y: fine.
- Co: no reference number, no grouping into upcoming and past, no directions to the studio.

**/account** — `account-1440.png`
- Ty: the `h1` is the user's name, so the page has no title heading.
- Sp: 368px gutter, a seventh width.
- Im: Clerk's default violet gradient avatar is the loudest colour anywhere on the site, and it appears twice.
- Hi: six rows with grey right-hand descriptions and no chevrons read as static metadata, not links.
- Mo: a single grey pulse bar as the loading state.
- Mb: fine.
- A11y: the avatar in `AccountMenu.tsx:53` has `alt=""` and no accessible name anywhere on the block.
- Co: "Progress and past orders", "Pieces you kept", "Where we deliver" are good.

**/account/addresses** — `addresses-1440.png`
- Solid throughout. Labelled fields, a Default badge, sensible empty state. Only gap: validation messages use `role="alert"` but are not linked to their inputs with `aria-describedby` (`AddressForm.tsx:43`), and there is no motion at all.

**/about** — `about-1440b.png`
- Ty: fine.
- Sp: fine.
- Im: the hero is a stock photograph of two people in a white kitchen holding red enamel cookware. It has nothing to do with a Sangli pottery studio and it is the single most damaging image in the product.
- Hi: fine.
- Mo: reveal.
- Mb: fine.
- A11y: `AboutBlock.tsx:23-28` lazy-loads a full-bleed hero with no `loading`/`fetchPriority`.
- Co: "Where Clay Meets Verses" and "Handcrafted Since 2025- Over 1000 pieces created with love" break sentence case, use a hyphen for a dash, and use the marketing register the direction doc bans.

**/faq** — `faq-1440.png`
- Best-executed page on the site. Accordion, sticky "ON THIS PAGE" rail, clean rules. Two gaps: a table of contents for two sections is scaffolding for content that is not there, and five questions is thin — nothing on glaze variation, food safety, breakage in transit, made-to-order returns, or GST.

**/shipping, /care** — `shipping-1440.png`, `care-1440.png`
- Same content template, executed well. The shared placeholder hero is the weak point; care content is the natural home for the "how to keep it" story and currently reads as policy.

**/contact** — `contact-1440.png`
- The cleanest page in the product: labelled two-column form, studio hours, phone, email, WhatsApp link in sage. Missing a map, a "book a studio visit" action, and a visible confirmation state after send.

**404** — `notfound-1440.png`
- "404 / This shelf is empty / The page you were looking for has been moved or never existed. The rest of the studio is still here." is excellent. It is centred while every other page is left-aligned, and there is no suggestion of what to look at instead.

**Mobile menu** — `mobile-menu-375.png`
- Sheet title sits at a 111px inset and the links at 129px, so the panel has two left edges. No studio identity, no phone or WhatsApp, no cart or orders entry, and "Sign in" is styled identically to a nav link. Row hit areas are the text, not the row.

**Sign-in dialog** — `signin-dialog-1440.png`
- Unstyled Clerk default: 8px radii, a grey gradient button, system sans, a drop shadow, "Secured by Clerk", and "Welcome back! Please sign in to continue" — an exclamation mark the house voice forbids. The app name reads "Poetry and Pottery" against the wordmark's "Poetry & Pottery". This is the one moment the studio disappears completely.

**Toasts** — `toast-addtocart-1440.png`
- Correct shape: square, ink, a check, a "View cart" action. Three problems: it lands bottom-centre, far from the cart it refers to; the inline "View cart" button has a white outline that reads as disabled; and `toaster.tsx` renders a bare `<Sonner>` with no `role`/`ariaLabel`, so announcement is left entirely to the library default across 23 call sites.

---

## 2. Ranked improvements

Effort: **S** under two hours · **M** half a day to a day · **L** two to four days · **XL** a week or more.

### Defects

| # | Page | Change | Why | Effort | Shot |
| --- | --- | --- | --- | --- | --- |
| D1 | every | Collapse seven page shells into one. Measured left edges at 1440: header/footer/products/wishlist **112**, events/workshops **104**, cart/checkout **176**, orders **240**, bookings **296**, account **368**. Cause is five `max-w-*` values (`7xl`, `6xl`, `5xl`, `4xl`, `3xl`) and two `md:px-*` values (`6`, `8`). Ship one `PageShell` at `max-w-7xl px-4 md:px-8`; inner columns narrow inside it, the outer edge never moves. | The wordmark, nav and footer sit on one line and the content slides left and right under them as you navigate. It is the most visible quality tell on the site and the cheapest to remove. | M | `cart-1440.png` vs `products-1440.png` |
| D2 | /orders | Fix the list query failure. `Your orders did not load` renders immediately after a successful order and "Try again" does not recover. Dev log: `Clerk: auth() was called but Clerk can't detect usage of clerkMiddleware()` at `src/lib/apollo/rsc-client.ts:14` (the app uses Next 16's `src/proxy.ts`, not `src/middleware.ts`). Order detail works, so it is the list path only. | A customer who just paid cannot see their order. Nothing else on this list matters more. | M | `orders-1440.png` |
| D3 | PDP mobile | Stop the gallery overflowing. `document.scrollWidth` is 383 on a 375 viewport; the offender is `.relative aspect-square min-w-0 flex-1 bg-white` inside the embla track. Every other route measures exactly 375. | The whole product page scrolls sideways on a phone. | S | `pdp-photos-375.png` |
| D4 | PDP, cards, /about | Content QA pass on the imported catalogue. `blue-blood-mug` thumbnail 4 is a photograph of a child; thumbnails 2 and 3 are grass and a leaf. The /about hero is a stock shot of two people with red enamel cookware in a white kitchen. The care list reads "Microvave safe". | Four images and one typo are doing more brand damage than any layout decision in this document. | S | `pdp-photos-1440.png`, `about-1440b.png` |
| D5 | sign-in dialog, header, /account | Pass a Clerk `appearance` config: zero radius, `--color-ink` primary button, DM Sans, no shadow, no "Secured by" row, and initials-on-ink or a drawn-vessel avatar instead of the violet gradient. Set the Clerk application name to "Poetry & Pottery". | Sign-in is the only screen that looks like a different product, and the violet avatar then follows the user onto every page. | M | `signin-dialog-1440.png`, `account-1440.png` |
| D6 | /products, /search | Hide facets with a count of 0 (seven of twelve on the shelf, ten of twelve on a search for "mug") and clamp the price slider to the real catalogue range; it currently spans ₹250–₹25,000 for a shelf whose dearest piece is ₹15,000 and whose median is ₹600, and the sage track is the loudest element on the page. | Dead facets say "this shop is empty" before the customer reaches the grid. | S | `products-1440.png`, `search-q-mug-1440.png` |
| D7 | /events | Split the two filter groups. "Upcoming \| Past" and "All \| Workshops \| Open mics" render on one line with identical styling and two active markers. Remove the orphan second hairline (two rules 37px apart with nothing between). Give the no-events empty state a CTA — `EmptyEvents.tsx:16-28` only renders one when `hasFilters` is true. | The page's only interactive control is unreadable and its only state is a dead end. | S | `events-1440.png` |
| D8 | PDP made to order | Preselect the first size (or disable Add to cart until one is picked and say why), give the options `role="radio"`/`aria-checked`, and keep the price line in sync with the selected size. | A customer can press an enabled Add to cart and get nothing, with no message; a screen-reader user cannot tell what is selected. | S | `pdp-mto-1440.png` |
| D9 | /products mobile | Restore the wishlist heart on cards below 1024px (`ProductCard.tsx:170` is `hidden lg:flex`) and hide the Add button at rest the way the direction doc specifies instead of the inverse (`lg:opacity-0` leaves it permanently on phones). | /wishlist can never fill from a phone, which is most of the traffic. | S | `products-375.png` |
| D10 | every | One focus treatment. There is no global `:focus-visible` rule; the base `outline-ring/50` at `globals.css:146-149` sets only a colour, so raw controls fall back to a 1px 50%-opacity outline (measured on the header search button), while `button.tsx` uses `ring-2 ring-primary`, inputs use `ring-1 ring-primary`, cards use `ring-1 ring-ink`, and four shadcn components use `ring-[3px] ring-ring/50`. `tabs.tsx:83` and four dropdown items have no indicator at all. | Five focus languages, one of them invisible, on a site that otherwise cares about detail. | M | `focus-header-1440.png` |
| D11 | every | Add a skip link and give `<main>` an `id` (`app/(storefront)/layout.tsx:31` has neither). A keyboard user tabs the announcement bar, wordmark, five nav links and five icon controls on every page before reaching content. | Baseline keyboard accessibility that we currently do not have. | S | — |
| D12 | /cart | The free-shipping line renders as "Shipping is free on this order." above a solid ink 1px rule and a second orphan ash rule, with no label and no progress. Replace with a labelled meter that shows the gap below threshold and collapses to one confirmed line above it. | It currently reads as two stray lines and a broken component. | S | `cart-lines-1440.png` |
| D13 | /workshops | Cut the 570px placeholder hero above the h1, or move it below the intro. The page title on the studio's main booking page sits below the fold at 1440×900. | Nobody should have to scroll to find out what page they are on. | S | `workshops-1440.png` |
| D14 | /workshops | Copy and state fixes: past days are labelled "studio closed" (they are simply past); after picking a slot, days outside the 7-day window grey out identically to closed days with no on-screen reason; the summary says "Pick your hours from the calendar" when hours are picked from the chip row 380px below it; "6 wheels" needs to say "6 wheels free". | The one genuinely complex flow in the product loses people at every ambiguity. | M | `workshops-picked-1440.png` |
| D15 | /workshops/bookings | De-emphasise cancelled bookings (muted row, struck price) and group into Upcoming / Past. Six identical "Cancelled" rows currently look like six live bookings. | A cancelled booking styled as a live one is a support ticket. | S | `bookings-1440.png` |
| D16 | /checkout | Collapse the coupon to a "Have a code?" text link that reveals the field, and remove `WELCOME10` from the placeholder. Drop the nav links from the header on `/checkout` and `/cart`, leaving wordmark and a back link. | An open discount box above the subtotal is a conversion leak and it advertises a code we may not be running. | S | `checkout-1440.png` |
| D17 | /cart | Separate "Remove" and "Save for later" (they currently read as one phrase) and drop the redundant "₹600 each" line when quantity is 1. | Two actions reading as one sentence is a misclick waiting to happen. | S | `cart-lines-1440.png` |
| D18 | /account | Make the page heading the page, not the user's name (`AccountMenu.tsx:59` renders `<h1>{displayName}</h1>`), give the six rows a chevron or right-arrow, and give the seven sign-in-wall routes a real `h1` instead of `SignInWall.tsx:11`'s `<h2>`. | Seven routes currently start their document outline at h2. | S | `account-1440.png` |
| D19 | every | Footer column headings are `<h3>` (`SiteFooter.tsx:31`) with no `h2` between them and the page `h1`, on every page in the app. Use a styled `<h2>` or a `<p>` with `aria-hidden` plus a visually hidden `h2`. | A heading-order break present on 29 of 29 routes. | S | — |
| D20 | every | Loading and error states. There are **zero** `loading.tsx` and **zero** `error.tsx` files across 29 routes, and the three `<Suspense>` boundaries (`products`, `search`, `events`) have no `fallback`, so they suspend to blank. Seventeen routes have no skeleton of any kind. | On a fast local machine this is invisible; on a phone on Indian mobile data it is a blank screen. | M | — |
| D21 | toasts, header | Give the toaster `toastOptions` with an explicit `role`, and wrap the header cart/wishlist counts in a polite live region (`SiteHeader.tsx:38-42`, `MobileNav.tsx:43-47`). Move desktop toasts to bottom-right or top-right so they point at the cart, and fix the "View cart" button inside the toast, which currently reads as disabled. | Twenty-three toast call sites currently rely entirely on Sonner's default announcement. | S | `toast-addtocart-1440.png` |
| D22 | home | Reclaim the vertical voids: the about block is 930px tall for four lines of copy and one small drawing, and three of five sections open with ~200px of nothing above the heading. Tighten to the doc's `py-16 md:py-24` and let the about image be the 16:9 landscape the doc specifies. | The home page is 4,239px tall and says very little in the bottom half. | M | `home-1440-y2550.png` |
| D23 | home | Restore the "At the studio" events block. With no events in the data the section vanishes entirely, taking the studio's second revenue line off the home page. Render a one-line open-studio teaser plus a link to /workshops as the fallback. | The home page currently sells pottery only. | S | — |
| D24 | mobile menu | One left edge (title and links both at 24px inset), 44px minimum row height, the studio's phone and WhatsApp at the foot, and "Sign in" as a button, not a nav link. | The primary navigation on phones is the least finished surface in the product. | S | `mobile-menu-375.png` |
| D25 | /products, PDP | Standardise the bottom rule under carousel rows — it currently renders a full-width ink hairline where every other divider on the site is `ash`. | A single heavier rule per carousel reads as a stuck hover state. | S | `pdp-photos-1440-y800.png` |
| D26 | design system | Token drift: `slider.tsx:40,51` ships `rounded-full` track and thumb, `tooltip.tsx:50` a 2px arrow radius, `popover.tsx:32` and `dropdown-menu.tsx:46,248` ship `shadow-md`/`shadow-lg` plus `ring-foreground/10`, and `zoom-in-95` still ships in popover, dropdown, tooltip and select (the select is user-facing on the shop sort control). `layout.tsx:21` sets `themeColor: "#fafaf9"` instead of clay-white `#F7F4EF`, which is a visible seam in mobile browser chrome. | The direction doc's two absolutes are radius 0 and no resting shadow; five components break them. | S | — |
| D27 | 404 | Left-align to the page shell like every other route, and add three or four archive pieces underneath as a recovery path. | The only centred page in the product, and its only exits are two generic buttons. | S | `notfound-1440.png` |
| D28 | /about | Rewrite "Where Clay Meets Verses" and "Handcrafted Since 2025- Over 1000 pieces created with love" into sentence case without the marketing register, and fix the hyphen. | It contradicts the house voice on the page that is supposed to establish it. | S | `about-1440b.png` |

### Elevations

| # | Page | Change | Why | Effort | Shot |
| --- | --- | --- | --- | --- | --- |
| E1 | all product imagery | Reshoot the catalogue: one neutral sweep, one soft window light, square, piece filling 70–80% of the frame, shadow falling the same way in every shot. Then a second "in the hand" or "on the table" frame at gallery position 2. Until the reshoot, centre-crop the existing photos to 1:1 and lift the darkest ones. | This is the single largest quality lever available. The current grid mixes a garden snapshot, a woodpile, three dark on-location shots and four clean drawings; no amount of layout work survives that. | XL (shoot) / M (interim crops) | `products-1440.png` |
| E2 | PDP | An "in the hand" scale cue. Capacity in ml, height and diameter in cm, weight in grams, in the fact list — plus a small drawn silhouette of the piece beside a hand or a standard 250ml cup at true relative scale, in the same ink line as the hero. | "How big is it" is the number one objection in ceramics, and the drawn line we already own can answer it better than a photograph can. | M | `pdp-photos-1440-y800.png` |
| E3 | PDP, /products | Glaze as a material, not a colour. Each glaze gets a real swatch (a photographed chip or a painted SVG wash in the hero's language), a name, one sentence on how it behaves in the kiln, and an honest variation note. Make the swatch clickable to "see everything in Ocean Blue". | Turns a grey `GlazeChip` square into the studio's vocabulary, and creates a second browse axis that does not depend on categories that are half empty. | M | `pdp-photos-1440.png` |
| E4 | PDP | A maker's note per piece: one or two handwritten-register sentences in Cormorant italic under the fact list — what the piece was for, what happened in the kiln, why the rim is the way it is. Seed from the existing product descriptions, let the admin edit per piece. | It is the cheapest thing that makes each object feel like it came from one pair of hands, and we already have the type style reserved for exactly this. | M | — |
| E5 | /custom | Rebuild as a real commission route: a numbered sequence (brief → sketch in 2 days → thrown → fired → shipped in about 10 days), photographs of past commissions, the glaze and size options that the product pages actually offer, and a structured brief form that pre-fills the WhatsApp message. | Made to order is the studio's differentiator and it is currently a three-card grid with a subtitle. | L | `custom-1440.png` |
| E6 | /products archive | Promote the archive to a gallery. It holds the studio's best photographs; present it as a dated wall (year headers, larger tiles, no price emphasis) with "Ask us for one like it" wired to WhatsApp per piece. | Proof of a long working practice, and the "ask us" sentence already written on the page finally becomes an action. | M | `products-archive-1440.png` |
| E7 | order confirmation | Warmth. Address the customer by name, show the pieces as thumbnails in the banner, state an estimated arrival date, say "we have emailed a copy to …", and link the care guide for what they bought. | The timeline copy is already the best writing in the product; the moment it lands in is a bordered box with 700px of empty space. | M | `order-confirmation-1440.png` |
| E8 | empty states | Give all eleven empty states a drawn vessel from `PlaceholderImage`, and fix `EmptyResults`'s "Nothing on this shelf yet" — "yet" is wrong for a filtered no-results state. Restore the doc's "Photo coming" line in Cormorant italic on the placeholder itself, which is specified and not implemented. | Eleven identical text blocks on a site that owns a set of hand-drawn vessels. | M | `cart-1440.png`, `events-1440.png` |
| E9 | home | Build the making story from `animation-study.md` §5. It is fully specified, it is the page's answer to "why does a mug cost this much", and the home page currently has 1,800px of near-empty space between the shelf and the footer to put it in. | The one piece of work that would make the home page memorable rather than merely tasteful. | XL | `home-1440-y2550.png` |
| E10 | PDP | Wire the kiln-label cross-highlight (`animation-study.md` item 3): hovering a fact row lights its leader line and dot, and back. Add the two missing labels so the made-to-order drawing carries Clay body, Glaze and Size, and move the "Clay body" dot off the glaze band. | Turns a static annotation into the page's one interactive object, using an SVG we have already built. | M | `pdp-mto-1440.png` |
| E11 | /workshops | Make the calendar the hero. Drop the duplicate price table, put the chip row and the calendar above the fold, show slot chips inline under the day you clicked, and explain the 7-day window on the calendar itself when it starts constraining choices. | The booking flow is good work buried under 570px of placeholder and a table that repeats itself. | M | `workshops-in-1440-y620.png` |
| E12 | /faq, /care | Grow the content. Add glaze variation, food and microwave safety, breakage in transit, made-to-order returns, GST and invoices to the FAQ; turn /care into a real guide (first wash, thermal shock, removing tea stain, what crazing is and why it is not a fault). | The two pages that answer the objections that stop ceramics purchases are the thinnest pages on the site. | M | `faq-1440.png` |
| E13 | search | Typeahead. On focus, show recent searches and four thumbnails as you type, and extend the index to events and workshops so the page's own promise ("what you want to use it for") becomes true. | A full-page navigation for every search is a 2015 pattern. | M | `search-dialog-results-1440.png` |
| E14 | motion | Finish the pass the animation study already scoped: ghost tint on icon buttons, 1px button lift, `lift-and-dim` on the category strip, and `tilt-straighten` on the drawn category icons. `ProductCarousel` already sets `reveal-item` and `toRevealDelay` but is only wrapped in a `Reveal` on the PDP, so its stagger is inert on the home page and the shop. | Cheap, specified, and it touches every page. | S | — |

---

## 3. Features a top studio site has that we lack

**Gift notes and gift wrap.** A checkbox at checkout that opens a short message field and adds a hand-written card to the parcel, plus an option to hide prices on the packing slip. Ceramics is a gift category — a mug at ₹600 and a wall piece at ₹15,000 are both things people buy for someone else. Store the note on the order, print it on the studio's picking view, show it back on the order detail page so the buyer can check what they wrote. Charge nothing for the note; charge ₹100 for wrap if the studio wants. Implementation is one nullable text field on the order, one field in the checkout form, one line in the admin order view.

**Next-batch notify.** Every sold-out piece currently ends at "Sold out · next batch soon" with no action. Add an email capture on the sold-out product page and on archive pieces: "Tell me when this comes out of the kiln." Store product id plus email, fire a job on the RabbitMQ queue when stock goes from 0 to positive or when a piece with the same name is created. This is the highest-value list a small studio can build, because it is demand data for what to throw next, and because five of nine shelf pieces are already at "Only 1".

**Studio visit booking.** The contact page says "Come by, or write to us" and gives opening hours, but offers no way to say you are coming. Add a light booking on /contact: pick a date and a 30-minute window from the same availability model the wheel sessions already use, leave a name and phone, get a WhatsApp confirmation. It reuses the workshops slot machinery almost entirely and turns a static hours block into a booking.

**Care guide on the order.** After delivery, the order detail page and the delivery email should link the care instructions for the specific glazes and clay bodies in that order, not the generic /care page. Ceramics fails in the first month from thermal shock and abrasive scrubbing; a studio that tells you how to keep the piece alive gets the second order. Join order items to their product's care lines, render them as a short list on the order detail page under the timeline, and include them in the "Delivered" email.

**Piece gallery from the archive, with provenance.** The archive holds 16 pieces with the studio's best photography and no purpose beyond browsing. Turn it into a dated wall grouped by year and collection, each tile linking to a detail view that shows the photographs large, names the glaze and clay body, says when it was made and that it has found a home, and offers "ask us for one like it" straight into WhatsApp with the piece name pre-filled. This is the page that proves the studio has been working for years, and it costs one route and one card component.

**Back-of-house order notes to the customer.** A small "from the studio" note the admin can add to any order — "your mug came out of the glaze firing this morning, here is how it looks" with a photo. Shown on the order detail page and pushed as one email. Small studios win on exactly this and no marketplace can copy it. One nullable rich text field plus one image on the order, one admin input, one section on the order page.

**Second-quality shelf.** Pieces with a kiln flaw the studio would not sell at full price, listed honestly at a discount with the flaw photographed and described. It converts waste into revenue, it is the most credible possible proof that the pieces are hand-made and fired in a real kiln, and it fits the "not mass production" principle better than anything currently on the site. Implement as a flag on the product plus a filter facet, reusing the existing shelf grid.

---

## 4. The ten to ship first

Ordered by quality gained per hour spent.

1. **One page shell (D1).** Seven different left edges collapse to one. Half a day, and it is the difference between "a site" and "a designed site".
2. **Fix /orders (D2).** A customer who just paid cannot see their order.
3. **Content QA on the imported catalogue (D4).** Remove the child photograph from the product gallery, replace the Le Creuset kitchen on /about, fix "Microvave". Two hours.
4. **Interim 1:1 crops of every product photo (E1, interim half).** Centre-crop and level the existing shots so the grid has one crop and one weight, while the real reshoot is booked. One day, and it changes how the whole shop reads.
5. **Style the Clerk modal and avatar (D5).** The one screen that looks like a different company, plus the violet avatar it leaves behind on every page.
6. **Kill the dead facets and clamp the price slider (D6).** Seven of twelve filters showing 0 makes the shop look closed.
7. **Fix the mobile PDP overflow and restore the mobile wishlist heart (D3, D9).** Two small fixes that repair the phone experience on the two pages that matter most.
8. **Made-to-order size selection (D8).** Preselect, or disable and explain. A customer can currently press Add to cart and get nothing.
9. **Add size, capacity and weight to the PDP fact list (E2, first half).** The number one unanswered question in ceramics, answerable today with the data we already have.
10. **One focus ring plus a skip link (D10, D11).** Five focus languages become one, and the keyboard gets a way past the header.

Behind those, in order: the events filter row and empty state (D7), the free-shipping meter (D12), the workshops hero and calendar copy (D13, D14), the checkout coupon collapse (D16), the empty-state illustrations (E8), and then the two big ones — the making story (E9) and the /custom rebuild (E5).
