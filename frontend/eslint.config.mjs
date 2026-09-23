import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

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
  // Deprecated APIs fail the lint, so a library upgrade surfaces what it retired.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/graphql/generated/**"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { "@typescript-eslint": tseslint.plugin },
    rules: { "@typescript-eslint/no-deprecated": "error" },
  },
  // Must stay last: formatting is prettier's job alone.
  prettier,
]);

export default eslintConfig;
