# Roke.to api

## Installation

```bash
$ yarn
```

## Running locally

### Start local Postgres DB using docker:

Install `docker` and `docker-compose`.

Start Docker container with Postgres DB:

```bash
docker-compose up -d
```

Export DB env variable:

```bash
export DATABASE_URL=postgres://postgres:pass123@0.0.0.0/postgres
```

### Change TypeORM config for development:

In `ormconfig.ts`:

```diff
-  ssl: {
-    rejectUnauthorized: false,
-  },
+  synchronize: true,
+  ssl: false,
```

Run backend in development mode:

```bash
yarn start:dev
```
