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
export GITHUB_ACCESS_TOKEN=ghp_...
export R2_ENV_BUCKET=<bucket> R2_ACCOUNT_ID=<id> R2_ACCESS_KEY_ID=<key> R2_SECRET_ACCESS_KEY=<secret>
sudo -E /opt/poetry-pottery/infra/deploy.sh   # ship main; the env files are re-pulled from R2 every time
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

A redeploy runs only steps 3, 4 and 6: fast-forward, refresh the env files, rebuild the image, migrate, swap the API container, wait for `/health`. Databases, nginx, the firewall and Tailscale are untouched. The env files are pulled from R2 on every run, so edit them in the bucket, never on the box.

Network layout afterwards:

| Service | Reachable from |
| --- | --- |
| API | `https://<API_DOMAIN>` through nginx; `127.0.0.1:6060` on the box |
| Postgres, Redis, RabbitMQ | the docker network by service name (`postgres:5432`, `redis:6379`, `rabbitmq:5672`) and the tailnet at `<tailscale ip>:5433 / 6381 / 5672 / 15672` |
| Firewall | ufw allows 22, 80, 443 and the `tailscale0` interface; nothing else |

To reach the database from your laptop: join the same tailnet and connect to `<tailscale ip>:5433` with the credentials from `infra/docker/.env`.

## Deploy from GitHub

`.github/workflows/deploy-api.yml` runs on every push to `main` that touches `api/` or `infra/` (and by hand from the Actions tab). It opens an SSH session to the server and runs `~/deploy.sh` there; that script holds every credential the deploy needs.

One-time setup:

1. On the server, as the user that will deploy (root is fine; any other user needs `NOPASSWD:SETENV` sudo for `/opt/poetry-pottery/infra/deploy.sh`), create `~/deploy.sh` with mode 700:

   ```bash
   #!/usr/bin/env bash
   set -euo pipefail
   export GITHUB_ACCESS_TOKEN=ghp_...
   export R2_ENV_BUCKET=<bucket> R2_ACCOUNT_ID=<id> R2_ACCESS_KEY_ID=<key> R2_SECRET_ACCESS_KEY=<secret>
   exec sudo -E /opt/poetry-pottery/infra/deploy.sh
   ```

2. On your machine, make a key for the workflow, put the public half on the server, and upload the private half and the server's host key to the env bucket:

   ```bash
   ssh-keygen -t ed25519 -f ./deploy_key -C github-deploy -N ""
   ssh-copy-id -i ./deploy_key.pub <user>@<server>
   ssh-keyscan -H <server> > known_hosts
   aws s3 cp deploy_key   s3://<bucket>/poetry-pottery-v2/ssh/deploy_key   --endpoint-url https://<account-id>.r2.cloudflarestorage.com
   aws s3 cp known_hosts  s3://<bucket>/poetry-pottery-v2/ssh/known_hosts  --endpoint-url https://<account-id>.r2.cloudflarestorage.com
   rm deploy_key deploy_key.pub known_hosts
   ```

   A different object prefix goes in a repo variable `DEPLOY_SSH_PREFIX`.

3. In the GitHub repo, Settings → Secrets and variables → Actions, add:

   | Secret | Value |
   | --- | --- |
   | `DEPLOY_HOST` | the server's public IP or DNS name (port 22 is open to the internet) |
   | `DEPLOY_USER` | the server user from step 1 |
   | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENV_BUCKET` | the same R2 values the deploy script uses; the token only needs read access |

The run's log shows the deploy script's own output, ending in the container table and the tailnet reachability check.

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
