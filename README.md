# GIFFIN Project Tracker

Next.js App Router, React, TypeScript, Tailwind CSS v4 and shadcn/ui-style source components (Radix Slot, CVA, and the shadcn registry configuration). Node.js **24+**; GitHub Actions runs on Node.js **24**.

## Included

- Login and registration on the homepage; About and Contact pages.
- Protected dashboard with project counts, AED contract totals, clients and category distribution.
- Project register: SO No, JO No, Project Name, Client, Contract Price, Category.
- Project creation, search and category filtering.
- Categories: Substation, Guardrail, Handrail, Bus Shelters.
- Profile name editing, settings and persistent light/dark mode.
- PostgreSQL-backed accounts, scrypt password hashes and expiring, hashed opaque sessions in HTTP-only cookies. Next.js server actions handle mutations and same-origin checks. Login/registration attempts are limited per email.
- Account-scoped projects: each user sees their own register. Shared company workspace and administrator roles are future work.
- Playwright desktop and mobile Chromium coverage, including account isolation.

## Setup

1. Install Node.js 24 or newer and PostgreSQL 17.
2. Copy `.env.example` to `.env.local`, set `DATABASE_URL` for your database.
3. Run `npm ci`.
4. Run `node --env-file=.env.local scripts/migrate.mjs`.
5. Run `npm run dev`.

Register from the homepage. No default credentials are created. Passwords require 12–128 characters.

## Checks

With `DATABASE_URL` exported and database migrated:

```sh
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

CI provisions PostgreSQL, migrates, typechecks, builds, and runs desktop/mobile Playwright tests on Node.js 24. No deployment workflow is configured. Deploy manually, set `DATABASE_URL`, and apply migrations before use. Use your database provider's TLS connection settings and keep certificate verification enabled.

## Current scope

Initial working foundation. Project editing/deletion, team sharing, password reset, email verification and administration are not implemented. Public self-registration is enabled; gate registration before exposing confidential company data. Contact information is intentionally unconfigured until verified company details are supplied. No example financial records are seeded.

A package lock is included. Local TypeScript checking and the production build passed. Playwright tests are configured, but full database integration runs require PostgreSQL. CI provisions PostgreSQL and Chromium for those checks.
