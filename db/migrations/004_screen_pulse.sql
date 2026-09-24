-- Screen Pulse: latest environment rating snapshot per monitored screen.
-- Theatre / chain / location come from joins on screens -> theatres -> chains.
-- Projection quality lives in screen_quality_checks (001); Pulse / Lionis
-- installs live in screen_appliances (appliance_type 'pulse' / 'lionis').

CREATE TABLE screen_environment_summaries (
  screen_id               text PRIMARY KEY REFERENCES screens(id) ON DELETE CASCADE,
  score                   integer NOT NULL CHECK (score BETWEEN 0 AND 120),
  on_temperature          double precision NOT NULL,
  on_temperature_status   text NOT NULL,
  on_humidity             double precision NOT NULL,
  on_humidity_status      text NOT NULL,
  on_dust                 double precision NOT NULL,
  on_dust_status          text NOT NULL,
  off_temperature         double precision NOT NULL,
  off_temperature_status  text NOT NULL,
  off_humidity            double precision NOT NULL,
  off_humidity_status     text NOT NULL,
  off_dust                double precision NOT NULL,
  off_dust_status         text NOT NULL,
  computed_at             timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT screen_environment_summaries_status_check CHECK (
    ARRAY[on_temperature_status, on_humidity_status, on_dust_status,
          off_temperature_status, off_humidity_status, off_dust_status]
    <@ ARRAY['within_theatre_baseline', 'within_recommended_baseline', 'out_of_range']
  )
);
CREATE INDEX screen_environment_summaries_score_idx ON screen_environment_summaries(score);
