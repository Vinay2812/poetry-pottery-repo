# Infra

`docker/` holds the compose files (Postgres 17 with pgvector, Redis, RabbitMQ, the API image) and `deploy.sh` both sets up a fresh server and ships later releases.

## Set up or deploy a server

One script does both. It looks for a git checkout in `TARGET_DIR` (default `/opt/poetry-pottery`): if there is none it runs the full setup, otherwise it redeploys. `--full` forces setup.

First run on a fresh Ubuntu or Debian box:

```bash
export GITHUB_ACCESS_TOKEN=ghp_...            # repo-scoped token, used for the HTTPS clone
export R2_ENV_BUCKET=<bucket> R2_ACCOUNT_ID=<id> R2_ACCESS_KEY_ID=<key> R2_SECRET_ACCESS_KEY=<secret>
export LETSENCRYPT_EMAIL=you@example.com
export TS_AUTHKEY=tskey-auth-...              # optional; without it tailscale prints a login URL
sudo -E ./infra/deploy.sh
```

Later releases:

```bash
sudo -E GITHUB_ACCESS_TOKEN=ghp_... /opt/poetry-pottery/infra/deploy.sh                # ship main
sudo -E GITHUB_ACCESS_TOKEN=ghp_... PULL_ENVS=1 ... /opt/poetry-pottery/infra/deploy.sh  # also refresh the envs
```

Setup does, in order:

1. Installs whatever is missing: git, docker with compose v2, the AWS CLI, curl, nginx, certbot, tailscale, ufw.
2. Joins the tailnet (`TS_HOSTNAME`, default `poetry-pottery-api`, Tailscale SSH on) and reads the node's IPv4.
3. Clones the repo over HTTPS with `GITHUB_ACCESS_TOKEN`. The token is passed per command, so it is never written into `.git/config`.
4. Pulls the production env files from R2 and renames each to `.env`:

   | Object in the bucket                             | Written to          |
   | ------------------------------------------------ | ------------------- |
   | `envs/poetry-potter-v2/api/.env.production`      | `api/.env`          |
   | `envs/poetry-potter-v2/frontend/.env.production` | `frontend/.env`     |
   | `envs/poetry-potter-v2/docker/.env.production`   | `infra/docker/.env` |

   Override the prefix with `ENV_PREFIX`. `BIND_HOST` is appended afterwards so the data services listen on the Tailscale address.
5. Locks the firewall to 22, 80, 443 and the `tailscale0` interface, then restarts Docker: `ufw reset`/`enable` flushes the iptables rules Docker uses to publish ports, and running containers are not recreated on their own.
6. Starts Postgres, Redis, RabbitMQ and the API, applies migrations through the one-off `migrate` service (the build stage of the API image, so the Prisma CLI is there), seeds the site scaffolding when `SEED=1`, and waits for `/health`.
7. Writes an nginx server block for `API_DOMAIN` (default `api-pnp-v2.prodapp.club`) proxying to `127.0.0.1:6060`, then requests a Let's Encrypt certificate and turns on the HTTPS redirect. `SKIP_TLS=1` keeps plain HTTP for a first smoke test. The DNS A record must already point at the server, and `TRUSTED_PROXY_HOPS=1` belongs in the API env so client IPs come from nginx.

Every run ends by opening a TCP connection to Postgres, Redis and RabbitMQ on the Tailscale address and fails if one does not answer.

A redeploy runs only steps 3 and 6: fast-forward, rebuild the image, migrate, swap the API container, wait for `/health`. Databases, nginx, the firewall and Tailscale are untouched, and `PULL_ENVS=1` adds the env refresh.

Network layout afterwards:

| Service | Reachable from |
| --- | --- |
| API | `https://<API_DOMAIN>` through nginx; `127.0.0.1:6060` on the box |
| Postgres, Redis, RabbitMQ | the docker network by service name (`postgres:5432`, `redis:6379`, `rabbitmq:5672`) and the tailnet at `<tailscale ip>:5433 / 6381 / 5672 / 15672` |
| Firewall | ufw allows 22, 80, 443 and the `tailscale0` interface; nothing else |

To reach the database from your laptop: join the same tailnet and connect to `<tailscale ip>:5433` with the credentials from `infra/docker/.env`.

## Day to day

```bash
docker compose -f infra/docker/docker-compose.api.yml ps
docker compose -f infra/docker/docker-compose.api.yml logs -f api
docker compose -f infra/docker/docker-compose.api.yml run --rm migrate            # migrations
docker compose -f infra/docker/docker-compose.api.yml run --rm migrate pnpm db:seed
docker compose -f infra/docker/docker-compose.api.yml run --rm migrate pnpm search:reindex   # after an import or restore
```

To see whether the search index is complete, count the pieces and evenings still missing an embedding (zero means indexed):

```bash
docker compose -f infra/docker/docker-compose.api.yml exec postgres \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "select (select count(*) from products where embedding is null) as products_missing, (select count(*) from events where embedding is null) as events_missing;"
```

`docker-compose.db.yml` alone starts only the three data services for local development (host ports 5433, 6381, 5672).
