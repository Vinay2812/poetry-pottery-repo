# Coverage gaps

What the test suite did not cover as of `test/coverage-gaps`, ranked by what it
would cost us to get wrong. Money, stock, seats, identity and data integrity
come first; cosmetics come last.

## How this was measured

```bash
cd api      && pnpm prisma:generate && pnpm test:cov          # vitest + v8, includes src/**/*.ts
cd api      && pnpm test:integration                          # throwaway database, real services
cd frontend && pnpm exec vitest run --project unit --coverage # v8, only reports files a test touches
```

The frontend reporter only lists files some test imported, so an untested file
shows up as an absence rather than a zero. Every frontend count below was taken
from a file inventory (`find`) cross-checked against the coverage report, not
from the report alone.

## Baseline

| Suite                  | Files | Tests | Lines  | Branches | Functions |
| ---------------------- | ----- | ----- | ------ | -------- | --------- |
| api unit               | 27    | 169   | 79.51% | 69.87%   | 73.53%    |
| api integration        | 4     | 18    | —      | —        | —         |
| frontend unit          | 17    | 139   | 76.49% | 84.14%   | 68.10%    |
| frontend stories       | 113   | —     | —      | —        | —         |
| browser flow scripts   | 0     | 0     | —      | —        | —         |

## P0 — money, stock, seats, identity

### Every resolver is untested

All twelve resolvers sit between the GraphQL edge and the services, and not one
has a spec. They are where the repo's single most important auth rule lives —
"identity from Clerk context only, never from GraphQL inputs" — and nothing
proves it holds.

| Resolver                | Lines  | Functions |
| ----------------------- | ------ | --------- |
| `workshops.resolver.ts` | 20%    | 20%       |
| `products.resolver.ts`  | 22.22% | 14.28%    |
| `events.resolver.ts`    | 23.07% | 20%       |
| `wishlist.resolver.ts`  | 25%    | 25%       |
| `addresses.resolver.ts` | 28.57% | 28.57%    |
| `cart.resolver.ts`      | 28.57% | 28.57%    |
| `orders.resolver.ts`    | 28.57% | 28.57%    |
| `contact.resolver.ts`   | 40%    | 40%       |
| `content.resolver.ts`   | 40%    | 40%       |
| `newsletter.resolver.ts`| 42.85% | 40%       |
| `settings.resolver.ts`  | 66.66% | 66.66%    |
| `users.resolver.ts`     | 66.66% | 66.66%    |

That leaves **51 root fields with no resolver spec** — 30 queries and 21
mutations in `api/schema.gql`. Nothing asserts which of them carry
`@AuthRequired()` or `@AdminRequired()`, so deleting a guard decorator on
`users`, `contactMessages`, `markContactMessageRead` or `updateContentPage`
would not fail a single test.

The frontend drives 45 of those 51. The six it does not touch
(`contactMessages`, `contentPages`, `newsletterStatus`, `users`,
`markContactMessageRead`, `updateContentPage`) are admin or server-only, which
makes them the least exercised and the most privileged at the same time.

### Integration races that do not exist

`api/test/integration/` proves cart merges, order placement and stock, coupon
redemption, order cancel, admin order transitions, checkout pricing, event
seats and workshop slots. It does not prove:

- **Wishlist toggle storms.** `WishlistService.toggle` deletes then inserts
  inside a transaction and leans on `skipDuplicates` plus a unique constraint.
  Nothing fires two taps at it at once, so the returned `wishlist_count` and the
  row count have never been checked against each other under contention.
- **Newsletter double subscribe.** Simultaneous subscribes of the same address
  could produce two rows or two welcome mails. Untested.
- **Contact throttle.** The strict throttle profile is opt-in metadata; nothing
  proves a burst of contact messages is bounded, nor that each accepted message
  is persisted and enqueued exactly once.
- **Seat integrity after mixed traffic.** Registrations and cancellations are
  each raced on their own, but the invariant that ties them together —
  `available_seats = total_seats - sum(seats on live registrations)` — is never
  read back after a mixed storm.

### Guards

