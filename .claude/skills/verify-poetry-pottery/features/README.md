# Poetry & Pottery verification map

The maintained source for verifying what a visitor can do on the storefront.
Read this index, then use the matching feature file as the recipe. The parent
`SKILL.md` covers launching, the doctor check, evidence and cleanup.

## Baseline preconditions

- Storefront at `http://localhost:3036`, API at `http://localhost:6066`, both
  started by this run. Never drive an instance you did not start.
- `./scripts/browser-flows.sh doctor` exits 0 and names the expected storefront
  URL, API health and evidence directory.
- `OUT_DIR=/tmp/verify` and `FLOW_SESSION=verify` so concurrent runs do not
  share a browser or overwrite each other's proof.
- Signed in as `maya+clerk_test@example.com` on the development Clerk instance.
  That account is an admin, so the header carries an extra `ADMIN` link the map
  otherwise ignores.
- A catalogue with stock: `cd api && pnpm db:seed` (or `pnpm import:legacy` for
  the studio's own data). At least one piece must be on the shelf and one
  open-studio day must be bookable, or half the map is unreachable.

## Driving conventions

- Start every recipe from the baseline unless its preconditions say otherwise.
- Prefer ARIA roles and accessible names over CSS position or tab order.
  `agent-browser find role button click --name "…"` is the default move.
- Icon-only controls name themselves in `aria-label` and are invisible to
  `agent-browser read`. Use `snapshot -i -c` to find them.
- Labels holding live data — dates, prices, product names — are matched by
  pattern, never pinned as a literal.
- Treat every command as literal. Keep quoted names and flags unchanged.
- The suite writes real rows. Cancel what a recipe creates; keep the proof.

## Proof and skip reporting

- Capture the action and the resulting state, not only the final screen.
- UI proof is a screenshot plus the assertion the harness printed.
- A state change is proved by reading it back from a second view — reopen the
  order from `/orders`, reload the booking — not by the toast that announced it.
- Money is integer rupees. Assert the rendered rupee figure, never a float.
- Record which flow name produced each artifact.
- An unreachable path is reported with the attempted route and the unmet
  precondition. A skipped entry point is never reported as verified through
  another path.

## Feature entry contract

Each file opens with an H1 and one paragraph of user-visible behaviour, then
exactly four H2s in this order: `Sub-features`, `How to get to it (user POV)`,
`Driving it with browser-flows.sh`, `Gotchas`. Keep implementation detail out —
name only user paths, stable handles, required state, commands and observable
proof.

## Features

- [Shop and buy](./shop-and-buy.md) — the shelf, filters, a product, the cart,
  checkout, the order and cancelling it.
- [Saved pieces](./saved-pieces.md) — saving a piece from a card and taking it
  back off the list.
- [Open studio](./open-studio.md) — booking wheel hours, moving them to another
  day, cancelling the session.
- [Events](./events.md) — the workshops-and-open-mics calendar and its empty
  state.
- [Reach the studio](./reach-the-studio.md) — the contact form and the
  newsletter subscribe/unsubscribe pair.
- [Account and session](./account-and-session.md) — signing in, the account
  page, signing out, and the 404 that keeps the site chrome.
