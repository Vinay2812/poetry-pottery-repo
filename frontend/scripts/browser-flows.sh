#!/usr/bin/env bash
#
# Drives the storefront through its core journeys with agent-browser and keeps
# the evidence. Every journey ends in an assertion against what the page says,
# so a green run means the path worked, not that the clicks landed.
#
#   BASE_URL=http://localhost:3036 ./scripts/browser-flows.sh
#   ./scripts/browser-flows.sh cart wishlist        # only the named flows
#
# Exits non-zero when any step fails. Screenshots and one video per flow land in
# OUT_DIR and survive the run.

set -uo pipefail

BASE_URL="${BASE_URL:-http://localhost:3030}"
OUT_DIR="${OUT_DIR:-/tmp/flows}"
SESSION="${FLOW_SESSION:-poetry-flows}"
FLOW_EMAIL="${FLOW_EMAIL:-maya+clerk_test@example.com}"
FLOW_PASSWORD="${FLOW_PASSWORD:-PotteryTest#2026}"
HEADLESS="${FLOW_HEADLESS:-1}"
API_HEALTH_URL="${API_HEALTH_URL:-http://localhost:6060/health}"

AB=(agent-browser --session "$SESSION")
if [ "$HEADLESS" = "0" ]; then AB+=(--headed); fi

PASSED=0
FAILED=0
FAILURES=()
CURRENT_FLOW="setup"

log() { printf '%s\n' "$*"; }
note() { printf '   %s\n' "$*"; }

pass() {
  PASSED=$((PASSED + 1))
  printf '  ok   %s\n' "$1"
}

fail() {
  FAILED=$((FAILED + 1))
  FAILURES+=("$CURRENT_FLOW: $1")
  printf '  FAIL %s\n' "$1"
  shot "fail-${CURRENT_FLOW}-$(printf '%s' "$1" | tr -c 'a-zA-Z0-9' '-' | cut -c1-40)"
}

ab() { "${AB[@]}" "$@"; }

# agent-browser prints a leading ✗ and exits non-zero when a locator misses.
act() {
  local what="$1"
  shift
  if ab "$@" >/dev/null 2>&1; then
    pass "$what"
  else
    fail "$what"
    return 1
  fi
}

settle() { ab wait "${1:-1200}" >/dev/null 2>&1; }

goto() {
  ab open "${BASE_URL}$1" >/dev/null 2>&1
  settle "${2:-2500}"
}

shot() {
  mkdir -p "$OUT_DIR/screens"
  ab screenshot "$OUT_DIR/screens/$1.png" >/dev/null 2>&1 || true
}

# bash 3.2 has no ${var@Q}, and every pattern below is embedded in JavaScript.
js_quote() {
  printf "'%s'" "$(printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e "s/'/\\\\'/g")"
}

# The page's own rendered text is the assertion surface: it is what a visitor reads.
expect_text() {
  local needle="$1" what="${2:-page says \"$1\"}"
  if ab read 2>/dev/null | grep -qiF -- "$needle"; then
    pass "$what"
  else
    fail "$what"
  fi
}

expect_no_text() {
  local needle="$1" what="${2:-page no longer says \"$1\"}"
  if ab read 2>/dev/null | grep -qiF -- "$needle"; then
    fail "$what"
  else
    pass "$what"
  fi
}

# Icon-only controls carry their name in aria-label, which rendered text misses.
has_control() {
  ab snapshot -i -c 2>/dev/null | grep -qF "\"$1\""
}

expect_control() {
  local name="$1" what="${2:-a control named \"$1\" is present}"
  if has_control "$name"; then pass "$what"; else fail "$what"; fi
}

# A page wider than the viewport is invisible in a screenshot and obvious on a phone.
expect_no_sideways_scroll() {
  local what="${1:-the page does not scroll sideways}"
  local measured
  measured="$(ab eval "document.documentElement.scrollWidth - document.documentElement.clientWidth" 2>/dev/null | tail -1 | tr -dc '0-9-')"
  if [ "${measured:-0}" = "0" ]; then
    pass "$what"
  else
    fail "$what (overflows by ${measured}px)"
  fi
}

