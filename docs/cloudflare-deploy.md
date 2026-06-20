# Cloudflare Deployment

SubBoost can run on Cloudflare Workers through OpenNext for Cloudflare. The app is not a static Pages site: it needs server routes, scheduled refreshes, and a PostgreSQL database.

## Requirements

- Node.js matching the root `package.json` engine.
- A Cloudflare account with Workers enabled.
- A PostgreSQL database. For production Workers, use Cloudflare Hyperdrive in front of PostgreSQL.
- `APP_URL`, `ENCRYPTION_KEY`, `JWT_SECRET`, and `CRON_SECRET` configured as Worker variables or secrets.

## Prepare

Install dependencies from the repository root:

```bash
npm ci
```

Copy the local Worker variables example for preview:

```bash
copy local\.dev.vars.example local\.dev.vars
```

Fill in `local/.dev.vars` with real values. This file is ignored by git.

Run database migrations against the target PostgreSQL database before deploying:

```bash
cd local
npm run db:migrate
```

## Hyperdrive

Create a Hyperdrive config for the PostgreSQL database:

```bash
cd local
npx wrangler hyperdrive create subboost-db --connection-string="postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public"
```

Copy the returned Hyperdrive id into `local/wrangler.jsonc` by uncommenting the `hyperdrive` block. At runtime SubBoost prefers `HYPERDRIVE.connectionString`; if no Hyperdrive binding is present, it falls back to `DATABASE_URL`.

## Secrets And Variables

Set the required runtime values:

```bash
cd local
npx wrangler secret put ENCRYPTION_KEY
npx wrangler secret put JWT_SECRET
npx wrangler secret put CRON_SECRET
npx wrangler secret put APP_URL
```

`APP_URL` should be the public `https://...` URL for the Worker or custom domain.

Optional:

```bash
npx wrangler secret put GITHUB_TOKEN
```

## Preview

From the repository root:

```bash
npm run cf:preview
```

This builds the Next.js app with OpenNext and starts `wrangler dev` using `local/wrangler.jsonc`.

## Deploy

From the repository root:

```bash
npm run cf:deploy
```

The Worker wrapper in `local/cloudflare/worker.js` delegates normal traffic to the OpenNext worker. Cloudflare Cron Triggers call the existing `/api/cron/update-subscriptions` route every five minutes, authenticated with `CRON_SECRET`.
