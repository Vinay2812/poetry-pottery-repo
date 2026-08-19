import { existsSync } from "node:fs";
import { resolve } from "node:path";

// Existing process.env values win, matching `node --env-file` semantics.
export function loadDotEnv(fileName = ".env"): void {
  const path = resolve(process.cwd(), fileName);
  if (!existsSync(path)) {
    return;
  }
  process.loadEnvFile(path);
}
