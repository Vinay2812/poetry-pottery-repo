# Frontend

Next.js 16 (App Router, Turbopack) + React 19 + Tailwind 4 + Apollo Client 4 +
Clerk, wired to the sibling NestJS GraphQL API in `../api` (port 6060).

## Setup

```bash
pnpm install
cp .env.example .env.local   # fill in real Clerk keys
pnpm codegen                 # regenerate typed hooks (introspects the running API)
pnpm dev                     # http://localhost:3030
```

Environment variables are validated by zod in `src/config/env.ts` and the app
fails fast with a readable message when one is missing or invalid.

| Variable                            | Scope   | Notes                                       |
| ----------------------------------- | ------- | ------------------------------------------- |
| `NEXT_PUBLIC_API_URL`               | client  | Defaults to `http://localhost:6060/graphql` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | client  | Required                                    |
| `CLERK_SECRET_KEY`                  | server  | Required                                    |
| `NEXT_PUBLIC_LOG_LEVEL`             | client  | `error\|warn\|info\|debug`                  |
| `LOG_LEVEL`                         | server  | `error\|warn\|info\|debug`                  |
| `SCHEMA_URL`                        | codegen | GraphQL endpoint or schema file path        |
| `SCHEMA_SYNC_KEY`                   | codegen | Must match the API's `SCHEMA_SYNC_KEY`      |

## Storefront

All storefront routes live under `src/app/(storefront)/`, sharing one header/footer layout.

| Route                                                        | Feature                                                                                                                                    |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `/`                                                          | Home: rendered moon-jar hero, categories, made-to-order banner, featured pieces, upcoming events, about (no pinned making story — dropped) |
| `/products`                                                  | Shop: shelf/archive tabs, one URL-driven filter sidebar, optimistic filter state                                                           |
| `/products/[slug]`                                           | Product detail: swipeable gallery, kiln-label fact list                                                                                    |
| `/custom`                                                    | Made-to-order pieces                                                                                                                       |
| `/cart`, `/wishlist`                                         | Cart and wishlist                                                                                                                          |
| `/checkout`                                                  | Address, coupon, order note, place order                                                                                                   |
| `/orders`, `/orders/[id]`                                    | Order history and detail                                                                                                                   |
| `/events`, `/events/[slug]`                                  | Events and seat registration                                                                                                               |
| `/workshops`, `/workshops/[slug]`                            | Open-studio wheel sessions: per-hour slot picking within the studio's `slot_span_days`                                                     |
| `/workshops/bookings`, `/workshops/bookings/[id]`            | Booking history and detail                                                                                                                 |
| `/account`, `/account/addresses`                             | Account and saved addresses                                                                                                                |
| `/about`, `/care`, `/faq`, `/privacy`, `/shipping`, `/terms` | CMS-backed content pages                                                                                                                   |
| `/contact`                                                   | Contact form                                                                                                                               |
| `/newsletter/unsubscribe`                                    | Newsletter unsubscribe                                                                                                                     |
| `/search`                                                    | Global search across products (shelf + archive) and events                                                                                 |
| `not-found.tsx`, `[...unmatched]`                            | 404, keeping the storefront header/footer                                                                                                  |

The mobile bottom nav opens the rest of the link list in `MobileMenuSheet` (`src/features/layout`).

## Architecture

```
src/
├── app/                 # App Router pages, layout, global styles
├── components/          # Header, web vitals reporter, shadcn ui/
├── config/env.ts        # zod-validated environment (single source of truth)
├── features/<name>/     # containers/ + components/ + types.ts + index.ts
├── graphql/             # operation documents + generated/graphql.tsx
├── lib/apollo/          # client provider + RSC client + links
├── lib/logger.ts        # one logger API (winston on server, console in browser)
└── store/ui-store.ts    # zustand
```

Containers own state, data fetching, derivation and handlers. Presentational
components take normal **flat props**: individual scalars plus `on*` callbacks,
each passed explicitly — no `viewModel` objects, no `{...spread}` in app code.
Pure formatting helpers (date labels, display-name fallbacks) live in the
feature's `types.ts` so they stay unit-testable. Cross-directory imports always
use the `@/` alias.

