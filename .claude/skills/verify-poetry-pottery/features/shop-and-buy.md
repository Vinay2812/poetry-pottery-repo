# Shop and buy

A visitor browses the shelf, narrows it to a category, opens a piece, puts it in
the cart, gives a delivery address, places the order and can cancel it while the
studio has not started work.

## Sub-features

- `shop-browse` lists what is on the shelf and offers the archive alongside it.
- `shop-filter` narrows the grid by category, material, price and availability,
  and the filter lives in the URL.
- `shop-detail` opens one piece with its gallery and buy box.
- `cart-add` puts a piece in the cart and the header count follows.
- `checkout-address` saves a delivery address when none exists.
- `checkout-place` turns the cart into an order and lands on the order.
- `order-cancel` cancels an order that has not been worked on.

## How to get to it (user POV)

- Choose `Shop` in the main navigation, or `Shop the shelf` on the home hero, or
  any tile in the `Shapes we throw` row.
- Open a piece by its name, or by the `+` on its card to add it without opening.
- Open the cart from the bag in the header, then `Continue to checkout`.
- Reach a placed order from `/orders`, or from the account page's `Orders` link.

## Driving it with browser-flows.sh

Preconditions:

- Doctor exits 0 and at least one piece is on the shelf with stock.
- The cart is empty. `./scripts/browser-flows.sh order` empties it first.

- **Whole journey.** Run `./scripts/browser-flows.sh home shop order`. Exit 0
  and the printed steps are the proof; `order-placed.png` and
  `order-cancelled.png` carry the state.
- **Browse.** Open `/products`. `agent-browser --session verify read` contains
  `Every piece on the shelf`, and `snapshot -i -c` lists
  `link "On the shelf (N)"` and `link "Archive (N)"`.
- **Filter.** Count the add-to-cart buttons, then
  `agent-browser --session verify find role checkbox check --name "Mugs 4"`.
  The URL gains a category parameter and the count drops without reaching zero.
  The previous results stay on screen while the new ones load — a skeleton flash
  here is a regression against the repo's URL-state rule.
- **Open a piece.** Click the product name. The URL becomes `/products/<slug>`
  and the buy box offers `Add to cart · ₹<price>`.
- **Add to cart.** Click that button, then open `/cart`. The page reads
  `Your cart` and no longer reads `Your cart is empty`, and the header bag shows
  a count in its `aria-label`.
- **Checkout.** `find role link click --name "Continue to checkout"`. If the
  page says `No addresses saved yet`, click `Add an address` and fill
  `input[name="name"]`, `phone`, `line1`, `city`, `state`, `pincode` (six
  digits), then `Save address`.
- **Place.** Click the button whose label starts `Place order`. The URL becomes
  `/orders/<id>` and the page offers `Cancel this order`.
- **Cancel.** Click `Cancel this order`, then `Cancel order` inside the dialog.
  The status reads `Cancelled`.
- **Proof.** `agent-browser --session verify screenshot
  /tmp/verify/screens/order-cancelled.png`, and reopen the order from `/orders`
  to confirm the cancelled status came from the server and not the optimistic
  update.

## Gotchas

- The cart survives between runs. A stale line changes the order total and makes
  a price assertion fail for the wrong reason — empty it first.
- Made-to-order pieces show `Choose options for <name>` instead of an add
  button; they cannot be added from the grid. Pick a stocked piece.
- `Place order` stays disabled until an address is selected, so a failed address
  save shows up two steps later as a disabled button, not as an error.
- Prices are integer rupees rendered with Indian digit grouping (`₹15,600`).
  Match the rendered string, not a parsed number.
- Only an order the studio has not started can be cancelled. Re-running the flow
  against an already-progressed order will find no `Cancel this order` button —
  place a fresh one.
- The order id is a 16-character nanoid, so it differs every run. Assert on the
  `/orders/` prefix, never a whole URL.
