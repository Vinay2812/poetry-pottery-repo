# Open studio

A guest picks how long they want at the wheel and for how many people, takes
that many hours out of the studio's calendar, books them, and can move the
session to another day or cancel it while it is still ahead.

## Sub-features

- `studio-tiers` shows the hour tiers with their price and how many pieces the
  guest takes home.
- `studio-pick` opens a day and offers the hours that still have a wheel free.
- `studio-book` turns the picked hours into a booking and lands on it.
- `booking-move` reschedules a booking onto different hours.
- `booking-cancel` cancels a booking and frees the hours again.

## How to get to it (user POV)

- Choose `Workshops` in the main navigation, or `Book a wheel session` on the
  home hero or in the footer.
- Reach an existing booking from `/workshops/bookings`, or from the account
  page's `Wheel sessions` link.

## Driving it with browser-flows.sh

Preconditions:

- Doctor exits 0 and `/workshops` shows at least one day labelled
  `N wheels free` — a studio whose days are all `studio closed` makes every step
  below unreachable.

- **Whole journey.** Run `./scripts/browser-flows.sh workshops`. It books, moves
  and cancels in one pass and leaves `workshop-booked.png`,
  `workshop-rescheduled.png` and `workshop-cancelled.png`.
- **Pick a tier.** Open `/workshops`. Click the button whose label starts
  `1 hour`. The tier table and the `HOW LONG` group both reflect the choice.
- **Pick a day.** Click a day button whose label ends `wheels free`. Days
  labelled `studio closed` are disabled and must not be clicked.
- **Pick an hour.** The hours appear in a group named `Hours`. Click a button
  inside `[role="group"][aria-label="Hours"]` rather than matching a clock time,
  which is formatted for the studio's timezone.
- **Book.** `find role button click --name "Book this session"`. The URL becomes
  `/workshops/bookings/<id>` and the fact list names the booked day.
- **Move.** Click `Move to another day`. In the dialog, pick a different day,
  then click `Remove <the hour already held>` before picking the new hour — the
  picker caps at the tier's count and silently ignores an extra tap otherwise.
  Click `Move session`, then read the day back from the fact list: it must have
  changed.
- **Cancel.** Click `Cancel this session`, then `Cancel session` in the dialog.
  The status badge reads `Cancelled`.
- **Proof.** Screenshot the booking after the move and after the cancel, and
  reload `/workshops/bookings/<id>` so the status comes from the server rather
  than the optimistic update.

## Gotchas

- The move dialog opens with the hours the guest already holds pre-selected and
  the picker refuses a tap once the tier's count is filled. Drop an hour first,
  or the new day changes nothing and `Move session` sits enabled over an
  unchanged selection.
- A multi-hour tier needs every hour picked before `Book this session` enables;
  `N of M hours picked` above the button is the state to read.
- Booking, moving and cancelling all write real rows and move real seat counts.
  Cancel what you book, or later runs find the studio full.
- Day availability is computed in the studio's timezone, not the browser's. Do
  not assert a specific date.
- A booking too close to its start cannot be moved; the `Move to another day`
  button is simply absent. Treat that as a skip with the reason, not a failure.
