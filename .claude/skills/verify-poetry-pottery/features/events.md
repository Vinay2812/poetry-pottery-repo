# Events

A visitor looks at the workshops and open mics the studio has scheduled, filters
them by when and what kind, opens one, and reserves seats. When nothing is
scheduled the page says so rather than showing an empty grid.

## Sub-features

- `events-list` shows scheduled events with their date, place and price.
- `events-filter` narrows by `Upcoming` / `Past` / `All` and by
  `Workshops` / `Open mics`.
- `events-empty` explains an empty calendar instead of rendering nothing.
- `events-detail` opens one event with its reserve box.
- `events-register` takes seats and lands on the registration.
- `registration-cancel` gives the seats back.

## How to get to it (user POV)

- Choose `Events` in the main navigation, or `Workshops and open mics` in the
  footer.
- Open an event by its title from the grid.
- Reach a registration from `/registrations`, or the account page's `Bookings`
  link.

## Driving it with browser-flows.sh

Preconditions:

- Doctor exits 0. Registration needs at least one published upcoming event with
  seats; the default catalogue often has none, in which case only the list and
  empty-state legs are reachable.

- **List and filters.** Run `./scripts/browser-flows.sh events`. It asserts the
  `Workshops and open mics` heading, recognises the empty state when the
  calendar is bare, and switches to `Past`.
- **Empty state.** With no events scheduled the page reads
  `No dates on the calendar`. That is the pass condition, not a skip.
- **Detail.** With an event present, click its title. The URL becomes
  `/events/<slug>` and the reserve box shows the price and the seats left.
- **Register.** Set the seat count and confirm. The URL becomes
  `/registrations/<id>` and the status reads `Pending`.
- **Cancel.** Cancel the registration from that page and read the status back
  as `Cancelled`, then reload `/events/<slug>` and confirm the seats-left figure
  went back up.
- **Proof.** Screenshot the list state you found (populated or empty) and, when
  you registered, both the registration and the seats-left figure before and
  after cancelling.

## Gotchas

- Events and open studio are different features on different routes. `/events`
  is the scheduled calendar; `/workshops` is the drop-in wheel booking. Their
  headings both mention workshops, so assert on the route as well as the text.
- With no seeded events the register and cancel legs are unreachable. Report
  them as such with the precondition — do not claim the feature is verified from
  the empty state alone.
- Seats are decremented under a conditional update. Two browser tabs racing for
  the last seat is covered by `api/ pnpm test:integration`, not here.
- Past events render without a reserve box; filtering to `Past` and then looking
  for one is a dead end.
