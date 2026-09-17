# Infra

`docker/` holds the compose files (Postgres 17 with pgvector, Redis, RabbitMQ, the API image) and `bootstrap.sh` brings a fresh server up from nothing.

## Bootstrap a server

On a fresh Ubuntu or Debian box, as root:

```bash
export R2_ENV_BUCKET=<bucket> R2_ACCOUNT_ID=<id> R2_ACCESS_KEY_ID=<key> R2_SECRET_ACCESS_KEY=<secret>
export LETSENCRYPT_EMAIL=you@example.com TS_AUTHKEY=tskey-auth-...   # TS_AUTHKEY optional: without it tailscale prints a login URL
sudo -E ./infra/bootstrap.sh
```

What it does, in order:

0. Installs whatever is missing: git, docker with compose v2, the AWS CLI, curl, nginx, certbot, tailscale, ufw.
0. Joins the tailnet (`TS_HOSTNAME`, default `poetry-pottery-api`, with Tailscale SSH enabled) and reads the node's Tailscale IPv4.
1. Clones the repo (or fast-forwards an existing checkout) at `BRANCH` (default `main`) into `TARGET_DIR` (default `./poetry-pottery`).
2. Pulls the production env files from R2 with the AWS CLI (R2 speaks S3) and renames each to `.env` in its folder:

   | Object in the bucket                                  | Written to           |
   | ----------------------------------------------------- | -------------------- |
   | `envs/poetry-potter-v2/api/.env.production`           | `api/.env`           |
   | `envs/poetry-potter-v2/frontend/.env.production`      | `frontend/.env`      |
   | `envs/poetry-potter-v2/docker/.env.production`        | `infra/docker/.env`  |

   Override the prefix with `ENV_PREFIX`.
3. Starts Postgres, Redis, RabbitMQ and the API (`docker compose -f infra/docker/docker-compose.api.yml up -d --build`).
4. Applies migrations through the one-off `migrate` service (build stage of the API image, so the Prisma CLI is available), seeds the site scaffolding when `SEED=1`, restarts the API and waits for `/health`.
5. Writes an nginx server block for `API_DOMAIN` (default `api-pnp-v2.prodapp.club`) proxying to `127.0.0.1:6060`, then requests a Let's Encrypt certificate with certbot and turns on the HTTPS redirect (`SKIP_TLS=1` keeps plain HTTP for a first smoke test). The DNS A record must already point at the server. Set `TRUSTED_PROXY_HOPS=1` in the API env so client IPs come from nginx.

Network layout afterwards:

| Service | Reachable from |
| --- | --- |
| API | `https://<API_DOMAIN>` through nginx; `127.0.0.1:6060` on the box |
| Postgres, Redis, RabbitMQ | the docker network by service name (`postgres:5432`, `redis:6379`, `rabbitmq:5672`) and the tailnet at `<tailscale ip>:5433 / 6381 / 5672 / 15672` (`BIND_HOST` in `infra/docker/.env`) |
| Firewall | ufw allows 22, 80, 443 and the `tailscale0` interface; nothing else |

To reach the database from your laptop: join the same tailnet and connect to `<tailscale ip>:5433` with the credentials from `infra/docker/.env`.

Needs an SSH key on the server that can read the repo (a deploy key is fine).

## Day to day

```bash
docker compose -f infra/docker/docker-compose.api.yml ps
docker compose -f infra/docker/docker-compose.api.yml logs -f api
docker compose -f infra/docker/docker-compose.api.yml run --rm migrate            # migrations
docker compose -f infra/docker/docker-compose.api.yml run --rm migrate pnpm db:seed
```

`docker-compose.db.yml` alone starts only the three data services for local development (host ports 5433, 6381, 5672).
