# Optimistic UI audit

Every place in `frontend/src` where a person acts and the interface waits on the API
before it shows anything. Read once before touching a container: the fix column is the
agreed shape, not a suggestion.

Legend for the fix column:

- **opt-mutation** — Apollo `optimisticResponse` (always with `__typename`) plus a cache
  `update`, rolled back by Apollo on error with a sonner toast.
- **opt-url** — `useOptimistic` + `useTransition` around a `router.replace`/`push`, so the
  control reflects the choice on the click and the list dims instead of flashing.
- **keep-previous** — hold the last good data on screen (`previousData`), mark it
  `aria-busy`, drop opacity, never fall back to a skeleton once something has been shown.
- **local-first** — derive the label from local state instead of the server echo.

## Products, search, wishlist

| Page                   | Interaction                       | Current behaviour                                                 | Fix                                          |
| ---------------------- | --------------------------------- | ----------------------------------------------------------------- | -------------------------------------------- |
| `/products`, `/search` | Sort, shelf tabs, category, glaze | `router.replace`, then grid swaps to skeletons on every change    | opt-url + keep-previous _(owned elsewhere)_  |
| `/products`, `/search` | Price slider commit               | Local draft, then URL write and refetch                           | opt-url _(owned elsewhere)_                  |
| `/search`              | Typing the query                  | Debounced URL write; results blank while typing                   | `useDeferredValue` + keep-previous _(owned)_ |
| `/products`            | Load more                         | Button shows its own spinner, grid stays — already fine           | none                                         |
| anywhere               | Heart a piece                     | Already optimistic on `wishlistIds`                               | none, verify no flicker                      |
| `/wishlist`            | Un-heart from the grid            | Optimistic id flip plus cache filter of `wishlist` — already fine | none                                         |
| product card           | Add to cart                       | Button disabled while the mutation runs, then a toast             | keep (server decides stock); no layout shift |

## Cart and checkout

| Page        | Interaction      | Current behaviour                                            | Fix                                             |
| ----------- | ---------------- | ------------------------------------------------------------ | ----------------------------------------------- |
| `/cart`     | Quantity stepper | Optimistic cart write when shipping is predictable           | none _(owned elsewhere)_                        |
| `/cart`     | Remove line      | Optimistic cart write                                        | none _(owned elsewhere)_                        |
| `/cart`     | Save for later   | Wishlist toggle plus remove, both optimistic                 | none                                            |
| `/cart`     | Clear cart       | Optimistic empty cart                                        | none                                            |
| `/checkout` | Apply coupon     | `network-only` quote refetch; totals hold on `previousData`  | keep-previous + `aria-busy` _(owned elsewhere)_ |
| `/checkout` | Remove coupon    | Clears local state, still waits a full quote round trip      | local-first totals _(owned elsewhere)_          |
| `/checkout` | Pick address     | Local state, instant                                         | none                                            |
| `/checkout` | Order note       | Local state, instant                                         | none                                            |
| `/checkout` | Place order      | Button spinner, then navigation — correct, money is involved | none                                            |

## Addresses

| Page                 | Interaction     | Current behaviour                                       | Fix          |
| -------------------- | --------------- | ------------------------------------------------------- | ------------ |
| `/account/addresses` | Make default    | Awaits the mutation; the Default badge moves late       | opt-mutation |
| `/account/addresses` | Delete          | Awaits the mutation; the card sits there until it lands | opt-mutation |
| `/account/addresses` | Save new / edit | Awaits the server id — cannot be predicted              | none, keep   |
| `/checkout`          | Same three      | Same hook, so they inherit the fix                      | opt-mutation |

## Orders

| Page          | Interaction       | Current behaviour                                                    | Fix                         |
| ------------- | ----------------- | -------------------------------------------------------------------- | --------------------------- |
| `/orders`     | Newer / Older     | `previousData` holds the list, but the page label is the server echo | local-first + keep-previous |
| `/orders/:id` | Cancel order      | Dialog spinner, status badge only moves on reply                     | opt-mutation                |
| `/orders/:id` | Retry after error | Refetch with a skeleton                                              | none                        |

## Events and registrations

| Page                 | Interaction         | Current behaviour                                      | Fix                                                          |
| -------------------- | ------------------- | ------------------------------------------------------ | ------------------------------------------------------------ |
| `/events`            | When / type / level | `router.replace`, chips wait for the URL to round-trip | opt-url + keep-previous                                      |
| `/events`            | Load more           | Button spinner, grid stays                             | none                                                         |
| `/events/:slug`      | Reserve seats       | Spinner, then a navigation — seats are server-checked  | keep; wrap the push in `startTransition` _(owned elsewhere)_ |
| `/registrations`     | Newer / Older       | Page label is the server echo                          | local-first _(owned elsewhere)_                              |
| `/registrations/:id` | Cancel booking      | Dialog spinner, badge moves on reply                   | opt-mutation _(owned elsewhere)_                             |

## Workshops

| Page                      | Interaction                  | Current behaviour                            | Fix                         |
| ------------------------- | ---------------------------- | -------------------------------------------- | --------------------------- |
| `/workshops/:slug`        | Duration, participants, slot | Local state, instant                         | none                        |
| `/workshops/:slug`        | Calendar month               | `previousData` holds the grid                | none                        |
| `/workshops/:slug`        | Book                         | Spinner, then navigation — seats are checked | keep                        |
| `/workshops/bookings`     | Newer / Older                | Page label is the server echo                | local-first + keep-previous |
| `/workshops/bookings/:id` | Cancel session               | Dialog spinner, badge moves on reply         | opt-mutation                |
| `/workshops/bookings/:id` | Reschedule                   | Dialog spinner, the hours move on reply      | opt-mutation                |

## Account, content, session

| Page                      | Interaction    | Current behaviour                                         | Fix                                            |
| ------------------------- | -------------- | --------------------------------------------------------- | ---------------------------------------------- |
| `/account`                | Sign out       | Clerk sign-out, then a push                               | wrap the push in `startTransition`             |
| anywhere                  | Sign out       | Only cart, wishlist, address and order fields are evicted | evict registrations and workshop bookings too  |
| footer, `/`               | Newsletter     | "Adding…" until the server answers                        | opt-mutation-style confirm, roll back on error |
| `/contact`                | Send a message | Spinner until the mail is queued                          | none, keep; reserve the error line             |
| `/newsletter/unsubscribe` | Page load      | "Taking you off the list…" then the answer                | none                                           |

## Reviews

Not on this branch — there is no reviews feature under `frontend/src/features`, and no
review mutation in `frontend/src/graphql`. Skipped.