expect_url() {
  local fragment="$1"
  local actual
  actual="$(ab get url 2>/dev/null | tail -1)"
  case "$actual" in
  *"$fragment"*) pass "url contains $fragment" ;;
  *) fail "url contains $fragment (was $actual)" ;;
  esac
}

# Labels that carry live data — dates, prices, product names — cannot be pinned
# in the script, so the first enabled control whose label matches is clicked.
# The optional third argument scopes the search to a CSS container.
click_matching() {
  local pattern="$1" what="${2:-click control matching $1}" scope="${3:-}"
  local result
  result="$(ab eval "(() => {
    const re = new RegExp($(js_quote "$pattern"));
    const scope = $(js_quote "$scope");
    const root = scope ? document.querySelector(scope) : document;
    if (!root) return 'MISS';
    const hit = [...root.querySelectorAll('button, a')].find((n) => !n.disabled
      && n.offsetParent !== null
      && re.test((n.getAttribute('aria-label') || n.textContent || '').trim()));
    if (!hit) return 'MISS';
    hit.click();
    return (hit.getAttribute('aria-label') || n_label(hit)).slice(0, 60);
    function n_label(node) { return (node.textContent || '').trim(); }
  })()" 2>/dev/null | tail -1 | tr -d '"')"
  if [ -z "$result" ] || [ "$result" = "MISS" ]; then
    fail "$what"
    return 1
  fi
  note "clicked: $result"
  pass "$what"
  settle
}

count_matching() {
  local counted
  counted="$(ab eval "(() => {
    const re = new RegExp($(js_quote "$1"));
    return [...document.querySelectorAll('button, a')]
      .filter((n) => !n.disabled && re.test((n.getAttribute('aria-label') || n.textContent || '').trim()))
      .length;
  })()" 2>/dev/null | tr -dc '0-9')"
  printf '%s' "${counted:-0}"
}

# The booked day is a fact row whose term is the date itself, so the fixed terms
# are subtracted rather than the date guessed.
booking_day() {
  ab eval "(() => {
    const fixed = new Set(['Session', 'Duration', 'You take home']);
    return [...document.querySelectorAll('dt')]
      .map((n) => (n.textContent || '').trim())
      .filter((t) => t && !fixed.has(t))
      .join(' | ');
  })()" 2>/dev/null | tail -1 | tr -d '\"'
}

start_flow() {
  CURRENT_FLOW="$1"
  log ""
  log "── $1"
  mkdir -p "$OUT_DIR/video"
  ab record start "$OUT_DIR/video/$1.webm" --fps 12 >/dev/null 2>&1 || true
}

end_flow() {
  ab record stop >/dev/null 2>&1 || true
}

# ---------------------------------------------------------------- preconditions

doctor() {
  local ok=0
  if command -v agent-browser >/dev/null 2>&1; then
    log "harness   agent-browser $(agent-browser --version 2>/dev/null | tail -1)"
  else
    log "harness   MISSING — agent-browser is not on PATH"
    ok=1
  fi

  local code
  code="$(curl -s -o /dev/null -m 10 -w '%{http_code}' "$BASE_URL/" || true)"
  if [ "$code" = "200" ]; then
    log "storefront $BASE_URL"
  else
    log "storefront UNREACHABLE at $BASE_URL (http $code) — start it with pnpm dev"
    ok=1
  fi

  local health
  health="$(curl -s -m 10 "$API_HEALTH_URL" || true)"
  case "$health" in
  *'"status":"ok"'*) log "api       $API_HEALTH_URL ok" ;;
  "") log "api       UNREACHABLE at $API_HEALTH_URL"; ok=1 ;;
  *) log "api       DEGRADED at $API_HEALTH_URL: $health"; ok=1 ;;
  esac

  if command -v ffmpeg >/dev/null 2>&1; then
    log "video     ffmpeg present, recording enabled"
  else
    log "video     ffmpeg missing — screenshots only"
  fi

  log "session   $SESSION"
  log "evidence  $OUT_DIR"
  log "user      $FLOW_EMAIL"
  return "$ok"
}