`AuthGuard` and `AdminGuard` are covered (`auth.guard.spec.ts`, 87% lines).
`GqlThrottlerGuard` is not: 75% lines, **45% branches**. The two branches that
matter are the ones nothing touches —

- a non-http, non-graphql context returns `true` early, which is the only thing
  stopping RabbitMQ consumers from being rate limited; and
- a non-`ThrottlerException` failure (a Redis outage) is swallowed so storage
  trouble cannot take the API down.

Both are load-bearing and both are unproven.

## P1 — data leaving the process

### Queue consumers

| File                 | Lines | Note                                              |
| -------------------- | ----- | ------------------------------------------------- |
| `queue.service.ts`   | 0%    | publish path never executed                       |
| `search.consumer.ts` | 20%   | zod validation of `search.index-*` never exercised |
| `mail.consumer.ts`   | 50%   | zod validation of `mail.send` never exercised     |

`api/src/queue/jobs.ts` declares a zod schema per job and the consumers parse
before acting. That parse is the only thing standing between a malformed
message and the service, and no test feeds it a bad payload.

### Mail

`mail.service.ts` is at 33% lines: neither the enqueue path nor the SMTP
delivery path runs in a test. The five templates in `src/mail/templates/` read
as fully covered by line count, but their branches sit at **50-57%** — the
conditional blocks (an order with a coupon versus without, a booking with one
slot versus several) render in only one direction, and no test asserts that
user-supplied text is escaped before it reaches an HTML mail body.

### Other outbound edges

| File                   | Lines  |
| ---------------------- | ------ |
| `clerk.service.ts`     | 0%     |
| `redis.service.ts`     | 9.52%  |
| `embeddings.service.ts`| 26.66% |
| `storage.service.ts`   | 36.36% |
| `current-user.decorator.ts` | 20% |

`storage.service.ts` signs R2 uploads; whatever content-type and size limits it
enforces are the server half of the admin image rules and are untested.

## P2 — storefront behaviour

### No scripted browser check exists

Zero. `frontend/README.md` tells an agent to drive `agent-browser` by hand and
read video frames, which is fine for a one-off design review and useless as a
regression gate. Every journey below has only ever been checked by a human or an
agent improvising:

| Journey                                                          | Routes                                                     |
| ---------------------------------------------------------------- | ---------------------------------------------------------- |
| Home → shop → filter → product → add to cart → checkout → order → cancel | `/`, `/products`, `/products/[slug]`, `/cart`, `/checkout`, `/orders`, `/orders/[id]` |
| Wishlist save and remove                                         | `/products/[slug]`, `/wishlist`                            |
| Events listing and empty state                                   | `/events`, `/events/[slug]`                                |
| Workshops book → reschedule → cancel                             | `/workshops`, `/workshops/[slug]`, `/workshops/bookings`   |
| Contact message                                                  | `/contact`                                                 |
| Newsletter subscribe and unsubscribe                             | `/newsletter/unsubscribe`, footer form                     |
| 404 keeping the storefront chrome                                | `[...unmatched]`                                           |
| Sign out clearing the Apollo store                               | header account menu                                        |

### Frontend helpers with thin coverage

Every `src/features/*/types.ts` has a test file, but the holes are real:

| File                             | Lines  | Branches | Functions |
| -------------------------------- | ------ | -------- | --------- |
| `features/workshops/types.ts`    | 80.95% | 56.25%   | 76%       |
| `features/products/types.ts`     | 94.89% | 92.18%   | 96.42%    |
| `features/orders/types.ts`       | 94.44% | 100%     | 90%       |
| `features/content/types.ts`      | 94.11% | 100%     | 88.88%    |
| `lib/format.ts`                  | 87.5%  | 100%     | 80%       |
| `lib/drawing/vessel.ts`          | 96.51% | 82.35%   | 92.3%     |

`features/workshops/types.ts` is the one that matters: it derives slot grouping,
price tiers and reschedule eligibility, and a little over half its branches run.

Files with no test at all: `lib/utils.ts`, `lib/site-url.ts`,
`lib/data/catalog.ts`, `lib/data/site-settings.ts`,
`lib/logger/browser-logger.ts`.

