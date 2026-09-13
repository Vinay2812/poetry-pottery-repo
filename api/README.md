# API

NestJS 11 + Apollo (code-first GraphQL) + Prisma 7 on Postgres 17 with pgvector. Port 6060.

## Setup

```bash
cp .env.example .env      # Clerk keys required; SMTP and R2 optional
pnpm install
pnpm migration:apply
pnpm db:seed              # settings, pages, studio config
pnpm import:legacy        # real catalogue (needs LEGACY_DATABASE_URL); or pnpm db:seed:demo
pnpm dev                  # http://localhost:6060/graphql
```

The compose stack in `../infra/docker` provides Postgres (5433), Redis (6381) and RabbitMQ (5672).

## Layout

```
src/
├── features/<domain>/   # module + service + resolver + types (+ spec) per domain
├── common/              # guards, decorators, filters, clerk, logging
├── prisma/              # PrismaService with ambient transactions
├── redis/               # ioredis client + tiny getOrSet cache
├── queue/               # RabbitMQ: typed jobs, publisher, SubscribeJob decorator
├── mail/                # nodemailer transport, enqueue/deliver, HTML layout
├── storage/             # Cloudflare R2 presigned uploads
├── embeddings/          # local sentence embeddings for search
└── health/              # /health with database, redis and queue checks
prisma/
├── schema.prisma
├── migrations/          # initial migration also creates search triggers
└── seed/                # demo catalogue, events, workshop config, content
```

## Conventions

- Identity comes from the Clerk context (`@CurrentUser()`), never from inputs. Guard with `@AuthRequired()` / `@AdminRequired()`.
- Money is integer rupees. Stock and seats change only inside transactions with conditional updates.
- Open-studio bookings hold one `WorkshopBookingSlot` per chosen hour. The hours need not touch and may fall on different days, as long as the earliest and latest sit within `WorkshopConfig.slot_span_days` calendar days in the studio timezone. `starts_at`/`ends_at` on the booking are the derived first start and last end. Every hour is validated and its capacity checked inside one transaction under a per-studio advisory lock.
- Anything slow or external (email, embeddings) is a queue job in `src/queue/jobs.ts`; consumers validate payloads with zod.
- New resolvers must be exported from `src/resolvers.ts` and modules from `src/modules.ts`, or `schema:emit` and the app will silently skip them.
- Commands: `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm schema:emit`, `pnpm prettier:format`.
