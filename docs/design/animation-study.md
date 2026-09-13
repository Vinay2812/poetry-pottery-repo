# Animation study

Ten reference landing pages read end to end: `whichai.dev/preview/with-design-skill/fable-5.1/1..5` and `.../gpt-6-astra/1..5`. Every value quoted below is copied out of the live stylesheets (pulled with `curl` for the shells, then read out of `document.styleSheets` in a real browser, since each preview's CSS is scoped behind `:where(.gallery-generation[data-gallery-group="with-design-skill"][data-gallery-model="…"])`). Screenshots at 1440×900 top and mid-scroll informed the judgements.

Two houses, two temperaments:

- **fable-5.1** — five print-inspired pages (manila slip-box, transit map, plain-text terminal, blueprint floor plan, letterpress folio). Almost nothing moves after load. What does move is a single drawn diagram that builds itself, plus a hover conversation between a diagram and a list.
- **gpt-6-astra** — five soft, image-first pages (garden notes, electric stickies, library sheets, connections graph, pinboard). Nothing at all animates on load or scroll. All the motion budget goes into two or three hover states, tuned tight (0.16–0.22s).

One finding worth stating up front: **not one of the ten uses `position: sticky` for a pinned scroll section, scroll-jacking, parallax, or a scroll-driven progress animation.** Their storytelling is structural (numbered lists, shared colour keys, tab-swapped panels), not kinetic. If we build the pinned making-story in §5 we go past every reference page — deliberately, and only once on the site.

---

## 1. Catalogue of techniques

### 1.1 Page-load orchestration

| # | Technique | Recipe (verbatim values) | Seen on | Judgement / fit |
| --- | --- | --- | --- | --- |
| A1 | **Self-drawing SVG diagram** | `fill:none; stroke-dasharray:1; stroke-dashoffset:1; animation: draw 1.4s cubic-bezier(.4,0,.2,1) forwards` with `@keyframes draw { to { stroke-dashoffset: 0 } }`. The `1`/`1` pair works because every path carries `pathLength="1"`. | fable-2 transit map | Best thing in the set. It says "this was drawn for you" without a word. **Perfect fit** — it is literally what our hero already does. |
| A2 | **Multi-phase draw with hand-authored delays** | Walls/doors/furniture `plot .9s cubic-bezier(.4,0,.2,1) forwards`; corridor line the same but `animation-delay: 2s`; `.labelGroup,.dims { opacity:0; animation: fade .6s ease forwards; animation-delay: 2.1s }`; `.dims { animation-delay: 2.5s }`; `.arrowHead { fade .4s ease forwards; animation-delay: 2.6s }`. | fable-4 blueprint | Structure first, then annotation, then dimensions. Reads as a draughtsman working. 2.6s is long but the payoff holds. **Fits** — same grammar as our kiln labels. |
| A3 | **Index-driven stagger via a CSS custom property** | `.slot { animation: dealIn .75s cubic-bezier(.2,.75,.2,1) both; animation-delay: calc(.15s + var(--i) * .13s) }`, `@keyframes dealIn { 0% { transform: translate(18%,30%) rotate(0deg); opacity: 0 } to { transform: translate(0) rotate(var(--r)); opacity: 1 } }` — `--i` and `--r` set inline per card. | fable-1 card fan | Zero JS, stagger lives in the markup. 130ms is a touch slow for more than five items. **Fits, retimed** (40ms, cap 8). |
| A4 | **Point markers popping after the line that carries them** | `.station { opacity:0; animation: pop .35s ease-out forwards }`, `@keyframes pop { 0%{opacity:0;transform:translateY(3px)} to{opacity:1;transform:none} }`, delay set inline per station. | fable-2 | 3px is almost nothing and that is why it works — it reads as ink settling, not as UI. **Fits.** |
| A5 | **Interleaved two-column settle** | `@keyframes settle { 0%{opacity:0;transform:translateY(6px)} 100%{opacity:1;transform:none} }`, `.gloss { animation: settle .7s ease-out both }`, left margin delays `.5s / .9s / 1.3s`, right margin `.7s / 1.1s / 1.5s`. | fable-5 folio | Two columns 200ms out of phase so the eye zig-zags down the page. Lovely. **Fits** for a two-column about/process block. |
| A6 | **Typewriter + blinking caret** | `.typed { width:0; overflow:hidden; white-space:nowrap; animation: type .7s ease forwards }`; caret `.cursor { animation: blink 1s steps(2, start) 3.2s infinite; opacity:0 }` — the caret only starts blinking 3.2s in, after the type finishes. Headline is filled with `background-clip:text` over `radial-gradient(circle at 50% 50%, var(--ink) 0 1.05px, rgba(23,32,26,.55) 1.05px 1.25px, transparent 1.4px); background-size:3px 3px` for a dot-matrix look. | fable-3 | Clever, era-correct for a terminal page. **Does not fit** us — a typewriter is an office, not a wheel. |
| A7 | **Scroll-driven section reveal with no JS** | `main > section:not(:first-child) { animation: section-in linear both; animation-timeline: view(); animation-range: entry 5% cover 22% }` with `@keyframes section-in { 0%{opacity:0;transform:translateY(36px)} to{opacity:1;transform:none} }`. Hero copy `copy-in .76s cubic-bezier(.16,1,.3,1) both` (actions +`.1s`), hero image `image-in .92s cubic-bezier(.16,1,.3,1) 90ms both` from `translateY(26px) scale(.975)`. | whichai's own page chrome, not the ten previews — flagged as such | `animation-timeline: view()` is the modern answer to our `Reveal` component, but Safari support is still partial. **Fits as a progressive enhancement only.** 36px is too much travel for us; 12px is our house value. |

### 1.2 Scroll reveals

The ten preview pages have **no scroll reveals at all**. Everything is painted at load and then sits still. Coming from a site that reveals every section, the effect on first read is striking: the page feels printed rather than assembled. Worth remembering before we add more.

### 1.3 Hover and micro-interactions

| # | Technique | Recipe | Seen on | Judgement / fit |
| --- | --- | --- | --- | --- |
| B1 | **Tilted paper straightens under the cursor** | `.garden-note { position:absolute; transition: transform .2s, box-shadow .2s }` → `:hover { transform: rotate(0deg) translateY(-6px); z-index:4 }`. Library variant: `.library-sheet { transition: transform .22s }` → `:hover { transform: rotate(0deg) translateY(-9px); z-index:4 }`. | gpt-1, gpt-3 | The single best micro-interaction in the ten. Rest state is a rotation; hover is the *absence* of rotation, so the card appears to be picked up and looked at straight. **Fits with restraint** — our cards are square and unrotated, but a shelf of drawn icons could carry a ±1° rest tilt. |
| B2 | **Lift sibling, dim the rest** | `.card { transition: transform .35s cubic-bezier(.2,.75,.2,1), box-shadow .35s ease, opacity .35s ease }`; hovered gets `translateY(-4px) scale(1.03)`, siblings get `opacity:.55`, connecting threads drop to `opacity:.16`. | fable-1 | Focus by subtraction. Reads as intentional, never twitchy, because the dim is the same 350ms as the lift. **Fits** — dimming siblings is cheaper and quieter than scaling the hovered one. |
| B3 | **Diagram ↔ list cross-highlight** | Invisible `.hit { fill:transparent; cursor:pointer }` rects over SVG rooms; hovering one sets `.roomFill { fill:var(--line); fill-opacity:0; transition: fill-opacity .3s ease }` → `.roomFillActive { fill-opacity:.1 }` *and* `tbody tr { transition: background-color .16s ease-out }` → `.rowOn { background-color: color-mix(in srgb, var(--chalk) 9%, transparent) }`, *and* swaps a callout panel that is pinned at `min-height: 9.5rem` so nothing reflows. `.hit:focus-visible { stroke:var(--pencil); stroke-width:2; stroke-dasharray:6 4 }`. | fable-4 | The most *designed* interaction in the ten: one pointer drives three synchronised state changes, keyboard included, and the fixed-height callout means zero layout shift. **Excellent fit** for our product-page kiln labels and for a shapes diagram. |
| B4 | **Line weight as the hover affordance** | `.route { stroke-width:9; transition: stroke-width .16s ease-out }` → active `stroke-width:7` plus a dashed overlay `stroke-dasharray:3 15`. Reduced motion: `.route { transition: none }`. | fable-2 | Changing a stroke, not a colour, keeps a mono palette honest. **Fits** — we are a one-accent site. |
| B5 | **Button lift** | `transition: background .2s, transform .2s` → `:hover { transform: translateY(-1px) }`. Soft house: `transition: filter .16s, transform .16s` → `:hover { filter: brightness(1.12); transform: translateY(-2px) }`. | all ten | 1px is the right number; 2px plus a brightness filter already feels app-like. **Fits at 1px, no filter.** |
| B6 | **Stamp press** | `.ci-btn { transition: transform .15s ease, box-shadow .15s ease }` → `:hover { transform: translate(-1px,-1px) rotate(-.6deg) }` with the hard shadow going `2px 2px 0` → `4px 4px 0`. | fable set | Charming on a bureaucratic-form page; the rotation is a strong flavour. **Does not fit** — a rotating button is a costume. |
| B7 | **Underline grows on hover, not appears** | `.quiet-link:hover { text-decoration: underline; text-underline-offset: 5px }` (theirs is instant); `.secondary { text-decoration: underline rgba(243,235,211,.4); text-underline-offset:4px; transition: text-decoration-color .2s }` — the underline is always there, only its colour animates. | gpt set / fable-1 | The always-present underline whose *colour* fades in is the more refined of the two, and it avoids layout jitter. **Fits.** |
| B8 | **Icon ring, not border** | `.graph-node-icon { box-shadow: 0 0 0 7px <bg>; transition: transform .2s, box-shadow .2s }` → `.graph-node:hover .graph-node-icon { transform: scale(1.09) }`; node opacity `transition: opacity .2s`. | gpt-4 | Ring-as-shadow lets the icon punch a hole in a busy background. `scale(1.09)` is too much for us. **Partial fit** at `scale(1.03)`. |
| B9 | **Ghost hover on icon buttons** | `.icon-button:hover { background: rgba(0,0,0,.035) }`. | all gpt pages | 3.5% black — invisible until you need it. **Fits exactly**; ours currently only change text colour. |

### 1.4 Ambient / looping

| # | Technique | Recipe | Seen on | Judgement / fit |
| --- | --- | --- | --- | --- |
| C1 | **Looping traveller with dwell holds** | `@keyframes runLineC { 0%,4%{transform:translateX(0)} 21%,26%{translateX(180px)} 47%,52%{translateX(400px)} 67%,72%{translateX(560px)} 95%,to{translateX(760px)} }`, applied as `animation: runLineC 15s linear infinite alternate` with `transform-box: view-box; transform-origin: 0 0`. Reduced motion: `.serviceDot { animation: none }`. | fable-2 | The paired percentage stops (`0%,4%`) are the trick: the dot *stops at each station*, so a linear timing function reads as a train with a timetable. Genuinely well crafted. **Does not fit** — an infinite loop on a pottery page is a screensaver. Worth stealing the *hold* technique if we ever animate a kiln temperature readout. |
| C2 | **Blinking caret** | `animation: blink 1s steps(2, start) 3.2s infinite` — `steps(2)` gives a hard on/off, no fade. | fable-3 | Correct technique, wrong world for us. **No fit.** |

Nothing else loops anywhere in the ten. No shimmer, no marquee, no float, no gradient pan. That restraint is the reference set's actual house style.

### 1.5 Transitions between states

| # | Technique | Recipe | Seen on | Judgement / fit |
| --- | --- | --- | --- | --- |
| D1 | **Tablist swaps a live preview** | `<div class="garden-tabs" role="tablist">` of three `<button role="tab" aria-selected>` steps, each a line icon + `<h3>` + one sentence, all pointing at one `aria-controls="garden-feature-preview"` panel. The panel swaps content; the only transition is the `.active` button's background. | gpt-1 | Steps stay readable all at once (all three are on screen with their copy), and the panel shows the result. No motion needed — the information change *is* the animation. **Fits well** for the workshops page and a shop-the-shelf story. |
| D2 | **Fixed-height callout** | `.callout { min-height: 9.5rem }` so swapping content never moves the page. | fable-4 | One CSS line that prevents the single worst class of "animation" bug. **Fits everywhere.** |
| D3 | **Label knockout over a drawn line** | SVG text with `paint-order: stroke fill; stroke: var(--paper); stroke-width: 4px; stroke-linejoin: round`. | fable-2 | Not motion, but it is what makes an animated diagram legible while it draws. **Fits** our kiln labels. |

### 1.6 Typography motion

Only two instances across ten pages: the fable-3 typewriter (A6) and the fable-5 marginalia settle (A5). **No** letter-by-letter splits, no word masks, no variable-font weight animation, no counters. Headlines are simply there. For a little-text direction this is the correct lesson: if there are only nine words on the screen, animating them individually draws attention to how few there are.

### 1.7 Cursor / pointer effects

**None.** No custom cursors, no magnetic buttons, no cursor-following blobs, no trailing highlights, no tilt-on-mousemove. Every pointer effect is a plain CSS `:hover` with a `:focus-visible` twin. For a keyboard-and-touch-first shop this is the right call, and it is the single easiest thing to copy.

### 1.8 Reduced motion and scroll plumbing

Every gpt page ships the global killswitch:

```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

plus `html { scroll-behavior: smooth; scroll-padding-top: 32px }` (20px below 600px) so in-page anchors land clear of the sticky header. fable handles it per-component instead (`.serviceDot { animation: none }`, `.route { transition: none }`) — more precise, more to maintain. Our `@media (prefers-reduced-motion: no-preference)` wrapper in `globals.css` is the better of the three patterns: motion is opt-in rather than bolted off.

---

## 2. What we do today

Read from `frontend/src/`:

| Where | What moves | Values |
| --- | --- | --- |
| `app/globals.css` | Four keyframes, all gated inside `@media (prefers-reduced-motion: no-preference)` | `clip-reveal` `inset(0 100% 0 0)→inset(0)` at `700ms cubic-bezier(.22,1,.36,1)`; `fade-up` 12px at `500ms` same curve, delay `var(--reveal-delay)`; `draw-line` `stroke-dashoffset: var(--draw-length,100)→0` at `600ms` same curve, delay `var(--draw-delay)`; `.animate-label-fade` = fade-up at `300ms ease-out`, delay `var(--label-delay)` |
| `components/motion/Reveal.tsx` | Section fade-up on first entry | `IntersectionObserver`, `threshold: 0.15`, `observer.disconnect()` after the first hit, content rendered visible so there is no SSR blank. Takes a `delay` prop; nothing on the site passes it |
| `features/home/components/HeroIllustration.tsx` | The moon-jar draw-on | `pathLength`-normalised `--draw-length: 1`; `DRAW_MS 600`, phases at `0 / 420 / 680 / 860`, pointer lines at `1000` with `LINE_STAGGER_MS 80`, labels at `1840ms`. Total ~2.4s |
| `features/products/components/ProductCard.tsx` | Second-photo crossfade + Add button | `transition-opacity duration-500 ease-out` on both images; Add is `lg:opacity-0 lg:group-hover:opacity-100` with `transition-opacity duration-200`. **No image scale** — the 1.02/900ms in the direction doc is not built |
| `features/products/components/ProductCarousel.tsx` | Embla drag/snap + progress thumb | Arrows `transition-colors`; `scrollPrev/Next(isReducedMotion.current)` jumps instantly under reduced motion. Good |
| `components/ui/dialog.tsx` / `sheet.tsx` | Radix enter/exit | Dialog `duration-200` with `zoom-in-95`/`zoom-out-95`; overlay `backdrop-blur-sm`. Sheet `transition duration-200 ease-in-out`, `slide-in-from-*-10`, overlay `duration-100` + `backdrop-blur-xs` |
| `features/layout/components/SiteHeader.tsx` | Nothing | `sticky top-0 z-40 border-b bg-background`; links only `transition-colors`. No scroll state, no hairline colour change |
| `features/products/components/CategoryTile.tsx` | Icon colour + underline | `transition-colors group-hover:text-primary`; `group-hover:underline` appears instantly |
| `components/ui/button.tsx` | Colour only | `transition-colors duration-200 ease-out` |
| `app/(storefront)/page.tsx` | One `Reveal`, around the featured carousel only | Categories, made-to-order, events and about are unwrapped; no grid stagger anywhere |

Gaps against our own `docs/design/direction.md`: no product-image hover scale, no left-growing link underline, no 40ms/cap-8 grid stagger, most home sections not revealed, dialog uses a `zoom` (a scale on a zero-radius sheet reads slightly wrong), sheet overlay uses a blur the direction doc bans elsewhere.

---

## 3. Ranked shortlist to adopt

Tokens: `clay-white #F7F4EF`, `ink #1F1D1A`, `sage #4F6F52`, `kiln #C4785A`, `smoke #6F6A62`, `ash #E5E0D8`, `--radius: 0`. House curve is `cubic-bezier(0.22, 1, 0.36, 1)` — keep it; it is the same family as the references' `(.16,1,.3,1)` and `(.2,.75,.2,1)`. Everything below is transform/opacity/`stroke-dashoffset`/`fill-opacity` only. No `width`, `height`, `top`, `filter` or `box-shadow` animation in a scroll path.

**1. Grid stagger on card reveals** *(from A3)* — home pieces grid, shop grid, events list, wishlist, order lines.
```css
/* pass --reveal-delay per card from the container, not a wrapper per card */
.animate-fade-up { animation-delay: var(--reveal-delay, 0ms); }
```
```tsx
style={{ "--reveal-delay": `${Math.min(index, 7) * 40}ms` }}
```
One `Reveal` around the grid; children carry the delay. Cap at 8 so row four never waits 600ms. Reduced motion: already handled by the `no-preference` wrapper. Perf: one observer per grid, not per card.

**2. Section reveals on every home section** *(from A7, retimed)* — wrap `HomeSection` itself so categories, made-to-order, events and about behave like the carousel already does. Keep 12px / 500ms / house curve; do **not** adopt the reference's 36px. Progressive enhancement worth adding later, behind `@supports (animation-timeline: view())`: drop the observer for `animation-timeline: view(); animation-range: entry 5% cover 22%`, keeping the JS path as the fallback.

**3. Diagram ↔ list cross-highlight** *(B3 + D2)* — product page kiln labels (`KilnLabels.tsx`) and the shapes strip. Hovering or focusing a fact row lights its SVG leader line and dot; hovering the dot lights the row.
```css
.fact-row { transition: background-color 160ms ease-out; }
.fact-row[data-on] { background-color: color-mix(in srgb, var(--color-sage) 8%, transparent); }
.leader { stroke: var(--color-ash); transition: stroke 200ms ease-out; }
.leader[data-on] { stroke: var(--color-sage); }
.hit { fill: transparent; cursor: pointer; }
.hit:focus-visible { stroke: var(--color-sage); stroke-width: 2; stroke-dasharray: 6 4; }
```
Pair with `min-height` on any swapping panel (D2). Perf: `fill-opacity`/`stroke` only, no reflow, no layout read.

**4. Ghost hover on icon buttons** *(B9)* — header cart/search/account, carousel arrows, gallery thumbs, quantity steppers, dialog close.
```css
transition: background-color 160ms ease-out, color 160ms ease-out;
&:hover { background-color: color-mix(in srgb, var(--color-ink) 4%, transparent); }
```
Zero radius keeps it a square of tint, which suits us better than the reference's rounded pill.

**5. Underline that grows from the left** *(B7, our direction doc's version)* — every text link, nav item, "See everything", footer columns.
```css
.link { background-image: linear-gradient(var(--color-ink), var(--color-ink));
        background-size: 0% 1px; background-position: 0 100%;
        background-repeat: no-repeat;
        transition: background-size 250ms cubic-bezier(0.22, 1, 0.36, 1); }
.link:hover, .link:focus-visible { background-size: 100% 1px; }
```
`background-size` is not a compositor property, but on a one-line inline element the paint area is a few hundred px² — measured cost is negligible and it avoids the pseudo-element `transform: scaleX` trick's subpixel wobble on serif text. Use sage for the underline on sage links, ink elsewhere. Reduced motion: skip the transition, underline is simply present on hover.

**6. Lift-and-dim on a row of siblings** *(B2)* — category strip, events rows, the "how a piece is made" strip.
```css
.strip:hover > * { opacity: .55; transition: opacity 350ms ease; }
.strip > *:hover, .strip > *:focus-within { opacity: 1; }
```
No lift, no scale: on a zero-radius, shadowless page the dim alone carries the focus, and it costs one composited property.

**7. Card image hover scale** *(our direction doc, absent in code)* — `ProductCard`.
```css
img { transition: transform 900ms cubic-bezier(0.22, 1, 0.36, 1); }
.group:hover img, .group:focus-within img { transform: scale(1.02); }
```
900ms is deliberately slower than everything else — it reads as the camera breathing, not as a button. Needs `overflow-hidden` on the square (already there) and `will-change: transform` **only** while hovered, set by the `:hover` rule, never at rest.

**8. Point markers pop after their line** *(A4)* — kiln-label dots, the scroll-story step markers, map/route drawings if we ever add the studio map.
```css
@keyframes dot-pop { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: none; } }
.dot { animation: dot-pop 350ms ease-out both; animation-delay: var(--dot-delay, 0ms); }
```
3px, not 8px. Bigger reads as a UI toast.

**9. Interleaved two-column settle** *(A5)* — about page story columns and the studio notes in Cormorant italic.
Reuse `fade-up` at `700ms ease-out both`, delays left `0 / 400 / 800ms`, right `200 / 600 / 1000ms`. Fire it from a `Reveal` on the block rather than on load, so it is not competing with the hero.

**10. Tilt-straightens-on-hover** *(B1)* — the drawn category icons only, nowhere else.
Rest `transform: rotate(-1.5deg)` (alternate sign per index), hover `transform: rotate(0deg) translateY(-4px)`, `transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1)`. This is the one place a hand-drawn wobble is honest: they are ink drawings pinned to a wall. Do not apply it to photographs, prices, or anything clickable that looks like a control.

**11. Button lift at 1px** *(B5)* — primary "Add to cart", "Book a wheel session", checkout CTA.
```css
transition: background-color 200ms ease-out, transform 200ms ease-out;
&:hover { transform: translateY(-1px); }
&:active { transform: translateY(0); }
```
No `filter: brightness()` — it washes ink on clay-white into mud.

**12. Fixed-height swap panels** *(D2)* — product gallery caption, workshop slot summary, cart totals, the scroll-story copy column. Any element whose content changes gets a `min-h-[…]` sized to its tallest state. Not an animation; it is what stops every other animation from looking broken.

**Page transitions:** adopt nothing new. The references have no page transitions, and Next's App Router default (paint the new route) plus our per-section `Reveal` already reads as a fresh sheet of paper. A View Transitions crossfade would add a frame of ghosting on product→product navigation for no story gain.

---

## 4. Do not copy

- **The looping service dot (C1).** Perfectly built, but an infinite animation on a shop page is a thing that never stops asking for attention. Our page should be able to sit still on a screen for ten minutes.
- **The typewriter headline (A6).** A machine writing implies mass production; we sell the opposite. It also delays first readable paint on the one string that matters for LCP.
- **The `rotate(-.6deg)` stamp button (B6).** Rotating controls are a costume. Buttons must look pressable, not collectable.
- **`filter: brightness(1.12)` on hover (B5 variant).** Filters force an off-main-thread paint of the whole element and, on our palette, turn `ink` into a flat grey.
- **`scale(1.09)` icon hover (B8).** Nine percent is a pop; at zero radius it looks like a dialog opening. 1.02–1.03 is our ceiling.
- **36px scroll travel (A7).** Too much lift makes a calm page feel like it is being dealt out. 12px is our number and it should stay our number.
- **`backdrop-blur` on overlays** (ours, not theirs — none of the ten blurs anything). The direction doc bans blur under the header; the sheet overlay should be a flat `ink/10` scrim for the same reason.
- **`zoom-in-95` on dialogs** (ours). Scaling a sharp-edged sheet reads as a phone app. Replace with opacity plus a 8px `translateY`.
- **Cursor effects, magnetic buttons, parallax, scroll-jacking beyond the one pinned story in §5.** The references use none, and they are the pages that feel expensive.

---

## 5. Home-page scroll story: how a piece is made

### 5.1 The idea

One drawn piece, in the same ink line as the moon-jar hero, changes state as you scroll. Five making steps, each paired with one studio value in a line or two (values from `docs/research/handmade-pottery-values.md` and the About page), then a sixth closing frame at 1225°C that hands you off to the shop.

| # | Step | Drawing state | Value | Copy (draft, one line + one) |
| --- | --- | --- | --- | --- |
| 1 | Wedging | A wedge of clay on the bench: a lumpy closed shape, spiral ridges, no vessel yet | **Trust the process** | "Nothing is thrown on day one." / "The clay is folded until the air is out of it. You cannot hurry this part, and it decides everything after." |
| 2 | Throwing | The jar's profile rises — wall curve draws in, four throwing rings appear | **Handmade with heart** | "Two hands, one revolution at a time." / "Every wall is pulled by hand, so no two jars close at quite the same height." |
| 3 | Trimming | A foot ring is cut at the base; small trimming curls fall to the ground line | **Sustainability** | "Every curl goes back in the bucket." / "Trimmings are wedged into the next batch. A studio this size throws almost nothing away." |
| 4 | Bisque firing | The line warms from `ink` to `kiln`; the piece stands alone on the shelf line | **The beauty of letting go** | "Then we close the door." / "Once the kiln is loaded, nothing more can be decided. What comes out is what the fire made." |
| 5 | Glazing | The sage band appears across the shoulder with its one drip | **Community** | "Glaze day is the loud day." / "Everyone dips on the same afternoon, out of the same buckets, and we all find out together." |
| 6 | 1225°C | Finished jar, sage band set, kiln mark burning at the foot; the verse arcs under the floor | — (closing frame) | "1225°C. One kiln." / link: "Shop the shelf" |

Steps 1–5 carry the five values one at a time. Step 6 is the payoff frame and the exit.

### 5.2 Placement

Between the hero and the category strip, as its own full-bleed band with `ash` hairlines top and bottom — it is the answer to "why does a mug cost this much", and it must be read before the shapes row invites a click. It replaces `HowItsMade.tsx` on the home page (that component stays for the about page's compact four-icon strip).

### 5.3 Wireframe (desktop ≥1024px)

```
────────────────────────────────────────────────────────── ash hairline
│  sticky viewport, 100svh, clay-white                                 │
│                                                                      │
│   ┌───── left column, 5/12 ─────┐   ┌──── right column, 6/12 ────┐   │
│   │                             │   │                            │   │
│   │  01  ── HOW A PIECE IS MADE │   │                            │   │
│   │      (11px, 0.18em, smoke)  │   │        ╭─────────╮         │   │
│   │                             │   │       ╱           ╲        │   │
│   │  Nothing is thrown          │   │      │   drawn     │       │   │
│   │  on day one.                │   │      │   piece,    │       │   │
│   │  (DM Serif, 40px, ink)      │   │      │   current   │       │   │
│   │                             │   │       ╲   state   ╱        │   │
│   │  The clay is folded until   │   │        ╰─────────╯         │   │
│   │  the air is out of it. You  │   │      ───────────────       │   │
│   │  cannot hurry this part.    │   │       floor + shadow       │   │
│   │  (15px DM Sans, smoke)      │   │                            │   │
│   │                             │   │                            │   │
│   │  TRUST THE PROCESS          │   │                            │   │
│   │  (11px, 0.18em, sage)       │   │                            │   │
│   │                             │   │                            │   │
│   │  min-height locked ~13rem   │   │                            │   │
│   └─────────────────────────────┘   └────────────────────────────┘   │
│                                                                      │
│   ▪ ─── ▫ ─── ▫ ─── ▫ ─── ▫ ─── ▫   step markers, 6 × 2px squares,   │
│   1     2     3     4     5     6   active = sage, rest = ash        │
│                                                                      │
────────────────────────────────────────────────────────── ash hairline
     ↑ wrapper is 6 × 100svh tall; the band above is sticky inside it
```

Mobile (<768px): no pinning. Six stacked blocks, drawing above copy, each ~72svh, each revealed by the existing `Reveal` at `threshold: 0.15`. The markers become a plain `01 / 06` counter above each eyebrow.

### 5.4 Mechanics

**Layout.** A wrapper `<section>` of `height: calc(6 * 100svh)` containing one `<div class="sticky top-0 h-[100svh]">`. `100svh` not `100vh` so mobile browser chrome does not clip the last step. No scroll-jacking, no wheel interception, no `scroll-snap` — the page scrolls at its natural rate and the content inside changes.

**Progress → step index.** One `IntersectionObserver` (with `rootMargin: "0px"`) to know when the band is on screen at all; while it is, a `requestAnimationFrame`-throttled `scroll` listener reads the wrapper's `getBoundingClientRect().top` once per frame and derives:

```ts
const progress = clamp(-rect.top / (rect.height - window.innerHeight), 0, 1);
const step = Math.min(5, Math.floor(progress * 6));
```

Only when `step` changes does it write `root.dataset.step = String(step)`. One dataset write per step change, no state churn, no layout thrash (a single read, no writes between reads). Detach the scroll listener when the observer says the band has left.

**Drawing states — crossfade, not morph.** Six `<g>` layers inside one SVG `viewBox`, all present in the DOM, all sharing the moon-jar coordinate space so the silhouette never jumps:

```css
.story-state { opacity: 0; transition: opacity 420ms cubic-bezier(0.22, 1, 0.36, 1); }
[data-step="0"] .story-state[data-state="0"] { opacity: 1; }
/* …one rule per step… */
```

Path morphing was considered and rejected: the shapes have different point counts (a wedge has no foot ring, a glazed jar has a band), so a morph would need a runtime library and would produce liquid in-betweens that look nothing like clay. Crossfade is 6 rules of CSS and reads as flipping through a sketchbook.

**Draw-on inside a step.** The first time a step becomes active, the *new* strokes in that layer draw themselves with our existing `.animate-draw-line` (`pathLength="1"`, `--draw-length: 1`, `600ms`, house curve), staggered with `--draw-delay` at 80ms per element, capped at 5. Shared strokes (the jar wall) do not redraw — they are in a base layer that is always visible from step 2 on. Mark each layer `data-drawn` after its first activation so scrolling back up does not replay; scrolling back shows the finished state of the earlier step, exactly like our hero's reduced-motion path.

**The sage band (step 5).** The band arrives as a `clip-path: inset(0 0 100% 0) → inset(0)` wipe from the shoulder down, `700ms`, house curve — the same wipe grammar as our hero image, and the one place on the page where sage appears in motion. The drip follows on a `--draw-delay: 300ms`.

**Copy column.** All six copy blocks are in the DOM; the active one is `opacity: 1`, the rest `opacity: 0; pointer-events: none`, crossfading at `280ms`, with a 12px `translateY` on entry only. Column is `min-height: 13rem` (D2) so the marker row never moves. Inactive blocks get `aria-hidden="true"` and `inert`.

**Step markers.** Six 2px squares (zero radius, naturally), `ash` at rest, `sage` when active, `transition: background-color 200ms ease-out`. They are `<button>`s: clicking one scrolls the window to `wrapperTop + index * innerHeight` with `behavior: "smooth"` (`"auto"` under reduced motion). Keyboard: left/right arrows move between steps. This gives the whole thing a non-scroll path, which is what makes it accessible rather than decorative.

**Reduced motion.** `@media (prefers-reduced-motion: reduce)`: the sticky wrapper collapses to `height: auto`, the inner band un-sticks (`position: static`), and all six steps render stacked and fully drawn, exactly like the mobile layout. No progress listener is attached at all — check `matchMedia("(prefers-reduced-motion: reduce)").matches` before wiring it, and re-check on `change`. This is the same "show the finished drawing at once" contract the hero already honours.

**Performance.** Animated properties are `opacity`, `transform`, `stroke-dashoffset` and `clip-path` only. `will-change: opacity` on the six SVG layers **only while the band is on screen** (toggled by the same IntersectionObserver), never at rest — six permanently promoted layers on a page that also has a carousel would cost more than it saves. One rAF-throttled listener, one dataset write per step, no React state in the scroll path (the container sets the attribute via a ref). The SVG is inline, no network cost; total added markup ≈ 6 layers × ~10 paths.

**SEO / no-JS.** All six copy blocks are real server-rendered text. With JS off, `data-step` is absent, and a `:root:not([data-step]) .story-state { opacity: 1 }` fallback shows every layer stacked — so it degrades to the mobile stacked reading, not to a blank band.

### 5.5 Sizing

| Piece of work | Hours |
| --- | --- |
| Draw the six SVG states in the hero's line style (wedge, thrown profile, trimmed foot + curls, bisque, glaze band + drip, finished with kiln mark), sharing one `viewBox` | 5–7 |
| `MakingStory` presentational component + six state layers + markers, with stories at mobile/tablet/laptop/desktop | 3 |
| `MakingStoryContainer`: observer, rAF progress, step index, reduced-motion branch, marker click/keyboard | 3 |
| CSS: crossfade rules, band clip-path wipe, draw-on staggers, reduced-motion and no-JS fallbacks | 1.5 |
| Copy pass with the owner on the five value lines | 1 |
| Wire into the home page between hero and categories; move `HowItsMade` to the about page; unit tests for the progress→step helper in `types.ts` | 1.5 |
| agent-browser verification at four viewports plus forced-reduced-motion, `pnpm tsc/test/lint/knip` | 1 |
| **Total** | **16–18** |

---

## 6. Implementation plan, by impact

Each item is independently shippable and does not require re-reading the reference pages.

| Order | Work | Files | Hours | Why first |
| --- | --- | --- | --- | --- |
| 1 | **Grid stagger + reveal every home section.** Add `--reveal-delay` at `Math.min(i,7) * 40ms` to grid children; wrap `HomeSection` in `Reveal`; same for shop grid, events list, wishlist. | `components/motion/Reveal.tsx`, `features/home/components/HomeSection.tsx`, `app/(storefront)/page.tsx`, `features/products/…`, `features/events/…` | 2 | Touches the most surface for the least code; the machinery already exists and is unused. |
| 2 | **Hover pass on controls.** Ghost tint on icon buttons (#4), 1px button lift (#11), left-growing link underline (#5), card image `scale(1.02)/900ms` (#7). | `components/ui/button.tsx`, `SiteHeader.tsx`, `SiteFooter.tsx`, `ProductCard.tsx`, `ProductCarousel.tsx`, `app/globals.css` | 3 | Every page, every session. Closes four gaps against our own direction doc. |
| 3 | **Fix the two off-brief transitions.** Dialog: drop `zoom-in-95`/`zoom-out-95` for opacity + 8px `translateY`, in 250ms / out 180ms. Sheet overlay: flat `ink/10`, no `backdrop-blur`. | `components/ui/dialog.tsx`, `components/ui/sheet.tsx` | 1 | Small, and it stops a sharp-edged site reading like an app. |
| 4 | **Home-page making story (§5).** | new `features/home/components/MakingStory.tsx` + container + `types.ts`, `app/(storefront)/page.tsx`, `globals.css` | 16–18 | The headline piece. Biggest story gain, biggest build — schedule it once 1–3 have landed so the rest of the page is already calm around it. |
| 5 | **Kiln-label cross-highlight on the product page (#3).** Fact rows ↔ leader lines ↔ dots, with invisible hit areas, `:focus-visible` dashed outline, and a `min-height` callout. | `components/motion/KilnLabels.tsx`, `features/products/components/…` | 4 | Turns a static annotation into the page's one interactive object; reuses the SVG already built. |
| 6 | **Lift-and-dim on strips (#6) + tilt-straighten on drawn category icons (#10).** | `features/products/components/CategoryStrip.tsx`, `CategoryTile.tsx`, `features/home/components/HowItsMade.tsx` | 2 | Cheap charm, confined to the one place hand-drawn wobble is honest. |
| 7 | **Interleaved settle on the about page (#9) + `dot-pop` markers (#8) wherever leader dots appear.** | `features/about/…`, `KilnLabels.tsx`, `MakingStory` | 2 | Finishes the about page, which currently has no motion of its own. |
| 8 | **`min-height` audit (#12).** Every panel whose content swaps: gallery caption, workshop slot summary, cart totals, story copy column. | various | 1.5 | Prevents the layout shift that would make items 4–7 look broken. |
| 9 | **Progressive `animation-timeline: view()` behind `@supports`,** keeping the observer path as fallback. | `app/globals.css`, `Reveal.tsx` | 2 | Pure perf/refinement; do last, and only if item 1 shows observer cost on long grids. |

Verification for every item: `pnpm tsc && pnpm test && pnpm lint && pnpm knip` in `frontend/`, stories at mobile/tablet/laptop/desktop via `atViewport`, and an `agent-browser` pass on `localhost:3030` with `set media reduced-motion` toggled both ways. Format with `pnpm prettier:format` before finishing.
