# Restore the dashboard database

## Goal
Bring the existing PostgreSQL-backed dashboard back online without changing the dashboard design or data model.

## Plan
1. Start a PostgreSQL 16 service using the project's existing database settings. Docker is unavailable in this preview environment, so use the native PostgreSQL runtime instead.
2. Run the existing migrations and seed process to create and populate the required tables.
3. Confirm the API health check succeeds, then verify `/api/theatres/stats` and `/api/approvals/summary` return data instead of HTTP 500.
4. Reload the dashboard and verify its cards and lists render normally, with no repeated failed requests.

## Technical details
- Confirmed failure: `ECONNREFUSED 127.0.0.1:5432`.
- The API is running, but no process is listening on PostgreSQL port 5432.
- The project already contains the schema migrations, seed data, and database commands needed for recovery.
- No iCount Cameras code or dashboard presentation will be changed.
