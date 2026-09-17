---
name: verify-poetry-pottery
description: "Verify Poetry & Pottery by driving the real storefront the way a shopper does — sign in, buy a piece, book a wheel, cancel — and keeping screenshots and video as proof. Also covers the check commands per app, the integration race suite and schema sync. Use before finishing any change to frontend/ or api/, when asked to prove a feature works, or when a change needs more than a passing unit test."
---

# Verify Poetry & Pottery

Three apps, no workspace: `frontend/` (Next.js 16, port 3030), `api/` (NestJS
GraphQL, port 6060), `infra/` (docker compose — Postgres 5433, Redis 6381,
RabbitMQ 5672). The surface a user touches is the storefront in a browser;
everything else is reached through it.

Start with the check commands. They are fast and they catch most of what breaks.
Drive the browser when a change touches a user-visible path, and treat the
browser run as the proof, not the check commands.

## Check commands

Run from each app's directory. `pnpm` everywhere, Node 24.

| App        | Commands                                                           |
| ---------- | ------------------------------------------------------------------ |
| `api/`     | `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm test:integration`     |
| `frontend/`| `pnpm tsc`, `pnpm test`, `pnpm lint`, `pnpm knip`, `pnpm codegen`   |

Then `pnpm prettier:format` in each app before finishing. Never run `pnpm dev`
to verify — it never exits.

Two commands need saying more about:

- **`api/ pnpm test:integration`** creates a throwaway database
  (`test/integration/run.ts` makes it, migrates it, drops it), so it needs
  Postgres on 5433 but touches nothing you care about. It is where the
  concurrency invariants live — stock, seats, coupons, wishlist toggles,
  newsletter double-subscribe. A race test that fails once in three runs is a
  finding, not a flake: run it three times when you change one.
- **Schema sync** is enforced by `scripts/check-schema-sync.sh` on pre-push. If
  you changed API types, `cd api && pnpm schema:emit` and then
  `cd frontend && pnpm codegen`. New resolvers must be exported from
  `api/src/resolvers.ts` or `schema:emit` silently drops them.

If `api/ pnpm build` fails on a missing `.prisma/client`, run
`pnpm prisma:generate` first. A fresh checkout always needs it.

## Launch

The browser flows need both servers and the compose services. Start them on
non-default ports so you never fight whatever the human already has running, and
keep the ports consistent with each other — the frontend has to be told where
the API is.

```bash
cd infra && docker compose up -d                 # Postgres 5433, Redis 6381, RabbitMQ 5672

cd api
pnpm prisma:generate
PORT=6066 CORS_ORIGINS=http://localhost:3036 QUEUE_CONSUMERS_ENABLED=false \
  pnpm dev > /tmp/verify/api.log 2>&1 &

cd ../frontend
NEXT_PUBLIC_API_URL=http://localhost:6066/graphql \
  pnpm exec next dev -p 3036 > /tmp/verify/frontend.log 2>&1 &
```

Ready when the health endpoint answers and the storefront returns 200. Wait for
them rather than sleeping:

```bash
until curl -sf http://localhost:6066/health > /dev/null; do sleep 2; done
until curl -so /dev/null http://localhost:3036/; do sleep 3; done
```

The first storefront request compiles the route and can take half a minute. Both
apps read `.env` / `.env.local`; copy them from the main checkout if you are in
a worktree, they are gitignored.

