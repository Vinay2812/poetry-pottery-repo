# Frontend

Next.js 16 (App Router, Turbopack) + React 19 + Tailwind 4 + Apollo Client 4 +
Clerk, wired to the sibling NestJS GraphQL API in `../api` (port 5050).

## Setup

```bash
pnpm install
cp .env.example .env.local   # fill in real Clerk keys
pnpm codegen                 # regenerate typed hooks (introspects the running API)
pnpm dev                     # http://localhost:3005
```

Environment variables are validated by zod in `src/config/env.ts` and the app
fails fast with a readable message when one is missing or invalid.

| Variable                            | Scope   | Notes                                       |
| ----------------------------------- | ------- | ------------------------------------------- |
| `NEXT_PUBLIC_API_URL`               | client  | Defaults to `http://localhost:5050/graphql` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | client  | Required                                    |
| `CLERK_SECRET_KEY`                  | server  | Required                                    |
| `NEXT_PUBLIC_LOG_LEVEL`             | client  | `error\|warn\|info\|debug`                  |
| `LOG_LEVEL`                         | server  | `error\|warn\|info\|debug`                  |
| `SCHEMA_URL`                        | codegen | GraphQL endpoint or schema file path        |
| `SCHEMA_SYNC_KEY`                   | codegen | Must match the API's `SCHEMA_SYNC_KEY`      |

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
| `pnpm dev`             | Dev server on port 3005                                                                   |
| `pnpm build`           | Production build (Turbopack, React Compiler enabled)                                      |
| `pnpm start`           | Serve the production build on port 3005                                                   |
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

## Design language

Proportions measured from a reference e-commerce design and mapped onto the
pottery theme (colors and fonts are ours; geometry, type conventions, and
density are the reference's):

- **Soft-square geometry.** Controls (buttons, inputs, selects, icon buttons)
  sit at 4px radius (`rounded`); cards and dialogs at 8px (`rounded-lg`);
  fully-round is reserved for badges/pills, dots, and avatars.
- **Border-first elevation.** 1px low-contrast borders define surfaces; resting
  shadows are gone. Deep soft shadows (`0 8px 32px / 0.14`) appear only on
  floating elements: dialogs, sheets, menus.
- **Type conventions.** Headings are tight-tracked semibold; form labels and
  eyebrows are 12px semibold UPPERCASE with wide tracking (`Label` does this by
  default); buttons are 14px semibold with slight positive tracking; table
  headers are uppercase 12px.
- **Control sizes.** Primary buttons h-12 (46px from `lg:`), small buttons
  h-10, form inputs a constant 54px tall with 16px text at every width (also
  prevents iOS focus zoom), selects h-10, sheet/drawer 430px wide.
- **Density.** Cards step `p-4 → md:p-6`; table cells `p-3 → md:p-4`; sections
  breathe, cards stay tight.

Verify rendered sizes with `node scripts/measure-responsive.mjs` against a
served `storybook-static` (port 6100) — it prints computed styles per
breakpoint.

## Storybook

Four global viewports are defined in `src/lib/storybook/viewports.ts`: mobile
375×667, tablet 768×1024, laptop 1366×768, desktop 1920×1080. Story files pin a
breakpoint with `atViewport("mobile")`. Every presentational component has
stories, and the a11y addon runs as an assertion inside `pnpm test`.
