# CLAUDE.md — poetry-pottery repo

Poetry & Pottery: e-commerce for handcrafted pottery with workshop/event management (combined here from `poetry-and-pottery-workspace`). Three independent apps, no workspace, nothing shared: `frontend/` (Next.js 16, port 3030), `api/` (NestJS 11 GraphQL, port 6060), `infra/` (docker compose: Postgres 17 + pgvector on 5433, Redis 8 on 6381; local dev currently points `DATABASE_URL` at the parent workspace's Postgres on 5435 instead). Package manager is pnpm everywhere. Node 24.

This file OVERRIDES any parent/workspace CLAUDE.md where they conflict.

## React component rules (overrides the workspace viewModel convention)

- Presentational components take normal **flat props**: individual scalars plus `on*` callbacks, passed explicitly. **No `viewModel` object props. No `{...spread}` in app code.**
- Containers own state, data fetching, derivation, handlers (`use client`); presentational components stay side-effect free.
- Pure formatting/derivation helpers live in the feature's `types.ts`, unit-tested.
- Naming: `onXxx` callback props, `handleXxx` internal handlers, `isXxx`/`hasXxx` booleans.
- Feature layout: `src/features/<name>/{components,containers,types.ts,index.ts}`.
- Every presentational component gets stories (mobile/tablet/laptop/desktop via `atViewport`).

## Conventions

- Double quotes, LF, Prettier is law (ESLint runs it as a rule in api/).
- `@/` alias for all cross-directory imports (`@test/` for api test helpers); `./x` within a folder.
- GraphQL operations are `.gql` files in `frontend/src/graphql/`; codegen introspects the running API (protected by `SCHEMA_SYNC_KEY` header) or `SCHEMA_URL=../api/schema.gql` offline.
- API is code-first GraphQL: types/services/resolvers per domain module (copy `api/src/users/`). New resolvers must be exported from the resolvers barrel or `schema:emit` silently omits them.
- Auth: identity from Clerk context only, never from GraphQL inputs. `@AuthRequired()`/`@AdminRequired()` decorators; JIT user provisioning in the guard.
- Env is zod-validated in both apps; `.env.example` files list exactly what the code reads — update them together.
- Comments: single-line, sparse, no ticket numbers. No `any`/`@ts-ignore`.

## Verification commands

- api: `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm schema:emit`
- frontend: `pnpm tsc`, `pnpm test`, `pnpm lint`, `pnpm knip`, `pnpm codegen`
- Never run `pnpm dev` to verify; use the commands above. Format with `pnpm prettier:format` in each app before finishing.
- Schema sync is enforced by the pre-push hook (`scripts/check-schema-sync.sh`).