Logging goes through a single import (`@/lib/logger`). Winston is aliased away
for browser builds (`next.config.ts` → `turbopack.resolveAlias`) so it never
reaches the client bundle.

## Commands

| Command                | What it does                                                                              |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| `pnpm dev`             | Dev server on port 3030                                                                   |
| `pnpm build`           | Production build (Turbopack, React Compiler enabled)                                      |
| `pnpm start`           | Serve the production build on port 3030                                                   |
| `pnpm codegen`         | Regenerate hooks via protected introspection (`SCHEMA_URL=../api/schema.gql` for offline) |
| `pnpm tsc`             | `tsc --noEmit`                                                                            |
| `pnpm lint`            | ESLint (incl. React Compiler rules)                                                       |
| `pnpm prettier:format` | Format the repo                                                                           |
| `pnpm test`            | Vitest: `unit` (jsdom) + `storybook` (chromium) projects                                  |
| `pnpm test:coverage`   | Unit coverage report (v8) into `coverage/`                                                |
| `pnpm storybook`       | Storybook on port 6006                                                                    |
| `pnpm build-storybook` | Static Storybook into `storybook-static/`                                                 |

## Optimization toolkit

Each command below writes machine-readable output, so an agent can run it and
read the result without a browser.

### `pnpm analyze`