Teardown is in [Cleanup](#cleanup). Leave the compose services up — they are
shared, and the integration suite makes its own database anyway.

## Doctor

One read-only command answers "is this instance worth driving?".

```bash
cd frontend
BASE_URL=http://localhost:3036 API_HEALTH_URL=http://localhost:6066/health \
  ./scripts/browser-flows.sh doctor
```

It reports the agent-browser version, whether the storefront answers, whether
the API's database, Redis and queue are all up, whether ffmpeg is present for
video, and which session, evidence directory and test user are in play. Exit 0
means drive it. Run it first, and again after anything surprising.

## Drive

`frontend/scripts/browser-flows.sh` is the harness. It wraps `agent-browser`,
signs in, drives a journey, and asserts against what the page renders.

```bash
cd frontend
BASE_URL=http://localhost:3036 API_HEALTH_URL=http://localhost:6066/health \
OUT_DIR=/tmp/verify FLOW_SESSION=verify \
  ./scripts/browser-flows.sh                      # all ten flows
  ./scripts/browser-flows.sh order workshops      # only the named ones
```

Flows: `home shop order wishlist events workshops contact newsletter notfound
signout`. Exit is non-zero when any assertion fails, and every failure is
reprinted at the end with the flow it came from.

For anything the script does not cover yet, drive `agent-browser` directly in
the same session and prefer stable handles:

```bash
agent-browser --session verify open http://localhost:3036/products
agent-browser --session verify snapshot -i -c                    # names and refs
agent-browser --session verify find role button click --name "Add an address"
agent-browser --session verify find role checkbox check --name "Mugs 4"
agent-browser --session verify fill 'input[name="pincode"]' 416416
agent-browser --session verify read | grep -i "your cart"
```

Names come from `aria-label` first and visible text second. Icon-only controls
(cart, wishlist, account, the heart on a card) carry their name only in
`aria-label`, so `read` will not find them — use `snapshot -i -c`. Labels that
carry live data (dates, prices, product names) cannot be pinned in a script; the
harness matches them by regex through its `click_matching` helper, and you
should do the same rather than clicking a `@ref` you captured two steps ago.

Sign-in is Clerk's hosted dialog, driven by
`maya+clerk_test@example.com` / `PotteryTest#2026` on the development instance.
The email and password steps are two separate submits of `.cl-formButtonPrimary`.

### Proof standards

- Drive the real path. No `eval` that calls a React setter, no GraphQL request
  in place of a click, no test-only route.
- Capture the action and the state that resulted, not only the final screen.
- Verify the side effect as well as the pixels. An order is placed when
  `/orders/<id>` renders and its status word changed — not when a toast appeared.
- Mock only where production already isolates the outside world. SMTP, R2 and
  the queue consumers are such boundaries; Postgres, Redis and Clerk are not.
- A flow that cannot be reached is reported with the prerequisite it needs and
  the route attempted. Never report a skipped entry point as verified through a
  different one.

## Evidence

Everything lands under `OUT_DIR` (default `/tmp/flows`) and survives cleanup:

- `$OUT_DIR/screens/<name>.png` — one per checkpoint, plus an automatic
  screenshot of any failing step.
- `$OUT_DIR/video/<flow>.webm` — one recording per flow, 12 fps.

Read a video rather than trusting a still whenever motion, layout shift or an
optimistic update is in question:

```bash
mkdir -p /tmp/verify/frames
ffmpeg -i /tmp/verify/video/order.webm -vf fps=4 /tmp/verify/frames/order-%03d.png
```

Then read the frames in order and look for the thing that moved: a skeleton that
flashed, a row that jumped after hydration, an optimistic value that rolled back.
`fps=4` is enough for flow-level checks; use `fps=15` for a motion review.

The suite writes real rows — orders, bookings, contact messages, newsletter
subscribers — and cancels the ones it can. Point it at a disposable database.

## Cleanup

Kill only what this run started, by port, never by process name:

```bash
agent-browser --session verify close
lsof -ti :3036 -sTCP:LISTEN | xargs -r kill
lsof -ti :6066 -sTCP:LISTEN | xargs -r kill
```

Leave the compose services up. Leave `$OUT_DIR` alone — the proof lives there,
and a cleanup that eats the evidence has failed. If the database needs resetting
after a heavy run: `cd api && pnpm db:reset && pnpm import:legacy`.

## Helpers

| Path                                | Invocation                                             |
| ----------------------------------- | ------------------------------------------------------ |
| `frontend/scripts/browser-flows.sh` | `./scripts/browser-flows.sh [doctor\|<flow>...]`        |
| `scripts/check-schema-sync.sh`      | runs on pre-push; `cd api && pnpm schema:emit` to fix   |
| `api/test/integration/run.ts`       | `cd api && pnpm test:integration`                       |

Both scripts are executable and take no arguments beyond what is shown.

## Feature map

[`features/README.md`](features/README.md) is the maintained list of what a user
can do and how to prove each one. Read it before driving. A proof that exercised
one convenient entry point is incomplete when the map lists others.

Keep it honest with `/maintain-verification-skill` — run it after a release or
whenever a feature file stops matching what the app does.
