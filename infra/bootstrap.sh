#!/usr/bin/env bash
# Bootstraps a fresh server: clones the repo, pulls the production env files from R2,
# renames them to .env in each folder, then starts the databases and the API with
# docker compose and applies the migrations.
#
# Export these before running (required):
#   export R2_ACCOUNT_ID=...          # Cloudflare account id (forms the S3 endpoint)
#   export R2_ACCESS_KEY_ID=...       # R2 API token key with read access to the env bucket
#   export R2_SECRET_ACCESS_KEY=...   # its secret
#   export R2_ENV_BUCKET=...          # bucket that holds envs/poetry-potter-v2/...
#
# Optional (defaults shown):
#   export REPO_URL=git@github.com:Vinay2812/poetry-pottery-repo.git
#   export BRANCH=main
#   export TARGET_DIR=./poetry-pottery
#   export ENV_PREFIX=envs/poetry-potter-v2   # objects: <prefix>/{api,frontend,docker}/.env.production
#   export SEED=1                             # also run `pnpm db:seed` (site scaffolding) after migrating
#
# Files written (each chmod 600):
#   <prefix>/api/.env.production       -> api/.env
#   <prefix>/frontend/.env.production  -> frontend/.env
#   <prefix>/docker/.env.production    -> infra/docker/.env
#
# Host needs: git, docker (compose v2), aws (any recent AWS CLI), curl, and an SSH key for the repo.
#
# Usage:
#   ./infra/bootstrap.sh
set -euo pipefail

REPO_URL="${REPO_URL:-git@github.com:Vinay2812/poetry-pottery-repo.git}"
BRANCH="${BRANCH:-main}"
TARGET_DIR="${TARGET_DIR:-./poetry-pottery}"
ENV_PREFIX="${ENV_PREFIX:-envs/poetry-potter-v2}"
: "${R2_ENV_BUCKET:?set R2_ENV_BUCKET}"
: "${R2_ACCOUNT_ID:?set R2_ACCOUNT_ID}"
: "${R2_ACCESS_KEY_ID:?set R2_ACCESS_KEY_ID}"
: "${R2_SECRET_ACCESS_KEY:?set R2_SECRET_ACCESS_KEY}"

log() { printf '\n==> %s\n' "$*"; }

for tool in git docker aws; do
  command -v "$tool" >/dev/null || { echo "missing: $tool" >&2; exit 1; }
done
docker compose version >/dev/null 2>&1 || { echo "docker compose v2 is required" >&2; exit 1; }

if [ -d "$TARGET_DIR/.git" ]; then
  log "Updating $TARGET_DIR ($BRANCH)"
  git -C "$TARGET_DIR" fetch --prune origin
  git -C "$TARGET_DIR" checkout -q "$BRANCH"
  git -C "$TARGET_DIR" pull --ff-only origin "$BRANCH"
else
  log "Cloning $REPO_URL ($BRANCH) into $TARGET_DIR"
  git clone --branch "$BRANCH" "$REPO_URL" "$TARGET_DIR"
fi
cd "$TARGET_DIR"

# R2 speaks the S3 API; the AWS CLI only needs the account endpoint and the key pair.
export AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-auto}"
R2_ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"

pull_env() {
  local name="$1" dest="$2"
  log "Pulling ${ENV_PREFIX}/${name}/.env.production -> ${dest}"
  aws s3 cp "s3://${R2_ENV_BUCKET}/${ENV_PREFIX}/${name}/.env.production" "$dest" --endpoint-url "$R2_ENDPOINT" --only-show-errors
  chmod 600 "$dest"
}
pull_env api api/.env
pull_env frontend frontend/.env
pull_env docker infra/docker/.env

COMPOSE=(docker compose -f infra/docker/docker-compose.api.yml)

log "Starting Postgres, Redis, RabbitMQ and the API"
"${COMPOSE[@]}" up -d --build postgres redis rabbitmq api

log "Applying migrations"
"${COMPOSE[@]}" run --rm --build migrate

if [ "${SEED:-0}" = "1" ]; then
  log "Seeding site scaffolding"
  "${COMPOSE[@]}" run --rm migrate pnpm db:seed
fi

log "Restarting the API so it starts against the migrated schema"
"${COMPOSE[@]}" restart api

log "Waiting for the API health check"
for _ in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:6060/health >/dev/null 2>&1; then
    log "API is up on :6060"
    "${COMPOSE[@]}" ps
    exit 0
  fi
  sleep 2
done
echo "API did not report healthy; see: ${COMPOSE[*]} logs api" >&2
exit 1
