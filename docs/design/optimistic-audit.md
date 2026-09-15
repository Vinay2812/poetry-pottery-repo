# Optimistic UI audit

Every place in `frontend/src` where a person acts and the interface waits on the API
before it shows anything, and the shape the fix should take.

## The agreed approach

Apollo and the generated hooks stay for fetching. Optimistic behaviour lives in React, in
the container — **no hand-written cache updates anywhere**: no `optimisticResponse`, no
`cache.writeQuery` / `updateQuery` / `cache.modify` / `cache.evict` in new code. The pattern
everywhere is the same four beats:

1. **Baseline.** The container holds the query result as the baseline (`data ?? previousData`).
2. **`useOptimistic`.** A reducer over that baseline applies the pending action to a copy.
   The presentational component renders the optimistic value and never knows the difference.
   Reducers are pure, live in the feature's `types.ts`, and are unit-tested.
3. **`useTransition`.** The handler calls `startTransition(async () => { … })`, dispatches
   the optimistic patch, then awaits the mutation. `isPending` drives `aria-busy` and a
   dimmed opacity — never a skeleton once real content has been on screen.
4. **Settle or roll back.** The new baseline comes from the mutation's returned payload where
   the API already returns the updated object, or from `refetchQueries` with
   `awaitRefetchQueries: true` where it does not. When the transition ends, `useOptimistic`
   drops back to that baseline with no flicker. On a thrown error React discards the
   optimistic value by itself and the handler raises a `sonner` toast.

Two supporting rules:

- **Shared optimistic state gets a context provider** in the feature, not zustand — zustand is
  for interface state, never for server data. The header cart count and the cart page read one
  provider; every heart on the site reads one wishlist provider.
- **Sign-out is a lifecycle call, not a hand-edit.** `client.clearStore()` once on user change,
  rather than evicting a hand-maintained list of root fields.
- **`fetchMore` pagination is fetching, not optimistic state.** Leave it alone.

Shorthands used in the fix column:

- **opt-mutation** — the four beats above, keyed on a mutation.
- **opt-url** — same, but the "mutation" is a `router.replace` / `router.push`, so the
  control reflects the choice on the click while the route settles.
- **defer-typing** — `useDeferredValue` over the typed query so the field never stutters,
  with the previous results held and dimmed.
- **keep-previous** — hold the last good data on screen, mark it `aria-busy`, drop opacity,
  never fall back to a skeleton once something has been shown.
- **local-first** — derive the label from local state instead of the server echo.

Every optimistic write must reserve the space its status line will occupy, so nothing shifts
when the line appears.

## Products, search, wishlist

| Page                   | Interaction                       | Current behaviour                                                  | Fix                                               |
| ---------------------- | --------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------- |
| `/products`, `/search` | Sort, shelf tabs, category, glaze | `router.replace`, then the grid swaps to skeletons on every change | opt-url + keep-previous _(owned elsewhere)_       |
| `/products`, `/search` | Price slider commit               | Local draft, then a URL write and a refetch                        | opt-url _(owned elsewhere)_                       |
| `/search`              | Typing the query                  | Debounced URL write; results blank while typing                    | defer-typing _(owned elsewhere)_                  |
| `/products`            | Load more                         | Button shows its own spinner, the grid stays — already fine        | none                                              |
| anywhere               | Heart a piece                     | Optimistic, but through the Apollo cache                           | opt-mutation, migrate off the cache               |
| `/wishlist`            | Un-heart from the grid            | Optimistic, but through the Apollo cache                           | opt-mutation, migrate off the cache               |
| product card           | Add to cart                       | Button disabled while the mutation runs, then a toast              | keep (the server decides stock); reserve the line |

## Cart and checkout

| Page        | Interaction      | Current behaviour                                              | Fix                                             |
| ----------- | ---------------- | -------------------------------------------------------------- | ----------------------------------------------- |
| `/cart`     | Quantity stepper | Optimistic, but through the Apollo cache                       | opt-mutation, migrate off the cache             |
| `/cart`     | Remove line      | Optimistic, but through the Apollo cache                       | opt-mutation, migrate off the cache             |
| `/cart`     | Save for later   | Wishlist toggle plus remove, both cache-optimistic             | opt-mutation, migrate off the cache             |
| `/cart`     | Clear cart       | Optimistic, but through the Apollo cache                       | opt-mutation, migrate off the cache             |
| `/checkout` | Apply coupon     | `network-only` quote refetch; totals hold on `previousData`    | keep-previous + `aria-busy` _(owned elsewhere)_ |
| `/checkout` | Remove coupon    | Clears local state, then still waits a full quote round trip   | opt-mutation over the quote _(owned elsewhere)_ |
| `/checkout` | Pick address     | Local state, instant                                           | none                                            |
| `/checkout` | Order note       | Local state, instant                                           | none                                            |
| `/checkout` | Place order      | Button spinner, then a navigation — correct, money is involved | none; wrap the push in `startTransition`        |

