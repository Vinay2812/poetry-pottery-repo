# Reach the studio

A visitor writes to the studio from the contact page and gets an acknowledgement,
or leaves an email in the footer to hear when a batch comes out of the kiln and
can unsubscribe from the link in that mail.

## Sub-features

- `contact-send` posts a message and confirms it went.
- `contact-validate` refuses a blank or malformed message before sending.
- `newsletter-subscribe` takes an email from the footer form.
- `newsletter-repeat` says so when the address is already on the list rather
  than adding it twice.
- `newsletter-unsubscribe` takes an address off from a tokenised link.

## How to get to it (user POV)

- Choose `Contact` in the footer, or `/contact` directly.
- Use the `Hear when a new batch comes out of the kiln` field in the footer of
  any page.
- Follow the `Unsubscribe` link in a newsletter mail, which lands on
  `/newsletter/unsubscribe?token=<token>`.

## Driving it with browser-flows.sh

Preconditions:

- Doctor exits 0. Neither leg needs a signed-in user.
- Use a fresh address each run (`flows+$(date +%s)@example.test`) so the repeat
  case is deliberate rather than accidental.

- **Whole journey.** Run `./scripts/browser-flows.sh contact newsletter`, which
  leaves `contact-sent.png`, `newsletter-subscribed.png` and
  `newsletter-unsubscribe.png`.
- **Contact.** Open `/contact`, fill `input[name="name"]`, `input[name="email"]`,
  `input[name="subject"]` and `textarea[name="message"]`, then
  `find role button click --name "Send message"`. The form confirms and does not
  say `Something went wrong`.
- **Validation.** Submit with the message empty. The form reports the field and
  posts nothing.
- **Subscribe.** From any page, fill `footer input[type="email"]` and click
  `Subscribe`. The form confirms.
- **Repeat.** Subscribe the same address again. The response says the address is
  already on the list; it does not error and does not add a second row.
- **Unsubscribe.** Open `/newsletter/unsubscribe` with no token: the page renders
  its own message rather than an application error. With a real token from the
  welcome mail, it confirms the address is off.
- **Proof.** Screenshot each confirmation. For the newsletter, the second
  subscribe's wording is the proof that the address was recognised.

## Gotchas

- SMTP is a production boundary: with no SMTP configured the API logs
  `mail skipped` and still queues the job, so a missing inbox is not a failure.
  Read `/tmp/verify/api.log` instead of waiting for mail.
- The contact mutation carries the strict throttle profile. A burst of runs will
  start getting refused — that is the guard working, not a bug.
- Contact and newsletter both write real rows with no cleanup path in the UI.
  Use a disposable database.
- The unsubscribe token comes from the welcome mail. Without it only the
  no-token rendering is reachable; report the tokenised leg as skipped with that
  reason.
- Addresses are trimmed and lower-cased before the uniqueness check, so
  `Maya@Example.test` and `maya@example.test` are the same subscriber.
