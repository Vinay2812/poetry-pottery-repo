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
├── features/admin/      # one sub-module per console area, every resolver @AdminRequired()
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

`src/features/` holds one module per domain: `addresses`, `cart`, `contact`, `content`, `events`,
`newsletter`, `orders`, `products`, `search`, `settings`, `users`, `wishlist`, `workshops`. `content`
serves the CMS-backed pages (about, care, faq, privacy, shipping, terms) and is admin-edited;
`newsletter` handles subscribe/unsubscribe and the admin export; `contact` queues the studio inbox
message and lists it for admins. `search` has no resolver of its own — `ProductsService` and
`EventsService` call `rankProducts` / `rankEvents` and narrow the ranked ids with their own
availability scope, so search reads the shelf and the archive with the same ranking.

## Conventions

- Identity comes from the Clerk context (`@CurrentUser()`), never from inputs. Guard with `@AuthRequired()` / `@AdminRequired()`. `AuthGuard` treats the Clerk session claim as a hint only: it looks up the `User` row by auth id and answers with that row's id and role, writing the claim back to Clerk when it has drifted rather than trusting it.
- Money is integer rupees. Stock and seats change only inside transactions with conditional updates.
- Placing an order pins every piece in the cart with `SELECT … FOR UPDATE` before quoting it, so the prices, options and availability written onto the order are the ones the stock take agrees with.
- Adding to the cart reads the existing line before rewriting it, so it runs under a per-user, per-piece advisory lock (`pg_advisory_xact_lock(userId, productId)`).
- Open-studio bookings hold one `WorkshopBookingSlot` per chosen hour. The hours need not touch and may fall on different days, as long as the earliest and latest sit within `WorkshopConfig.slot_span_days` calendar days in the studio timezone. `starts_at`/`ends_at` on the booking are the derived first start and last end. Every hour is validated and its capacity checked inside one transaction under a per-studio advisory lock.
- Anything slow or external (email, embeddings) is a queue job in `src/queue/jobs.ts`; consumers validate payloads with zod.
- New resolvers must be exported from `src/resolvers.ts` and modules from `src/modules.ts`, or `schema:emit` and the app will silently skip them.
- The console never restates a rule: admin services reuse `OrdersService.applyStatus`, `EventsService.applyStatus` and `WorkshopsService.applyStatus`, so stock, seats, slot capacity and the status mails behave the same however a row is moved.
- Commands: `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm schema:emit`, `pnpm prettier:format`.

## Admin surface

Everything below sits behind `@AdminRequired()` (`UserRole.ADMIN`, promoted with `pnpm make-admin <email>`). Each area is a sub-module of `src/features/admin/`, and every list returns `{ items, page_info }` with search and filter arguments.

| Area                       | Queries                                                                             | Mutations                                                                                                                                                                                                                                                                         |
| -------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| dashboard                  | `adminDashboard`                                                                    | —                                                                                                                                                                                                                                                                                 |
| products                   | `adminProducts`, `adminProduct`, `adminProductOptionGroups`                         | `createProduct`, `updateProduct`, `setProductActive`, `setProductFeatured`, `adjustProductStock`, `reorderProductImages`, `createProductOptionGroup`, `updateProductOptionGroup`, `deleteProductOptionGroup`, `createProductOption`, `updateProductOption`, `deleteProductOption` |
| categories and collections | `adminCategories`, `adminCollections`                                               | `createCategory`, `updateCategory`, `deleteCategory`, `createCollection`, `updateCollection`, `deleteCollection`                                                                                                                                                                  |
| orders                     | `adminOrders`, `adminOrder`                                                         | `setOrderStatus`, `markOrderPaid`, `cancelOrderAsAdmin`, `setOrderAdminNote`                                                                                                                                                                                                      |
| users                      | `adminUsers`, `adminUser`                                                           | `setUserRole`                                                                                                                                                                                                                                                                     |
| events                     | `adminEvents`, `adminEvent`, `adminEventRegistrations`                              | `createEvent`, `updateEvent`, `publishEvent`, `unpublishEvent`, `completeEvent`, `cancelEvent`, `setRegistrationStatus`                                                                                                                                                           |
| workshops                  | `adminWorkshopConfigs`, `adminWorkshopBlackouts`, `adminWorkshopBookings`           | `updateWorkshopConfig`, `saveWorkshopTier`, `deleteWorkshopTier`, `createWorkshopBlackout`, `updateWorkshopBlackout`, `deleteWorkshopBlackout`, `setWorkshopBookingStatus`                                                                                                        |
| reviews                    | `adminReviews`                                                                      | `setReviewHidden`, `deleteReviewAsAdmin`                                                                                                                                                                                                                                          |
| content                    | `adminContentPages`, `adminContentPage`                                             | `saveContentPage`, `deleteContentPage`, `updateSiteSettings`, `updateAnnouncement`                                                                                                                                                                                                |
| coupons                    | `adminCoupons`                                                                      | `createCoupon`, `updateCoupon`, `deleteCoupon`                                                                                                                                                                                                                                    |
| inbox                      | `adminContactMessages`, `adminNewsletterSubscribers`, `exportNewsletterSubscribers` | `setContactMessageRead`, `deleteContactMessage`, `unsubscribeSubscriber`                                                                                                                                                                                                          |
| uploads                    | `imageSpecs`                                                                        | `createAdminUpload`, `confirmUpload`                                                                                                                                                                                                                                              |

### Images

`imageSpecs` returns the table from `docs/design/direction.md` so the console can show the requirement before a file is picked. The flow is: `createAdminUpload(purpose, content_type, size)` presigns a PUT into the folder for that purpose, the browser uploads, then `confirmUpload(key, purpose)` reads the stored object back, measures it with `sharp` (ratio within ±2%, minimum pixels, format, 8 MB cap), deletes it and returns a clear message on a mismatch, and otherwise records the key in `confirmed_uploads` and returns the public URL.

Entity mutations reject any image URL that is not in `confirmed_uploads` under the same purpose, so a 600 px category tile cannot be saved as a product photo. Two exceptions keep the console usable: URLs already stored on the row being edited pass through, and the check is skipped entirely when R2 is not configured. `confirmed_uploads` is a table rather than a Redis key because a confirmation has to outlive a cache flush and any TTL — an admin may confirm an image today and publish the page next week.

## Concurrency tests

`pnpm test:integration` runs the 18 tests in `test/integration/` against a real Postgres: it creates
a throwaway database, applies the migrations with `prisma migrate deploy`, runs the suite and drops
the database again, so the dev data is never touched. It needs the compose stack up and is
deliberately outside `pnpm test` — run it by hand after touching cart, orders, events, workshops or
coupon code, since those are the paths it guards.

Each test fires twenty calls at once and checks the guard held: the last piece sells once, the last
seat and the last wheel go to one guest, a single-use coupon is redeemed once, a double cancel
returns stock and seats exactly once, and concurrent cart adds merge into one line.