## Addresses

| Page                 | Interaction     | Current behaviour                                       | Fix                                           |
| -------------------- | --------------- | ------------------------------------------------------- | --------------------------------------------- |
| `/account/addresses` | Make default    | Awaits the mutation; the Default mark moves late        | opt-mutation over the address list            |
| `/account/addresses` | Delete          | Awaits the mutation; the card sits there until it lands | opt-mutation (drop the row, restore on error) |
| `/account/addresses` | Save new / edit | Awaits the server id — cannot be predicted              | none, keep the spinner                        |
| `/checkout`          | Same three      | Same hook, so they inherit the fix                      | opt-mutation                                  |

## Orders

| Page          | Interaction       | Current behaviour                                                    | Fix                         |
| ------------- | ----------------- | -------------------------------------------------------------------- | --------------------------- |
| `/orders`     | Newer / Older     | `previousData` holds the list, but the page label is the server echo | local-first + keep-previous |
| `/orders/:id` | Cancel order      | Dialog spinner; the status badge and timeline only move on reply     | opt-mutation over the order |
| `/orders/:id` | Retry after error | Refetch with a skeleton                                              | none                        |

## Events and registrations

| Page                 | Interaction         | Current behaviour                                      | Fix                                                          |
| -------------------- | ------------------- | ------------------------------------------------------ | ------------------------------------------------------------ |
| `/events`            | When / type / level | `router.replace`, chips wait for the URL to round-trip | opt-url + keep-previous                                      |
| `/events`            | Load more           | Button spinner, the grid stays                         | none                                                         |
| `/events/:slug`      | Reserve seats       | Spinner, then a navigation — seats are server-checked  | keep; wrap the push in `startTransition` _(owned elsewhere)_ |
| `/registrations`     | Newer / Older       | Page label is the server echo                          | local-first _(owned elsewhere)_                              |
| `/registrations/:id` | Cancel booking      | Dialog spinner; the badge moves on reply               | opt-mutation _(owned elsewhere)_                             |

## Workshops

| Page                      | Interaction                  | Current behaviour                              | Fix                            |
| ------------------------- | ---------------------------- | ---------------------------------------------- | ------------------------------ |
| `/workshops/:slug`        | Duration, participants, slot | Local state, instant                           | none                           |
| `/workshops/:slug`        | Calendar month               | `previousData` holds the grid                  | keep-previous, add `aria-busy` |
| `/workshops/:slug`        | Book                         | Spinner, then a navigation — seats are checked | keep                           |
| `/workshops/bookings`     | Newer / Older                | Page label is the server echo                  | local-first + keep-previous    |
| `/workshops/bookings/:id` | Cancel session               | Dialog spinner; the badge moves on reply       | opt-mutation over the booking  |
| `/workshops/bookings/:id` | Reschedule                   | Dialog spinner; the hours move on reply        | opt-mutation over the booking  |

## Account, content, session

| Page                      | Interaction    | Current behaviour                                                        | Fix                                                      |
| ------------------------- | -------------- | ------------------------------------------------------------------------ | -------------------------------------------------------- |
| `/account`                | Sign out       | Clerk sign-out, then a push                                              | wrap the push in `startTransition`                       |
| anywhere                  | Sign out       | Only cart, wishlist, address and order fields are dropped from the cache | also drop registrations and workshop bookings; see below |
| footer, `/`               | Newsletter     | "Adding…" until the server answers                                       | opt-mutation on the local form state, roll back on error |
| `/contact`                | Send a message | Spinner until the mail is queued                                         | none, keep; reserve the error line so nothing shifts     |
| `/newsletter/unsubscribe` | Page load      | "Taking you off the list…" then the answer                               | none                                                     |

## Reviews

Not on this branch. There is no reviews feature under `frontend/src/features` and no review
mutation in `frontend/src/graphql`. Nothing to migrate or make optimistic.

