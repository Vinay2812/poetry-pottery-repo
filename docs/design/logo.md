# Logo

## What the mark is

A two-line serif wordmark. "Poetry" sits on the first line, "&Pottery" on the second with the
ampersand leading and kerned into the P. The "o" of Poetry is not the font's "o": it is a round
bowl drawn for this logo, and inside it sits a single-stroke spiral of two turns ending in a
pressed dot — a coil of clay seen from above, or a thumbprint left in a wet wall. It is the only
drawn element in the mark and the only place the studio's hand shows.

## The round "o"

DM Serif Display's "o" is a high-contrast Didone: 497 units wide with a counter only 193 wide, far
too narrow to hold a coil. The logo's "o" widens that same outline to **560 × 511** units on a
1000-unit em, and widens its counter further, to **300 × 471**. Both contours are scaled about the
one axis, so the Didone curvature, the overshoots above the x-height and below the baseline, and
the 20-unit hairline top and bottom all survive untouched; only the width changes. The stems come
out at 130 units, keeping the vertical stress and the thick/thin axis of every letter beside it.
Sidebearings drop to 16 units and "P o e" closes up by 10 more on each side, because a rounder
bowl carries more optical weight than the one it replaced.

## The spiral

A true spiral, not a decoration dropped in. It is centred in the new counter, starts at the top,
winds inward clockwise for two turns, and finishes in a round dot of 20 units radius at the dead
centre — the coil pressed down with a thumb. Its radii come from the counter but are pulled back
towards a circle, so the two turns sit evenly instead of stretching with the bowl. It is stroked
at 20 units, exactly the weight of the hairline top and bottom of the "o" around it, with round
caps. At any size the coil therefore reads as the same weight as the thin strokes beside it, and
it thickens and thins with the wordmark as one drawing.

## Letterforms

Every other letter is DM Serif Display Regular, the site's display face, converted to outlines
with `opentype.js`; the round "o" is derived from the same outline. The published files contain no
text elements and no font references, so they render identically everywhere.

**Licence:** SIL Open Font License 1.1. DM Serif Display is by Colophon Foundry, derived from
Source Serif — "Copyright 2014-2018 Adobe (http://www.adobe.com/), with Reserved Font Name
'Source'. Copyright 2019 Google LLC." Outlines converted from a font under OFL 1.1 may be embedded
in and distributed as artwork; the OFL's reserved font name applies to the font software, not to
the logo drawn from it. Source: `github.com/google/fonts/tree/main/ofl/dmserifdisplay`.

## Colour

| Use                      | Ink       | Background |
| ------------------------ | --------- | ---------- |
| Default                  | `#1F1D1A` | `#F7F4EF`  |
| Reverse                  | `#F7F4EF` | `#1F1D1A`  |
| App icons, favicon       | `#F7F4EF` | `#1F1D1A`  |
| Social card (og-image)   | `#1F1D1A` | `#F7F4EF`  |

Two colours only. The mark is never sage, never kiln, never a gradient, and never a tint of ink.
On a photograph, use the reverse lockup over the darkest quarter of the frame, or set the
photograph behind a solid clay-white or ink panel first.

## Clear space

One "o" width on every side — measure the width of the round spiral "o" in whatever size the
lockup is set at (0.61 of the lockup's height, inline) and keep that much empty on all four sides. Nothing crosses it: no rule, no nav link, no
image edge. The header already satisfies this with its 20px gap to the vertical rule.

## Minimum sizes

| Lockup           | Minimum                  | Notes                                             |
| ---------------- | ------------------------ | ------------------------------------------------- |
| Inline wordmark  | 16 px tall (130 px wide) | the header uses 18 px mobile, 22 px desktop       |
| Stacked wordmark | 32 px tall (65 px wide)  | below this the two lines close up                 |
| Mark alone       | 20 px square             | 16 px works as a favicon, where the OS softens it |

Below the minimum the second turn of the spiral closes and the mark reads as a blob. Prefer the
mark over a shrunken wordmark whenever the space is under 130 px wide.

## Do not

- Do not retype the wordmark in a live font — the round "o" and its spiral only exist in these
  files, and DM Serif Display's own "o" will not stand in for them.
- Do not change the line break: it is always "Poetry" over "&Pottery", never "Poetry &" over
  "Pottery".
- Do not set the two lines flush left; the short line is optically centred over the long one.
- Do not recolour, outline, emboss, add a shadow, or place the mark in a circle or a rounded box.
- Do not stretch, skew, rotate, or change the spacing between the words.
- Do not fill the spiral or thicken its stroke to make it visible at a small size; use the mark.
- Do not put the default lockup on ink or the reverse lockup on clay-white.

## Files

All under `frontend/public/brand/`:

| File                           | What it is                                      |
| ------------------------------ | ----------------------------------------------- |
| `wordmark-inline.svg`          | one line, "Poetry & Pottery", ink               |
| `wordmark-inline-reverse.svg`  | one line, clay-white                            |
| `wordmark-stacked.svg`         | two lines, ink                                  |
| `wordmark-stacked-reverse.svg` | two lines, clay-white                           |
| `mark.svg`                     | the spiral "o" alone, square viewBox, ink       |
| `mark-reverse.svg`             | the spiral "o" alone, clay-white                |
| `favicon.svg`                  | mark in clay-white on an ink tile               |
| `apple-touch-icon.png`         | 180 × 180, mark on ink                          |
| `icon-512.png`                 | 512 × 512, mark on ink                          |
| `og-image.png`                 | 1200 × 630, stacked wordmark on clay-white      |

In the app:

- `frontend/src/components/brand/Wordmark.tsx` — the inline lockup as an inline SVG, with an
  `isReverse` prop. Generated from the same outlines; regenerate it rather than hand-editing the
  path data.
- `frontend/src/features/layout/components/Wordmark.tsx` — wraps it in the home link used by the
  header and the footer.
- `frontend/src/app/layout.tsx` — declares the favicon, the apple touch icon and the OG image.

The SVG lockups are tight to the ink, with no padding, so they can be sized by height alone.