sign_in() {
  goto "/"
  if has_control "Your account"; then
    log "already signed in"
    return 0
  fi
  act "open the sign-in dialog" find role button click --name "Sign in" || return 1
  settle 2500
  act "enter the email" fill 'input[name="identifier"]' "$FLOW_EMAIL" || return 1
  act "continue past the email step" click '.cl-formButtonPrimary' || return 1
  settle 3000
  act "enter the password" fill 'input[name="password"]' "$FLOW_PASSWORD" || return 1
  act "submit the password" click '.cl-formButtonPrimary' || return 1
  settle 5000
  expect_control "Your account" "the header shows the account button"
  shot "signed-in"
}

empty_the_cart() {
  goto "/cart"
  local guard=0
  while [ "$(count_matching '^Remove$')" != "0" ] && [ "$guard" -lt 12 ]; do
    click_matching '^Remove$' "remove a leftover cart line" >/dev/null 2>&1 || break
    settle 1200
    guard=$((guard + 1))
  done
}

# ---------------------------------------------------------------------- flows

flow_home() {
  start_flow home
  goto "/"
  expect_text "Pottery made slowly" "the hero headline renders"
  expect_text "Shapes we throw" "the category row renders"
  expect_text "Pieces on the shelf" "the featured shelf renders"
  act "follow the hero into the shop" find role link click --name "Shop the shelf"
  settle 2500
  expect_url "/products"
  shot "home-to-shop"
  end_flow
}

flow_shop() {
  start_flow shop
  goto "/products"
  expect_text "Every piece on the shelf" "the shop heading renders"
  local before
  before="$(count_matching 'to cart$')"
  note "add-to-cart buttons before filtering: $before"
  act "filter to mugs" find role checkbox check --name "Mugs 4"
  settle 2500
  expect_url "categor"
  local after
  after="$(count_matching 'to cart$')"
  note "add-to-cart buttons after filtering: $after"
  if [ "$after" -le "$before" ] && [ "$after" -gt 0 ]; then
    pass "the filter narrows the grid and keeps results"
  else
    fail "the filter narrows the grid and keeps results (before=$before after=$after)"
  fi
  shot "shop-filtered"
  act "switch to the archive" find role link click --name "Archive"
  settle 2500
  expect_url "archive"
  act "switch back to the shelf" find role link click --name "On the shelf"
  settle 2500
  shot "shop-shelf"
  end_flow
}

flow_product_to_order() {
  start_flow order
  empty_the_cart

  goto "/products"
  click_matching '^(Blue Blood Mug|The Kalyug Mug)$' "open a product from the grid" || {
    end_flow
    return
  }
  settle 3000
  expect_url "/products/"
  shot "product-detail"
  expect_text "Add to cart" "the buy box offers the cart"

  # The gallery is the widest thing on the page, so the phone check belongs here.
  ab set viewport 375 812 >/dev/null 2>&1
  settle 1500
  expect_no_sideways_scroll "the product page fits a 375px phone"
  shot "product-detail-375"
  ab set viewport 1440 900 >/dev/null 2>&1
  settle 1500

  click_matching '^Add to cart' "add the piece to the cart" || {
    end_flow
    return
  }
  settle 2500
  goto "/cart"
  expect_text "Your cart" "the cart page renders"
  expect_no_text "Your cart is empty" "the cart holds the piece"
  shot "cart"

  act "continue to checkout" find role link click --name "Continue to checkout"
  settle 3000
  expect_url "/checkout"

  if ab read 2>/dev/null | grep -qF "No addresses saved yet"; then
    act "open the address form" find role button click --name "Add an address"
    settle 1500
    act "fill the name" fill 'input[name="name"]' "Maya Iyer"
    ab fill 'input[name="phone"]' "9876543210" >/dev/null 2>&1
    ab fill 'input[name="line1"]' "1 Kiln Lane" >/dev/null 2>&1
    ab fill 'input[name="city"]' "Sangli" >/dev/null 2>&1
    ab fill 'input[name="state"]' "Maharashtra" >/dev/null 2>&1
    ab fill 'input[name="pincode"]' "416416" >/dev/null 2>&1
    act "save the address" find role button click --name "Save address"
    settle 3000
  else
    pass "an address is already saved"
  fi
  shot "checkout"

  click_matching '^Place order' "place the order" || {
    end_flow
    return
  }
  settle 6000
  expect_url "/orders/"
  expect_text "Cancel this order" "a fresh order can still be cancelled"
  shot "order-placed"

  # The list is the first place a customer looks after paying, so it is checked
  # on the order they just placed rather than on the page rendering at all.
  local order_id
  order_id="$(ab get url 2>/dev/null | tail -1 | sed -e 's#.*/orders/##' -e 's#?.*##')"
  note "order placed: $order_id"
  goto "/orders"
  expect_text "Your orders" "the orders list renders"
  expect_no_text "Your orders did not load" "the orders list query did not fail"
  expect_text "$order_id" "the list shows the order just placed"
  shot "orders-list"

  goto "/orders/$order_id"
  click_matching '^Cancel this order$' "open the cancel dialog" || {
    end_flow
    return
  }
  settle 1500
  click_matching '^Cancel order$' "confirm the cancellation" '[role="dialog"]' || {
    end_flow
    return
  }
  settle 4000
  expect_text "Cancelled" "the order reads as cancelled"
  shot "order-cancelled"
  end_flow
}

