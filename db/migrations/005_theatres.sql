-- Theatres, screen devices, FLM feeds and approvals: columns and tables the
-- UI edits that 001 did not model.

-- IP & Suites tab: devices can be "Unknown" certificate status and carry
-- their own IP config and auto-sync flag.
ALTER TYPE certificate_status ADD VALUE IF NOT EXISTS 'Unknown';

ALTER TABLE screen_devices
  ADD COLUMN certificate_auto_sync boolean NOT NULL DEFAULT false,
  ADD COLUMN ip_address            inet,
  ADD COLUMN subnet_mask           inet,
  ADD COLUMN gateway               inet;

ALTER TABLE suites
  ADD COLUMN effective_from date,
  ADD COLUMN created_at     timestamptz NOT NULL DEFAULT now();

-- Theatre change history (TheatreLogsDialog).
CREATE TABLE theatre_logs (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  theatre_id  text NOT NULL REFERENCES theatres(id) ON DELETE CASCADE,
  logged_at   timestamptz NOT NULL DEFAULT now(),
  section     text NOT NULL CHECK (section IN ('General Information', 'Location & Systems', 'Connectivity Details',
                                                'Content & Key Delivery', 'Screen Management', 'IP & Suites')),
  action      text NOT NULL CHECK (action IN ('Created', 'Updated', 'Listed', 'Unlisted', 'Deleted')),
  updated_by  text NOT NULL,
  old_value   text,
  new_value   text
);
CREATE INDEX theatre_logs_theatre_idx ON theatre_logs(theatre_id, logged_at DESC);

-- Backfill: one "Created" entry per existing theatre.
INSERT INTO theatre_logs (theatre_id, logged_at, section, action, updated_by, new_value)
SELECT id, created_at, 'General Information', 'Created', coalesce(created_by, updated_by, 'System'), name
FROM theatres;

-- FLM feeds: ignoring an update, third-party IDs mapped before the feed is
-- attached to a theatre, and who resolved it.
ALTER TABLE flm_feeds
  ADD COLUMN ignored_at        timestamptz,
  ADD COLUMN ignored_by        text,
  ADD COLUMN pending_mappings  jsonb NOT NULL DEFAULT '[]',  -- [{domain, externalId}]
  ADD COLUMN resolved_at       timestamptz,
  ADD COLUMN resolved_by       text;

-- Approvals: accept / reject.
ALTER TABLE company_claims
  ADD COLUMN status      text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected')),
  ADD COLUMN reviewed_at timestamptz,
  ADD COLUMN reviewed_by text;

ALTER TABLE partner_requests
  ADD COLUMN reviewed_at timestamptz,
  ADD COLUMN reviewed_by text;