Runs `next build --experimental-analyze` (Turbopack's native bundle analysis).

- `.next/diagnostics/route-bundle-stats.json` — per-route first-load JS bytes
  and the exact chunk list. **Start here for automated checks.**
- `.next/diagnostics/build-diagnostics.json` — build-level diagnostics.
- `.next/diagnostics/analyze/index.html` — interactive treemap UI (serve the
  `analyze` directory to view it).

`@next/bundle-analyzer` is intentionally not used: it is webpack-only, and this
app builds with Turbopack.

### `pnpm lighthouse`

Builds, then runs Lighthouse CI twice via `scripts/lighthouse.ts` — desktop
(`lighthouserc.json`) and mobile (`lighthouserc.mobile.json`). lhci starts and
stops `pnpm start` itself.

- `.lighthouse/desktop/home-<timestamp>.json` and `.html`
- `.lighthouse/mobile/home-<timestamp>.json` and `.html`
- Read `categories.<id>.score` from the JSON for scores.

Assertions are warn-level (performance / accessibility / best-practices ≥ 0.85)
so regressions surface without failing the command.

Notes: the script points `CHROME_PATH` at the Playwright Chromium download when
`CHROME_PATH` is unset. The configs send a `__clerk_db_jwt` cookie so Clerk's
dev-browser handshake does not redirect the audited page away from localhost
when placeholder keys are in use.

### `pnpm knip`

Reports unused files, exports and dependencies. Exits non-zero on findings.
Configured in `knip.ts`; every ignore entry carries a one-line reason.

### Web Vitals

`src/components/web-vitals-reporter.tsx` logs every metric through the shared
logger at `debug` level — visible in dev, silent in production (default `warn`).

## Design system

The house style is `../docs/design/direction.md`: zero radius everywhere, one sage accent,
DM Serif Display headings over DM Sans body text, and the hand-drawn kiln-label moon jar as the
site's one illustration device. `--radius: 0px` in `globals.css` and `rounded-none` on the base
button/input are the enforcement point — nothing in `components/ui` should reintroduce a radius.
`../docs/design/animation-study.md` is the reference-page survey and gap analysis that produced
the current motion pass; `../docs/design/temporary-photos.md` records that the Pexels stand-in
photos are scoped to the opt-in `pnpm db:seed:demo` catalogue only — the default local data
(`pnpm import:legacy`) uses the studio's own CDN photos, and the home hero is a drawn illustration
that needs no photo either way.

Motion lives behind a handful of shared primitives rather than being hand-rolled per component:
`Reveal` (`src/components/motion/Reveal.tsx`) fades a section up 12px the first time it scrolls
into view, one `IntersectionObserver` per group so a grid doesn't pay for one observer per card;
`stagger.ts`'s `toRevealDelay` caps that stagger at 8 cards, 40ms apart, via a `--reveal-delay`
CSS variable; and `ghost-hover`, `link-underline`, `photo-zoom` (`src/app/globals.css`) are Tailwind
`@utility` classes for the icon-button tint, the left-growing underline and the 1.02 image scale on
hover, so every place that needs one of those three effects reads the same class instead of
reimplementing the transition.

## Conventions and verification

The no-cache-writes optimistic UI rule (React `useOptimistic` + `useTransition` in the container,
never a hand-written Apollo cache write) is in the repo `CLAUDE.md` — see also
`../docs/design/optimistic-audit.md` for the page-by-page audit that drove the current pass; it is
not repeated here.

For motion or layout changes, verify from a recording rather than stills: `agent-browser --session
<s> record start /tmp/x.webm --fps 30`, exercise the change, `record stop`, then `ffmpeg -i x.webm
-vf fps=15 frames-%03d.png` and read the frames for shift and flicker. Static changes can still use
an `agent-browser` screenshot pass against `localhost:3030`.

### Browser flows

`scripts/browser-flows.sh` drives the storefront end to end through the journeys
a visitor actually takes, against a running API and frontend. Unit tests and
stories prove pieces; this proves the seams between them.

```bash
pnpm dev                                  # or point BASE_URL at any instance
./scripts/browser-flows.sh doctor         # is this stack worth driving?
./scripts/browser-flows.sh                # all ten flows
./scripts/browser-flows.sh order wishlist # only the named ones
```

`doctor` is read-only: it reports the agent-browser version, whether the
storefront answers, whether the API's database, Redis and queue are up, whether
ffmpeg is present for video, and which session, evidence directory and test user
are in play. A full run refuses to start when it fails.

| Flow         | What it drives                                                                     |
| ------------ | ---------------------------------------------------------------------------------- |
| `home`       | Hero, categories, featured shelf, hero link into the shop                          |
| `shop`       | Shelf heading, category filter narrows the grid, shelf/archive tabs                |
| `order`      | Product → add to cart → cart → checkout (address) → place order → cancel the order |
| `wishlist`   | Save a piece, see it listed, unsave it, empty state returns                        |
| `events`     | Events heading, the empty state, the past filter                                   |
| `workshops`  | Tier → day → hour → book → move to another day → cancel                            |
| `contact`    | Fill and send a message                                                            |
| `newsletter` | Footer subscribe, and the unsubscribe page without a token                         |
| `notfound`   | 404 copy, the way back, and that the storefront chrome survives                    |
| `signout`    | Sign out from the account page, header offers sign in again                        |

Every step asserts against what the page renders — a URL, a heading, a status
word, or a value that changed — so the run fails when a journey breaks rather
than when a click misses. The script exits non-zero on the first failing
assertion it records and prints them all at the end.

Configuration, all environment variables:

| Variable                       | Default                        |
| ------------------------------ | ------------------------------ |
| `BASE_URL`                     | `http://localhost:3030`        |
| `API_HEALTH_URL`               | `http://localhost:6060/health` |
| `OUT_DIR`                      | `/tmp/flows`                   |
| `FLOW_SESSION`                 | `poetry-flows`                 |
| `FLOW_EMAIL` / `FLOW_PASSWORD` | the Clerk test user            |
| `FLOW_HEADLESS`                | `1` (set `0` to watch it run)  |

Evidence lands in `$OUT_DIR/screens/*.png` and `$OUT_DIR/video/<flow>.webm`, one
video per flow, and survives the run. A failing step screenshots itself before
moving on. To read a video frame by frame:

```bash
ffmpeg -i /tmp/flows/video/order.webm -vf fps=4 /tmp/flows/frames/order-%03d.png
```

The suite needs a signed-in user, so it runs against a development Clerk
instance with the `+clerk_test` address above. It writes real rows — orders,
bookings, contact messages, newsletter subscribers — and cancels what it can, so
point it at a disposable database rather than anything you care about.

## Storybook

Four global viewports are defined in `src/lib/storybook/viewports.ts`: mobile
375×667, tablet 768×1024, laptop 1366×768, desktop 1920×1080. Every
presentational component has one story per viewport it needs to prove, each
pinned with `atViewport("mobile" | "tablet" | "laptop" | "desktop")`, and the
a11y addon runs as an assertion on every story inside `pnpm test`.