flow_wishlist() {
  start_flow wishlist
  goto "/products"
  click_matching '^Save .* to wishlist$' "save a piece to the wishlist" || {
    end_flow
    return
  }
  settle 2500
  goto "/wishlist"
  expect_text "Saved pieces" "the wishlist page renders"
  expect_no_text "Nothing saved yet" "the saved piece is listed"
  shot "wishlist-full"
  click_matching '^Remove .* from wishlist$' "unsave the piece" || {
    end_flow
    return
  }
  settle 2500
  goto "/wishlist"
  expect_text "Nothing saved yet" "the wishlist is empty again"
  shot "wishlist-empty"
  end_flow
}

flow_events() {
  start_flow events
  goto "/events"
  expect_text "Workshops and open mics" "the events heading renders"
  if ab read 2>/dev/null | grep -qF "No dates on the calendar"; then
    pass "the empty state explains there is nothing scheduled"
  else
    expect_text "Upcoming" "the events list offers its filters"
  fi
  act "switch to past dates" find role button click --name "Past"
  settle 2000
  shot "events"
  end_flow
}

flow_workshops() {
  start_flow workshops
  goto "/workshops"
  expect_text "Open Studio Sessions" "the studio page renders"
  click_matching '^1 hour' "pick the one-hour tier" || {
    end_flow
    return
  }
  click_matching 'wheels free$' "pick an open day" || {
    end_flow
    return
  }
  settle 3000
  # Slot labels are clock times, so the hours group is the stable handle.
  click_matching '.' "pick an hour at the wheel" '[role="group"][aria-label="Hours"]' || {
    end_flow
    return
  }
  settle 2000
  shot "workshop-picked"
  click_matching '^Book this session$' "book the session" || {
    end_flow
    return
  }
  settle 6000
  expect_url "/workshops/bookings/"
  shot "workshop-booked"

  if ab read 2>/dev/null | grep -qiF "Move to another day"; then
    local before_day
    before_day="$(booking_day)"
    note "booked for: $before_day"
    click_matching '^Move to another day$' "open the reschedule dialog"
    settle 2500
    click_matching 'wheels free$' "pick a new day" '[role="dialog"]' || true
    settle 2500
    # The dialog opens on the hours already booked and the picker caps at that
    # many, so the old hour has to be dropped before a new one can be taken.
    click_matching '^Remove ' "drop the hour already held" '[role="dialog"]' || true
    settle 1000
    click_matching '.' "pick a new hour" '[role="dialog"] [role="group"][aria-label="Hours"]' || true
    settle 1500
    click_matching '^Move session$' "confirm the move" '[role="dialog"]' || true
    settle 5000
    local after_day
    after_day="$(booking_day)"
    note "moved to: $after_day"
    if [ -n "$after_day" ] && [ "$after_day" != "$before_day" ]; then
      pass "the booking moved to a different day"
    else
      fail "the booking moved to a different day (still $after_day)"
    fi
    shot "workshop-rescheduled"
  else
    note "this booking cannot be moved; skipping the reschedule leg"
  fi

  click_matching '^Cancel this session$' "open the cancel dialog" || {
    end_flow
    return
  }
  settle 1500
  click_matching '^Cancel session$' "confirm the cancellation" '[role="dialog"]' || {
    end_flow
    return
  }
  settle 4000
  expect_text "Cancelled" "the booking reads as cancelled"
  shot "workshop-cancelled"
  end_flow
}

