import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import reactHooks from "eslint-plugin-react-hooks";

const eslintConfig = defineConfig([
  globalIgnores([
    ".next/**",
    ".lighthouse/**",
    ".lighthouseci/**",
    "out/**",
    "build/**",
    "coverage/**",
    "storybook-static/**",
    "next-env.d.ts",
    "src/graphql/generated/**",
  ]),
  ...nextVitals,
  ...nextTs,
  // React Compiler lint rules ship with eslint-plugin-react-hooks v7.
  {
    files: ["**/*.{ts,tsx}"],
    extends: [reactHooks.configs.flat["recommended-latest"]],
  },
  // Must stay last: formatting is prettier's job alone.
  prettier,
]);

export default eslintConfig;
