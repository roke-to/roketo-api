# Roke.to api

## Installation

```bash
$ yarn
```

## Running locally (testnet)

### Export all the required testnet env variables

```bash
export NEAR_NETWORK_ID=testnet
export NEAR_NODE_URL=https://rpc.testnet.near.org
export NEAR_WALLET_URL=https://wallet.testnet.near.org
export ROKETO_CONTRACT_NAME=streaming-r-v2.dcversus.testnet
```

### Prepare local Postgres DB using docker:

Install `docker` and `docker-compose`.

Start Docker container with Postgres DB:

```bash
docker-compose up -d
```

Set DB connection string to environment variable:

```bash
export DATABASE_URL=postgres://postgres:pass123@0.0.0.0/postgres
```

Change TypeORM config for development:

In `ormconfig.ts`:

```diff
-  ssl: {
-    rejectUnauthorized: false,
-  },
+  synchronize: true,
+  ssl: false,
```

Build the project before executing migrations:

```bash
yarn build
```

Execute all the built migrations:

```bash
yarn migrate
```

### Run backend in development mode:

```bash
yarn start:dev
```

## Mirroring testnet production DB to local DB

To drop all the data from your local DB and mirror testnet DB run the following command (it should NOT log any errors):

```bash
pg_dump --no-privileges --format c --dbname=postgres://wbfowrsvetlpvg:deb9d553b6b888ee55efa391dbb4a1dbbd1c16d6505534ca962359cb04e926cb@ec2-3-211-221-185.compute-1.amazonaws.com:5432/d9jumvarl5n3c | pg_restore --no-owner --clean --if-exists --dbname=$DATABASE_URL
```

You may need to install `postgresql-14` Linux package or `brew upgrade postgresql` for macOS first.

If you don't have such Linux package for installation, try adding a custom Postgres PPA: https://www.postgresql.org/download/linux/ubuntu/

## Generating migrations for production DBs

Migrations can be generated by comparing live schema of DB with built entities. To generate a migration, do the following:

1. Stop backend from running.
2. Mirror testnet production DB to local DB using the command from the previous paragraph.
3. Build the project with `yarn build` (so all the updated entities files are built).
4. Generate a migration with `yarn typeorm migration:generate -n "MIGRATION_NAME_HERE"` while replacing `MIGRATION_NAME_HERE` placeholder with actual migration name.

At this point you should have a new file generated in `src/migrations` folder. For validation, do the following:

5. Build the project with `yarn build` (so the fresh migration is built).
6. Apply it to DB with `yarn migrate`.
7. Remove `synchronize: true` from ORMConfig file.
8. Run backend as usual.

If it runs without `synchronize: true` option as good as it run with it, then a migration was generated and applied correctly.

## Using with local frontend

Feel free to run client API generation script at any point:

```bash
./generate-and-deploy-api-client.sh
```

After that, use the produced API version in `package.json` of frontend app and change `VITE_WEB_API_URL` in `.env` file to point at you local backend instance.