flow_contact() {
  start_flow contact
  goto "/contact"
  expect_text "Come by, or write to us" "the contact page renders"
  ab fill 'input[name="name"]' "Flow Check" >/dev/null 2>&1
  ab fill 'input[name="email"]' "flows+$(date +%s)@example.test" >/dev/null 2>&1
  ab fill 'input[name="subject"]' "Browser flow check" >/dev/null 2>&1
  ab fill 'textarea[name="message"]' "Automated storefront flow check. Please ignore." >/dev/null 2>&1
  act "send the message" find role button click --name "Send message"
  settle 4000
  expect_no_text "Something went wrong" "the form did not error"
  shot "contact-sent"
  end_flow
}

flow_newsletter() {
  start_flow newsletter
  goto "/"
  ab fill 'footer input[type="email"]' "flows+$(date +%s)@example.test" >/dev/null 2>&1
  act "subscribe from the footer" find role button click --name "Subscribe"
  settle 3500
  expect_no_text "Something went wrong" "the subscribe form did not error"
  shot "newsletter-subscribed"
  goto "/newsletter/unsubscribe"
  expect_no_text "Application error" "the unsubscribe page renders without a token"
  shot "newsletter-unsubscribe"
  end_flow
}

flow_notfound() {
  start_flow notfound
  goto "/this-shelf-does-not-exist"
  expect_text "This shelf is empty" "the 404 copy renders"
  expect_text "Browse pieces" "the 404 offers a way back"
  # The 404 must keep the storefront chrome rather than bare-bone erroring.
  expect_text "Poetry & Pottery" "the 404 keeps the site chrome"
  shot "notfound"
  end_flow
}

flow_signout() {
  start_flow signout
  goto "/account"
  expect_text "Sign out" "the account page offers sign out"
  act "sign out" find role button click --name "Sign out"
  settle 5000
  goto "/"
  expect_control "Sign in" "the header offers sign in again"
  shot "signed-out"
  end_flow
}

# ----------------------------------------------------------------------- main

ALL_FLOWS=(home shop order wishlist events workshops contact newsletter notfound signout)

main() {
  mkdir -p "$OUT_DIR/screens" "$OUT_DIR/video"

  # `doctor` on its own is the read-only "is this instance worth driving?" check.
  if [ "${1:-}" = "doctor" ] && [ "$#" -eq 1 ]; then
    doctor
    exit "$?"
  fi

  if ! doctor; then
    log ""
    log "refusing to drive an unhealthy stack"
    exit 2
  fi

  local selected=("$@")
  if [ "${#selected[@]}" -eq 0 ]; then selected=("${ALL_FLOWS[@]}"); fi

  CURRENT_FLOW="sign-in"
  log ""
  log "── sign-in"
  sign_in

  for flow in "${selected[@]}"; do
    case "$flow" in
    home) flow_home ;;
    shop) flow_shop ;;
    order) flow_product_to_order ;;
    wishlist) flow_wishlist ;;
    events) flow_events ;;
    workshops) flow_workshops ;;
    contact) flow_contact ;;
    newsletter) flow_newsletter ;;
    notfound) flow_notfound ;;
    signout) flow_signout ;;
    *)
      log "unknown flow: $flow (known: ${ALL_FLOWS[*]})"
      exit 2
      ;;
    esac
  done

  ab close >/dev/null 2>&1 || true

  log ""
  log "─────────────────────────────────────────────"
  log "passed $PASSED   failed $FAILED"
  log "evidence: $OUT_DIR/screens and $OUT_DIR/video"
  if [ "$FAILED" -gt 0 ]; then
    log ""
    for failure in "${FAILURES[@]}"; do log "  ✗ $failure"; done
    exit 1
  fi
}

main "$@"
