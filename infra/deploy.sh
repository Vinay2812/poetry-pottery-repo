#!/usr/bin/env bash
# One script for both jobs on an Ubuntu or Debian server:
#
#   first run  (nothing installed yet) -> installs tools, joins Tailscale, clones the repo,
#                                         pulls the env files from R2, starts the stack,
#                                         puts nginx + Let's Encrypt in front of the API
#   later runs (already set up)        -> fast-forwards the checkout, rebuilds the API image,
#                                         applies migrations and swaps the API container
#
# A marker inside .git records completed setup. Interrupted setup runs resume the setup
# path on retry. Use `--full` to repeat setup on an existing installation.
#
# Export before running (required on the first run):
#   export GITHUB_ACCESS_TOKEN=ghp_...   # repo-scoped token; used for the HTTPS clone and never written to disk
#   export R2_ACCOUNT_ID=...             # Cloudflare account id (forms the S3 endpoint)
#   export R2_ACCESS_KEY_ID=...          # R2 API token key with read access to the env bucket
#   export R2_SECRET_ACCESS_KEY=...      # its secret
#   export LETSENCRYPT_EMAIL=...         # contact address for the certificate (any address you own)
#
# On a redeploy only GITHUB_ACCESS_TOKEN is needed, and only if the remote is HTTPS.
# Add PULL_ENVS=1 plus the three R2 credential variables to refresh the env files as well.
#
# Optional (defaults shown):
#   export API_DOMAIN=api-pnp-v2.prodapp.club   # DNS A record must already point at this server
#   export GITHUB_REPO=Vinay2812/poetry-pottery-repo
#   export BRANCH=main
#   export TARGET_DIR=/opt/poetry-pottery
#   export R2_ENV_BUCKET=envs                  # bucket containing the env objects
#   export ENV_PREFIX=poetry-pottery-v2          # objects: <prefix>/{api,frontend,docker}/.env.prod
#   export TS_AUTHKEY=tskey-auth-...            # Tailscale auth key; without it `tailscale up` prints a login URL
#   export TS_HOSTNAME=poetry-pottery-api       # this machine's name on the tailnet
#   export PULL_ENVS=1                          # redeploy: also re-pull the env files from R2
#   export SEED=1                               # run `pnpm db:seed` (site scaffolding) after migrating
#   export REINDEX=1                            # run `pnpm search:reindex` (rebuild every search embedding) after migrating
#   export SKIP_TLS=1                           # nginx on port 80 only, no certbot (first smoke test)
#   export FULL=1                               # force the full setup path even on an existing checkout
#
# Files written on the setup path (each chmod 600):
#   <prefix>/api/.env.prod       -> api/.env
#   <prefix>/frontend/.env.prod  -> frontend/.env
#   <prefix>/docker/.env.prod    -> infra/docker/.env   (+ BIND_HOST=<tailscale ip> appended)
#
# Network layout afterwards:
#   API        127.0.0.1:6060 behind nginx at https://<API_DOMAIN>
#   Data       <tailscale ip>:5433 / 6381 / 5672 / 15672, and the docker network by service name
#   Firewall   ufw allows 22, 80, 443 and the tailscale0 interface; everything else denied
#
# Run as root: sudo -E ./infra/deploy.sh   (add --full to force the setup path)
set -euo pipefail
umask 077

GITHUB_REPO="${GITHUB_REPO:-Vinay2812/poetry-pottery-repo}"
BRANCH="${BRANCH:-main}"
TARGET_DIR="${TARGET_DIR:-/opt/poetry-pottery}"
R2_ENV_BUCKET="${R2_ENV_BUCKET:-envs}"
ENV_PREFIX="${ENV_PREFIX:-poetry-pottery-v2}"
API_DOMAIN="${API_DOMAIN:-api-pnp-v2.prodapp.club}"
TS_HOSTNAME="${TS_HOSTNAME:-poetry-pottery-api}"
[ "${1:-}" = "--full" ] && FULL=1

