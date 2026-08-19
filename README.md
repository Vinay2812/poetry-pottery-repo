# Poetry & Pottery

E-commerce platform for handcrafted pottery with workshop/event management — the `poetry-and-pottery-workspace` projects combined into this repo. Next.js frontend, NestJS GraphQL API, and local infra — three independent apps in one repo (no workspace, nothing shared; each folder has its own `package.json` and lockfile).

| Folder      | What                                             | Port        |
| ----------- | ------------------------------------------------ | ----------- |
| `frontend/` | Next.js 16 (App Router, React 19, Tailwind 4)    | 3030        |
| `api/`      | NestJS 11 GraphQL API (Apollo, Prisma, Postgres) | 6060        |
| `infra/`    | docker (Postgres 17 + pgvector, Redis 8) + k8s   | 5433 / 6381 |

> Local dev currently uses the `poetry-and-pottery-infra` Postgres from the parent workspace (`localhost:5435`, db `poetry-and-pottery`) via `api/.env` `DATABASE_URL` — not this repo's `infra/` compose on 5433.

## Prerequisites

- Node 24 (`.nvmrc`), pnpm 11, Docker
- A [Clerk](https://clerk.com) application (publishable + secret keys)

## First run

```bash
# 1. Database + Redis
docker compose -f infra/docker/docker-compose.db.yml up -d

# 2. API
cd api
cp .env.example .env            # fill in Clerk keys
pnpm install
pnpm migration:apply
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

| Where       | Command                                                         | What                                                       |
| ----------- | --------------------------------------------------------------- | ---------------------------------------------------------- |
| `api/`      | `pnpm dev`                                                      | API with watch mode                                        |
| `api/`      | `pnpm schema:emit`                                              | Regenerate `schema.gql` (no DB needed)                     |
| `api/`      | `pnpm migration:create`                                         | Create a migration from schema changes                     |
| `api/`      | `pnpm db:studio`                                                | Prisma Studio                                              |
| `api/`      | `pnpm test` / `pnpm build`                                      | Vitest / production build                                  |
| `frontend/` | `pnpm dev`                                                      | Next dev server on 3030                                    |
| `frontend/` | `pnpm codegen`                                                  | Regenerate typed hooks (running API or schema file)        |
| `frontend/` | `pnpm storybook`                                                | Storybook on 6006                                          |
| `frontend/` | `pnpm test` / `pnpm tsc`                                        | Vitest / typecheck                                         |
| `frontend/` | `pnpm analyze`                                                  | Bundle-size treemap report                                 |
| `frontend/` | `pnpm lighthouse`                                               | Lighthouse CI audit → `.lighthouse/`                       |
| `frontend/` | `pnpm knip`                                                     | Find unused files/exports/deps                             |
| `infra/`    | `docker compose -f docker/docker-compose.db.yml up -d`          | Postgres + Redis only                                      |
| `infra/`    | `docker compose -f docker/docker-compose.api.yml up -d --build` | Full backend stack (API container included)                |
| root        | commits                                                         | husky runs lint-staged + commitlint (conventional commits) |

## Schema workflow

The API is code-first: resolvers define the schema. The frontend's `pnpm codegen` introspects the running API over a protected call (`x-schema-key` header, `SCHEMA_SYNC_KEY` env on both sides; in production the API refuses introspection without it). `api/schema.gql` remains the emitted artifact for offline use and editor tooling. After changing any resolver/type:

```bash
cd api && pnpm schema:emit && cd ../frontend && pnpm codegen
```

A husky pre-push hook (`scripts/check-schema-sync.sh`) enforces sync: it re-emits the schema, regenerates the frontend hooks from it, and blocks the push if either file was stale or the frontend no longer typechecks against the schema.

## Auth

Clerk on both sides. The API JIT-provisions a `User` row on the first authenticated request (no webhook, no seed needed). User identity always comes from the Clerk context, never from GraphQL inputs.

## Rate limiting

Three named throttler profiles (env-tunable): `default` 100/60s (global), `short` 10/1s, `strict` 5/60s — applied per resolver with `@Throttle(...)`, keyed by user id (falls back to IP).

## Infra

`infra/docker/docker-compose.db.yml` runs Postgres 17 with **pgvector** baked in (`vector` extension auto-created on a fresh volume via `initdb/01-extensions.sql`) and **Redis 8** (host port 6381; 6379/6380 are taken by other local projects). `docker-compose.api.yml` includes the db file and adds the containerized API built from `infra/docker/Dockerfile.api` with build context `api/` (multi-stage: cached pnpm install → prisma generate + nest build → `pnpm prune --prod` → slim non-root runtime). All three services share the `backend` network — inside it the API reaches the database at `postgres:5432` and Redis at `redis:6379`. The containerized API always runs `NODE_ENV=production`; use `pnpm dev` in `api/` for the dev experience (Sandbox, pretty logs).

### How env reaches the containers

Three separate mechanisms, in play at different moments:

1. **Compose interpolation (`${VAR:-default}`)** — resolved when you run `docker compose up`. Compose auto-loads `infra/docker/.env` (gitignored; copy from `infra/docker/.env.example`) because it sits next to the compose files — that's the place to set ports and DB credentials. A shell variable still outranks the file for one-off overrides, and `--env-file <path>` can point at a different file entirely:

   ```bash
   docker compose -f infra/docker/docker-compose.db.yml up -d          # values from infra/docker/.env
   POSTGRES_PORT=5544 docker compose -f infra/docker/docker-compose.db.yml up -d   # shell wins
   ```

2. **Container runtime env** — the API service loads `env_file: ../../api/.env` for app-level values (Clerk keys, `SCHEMA_SYNC_KEY`, log level, throttles), so those are maintained in one place whether you run `pnpm dev` or the container. The `environment:` block then overrides the values that must differ inside the network — `DATABASE_URL` rebuilt from the `POSTGRES_*` interpolation values pointing at `postgres:5432`, `NODE_ENV` pinned to `production`, `PORT` fixed. Precedence: `environment` > `env_file` > image `ENV`.

3. **Build-time env** — none. The one value the build touches is a dummy `DATABASE_URL` baked into `Dockerfile.api`, because `prisma.config.ts` resolves the variable eagerly at `prisma generate` while never connecting. The image contains no real config; everything real arrives at runtime. If a genuine build-time input is ever needed, use `build.args:` + `ARG` for non-sensitive values (args are inspectable via `docker history`) or a BuildKit secret mount for sensitive ones.

## Environment

Each app validates `process.env` with zod at boot and fails fast. `.env.example` in each folder lists every variable the code actually reads — they are the reference.
