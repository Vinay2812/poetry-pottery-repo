import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// typescript-react-apollo@5 emits `use*SuspenseQuery` overloads that do not
// typecheck against Apollo Client v4 (and ship a `@ts-ignore`). We use
// `useQuery`, so the block is removed to keep the generated file strict.
const target = resolve(
  import.meta.dirname,
  "../src/graphql/generated/graphql.tsx",
);

const SUSPENSE_BLOCK =
  /\/\/ @ts-ignore\nexport function use\w+SuspenseQuery[\s\S]*?\n {8}\}\n/g;
const SUSPENSE_RESULT = /^export type \w+SuspenseQueryHookResult = .*\n/gm;

const original = readFileSync(target, "utf8");
const stripped = original
  .replace(SUSPENSE_BLOCK, "")
  .replace(SUSPENSE_RESULT, "");

if (stripped === original) {
  console.error(
    `No suspense hooks found in ${target}; check the codegen setup.`,
  );
  process.exit(1);
}

writeFileSync(target, stripped);