log() { printf '\n==> %s\n' "$*"; }
apt_install() { DEBIAN_FRONTEND=noninteractive apt-get install -y -q "$@"; }
require() { for name in "$@"; do [ -n "${!name:-}" ] || { echo "set $name" >&2; exit 1; }; done; }

# The repo is cloned over HTTPS with the token; git stores the sanitised URL so the token
# never lands in .git/config, and every later fetch takes it from the environment.
git_remote_url() { printf 'https://github.com/%s.git' "$GITHUB_REPO"; }
git_auth() {
  if [ -n "${GITHUB_ACCESS_TOKEN:-}" ]; then
    GITHUB_HTTP_HEADER="Authorization: Basic $(printf 'x-access-token:%s' "$GITHUB_ACCESS_TOKEN" | base64 | tr -d '\n')" \
      git --config-env=http.https://github.com/.extraheader=GITHUB_HTTP_HEADER "$@"
  else
    git "$@"
  fi
}

# The checkout can exist before env downloads, migrations or TLS setup succeed.
if [ -d "$TARGET_DIR/.git" ] &&
   [ -f "$TARGET_DIR/.git/deploy-setup-complete" ] &&
   [ "${FULL:-0}" != "1" ]; then
  MODE=redeploy
else
  MODE=setup
fi
log "Mode: $MODE (repo $GITHUB_REPO, branch $BRANCH, dir $TARGET_DIR)"

[ "$(id -u)" -eq 0 ] || { echo "run as root: sudo -E ./infra/deploy.sh" >&2; exit 1; }

# ---------------------------------------------------------------- tools (setup only)
if [ "$MODE" = setup ]; then
  rm -f "$TARGET_DIR/.git/deploy-setup-complete"
  command -v apt-get >/dev/null || { echo "this script installs packages with apt; use Ubuntu or Debian" >&2; exit 1; }
  require GITHUB_ACCESS_TOKEN R2_ACCOUNT_ID R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY R2_ENV_BUCKET
  [ "${SKIP_TLS:-0}" = "1" ] || require LETSENCRYPT_EMAIL

  log "Installing missing tools"
  apt-get update -q
  command -v curl >/dev/null || apt_install curl
  command -v git >/dev/null || apt_install git
  apt_install ca-certificates gnupg ufw nginx
  command -v docker >/dev/null || curl -fsSL https://get.docker.com | sh
  docker compose version >/dev/null 2>&1 || apt_install docker-compose-plugin
  systemctl enable --now docker
  if ! command -v aws >/dev/null; then
    apt_install unzip
    curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-$(uname -m).zip" -o /tmp/awscli.zip
    unzip -qo /tmp/awscli.zip -d /tmp && /tmp/aws/install --update && rm -rf /tmp/aws /tmp/awscli.zip
  fi
  if [ "${SKIP_TLS:-0}" != "1" ] && ! command -v certbot >/dev/null; then
    apt_install certbot python3-certbot-nginx
  fi
  command -v tailscale >/dev/null || curl -fsSL https://tailscale.com/install.sh | sh

  log "Joining the tailnet as ${TS_HOSTNAME}"
  systemctl enable --now tailscaled
  if [ -n "${TS_AUTHKEY:-}" ]; then
    tailscale up --authkey "$TS_AUTHKEY" --hostname "$TS_HOSTNAME" --ssh
  else
    # Prints a login URL and waits until the node is authorised.
    tailscale up --hostname "$TS_HOSTNAME" --ssh
  fi
fi

# The data services bind to the tailnet address, so it is resolved on every run, not just setup.
command -v tailscale >/dev/null || { echo "tailscale is not installed; run with --full" >&2; exit 1; }
TS_IP="$(tailscale ip -4 2>/dev/null | head -n1 || true)"
[ -n "$TS_IP" ] || { echo "tailscale has no IPv4 address; run 'tailscale up' and retry" >&2; exit 1; }
log "Tailscale IPv4 is ${TS_IP}"

