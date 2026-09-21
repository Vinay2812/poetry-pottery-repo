// Regenerates every brand asset from the letter outlines in Wordmark.tsx.
// The "o" of Poetry is a closed monoline ring with a coil peeling off it clockwise into a hooked end.
// Rasters are drawn by the headless browser: `node scripts/brand.mjs` then `sh scripts/brand-rasters.sh`.
import { readFileSync, writeFileSync } from "node:fs";

const INK = "#1F1D1A";
const CLAY = "#F7F4EF";
const TSX = "src/components/brand/Wordmark.tsx";
const OUT = "public/brand";

// The circle the old bowl occupied: x 571..1131, y -511..15, so the letters beside it stay put.
const O = { cx: 851, cy: -248, outer: 263 };
const STROKE = 84;
const SWEEP_DEG = 400;
const START_DEG = -60; // one o'clock, clockwise on screen from there
const END_RADIUS = 45;
const CAP_RADIUS = 30;

function spiralPath(cx, cy) {
  const outer = O.outer - STROKE / 2;
  const points = [];
  for (let deg = 0; deg <= SWEEP_DEG; deg += 2) {
    const t = deg / SWEEP_DEG;
    // A steady Archimedean wind: one stroke of air between turns, and it leaves the ring cleanly.
    const r = outer - (outer - END_RADIUS) * t;
    const a = ((START_DEG + deg) * Math.PI) / 180;
    points.push(
      `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`,
    );
  }
  const end = points[points.length - 1].split(" ").map(Number);
  return { d: `M${points[0]}L${points.slice(1).join("L")}`, end };
}

function strokeMarkup(ink, cx, cy) {
  const { d, end } = spiralPath(cx, cy);
  const line = `fill="none" stroke="${ink}" stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round"`;
  return (
    `<circle ${line} cx="${cx}" cy="${cy}" r="${O.outer - STROKE / 2}"/>` +
    `<path ${line} d="${d}"/>` +
    `<circle fill="${ink}" cx="${end[0]}" cy="${end[1]}" r="${CAP_RADIUS}"/>`
  );
}

const svgOpen = (viewBox, extra = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" ${extra}viewBox="${viewBox}" role="img" aria-label="Poetry &amp; Pottery"><title>Poetry &amp; Pottery</title>`;

const tsx = readFileSync(TSX, "utf8");
const letters = tsx.match(/const LETTERS =\s*"([^"]+)"/)[1];
// Idempotent: the bowl is only there on the first run over the original outlines.
const withoutBowl = letters.replace(/M851\.56 15L.*?(?=M1408 -496)/, "");
const pGlyph = letters.match(/^M294 0L.*?(?=M851\.56 15|M1408 -496)/)[0];

// Inline lockup and the component share the same coordinates.
const inline = (ink) =>
  `${svgOpen("22 -673 7420 913")}<path fill="${ink}" d="${withoutBowl}"/>${strokeMarkup(ink, O.cx, O.cy)}</svg>`;
writeFileSync(`${OUT}/wordmark-inline.svg`, inline(INK));
writeFileSync(`${OUT}/wordmark-inline-reverse.svg`, inline(CLAY));

// Stacked: "Poetry" is shifted 506 right on the first line; the second line is already baked in.
const stacked = readFileSync(`${OUT}/wordmark-stacked.svg`, "utf8");
const stackedLetters = stacked.match(/<path fill="#1F1D1A" d="([^"]+)"/)[1];
const stackedWithoutBowl = stackedLetters.replace(
  /M1357\.56 15L.*?(?=M1914 -496)/,
  "",
);
const stackedSvg = (ink) =>
  `${svgOpen("24 -660 3955 1960")}<path fill="${ink}" d="${stackedWithoutBowl}"/>${strokeMarkup(ink, O.cx + 506, O.cy)}</svg>`;
writeFileSync(`${OUT}/wordmark-stacked.svg`, stackedSvg(INK));
writeFileSync(`${OUT}/wordmark-stacked-reverse.svg`, stackedSvg(CLAY));

// The mark alone is the spiral.
const mark = (ink) =>
  `${svgOpen("571 -528 560 560")}${strokeMarkup(ink, O.cx, O.cy)}</svg>`;
writeFileSync(`${OUT}/mark.svg`, mark(INK));
writeFileSync(`${OUT}/mark-reverse.svg`, mark(CLAY));

// App icons carry the P, set on ink: the letter reads at 16px where the coil would blur.
const scale = (64 * 0.68) / 660;
const tx = (64 - 525 * scale) / 2 - 22 * scale;
const ty = (64 - 660 * scale) / 2 + 660 * scale;
const icon = `${svgOpen("0 0 64 64", 'width="64" height="64" ')}<rect width="64" height="64" fill="${INK}"/><g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale.toFixed(4)})"><path fill="${CLAY}" d="${pGlyph}"/></g></svg>`;
writeFileSync(`${OUT}/favicon.svg`, icon);

// Social card: the stacked lockup centred on clay white.
const ogScale = 380 / 1960;
const ogTx = (1200 - 3955 * ogScale) / 2 - 24 * ogScale;
const ogTy = (630 - 1960 * ogScale) / 2 + 660 * ogScale;
const og = `${svgOpen("0 0 1200 630", 'width="1200" height="630" ')}<rect width="1200" height="630" fill="${CLAY}"/><g transform="translate(${ogTx.toFixed(2)} ${ogTy.toFixed(2)}) scale(${ogScale.toFixed(4)})"><path fill="${INK}" d="${stackedWithoutBowl}"/>${strokeMarkup(INK, O.cx + 506, O.cy)}</g></svg>`;
writeFileSync(`${OUT}/og-image.svg`, og);

// The component gets the same drawing.
const { d, end } = spiralPath(O.cx, O.cy);
const nextTsx = tsx
  .replace(/const LETTERS =\s*"[^"]+"/, `const LETTERS =\n  "${withoutBowl}"`)
  .replace(/const SPIRAL =\s*"[^"]+"/, `const SPIRAL =\n  "${d}"`)
  .replace(/const (?:HAIRLINE|STROKE) = \d+;/, `const STROKE = ${STROKE};`)
  .replace(
    /const DOT = \{[^}]+\};/,
    `const DOT = { cx: ${end[0]}, cy: ${end[1]}, r: ${CAP_RADIUS} };`,
  )
  .replace("strokeWidth={HAIRLINE}", "strokeWidth={STROKE}");
writeFileSync(TSX, nextTsx);
console.log("brand assets written");
