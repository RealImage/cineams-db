# Support the database locally and in Lovable

## Confirmed cause
Your Docker database is running on your computer, but the Lovable preview runs elsewhere. In the preview, `127.0.0.1:5432` points to the preview environment—not your computer—so both dashboard requests fail with `ECONNREFUSED`.

## Plan
1. Preserve the existing local setup: local development continues using the `cineams-db` Docker container and the current local `DATABASE_URL` default.
2. Enable Lovable Cloud for a hosted PostgreSQL database that the preview and published app can reach.
3. Apply the existing schema migrations and seed data to the hosted database, adapting only incompatible SQL if required.
4. Configure the preview API to use the hosted database through a protected environment secret, while retaining the local fallback for development on your computer.
5. Verify the health endpoint, theatre statistics, and approvals summary all return data.
6. Reload the dashboard in the Lovable preview and confirm the cards and lists render without repeated HTTP 500 errors.

## Scope
- No dashboard or iCount Cameras presentation changes.
- Local Docker remains supported.
- Database credentials will not be committed to the project.