# ---------------------------------------------------------------- repo
if [ -d "$TARGET_DIR/.git" ]; then
  log "Updating $TARGET_DIR ($BRANCH)"
  cd "$TARGET_DIR"
  BEFORE="$(git rev-parse --short HEAD)"
  git_auth fetch --prune origin
  git checkout -q "$BRANCH"
  git_auth merge --ff-only "origin/$BRANCH"
else
  log "Cloning $GITHUB_REPO ($BRANCH) into $TARGET_DIR"
  git_auth clone --branch "$BRANCH" "$(git_remote_url)" "$TARGET_DIR"
  cd "$TARGET_DIR"
  BEFORE=""
fi
AFTER="$(git rev-parse --short HEAD)"
[ -n "$BEFORE" ] && log "At $AFTER (was $BEFORE)" || log "At $AFTER"

# ---------------------------------------------------------------- env files
if [ "$MODE" = setup ] || [ "${PULL_ENVS:-0}" = "1" ]; then
  require R2_ACCOUNT_ID R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY R2_ENV_BUCKET
  # R2 speaks the S3 API; the AWS CLI needs only the account endpoint and the key pair.
  export AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID"
  export AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"
  export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-auto}"
  R2_ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
  ENV_STAGE="$(mktemp -d)"
  trap 'rm -rf "$ENV_STAGE"' EXIT
  for pair in "api:api/.env" "frontend:frontend/.env" "docker:infra/docker/.env"; do
    name="${pair%%:*}"; dest="${pair#*:}"
    log "Pulling s3://${R2_ENV_BUCKET}/${ENV_PREFIX}/${name}/.env.prod -> ${dest}"
    aws s3 cp "s3://${R2_ENV_BUCKET}/${ENV_PREFIX}/${name}/.env.prod" "$ENV_STAGE/$name" \
      --endpoint-url "$R2_ENDPOINT" --only-show-errors
    chmod 600 "$ENV_STAGE/$name"
  done
  mv "$ENV_STAGE/api" api/.env
  mv "$ENV_STAGE/frontend" frontend/.env
  mv "$ENV_STAGE/docker" infra/docker/.env
  rmdir "$ENV_STAGE"
  trap - EXIT
fi

# Data services listen on the tailnet address only; the API stays on loopback behind nginx.
# Written on every run so a refreshed env file or a changed tailnet address never leaves them on loopback.
[ -f infra/docker/.env ] || { echo "infra/docker/.env is missing; run with PULL_ENVS=1" >&2; exit 1; }
sed -i '/^BIND_HOST=/d;/^API_BIND_HOST=/d' infra/docker/.env
printf 'BIND_HOST=%s\nAPI_BIND_HOST=127.0.0.1\n' "$TS_IP" >> infra/docker/.env
log "Data services bind to ${TS_IP}; the API binds to 127.0.0.1"

# ---------------------------------------------------------------- firewall (setup only)
if [ "$MODE" = setup ]; then
  log "Configuring ufw (22, 80, 443 public; everything else over tailscale0)"
  ufw --force reset >/dev/null
  ufw default deny incoming >/dev/null
  ufw default allow outgoing >/dev/null
  for port in 22 80 443; do ufw allow "${port}/tcp" >/dev/null; done
  ufw allow in on tailscale0 >/dev/null
  ufw --force enable >/dev/null
  # ufw reset/enable flushes iptables, taking Docker's published-port rules with it; a restart reinstalls them.
  systemctl restart docker
fi

# ---------------------------------------------------------------- stack
COMPOSE=(docker compose -f infra/docker/docker-compose.api.yml)

# Postgres reads this bind mount as its unprivileged container user.
chmod -R a+rX infra/docker/initdb

log "Building the API image"
"${COMPOSE[@]}" build api migrate

# Recreated only when their configuration (such as the bind address) changed; data lives in named volumes.
log "Starting Postgres, Redis and RabbitMQ"
"${COMPOSE[@]}" up -d --wait --wait-timeout 120 postgres redis rabbitmq

