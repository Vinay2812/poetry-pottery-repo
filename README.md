# Poetry & Pottery

E-commerce platform for handcrafted pottery with workshop/event management — the `poetry-and-pottery-workspace` projects combined into this repo. Next.js frontend, NestJS GraphQL API, and local infra — three independent apps in one repo (no workspace, nothing shared; each folder has its own `package.json` and lockfile).

| Folder      | What                                                 | Port               |
| ----------- | ---------------------------------------------------- | ------------------ |
| `frontend/` | Next.js 16 (App Router, React 19, Tailwind 4)        | 3030               |
| `api/`      | NestJS 11 GraphQL API (Apollo, Prisma, Postgres)     | 6060               |
| `infra/`    | docker (Postgres 17 + pgvector, Redis 8, RabbitMQ 4) | 5433 / 6381 / 5672 |

Local dev uses this repo's own compose stack: Postgres `poetry_pottery` on 5433, Redis on 6381, RabbitMQ on 5672 (management UI on 15672, user/password `poetry`).

## Prerequisites

- Node 24 (`.nvmrc`), pnpm 11, Docker
- A [Clerk](https://clerk.com) application (publishable + secret keys)

## First run

```bash
# 1. Database + Redis + RabbitMQ
cp infra/docker/.env.example infra/docker/.env
docker compose -f infra/docker/docker-compose.db.yml up -d

# 2. API
cd api
cp .env.example .env            # fill in Clerk keys (SMTP and R2 are optional)
pnpm install
pnpm migration:apply
pnpm db:seed                    # site settings, public pages, studio config
pnpm import:legacy              # real catalogue from the old production DB (LEGACY_DATABASE_URL in .env)
pnpm search:reindex             # embeddings for search (downloads the model on first run)
pnpm dev                        # http://localhost:6060/graphql

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env.local      # fill in Clerk keys
pnpm install
pnpm codegen                    # introspects the running API (or SCHEMA_URL=../api/schema.gql offline)
pnpm dev                        # http://localhost:3030

# 4. Git hooks (repo root, once)
pnpm install
```

## Daily commands

| Where       | Command                                                         | What                                                                    |
| ----------- | --------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `api/`      | `pnpm dev`                                                      | API with watch mode                                                     |
| `api/`      | `pnpm schema:emit`                                              | Regenerate `schema.gql` (no DB needed)                                  |
| `api/`      | `pnpm migration:create`                                         | Create a migration from schema changes                                  |
| `api/`      | `pnpm db:seed` / `pnpm db:reset`                                | Seed site scaffolding / drop, migrate and reseed                        |
| `api/`      | `pnpm import:legacy` / `pnpm db:reset:legacy`                   | Import the old production data (see docs/data/legacy-import.md)         |
| `api/`      | `pnpm db:seed:demo`                                             | Optional demo catalogue for local play                                  |
| `api/`      | `pnpm search:reindex`                                           | Recompute product and event embeddings                                  |
| `api/`      | `pnpm make-admin you@example.com`                               | Promote a signed-in user to admin                                       |
| `api/`      | `pnpm db:studio`                                                | Prisma Studio                                                           |
| `api/`      | `pnpm test` / `pnpm build`                                      | Vitest / production build                                               |
| `api/`      | `pnpm test:integration`                                         | Concurrency races against a throwaway database (needs compose stack up) |
| `frontend/` | `pnpm dev`                                                      | Next dev server on 3030                                                 |
| `frontend/` | `pnpm codegen`                                                  | Regenerate typed hooks (running API or schema file)                     |
| `frontend/` | `pnpm storybook`                                                | Storybook on 6006                                                       |
| `frontend/` | `pnpm test` / `pnpm tsc`                                        | Vitest / typecheck                                                      |
| `frontend/` | `pnpm analyze`                                                  | Bundle-size treemap report                                              |
| `frontend/` | `pnpm lighthouse`                                               | Lighthouse CI audit → `.lighthouse/`                                    |
| `frontend/` | `pnpm knip`                                                     | Find unused files/exports/deps                                          |
| `infra/`    | `docker compose -f docker/docker-compose.db.yml up -d`          | Postgres + Redis only                                                   |
| `infra/`    | `docker compose -f docker/docker-compose.api.yml up -d --build` | Full backend stack (API container included)                             |
| root        | commits                                                         | husky runs lint-staged + commitlint (conventional commits)              |

## Schema workflow

The API is code-first: resolvers define the schema. The frontend's `pnpm codegen` introspects the running API over a protected call (`x-schema-key` header, `SCHEMA_SYNC_KEY` env on both sides; in production the API refuses introspection without it). `api/schema.gql` remains the emitted artifact for offline use and editor tooling. After changing any resolver/type:

```bash
cd api && pnpm schema:emit && cd ../frontend && pnpm codegen
```

A husky pre-push hook (`scripts/check-schema-sync.sh`) enforces sync: it re-emits the schema, regenerates the frontend hooks from it, and blocks the push if either file was stale or the frontend no longer typechecks against the schema.

## Auth

Clerk on both sides. The API JIT-provisions a `User` row on the first authenticated request (no webhook, no seed needed). User identity always comes from the Clerk context, never from GraphQL inputs.

## Background jobs

Slow work leaves the request path through RabbitMQ (`api/src/queue`): search embeddings for products and events, and transactional email. Every WhatsApp hand-off the site offers (the `wa.me` links on the storefront, and the admin's reply from a commission brief) is recorded as a `WhatsAppMessage`, emailed through the same queue, and listed under Inbox → WhatsApp in the dashboard. Consumers run inside the API process; set `QUEUE_CONSUMERS_ENABLED=false` on replicas that should only serve GraphQL. Failed messages are dead-lettered to `poetry.dead-letters`.

## Search

Postgres keeps a weighted `tsvector` per product and event (maintained by triggers in the initial migration). A pgvector column holds a 384-dimension embedding from `Xenova/all-MiniLM-L6-v2`, computed locally with `@huggingface/transformers` (the model downloads once into `api/.cache/models`). Names and titles also carry a `pg_trgm` trigram index. Search ranks whole-word, prefix (last word half-typed), trigram-similarity (typos) and semantic matches together, so `cha` and `chand` both find _Chaand Cups_.

## Rate limiting

Three named throttler profiles (env-tunable): `default` 100/60s (global), `short` 10/1s, `strict` 5/60s — applied per resolver with `@Throttle(...)`, keyed by user id (falls back to IP). Counters live in Redis so limits hold across replicas.

## Infra

`infra/docker/docker-compose.db.yml` runs Postgres 17 with **pgvector** baked in (`vector` extension auto-created on a fresh volume via `initdb/01-extensions.sql`) and **Redis 8** (host port 6381; 6379/6380 are taken by other local projects). `docker-compose.api.yml` includes the db file and adds the containerized API built from `infra/docker/Dockerfile.api` with build context `api/` (multi-stage: cached pnpm install → prisma generate + nest build → `pnpm prune --prod` → slim non-root runtime). All three services share the `backend` network — inside it the API reaches the database at `postgres:5432` and Redis at `redis:6379`. The containerized API always runs `NODE_ENV=production`; use `pnpm dev` in `api/` for the dev experience (Sandbox, pretty logs).

### How env reaches the containers

Three separate mechanisms, in play at different moments:

1. **Compose interpolation (`${VAR:-default}`)** — resolved when you run `docker compose up`. Compose auto-loads `infra/docker/.env` (gitignored; copy from `infra/docker/.env.example`) because it sits next to the compose files — that's the place to set ports and DB credentials. A shell variable still outranks the file for one-off overrides, and `--env-file <path>` can point at a different file entirely:

   ```bash
   docker compose -f infra/docker/docker-compose.db.yml up -d          # values from infra/docker/.env
   POSTGRES_PORT=5544 docker compose -f infra/docker/docker-compose.db.yml up -d   # shell wins
   ```

2. **Container runtime env** — the API service loads `env_file: ../../api/.env` for app-level values (Clerk keys, `SCHEMA_SYNC_KEY`, log level, throttles), so those are maintained in one place whether you run `pnpm dev` or the container. The `environment:` block then overrides only the values that must differ inside the network: `DATABASE_URL` rebuilt from the `POSTGRES_*` interpolation values pointing at `postgres:5432`, `REDIS_URL`, `RABBITMQ_URL` and `EMBEDDINGS_CACHE_DIR`. `NODE_ENV=production` comes from the image, and `PORT` from `api/.env`. Precedence: `environment` > `env_file` > image `ENV`.

3. **Build-time env** — none. The one value the build touches is a dummy `DATABASE_URL` baked into `Dockerfile.api`, because `prisma.config.ts` resolves the variable eagerly at `prisma generate` while never connecting. The image contains no real config; everything real arrives at runtime. If a genuine build-time input is ever needed, use `build.args:` + `ARG` for non-sensitive values (args are inspectable via `docker history`) or a BuildKit secret mount for sensitive ones.

## Environment

Each app validates `process.env` with zod at boot and fails fast. `.env.example` in each folder lists every variable the code actually reads — they are the reference.

## Architecture

[`architecture/index.html`](architecture/index.html) — 24 pages, one per system (auth, catalogue and search, commissions, cart, notifications, checkout, events, workshops, studio visits, reviews, queue, uploads, admin, the storefront shell, frontend data, …), each with a diagram, the algorithm and its guards, a call trace through the real files, edge cases and the specs that cover it. Self-contained HTML; open it from disk.

## Branches

The rewrite is built as one PR per feature, each stacked on the previous branch. All ten PRs are open and none is merged. The commit graph is one strictly linear line from `origin/main` to `feat/admin-ui`, with the documentation branch on the end, so every pull request base is also the real parent. [`architecture/branches.html`](architecture/branches.html) has the measured counts and the commands that produce them.

| Branch                     | Adds                                                                                                                                                                               | PR  |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| `feat/platform-foundation` | Schema, queue, throttling, storefront shell                                                                                                                                        | #1  |
| `feat/catalog`             | Products, hybrid keyword + semantic search, filters, product pages                                                                                                                 | #2  |
| `feat/cart-wishlist`       | Cart and wishlist, server-priced customisations, optimistic updates                                                                                                                | #3  |
| `feat/checkout`            | Checkout, orders, saved addresses, coupons, account page                                                                                                                           | #4  |
| `feat/events`              | Events with seat-guarded registrations and bookings pages                                                                                                                          | #5  |
| `feat/workshops`           | Open-studio session booking, capacity-aware availability                                                                                                                           | #6  |
| `feat/design-refresh`      | Sharp/zero-radius direction, legacy catalogue import, archive gallery, made-to-order reference photos, seconds, glazes, piece facts, motion pass, concurrency hardening, the brand | #7  |
| `feat/reviews`             | Product and event reviews with photos, the subject lock, gated presigns, the upload cap, the cleanup job                                                                           | #8  |
| `feat/admin`               | Admin API: catalogue, glazes, orders, events, workshops, visits, commissions, coupons, content, users, waiting list                                                                | #9  |
| `feat/admin-ui`            | Admin console shell, tables and forms for every module, the printable packing slip                                                                                                 | #10 |