Containers are not unit-tested by design — they own state and fetching, and the
repo's rule is that pure derivation lives in the feature's `types.ts`. Anything
still computed inline inside a container is therefore a gap in the *source*, not
the tests, and is recorded as such rather than papered over with a render test.

## P3 — presentational components without a story

113 of 136 components have stories. The missing ones:

- `features/auth/components/SignInWall.tsx` — the only feature component with no
  story, and it is the gate every authenticated page renders behind.
- `components/icons/social.tsx`
- `components/ui/`: accordion, badge, checkbox, dropdown-menu, input, label,
  popover, radio-group, scroll-area, select, separator, sheet, skeleton, slider,
  switch, table, tabs, textarea, tooltip. Only button, card and dialog have
  stories today.

`components/providers/toaster.tsx` and `components/web-vitals-reporter.tsx` are
side-effect mounts with nothing to render, so a story would prove nothing.

## Closing order

1. Resolver specs, with the context-identity and guard-metadata assertions.
2. The four missing integration races.
3. `GqlThrottlerGuard`, queue consumer payload validation, mail templates.
4. Remaining outbound edges: mail service, storage, clerk, queue publish.
5. Frontend helper holes and the untested `lib/` files.
6. `frontend/scripts/browser-flows.sh` driving the eight journeys end to end.
7. Stories for `SignInWall` and the UI primitives the app actually uses.

## After

| Suite                | Files     | Tests     | Lines           | Branches        | Functions       |
| -------------------- | --------- | --------- | --------------- | --------------- | --------------- |
| api unit             | 27 → 48   | 169 → 413 | 79.51 → 87.61%  | 69.87 → 77.63%  | 73.53 → 89.09%  |
| api integration      | 4 → 8     | 18 → 40   | —               | —               | —               |
| frontend unit        | 17 → 21   | 139 → 187 | 76.49 → 81.38%  | 84.14 → 94.11%  | 68.10 → 76.01%  |
| frontend stories     | 113 → 120 | —         | —               | —               | —               |
| browser flows        | 0 → 1     | 0 → 70          | —               | —               | —               |

The frontend percentages are held down by `src/graphql/generated/graphql.tsx`,
which lands in the report only because tests import it. Excluding generated
code the unit suite is at 100% statements and functions, with 26 branches left,
every one of them a guard the types make unreachable (documented inline).

What closed:

- **Resolvers.** All twelve at 100% lines, branches and functions. Every field's
  guard is asserted by metadata, and every `@CurrentUser()` field is pinned
  against the id-ish input that could have been used instead.
- **Races.** Four new integration specs — wishlist toggle storms, newsletter
  double subscribe, contact bursts, and the seat ledger after mixed traffic. No
  admin seat-edit path exists in the product, so the reachable invariant
  (`available_seats = total_seats - Σ live registration seats`) is what the seat
  spec pins.
- **Edges.** `GqlThrottlerGuard` including the non-http early return and the
  Redis-outage fallthrough; both queue consumers' zod rejection paths; the mail
  service, all five templates (branches 61 → 95%, with escaping asserted), the
  R2 signer and the Clerk service, each 0-36% → 100% lines.
- **Storefront.** Every `types.ts` helper and the untested `lib/` files, plus
  stories for `SignInWall`, the social marks and the nine UI primitives the app
  actually imports.
- **Journeys.** `frontend/scripts/browser-flows.sh` drives ten journeys through
  70 assertions against a running stack, screenshots and records each one, and
  exits non-zero on any failure. It is documented in `frontend/README.md` and is
  the harness the `verify-poetry-pottery` skill drives.

What is deliberately still open:

- `redis.service.ts` (9.52%) and `embeddings.service.ts` — thin wrappers over a
  client and a model download; a unit test would assert the mock.
- Nine unused `components/ui/*` primitives have no stories. `knip.ts` ignores
  that directory wholesale, so deleting them is a call to make, not a gap to
  fill.
- Containers are not unit-tested by design. The derivation still inlined in
  `WorkshopBookingContainer` / `BookingDetailContainer` (a duplicated calendar
  grid builder), `CheckoutContainer` (the money cascade) and
  `ProductListContainer` (the pagination merge) belongs in each feature's
  `types.ts` first; that is a source change, not a test one.
