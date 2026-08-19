import { spawnSync } from "node:child_process";
import { chromium } from "playwright";

// lhci needs a Chrome binary; fall back to the Playwright download that the
// Storybook browser tests already require.
const chromePath = process.env.CHROME_PATH ?? chromium.executablePath();

const configs = ["lighthouserc.json", "lighthouserc.mobile.json"];

for (const config of configs) {
  const result = spawnSync("lhci", ["autorun", `--config=${config}`], {
    stdio: "inherit",
    env: { ...process.env, CHROME_PATH: chromePath },
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
