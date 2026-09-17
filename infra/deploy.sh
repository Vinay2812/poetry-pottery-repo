#!/usr/bin/env bash
# Redeploys an already bootstrapped server: fast-forwards the checkout, optionally refreshes the
# env files from R2, rebuilds the API image, applies migrations and restarts the API.
# Run it from anywhere on the server, e.g. `sudo /opt/poetry-pottery/infra/deploy.sh`.
#
# Optional (defaults shown):
#   export TARGET_DIR=/opt/poetry-pottery     # the bootstrapped checkout
#   export BRANCH=main                        # branch to deploy (fast-forward only)
#   export PULL_ENVS=1                        # also re-pull api/frontend/docker envs from R2
#                                             # (then R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENV_BUCKET
#                                             #  and optionally ENV_PREFIX must be exported, as for bootstrap.sh)
#   export SEED=1                             # run `pnpm db:seed` after migrating
#
# Steps: git fetch + fast-forward -> (envs) -> build api image -> migrate -> up -d api -> wait for /health.
# Databases keep running throughout; only the API container is replaced.
set -euo pipefail

TARGET_DIR="${TARGET_DIR:-/opt/poetry-pottery}"
BRANCH="${BRANCH:-main}"
ENV_PREFIX="${ENV_PREFIX:-envs/poetry-potter-v2}"

log() { printf '\n==> %s\n' "$*"; }

cd "$TARGET_DIR"
[ -d .git ] || { echo "$TARGET_DIR is not a checkout; run infra/bootstrap.sh first" >&2; exit 1; }

BEFORE="$(git rev-parse --short HEAD)"
log "Fetching $BRANCH"
git fetch --prune origin
git checkout -q "$BRANCH"
git pull --ff-only origin "$BRANCH"
AFTER="$(git rev-parse --short HEAD)"
log "Deploying $BRANCH at $AFTER (was $BEFORE)"

if [ "${PULL_ENVS:-0}" = "1" ]; then
  : "${R2_ENV_BUCKET:?set R2_ENV_BUCKET}"; : "${R2_ACCOUNT_ID:?set R2_ACCOUNT_ID}"
  : "${R2_ACCESS_KEY_ID:?set R2_ACCESS_KEY_ID}"; : "${R2_SECRET_ACCESS_KEY:?set R2_SECRET_ACCESS_KEY}"
  export AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID" AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY" AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-auto}"
  R2_ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
  # Keep the bind settings bootstrap appended to the docker env.
  BIND_LINES="$(grep -E '^(BIND_HOST|API_BIND_HOST)=' infra/docker/.env || true)"
  for pair in "api:api/.env" "frontend:frontend/.env" "docker:infra/docker/.env"; do
    name="${pair%%:*}"; dest="${pair#*:}"
    log "Pulling ${ENV_PREFIX}/${name}/.env.production -> ${dest}"
    aws s3 cp "s3://${R2_ENV_BUCKET}/${ENV_PREFIX}/${name}/.env.production" "$dest" --endpoint-url "$R2_ENDPOINT" --only-show-errors
    chmod 600 "$dest"
  done
  [ -n "$BIND_LINES" ] && { sed -i '/^BIND_HOST=/d;/^API_BIND_HOST=/d' infra/docker/.env; printf '%s\n' "$BIND_LINES" >> infra/docker/.env; }
fi

COMPOSE=(docker compose -f infra/docker/docker-compose.api.yml)

log "Building the API image"
"${COMPOSE[@]}" build api migrate

log "Applying migrations"
"${COMPOSE[@]}" run --rm migrate

if [ "${SEED:-0}" = "1" ]; then
  log "Seeding site scaffolding"
  "${COMPOSE[@]}" run --rm migrate pnpm db:seed
fi

log "Replacing the API container"
"${COMPOSE[@]}" up -d --no-deps api

log "Waiting for the API health check"
for _ in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:6060/health >/dev/null 2>&1; then
    log "Deployed $AFTER; API healthy on :6060"
    docker image prune -f >/dev/null
    exit 0
  fi
  sleep 2
done
echo "API did not report healthy after the deploy; see: ${COMPOSE[*]} logs api" >&2
exit 1