## Inventory: hand-written Apollo cache writes to migrate

Everything below reaches into the cache by hand. Each entry has to move to the React pattern
above, which means the container owns an optimistic copy of the query data and the mutation
payload (or an awaited refetch) becomes the new baseline.

| File                                                        | Lines   | What it does by hand                                                           | Migration                                                       |
| ----------------------------------------------------------- | ------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `src/features/cart/hooks.ts`                                | 53–59   | `writeQuery` of the cart after add-to-cart                                     | let the mutation payload settle; refetch `Cart` if it drifts    |
| `src/features/cart/hooks.ts`                                | 101–125 | `optimistic()` builder for a whole predicted `Cart`                            | becomes the `useOptimistic` reducer in `CartContainer`          |
| `src/features/cart/hooks.ts`                                | 137–186 | `optimisticResponse` + `writeQuery` for quantity, remove, clear                | opt-mutation in `CartContainer`                                 |
| `src/features/wishlist/hooks.ts`                            | 63–101  | `optimisticResponse`, `readQuery`/`writeQuery` on `WishlistIds` and `Wishlist` | a shared `useOptimistic` id set; refetch both after settle      |
| `src/features/addresses/hooks.ts`                           | 28–40   | `readAddresses` / `writeAddresses` helpers                                     | drop; the list lives in `useAddressBook` state                  |
| `src/features/addresses/hooks.ts`                           | 75–174  | `update` callbacks reordering the address list after every mutation            | opt-mutation in `useAddressBook`                                |
| `src/features/orders/hooks.ts`                              | 58–65   | `writeQuery` of the cancelled order                                            | opt-mutation over the order in `OrderDetailContainer`           |
| `src/features/events/hooks.ts`                              | 31–34   | `evict` + `gc` of `myRegistrations` after register and cancel                  | `refetch` the list instead                                      |
| `src/features/events/hooks.ts`                              | 49–55   | `fetchMore` `updateQuery` concatenating event pages                            | keep for now; pagination, not optimism                          |
| `src/features/events/hooks.ts`                              | 149–158 | `writeQuery` of the cancelled registration                                     | opt-mutation over the registration                              |
| `src/features/workshops/hooks.ts`                           | 192–203 | `writeBooking` `writeQuery` after cancel and reschedule                        | opt-mutation over the booking                                   |
| `src/features/checkout/containers/CheckoutContainer.tsx`    | 50–71   | `evict` `orders`, `readQuery`/`writeQuery` an emptied cart                     | `refetchQueries: ["Cart", "Orders"]` with `awaitRefetchQueries` |
| `src/features/products/containers/ProductListContainer.tsx` | 191     | `fetchMore` `updateQuery` concatenating product pages                          | keep for now; pagination, not optimism                          |
| `src/lib/apollo/apollo-provider.tsx`                        | 22–48   | `evict` of a hand-maintained list of user-scoped root fields on user change    | replace the whole list with one `client.clearStore()`           |

The two `fetchMore` `updateQuery` calls are the only cache writes worth keeping: that is how
Apollo paginates, and pagination is fetching rather than optimistic state. Nobody may borrow
them to fake optimism.

## What this pass changed

| Feature             | Done                                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| Wishlist            | `WishlistProvider` holds the optimistic id list; every heart and the header count flip on the click  |
| Cart                | `CartProvider` holds the optimistic cart; stepper, remove and clear move the page and header at once |
| Addresses           | `useAddressBook` holds the optimistic list; delete and make-default land on the click                |
| Orders              | Cancel turns the badge at once; the list pager reads local state and dims instead of flashing        |
| Events              | Filters answer on the click; cancelling a seat turns the badge at once; pager is local-first         |
| Workshops           | Cancel and reschedule land on the click; pager is local-first                                        |
| Checkout            | Cart and orders are fetched again after an order is placed, in place of cache surgery                |
| Newsletter, contact | The thank-you shows on submit; both status lines keep their height so nothing jumps                  |
| Session             | One `client.clearStore()` on an account change, in place of a hand-maintained eviction list          |

No `optimisticResponse`, `cache.writeQuery`, `cache.modify`, `cache.evict` or `readQuery`
remains in `frontend/src`. The two `fetchMore` `updateQuery` calls stay: that is pagination.

Still open, because the files belong to other work in flight: the `/products` and `/search`
toolbar (sort, tabs, facets, typed query) and the checkout coupon field.