log "Applying migrations"
"${COMPOSE[@]}" run --rm migrate

if [ "${SEED:-0}" = "1" ]; then
  log "Seeding site scaffolding"
  "${COMPOSE[@]}" run --rm migrate pnpm db:seed
fi

if [ "${REINDEX:-0}" = "1" ]; then
  # Needed once after data arrives outside the API (an import or a restore); the API keeps the index current otherwise.
  log "Rebuilding the search embeddings"
  "${COMPOSE[@]}" run --rm migrate pnpm search:reindex
fi

log "Starting the API on the new image"
"${COMPOSE[@]}" up -d --no-deps api

log "Waiting for the API health check"
healthy=0
for _ in $(seq 1 30); do
  if curl --connect-timeout 2 --max-time 5 -fsS http://127.0.0.1:6060/health >/dev/null 2>&1; then healthy=1; break; fi
  sleep 2
done
[ "$healthy" = 1 ] || { echo "API did not report healthy; see: ${COMPOSE[*]} logs api" >&2; exit 1; }

# ---------------------------------------------------------------- nginx + tls (setup only)
if [ "$MODE" = setup ]; then
  log "Configuring nginx for ${API_DOMAIN}"
  cat > "/etc/nginx/sites-available/${API_DOMAIN}" <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name ${API_DOMAIN};

    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:6060;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;
    }
}
NGINX
  ln -sf "/etc/nginx/sites-available/${API_DOMAIN}" "/etc/nginx/sites-enabled/${API_DOMAIN}"
  rm -f /etc/nginx/sites-enabled/default
  nginx -t
  systemctl enable --now nginx
  systemctl reload nginx

  if [ "${SKIP_TLS:-0}" != "1" ]; then
    log "Requesting a Let's Encrypt certificate for ${API_DOMAIN}"
    certbot --nginx -d "$API_DOMAIN" --non-interactive --agree-tos -m "$LETSENCRYPT_EMAIL" --redirect
    systemctl enable --now certbot.timer 2>/dev/null || true
  fi
fi

docker image prune -f >/dev/null

log "Checking the data services answer on the tailnet address"
port() { grep -E "^$1=" infra/docker/.env | cut -d= -f2 || echo "$2"; }
for target in "Postgres:$(port POSTGRES_PORT 5433)" "Redis:$(port REDIS_PORT 6381)" "RabbitMQ:$(port RABBITMQ_PORT 5672)"; do
  name="${target%%:*}"; p="${target##*:}"
  if timeout 5 bash -c "exec 3<>/dev/tcp/${TS_IP}/${p}" 2>/dev/null; then
    echo "  ${name} reachable on ${TS_IP}:${p}"
  else
    echo "${name} is not reachable on ${TS_IP}:${p}; try 'systemctl restart docker' then rerun, and check 'ufw status' and '${COMPOSE[*]} ps'" >&2
    exit 1
  fi
done

log "Done: $MODE of $BRANCH at $AFTER"
if [ "$MODE" = setup ]; then
  echo "  API        https://${API_DOMAIN}  (nginx -> 127.0.0.1:6060)"
  echo "  Postgres   ${TS_IP}:$(port POSTGRES_PORT 5433)   (tailnet only)"
  echo "  Redis      ${TS_IP}:$(port REDIS_PORT 6381)"
  echo "  RabbitMQ   ${TS_IP}:$(port RABBITMQ_PORT 5672)   (management on $(port RABBITMQ_MANAGEMENT_PORT 15672))"
  echo "  Set TRUSTED_PROXY_HOPS=1 in api/.env so client IPs are read from nginx."
fi
"${COMPOSE[@]}" ps --format 'table {{.Name}}\t{{.Status}}\t{{.Ports}}'
if [ "$MODE" = setup ]; then
  touch "$TARGET_DIR/.git/deploy-setup-complete"
fi
