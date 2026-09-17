# Saved pieces

A visitor keeps a piece for later from the heart on its card, sees it on the
saved list, and takes it back off. The header count follows, and a piece that
has since been archived stays saved.

## Sub-features

- `wishlist-save` saves a piece from a product card or the product page.
- `wishlist-list` shows the saved pieces, with an empty state when there are
  none.
- `wishlist-remove` takes a piece back off the list.
- `wishlist-count` keeps the header heart's count in step.

## How to get to it (user POV)

- Click the heart on any product card in the shop, the home shelf or a carousel.
- Open the heart in the header, or `/wishlist` directly.
- Reach it from the account page's `Saved pieces` link.

## Driving it with browser-flows.sh

Preconditions:

- Doctor exits 0, signed in, and `/wishlist` reads `Nothing saved yet`.

- **Whole journey.** Run `./scripts/browser-flows.sh wishlist`. Exit 0 leaves
  `wishlist-full.png` and `wishlist-empty.png`.
- **Save.** Open `/products` and click the control named
  `Save <name> to wishlist`. The same control's name flips to
  `Remove <name> from wishlist` and its `aria-pressed` becomes `true`.
- **List.** Open `/wishlist`. The page reads `Saved pieces` and no longer reads
  `Nothing saved yet`, and the saved piece is named on it.
- **Count.** `agent-browser --session verify snapshot -i -c` shows the header
  link named `Wishlist (1)`.
- **Remove.** Click `Remove <name> from wishlist`, reload `/wishlist`. It reads
  `Nothing saved yet` again and the header link is back to `Wishlist`.
- **Proof.** Screenshot the populated list and the empty state, and take the
  empty state from a reload rather than from the optimistic removal.

## Gotchas

- The heart is icon-only: its name lives in `aria-label` and
  `agent-browser read` will never see it. Use `snapshot -i -c`.
- The heart on a card is hidden until hover on desktop widths; it is in the
  accessibility tree either way, so click by name rather than by position.
- Saving is optimistic. A removal that renders instantly and comes back on
  reload means the mutation failed — read the list back before calling it done.
- An archived piece stays on the list but loses its add-to-cart control. That is
  intended, not a broken card.
- Saving needs a signed-in user; anonymously the heart opens the sign-in dialog
  instead.
