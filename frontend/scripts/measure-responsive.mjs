// Measures computed styles of rendered components across breakpoint stories.
// Usage: build storybook, serve storybook-static on :6100, then `node scripts/measure-responsive.mjs`.
import { chromium } from "playwright";

const BASE = "http://localhost:6100/iframe.html?viewMode=story&id=";
const BREAKPOINTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  laptop: { width: 1366, height: 768 },
};
const PROBES = [
  { story: "ui-button", sel: "figure button", label: "button" },
  { story: "ui-input", sel: "figure input", label: "input" },
  { story: "ui-card", sel: "figure > div:first-child", label: "card" },
  { story: "ui-badge", sel: "figure span", label: "badge" },
  { story: "ui-table", sel: "figure table", label: "table" },
];

const browser = await chromium.launch();
for (const probe of PROBES) {
  const rows = [];
  for (const [bp, viewport] of Object.entries(BREAKPOINTS)) {
    const page = await browser.newPage({ viewport });
    await page.goto(`${BASE}${probe.story}--${bp}`, {
      waitUntil: "networkidle",
    });
    const el = page.locator(probe.sel).first();
    const m = await el.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      const css = getComputedStyle(node);
      return {
        w: Math.round(rect.width),
        h: Math.round(rect.height),
        font: css.fontSize,
        pad: `${css.paddingTop} ${css.paddingLeft}`,
      };
    });
    const fig = await page
      .locator("figure")
      .first()
      .evaluate((node) => Math.round(node.getBoundingClientRect().width));
    rows.push({ bp, ...m, figureW: fig });
    await page.close();
  }
  console.log(`\n== ${probe.label} ==`);
  for (const r of rows)
    console.log(
      `${r.bp.padEnd(7)} w=${String(r.w).padEnd(4)} h=${String(r.h).padEnd(3)} font=${r.font.padEnd(5)} pad=${r.pad.padEnd(12)} figure=${r.figureW}`,
    );
}
await browser.close();
