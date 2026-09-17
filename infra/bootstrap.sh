#!/usr/bin/env bash
# Bootstraps a fresh Ubuntu/Debian server for the Poetry & Pottery API:
#   1. installs anything missing (git, docker + compose, aws cli, curl, nginx, certbot, tailscale, ufw)
#   2. joins the tailnet so Postgres, Redis and RabbitMQ are reachable only over Tailscale (or inside docker)
#   3. clones the repo, pulls the production env files from R2 and renames them to .env
#   4. starts the databases and the API, applies migrations
#   5. puts nginx in front of the API on https://<API_DOMAIN> with a Let's Encrypt certificate
#
# Export these before running (required):
#   export R2_ACCOUNT_ID=...          # Cloudflare account id (forms the S3 endpoint)
#   export R2_ACCESS_KEY_ID=...       # R2 API token key with read access to the env bucket
#   export R2_SECRET_ACCESS_KEY=...   # its secret
#   export R2_ENV_BUCKET=...          # bucket that holds envs/poetry-potter-v2/...
#   export LETSENCRYPT_EMAIL=...      # for the certificate on API_DOMAIN
#
# Optional (defaults shown):
#   export API_DOMAIN=api-pnp-v2.prodapp.club   # DNS A record must already point at this server
#   export TS_AUTHKEY=tskey-auth-...            # Tailscale auth key; without it `tailscale up` prints a login URL
#   export TS_HOSTNAME=poetry-pottery-api       # name of this machine on the tailnet
#   export REPO_URL=git@github.com:Vinay2812/poetry-pottery-repo.git
#   export BRANCH=main
#   export TARGET_DIR=/opt/poetry-pottery
#   export ENV_PREFIX=envs/poetry-potter-v2     # objects: <prefix>/{api,frontend,docker}/.env.production
#   export SEED=1                               # also run `pnpm db:seed` (site scaffolding) after migrating
#   export SKIP_TLS=1                           # nginx on port 80 only (no certbot), for a first smoke test
#
# Files written (each chmod 600):
#   <prefix>/api/.env.production       -> api/.env
#   <prefix>/frontend/.env.production  -> frontend/.env
#   <prefix>/docker/.env.production    -> infra/docker/.env   (+ BIND_HOST=<tailscale ip> appended)
#
# Network layout after the run:
#   api        127.0.0.1:6060  <- nginx https://<API_DOMAIN>
#   postgres   <tailscale ip>:5433, redis :6381, rabbitmq :5672/:15672  (tailnet only; docker services use the internal network)
#   firewall   ufw allows 22, 80, 443 and the tailscale0 interface; everything else is denied
#
# Run as root (or with sudo). Usage:
#   sudo -E ./infra/bootstrap.sh
set -euo pipefail

REPO_URL="${REPO_URL:-git@github.com:Vinay2812/poetry-pottery-repo.git}"
BRANCH="${BRANCH:-main}"
TARGET_DIR="${TARGET_DIR:-/opt/poetry-pottery}"
ENV_PREFIX="${ENV_PREFIX:-envs/poetry-potter-v2}"
API_DOMAIN="${API_DOMAIN:-api-pnp-v2.prodapp.club}"
TS_HOSTNAME="${TS_HOSTNAME:-poetry-pottery-api}"
: "${R2_ENV_BUCKET:?set R2_ENV_BUCKET}"
: "${R2_ACCOUNT_ID:?set R2_ACCOUNT_ID}"
: "${R2_ACCESS_KEY_ID:?set R2_ACCESS_KEY_ID}"
: "${R2_SECRET_ACCESS_KEY:?set R2_SECRET_ACCESS_KEY}"
if [ "${SKIP_TLS:-0}" != "1" ]; then : "${LETSENCRYPT_EMAIL:?set LETSENCRYPT_EMAIL (or SKIP_TLS=1)}"; fi

log() { printf '\n==> %s\n' "$*"; }
need_root() { [ "$(id -u)" -eq 0 ] || { echo "run as root (sudo -E ./infra/bootstrap.sh)" >&2; exit 1; }; }
apt_install() { DEBIAN_FRONTEND=noninteractive apt-get install -y -q "$@"; }

need_root
command -v apt-get >/dev/null || { echo "this script installs packages with apt; use Ubuntu or Debian" >&2; exit 1; }

# ---------------------------------------------------------------- 1. tools
log "Installing missing tools"
apt-get update -q
command -v curl >/dev/null || apt_install curl
command -v git >/dev/null || apt_install git
apt_install ca-certificates gnupg ufw nginx
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sh
fi
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
if ! command -v tailscale >/dev/null; then
  curl -fsSL https://tailscale.com/install.sh | sh
fi

# ---------------------------------------------------------------- 2. tailscale
log "Joining the tailnet as ${TS_HOSTNAME}"
systemctl enable --now tailscaled
if [ -n "${TS_AUTHKEY:-}" ]; then
  tailscale up --authkey "$TS_AUTHKEY" --hostname "$TS_HOSTNAME" --ssh
else
  # Prints a login URL; the script waits until the node is authorised.
  tailscale up --hostname "$TS_HOSTNAME" --ssh
fi
TS_IP="$(tailscale ip -4 | head -n1)"
[ -n "$TS_IP" ] || { echo "tailscale did not report an IPv4 address" >&2; exit 1; }
log "Tailscale IPv4 is ${TS_IP}"

# ---------------------------------------------------------------- 3. repo + envs
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

# Data services listen on the tailnet address only; the API stays on loopback behind nginx.
sed -i '/^BIND_HOST=/d;/^API_BIND_HOST=/d' infra/docker/.env
printf 'BIND_HOST=%s\nAPI_BIND_HOST=127.0.0.1\n' "$TS_IP" >> infra/docker/.env

# ---------------------------------------------------------------- 4. firewall
log "Configuring ufw (22, 80, 443 public; everything else via tailscale0)"
ufw --force reset >/dev/null
ufw default deny incoming >/dev/null
ufw default allow outgoing >/dev/null
ufw allow 22/tcp >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
ufw allow in on tailscale0 >/dev/null
ufw --force enable >/dev/null

# ---------------------------------------------------------------- 5. stack
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
healthy=0
for _ in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:6060/health >/dev/null 2>&1; then healthy=1; break; fi
  sleep 2
done
[ "$healthy" = 1 ] || { echo "API did not report healthy; see: ${COMPOSE[*]} logs api" >&2; exit 1; }

# ---------------------------------------------------------------- 6. nginx + tls
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

log "Done"
echo "  API        https://${API_DOMAIN}  (nginx -> 127.0.0.1:6060)"
echo "  Postgres   ${TS_IP}:$(grep -E '^POSTGRES_PORT=' infra/docker/.env | cut -d= -f2 || echo 5433)  (tailnet only)"
echo "  Redis      ${TS_IP}:$(grep -E '^REDIS_PORT=' infra/docker/.env | cut -d= -f2 || echo 6381)"
echo "  RabbitMQ   ${TS_IP}:$(grep -E '^RABBITMQ_PORT=' infra/docker/.env | cut -d= -f2 || echo 5672)  (management on $(grep -E '^RABBITMQ_MANAGEMENT_PORT=' infra/docker/.env | cut -d= -f2 || echo 15672))"
echo "  The API's TRUSTED_PROXY_HOPS in api/.env should be 1 so client IPs are read from nginx."
"${COMPOSE[@]}" ps
