# Account and session

A visitor signs in through Clerk, reaches their orders, bookings, saved pieces
and addresses from one account page, and signs out again. A wrong URL lands on a
404 that still looks like the studio.

## Sub-features

- `session-sign-in` signs in from the header with an email and a password.
- `account-hub` links to orders, bookings, wheel sessions, saved pieces and
  addresses.
- `account-addresses` adds, edits and deletes a delivery address.
- `session-sign-out` signs out and clears the cached data.
- `gate-signed-out` shows a sign-in wall instead of an empty page on
  authenticated routes.
- `notfound` keeps the header and footer on an unknown route.

## How to get to it (user POV)

- Click the person icon at the right of the header — `Sign in` when signed out,
  `Your account` when signed in.
- Open `/account`, or any authenticated route while signed out.
- Type any URL the app does not serve.

## Driving it with browser-flows.sh

Preconditions:

- Doctor exits 0. `signout` must run last in a session, since everything after
  it would be anonymous.

- **Whole journey.** Run `./scripts/browser-flows.sh notfound signout`. The
  sign-in half runs at the start of every invocation of the script.
- **Sign in.** `find role button click --name "Sign in"`, fill
  `input[name="identifier"]`, click `.cl-formButtonPrimary`, fill
  `input[name="password"]`, click `.cl-formButtonPrimary` again. The header's
  person button is then named `Your account`.
- **Account hub.** Open `/account`. It greets the user by name and links
  `Orders`, `Bookings`, `Wheel sessions`, `Saved pieces` and `Addresses`.
- **Addresses.** From `/account/addresses`, add one with a six-digit pincode,
  confirm it lists, then delete it.
- **Sign out.** `find role button click --name "Sign out"`, then open `/`. The
  header's person button is named `Sign in` again.
- **Signed-out gate.** While signed out, open `/orders`. It reads
  `Sign in to see your orders` and offers a sign-in button, rather than an empty
  list.
- **404.** Open `/this-shelf-does-not-exist`. The page reads
  `This shelf is empty`, offers `Browse pieces`, and still carries the site
  wordmark and footer.
- **Proof.** Screenshot the signed-in header, the signed-out header and the 404.
  The pair of header screenshots is what proves the session actually changed.

## Gotchas

- The header person button is icon-only; its name is in `aria-label` and only
  `snapshot -i -c` will find it. Asserting on the text `Sign in` via `read`
  matches the sign-in wall on other pages instead.
- Clerk's dialog is two submits, not one: email, then password. Both use
  `.cl-formButtonPrimary`.
- `Continue with Google` also contains the word "Continue". Matching text alone
  will send the run to Google's sign-in page.
- The test user is an admin, so the header carries an extra `ADMIN` link. Do not
  treat its absence on a non-admin account as a regression.
- `agent-browser close` ends the session and drops the sign-in with it, so a
  later run signs in again from scratch.
- Sign-out clears the Apollo store. A cart count that survives a sign-out is a
  real bug, not a stale render.
