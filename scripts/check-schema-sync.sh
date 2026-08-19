#!/bin/sh
# Used by the pre-push hook: block pushes when schema.gql is stale
# or the frontend disagrees with the schema.
set -e

echo "🔎 schema-sync: emitting schema from API resolvers"
pnpm -C api schema:emit >/dev/null

if ! git diff --exit-code --quiet -- api/schema.gql; then
  echo "❌ schema-sync: api/schema.gql was out of date. It has been regenerated; review and commit it." >&2
  exit 1
fi
echo "✅ schema-sync: api/schema.gql is up to date"

echo "🔎 schema-sync: regenerating frontend hooks against the schema"
SCHEMA_URL=../api/schema.gql pnpm -C frontend codegen >/dev/null

if ! git diff --exit-code --quiet -- frontend/src/graphql/generated; then
  echo "❌ schema-sync: generated GraphQL hooks were out of date. They have been regenerated; review and commit them." >&2
  exit 1
fi
echo "✅ schema-sync: generated hooks are up to date"

echo "🔎 schema-sync: typechecking frontend against the schema"
if ! pnpm -C frontend tsc >/dev/null; then
  echo "❌ schema-sync: frontend does not typecheck against the schema" >&2
  exit 1
fi
echo "✅ schema-sync: schema and frontend are in sync"
