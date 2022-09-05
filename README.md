# Roke.to api

## Installation

```bash
$ yarn
```

## Running locally

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

## Populating local DB with Testnet Production data 

To drop all the data from your local DB and mirror testnet DB run the following command: 

```bash
pg_dump --no-privileges --no-owner --create --clean --if-exists --format c --dbname=postgres://wbfowrsvetlpvg:deb9d553b6b888ee55efa391dbb4a1dbbd1c16d6505534ca962359cb04e926cb@ec2-3-211-221-185.compute-1.amazonaws.com:5432/d9jumvarl5n3c | pg_restore --dbname=$DATABASE_URL
```

You may need to install `postgresql-14` Linux package or `brew upgrade postgresql` for macOS first.

If you don't have such Linux package for installation, try adding a custom Postgres PPA: https://www.postgresql.org/download/linux/ubuntu/

## Using with local frontend

Feel free to run client API generation script at any point:

```bash
./generate-and-deploy-api-client.sh
```

After that, use the produced API version in `package.json` of frontend app and change `VITE_WEB_API_URL` in `.env` file to point at you local backend instance.