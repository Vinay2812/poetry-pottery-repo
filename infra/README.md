# Infra

`docker/` holds the compose files (Postgres 17 with pgvector, Redis, RabbitMQ, the API image) and `bootstrap.sh` brings a fresh server up from nothing.

## Bootstrap a server

```bash
R2_ENV_BUCKET=<bucket> R2_ACCOUNT_ID=<id> R2_ACCESS_KEY_ID=<key> R2_SECRET_ACCESS_KEY=<secret> \
  ./infra/bootstrap.sh
```

What it does, in order:

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

Needs `git`, `docker` with compose v2, `aws` and `curl` on the host, and an SSH key that can read the repo.

## Day to day

```bash
docker compose -f infra/docker/docker-compose.api.yml ps
docker compose -f infra/docker/docker-compose.api.yml logs -f api
docker compose -f infra/docker/docker-compose.api.yml run --rm migrate            # migrations
docker compose -f infra/docker/docker-compose.api.yml run --rm migrate pnpm db:seed
```

`docker-compose.db.yml` alone starts only the three data services for local development (host ports 5433, 6381, 5672).
