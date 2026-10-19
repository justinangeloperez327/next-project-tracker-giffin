# GIFFIN Project Tracker

Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/ui source components, Prisma ORM 7.10.1 and PostgreSQL. Node.js 24+; GitHub Actions uses Node.js 24 on Ubuntu 24.04.

## Features

- Login/register homepage, About and Contact.
- Protected dashboard, searchable project register, categories, settings and profile.
- Project columns: SO No, JO No, Project Name, Client, Contract Price (AED), Category.
- Substation: any number of named door types per project, plus Grating beam support and Grating panel trackers. Each has optional site measurement, drawing issued, delivery and installation dates, and remarks. Add or rename door types; names are unique per project, ignoring case and surrounding spaces.
- Bus Shelters: total and installed counts, remaining quantity and installation percentage. Installed counts cannot exceed the total.
- Guardrail and Handrail trackers are deferred.
- Persistent light/dark mode. Each account currently owns its own projects; team sharing and administrator roles are future work.

## Vercel + Prisma Postgres (manual deployment)

1. In your Vercel project's Storage tab, create/connect **Prisma Postgres** through the Vercel Marketplace. Connect the environments you intend to use. Use separate databases for production and previews when they should not share data.
2. The integration supplies `DATABASE_URL`. This app requires the PostgreSQL TCP URL (`postgres://` or `postgresql://`), not an older `prisma+postgres://` Accelerate URL.
3. For production traffic, obtain the pooled TCP URL from Prisma Console and add it as `DATABASE_URL_POOLED`. The app prefers that value and falls back to `DATABASE_URL`; Prisma migrations use the direct `DATABASE_URL`.
4. Manually deploy with Node.js 24. `vercel.json` disables Git-triggered deployments and sets the build command to `npm run vercel-build`. That command applies committed migrations, generates Prisma Client and builds Next.js. No local development setup is required for deployment.

No database has been provisioned or connected by this repository change. Database credentials belong in Vercel environment variables, never in Git. No default account is created; register from the homepage.

Reference: [Prisma Postgres on Vercel](https://www.prisma.io/docs/guides/postgres/vercel).

## Local development (optional)

```sh
npm ci
# Copy .env.example to .env.local and set DATABASE_URL.
npm run db:migrate
npm run dev
```

The migration wrapper and Prisma configuration load `.env.local` and `.env`, without overriding environment variables already supplied by Vercel or CI. Runtime database initialization is lazy, so `npm run build` does not require a live database. `npm run vercel-build` does require the database because it applies migrations.

## Migrations and existing installations

`prisma/schema.prisma` contains the models. Committed SQL in `prisma/migrations` preserves database constraints (including category checks, valid shelter counts and case-insensitive door type names). Apply schema changes using Prisma Migrate, not `db push`, so these constraints remain present.

Migration 003 copies the previous single Doors tracker into a named **General doors** type, preserving every date and remark. The previous record remains in the database for preservation; new door edits use named types.

If a database was created using the old SQL migration runner, Prisma needs a one-time baseline before `migrate deploy`. Inspect the existing tables against the first two committed migrations, then mark only migrations whose complete schema already exists as applied:

```sh
npx prisma migrate resolve --applied 202610190001_initial
# Only if the substation and bus shelter tracker tables already exist with their constraints:
npx prisma migrate resolve --applied 202610190002_category_trackers
npm run db:migrate
```

Do not baseline an empty database or mark a migration applied if its tables/constraints are missing. Fresh databases need only `npm run db:migrate`.

## Validation

```sh
npm test
npm run db:validate
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

CI provisions PostgreSQL 17, generates Prisma Client, applies migrations, validates the schema, runs unit tests, typechecks, builds, and runs desktop/mobile Chromium tests. Tests cover dates, shelter counts, project access control and customizable door types. Production credentials are not used by CI.

## Current limits

Project editing/deletion, door type deletion, team sharing, password reset, email verification and administration are not implemented. Registration is public; restrict access before storing confidential company records. Contact email and telephone remain unconfigured until verified details are provided.
