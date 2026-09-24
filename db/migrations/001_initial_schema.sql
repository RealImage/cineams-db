-- CinemaDB core schema.
-- Mirrors the domain types in src/types and src/data, normalized around
-- companies -> chains -> theatres -> screens, with appliance modules
-- (Qube ACS, Pulse, Edge, iCount, WireTAP) hanging off theatres/screens.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TYPE record_status      AS ENUM ('Active', 'Inactive', 'Closed', 'Deleted');
CREATE TYPE certificate_status AS ENUM ('Valid', 'Invalid', 'Expired');
CREATE TYPE appliance_type     AS ENUM ('qube_acs', 'pulse', 'edge', 'lionis');
CREATE TYPE appliance_status   AS ENUM ('Active', 'Device Paused', 'Inactive');

-- ---------------------------------------------------------------------------
-- Organizations
-- ---------------------------------------------------------------------------

CREATE TABLE companies (
  id          text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name        text NOT NULL UNIQUE,
  status      record_status NOT NULL DEFAULT 'Active',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  created_by  text,
  updated_by  text
);

CREATE TABLE chains (
  id          text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  company_id  text REFERENCES companies(id) ON DELETE SET NULL,
  name        text NOT NULL UNIQUE,
  status      record_status NOT NULL DEFAULT 'Active',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  created_by  text,
  updated_by  text
);
CREATE INDEX chains_company_id_idx ON chains(company_id);

-- ---------------------------------------------------------------------------
-- Theatres
-- ---------------------------------------------------------------------------

CREATE TABLE theatres (
  id                          text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code                        text UNIQUE,            -- business ID shown in UI, e.g. "T30000"
  uuid                        text UNIQUE,
  third_party_id              text,
  chain_id                    text REFERENCES chains(id) ON DELETE SET NULL,
  company_id                  text REFERENCES companies(id) ON DELETE SET NULL,
  name                        text NOT NULL,
  display_name                text,
  alternate_names             text[] NOT NULL DEFAULT '{}',
  listing                     text CHECK (listing IN ('Listed', 'Private')),
  type                        text,
  status                      record_status NOT NULL DEFAULT 'Active',
  address                     text,
  city                        text,
  state                       text,
  country                     text,
  postal_code                 text,
  latitude                    double precision,
  longitude                   double precision,
  timezone                    text,
  phone_number                text,
  email                       text,
  website                     text,
  contact                     text,
  location_type               text,
  bike_parking_available      boolean,
  bike_parking_capacity       integer,
  car_parking_available       boolean,
  car_parking_capacity        integer,
  theatre_management_system   text,
  ticketing_system            text,
  start_date                  date,
  notes                       text,
  closure_details             text,
  exhibitor_integrator_companies text[] NOT NULL DEFAULT '{}',
  ad_integrators              text[] NOT NULL DEFAULT '{}',
  -- Delivery / KDM / LiveWire / download-window settings edited on the
  -- theatre form. Kept as JSON because the shape is form-driven.
  delivery_settings           jsonb NOT NULL DEFAULT '{}',
  configuration_notes         text,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now(),
  created_by                  text,
  updated_by                  text
);
CREATE INDEX theatres_chain_id_idx   ON theatres(chain_id);
CREATE INDEX theatres_company_id_idx ON theatres(company_id);
CREATE INDEX theatres_location_idx   ON theatres(country, state, city);
CREATE INDEX theatres_name_idx       ON theatres(lower(name));

-- External-domain IDs for a theatre (e.g. maccs.com -> US20211622)
CREATE TABLE theatre_mappings (
  id           text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  theatre_id   text NOT NULL REFERENCES theatres(id) ON DELETE CASCADE,
  domain       text NOT NULL,
  external_id  text NOT NULL,
  UNIQUE (theatre_id, domain, external_id)
);
CREATE INDEX theatre_mappings_lookup_idx ON theatre_mappings(domain, external_id);

-- ---------------------------------------------------------------------------
-- Screens and screen devices
-- ---------------------------------------------------------------------------

CREATE TABLE screens (
  id                          text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  theatre_id                  text NOT NULL REFERENCES theatres(id) ON DELETE CASCADE,
  number                      text,
  name                        text NOT NULL,
  uuid                        text UNIQUE,
  third_party_id              text,
  status                      record_status NOT NULL DEFAULT 'Active',
  auto_screen_update_lock     boolean NOT NULL DEFAULT false,
  flm_management_lock         boolean NOT NULL DEFAULT false,
  multi_thumbprint_kdm_screen boolean NOT NULL DEFAULT false,
  seating_capacity            integer,
  cooling_type                text,
  wheelchair_accessibility    boolean NOT NULL DEFAULT false,
  motion_seats                boolean NOT NULL DEFAULT false,
  closure_notes               text,
  operators                   jsonb NOT NULL DEFAULT '[]',  -- [{name,email,phone}]
  dimensions                  jsonb NOT NULL DEFAULT '{}',
  projection                  jsonb NOT NULL DEFAULT '{}',
  sound                       jsonb NOT NULL DEFAULT '{}',
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now(),
  created_by                  text,
  updated_by                  text
);
CREATE INDEX screens_theatre_id_idx ON screens(theatre_id);

CREATE TABLE screen_devices (
  id                       text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  screen_id                text NOT NULL REFERENCES screens(id) ON DELETE CASCADE,
  manufacturer             text NOT NULL,
  model                    text NOT NULL,
  serial_number            text NOT NULL,
  role                     text,
  certificate_status       certificate_status NOT NULL DEFAULT 'Valid',
  certificate_lock_status  text NOT NULL DEFAULT 'Unlocked' CHECK (certificate_lock_status IN ('Locked', 'Unlocked')),
  software_version         text
);
CREATE INDEX screen_devices_screen_id_idx ON screen_devices(screen_id);
CREATE INDEX screen_devices_serial_idx    ON screen_devices(serial_number);

CREATE TABLE screen_ip_addresses (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  screen_id  text NOT NULL REFERENCES screens(id) ON DELETE CASCADE,
  address    inet NOT NULL,
  subnet     inet,
  gateway    inet
);
CREATE INDEX screen_ip_addresses_screen_id_idx ON screen_ip_addresses(screen_id);

CREATE TABLE suites (
  id         text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  screen_id  text NOT NULL REFERENCES screens(id) ON DELETE CASCADE,
  name       text NOT NULL,
  status     text NOT NULL DEFAULT 'Valid' CHECK (status IN ('Valid', 'Invalid'))
);

CREATE TABLE suite_devices (
  suite_id   text NOT NULL REFERENCES suites(id) ON DELETE CASCADE,
  device_id  text NOT NULL REFERENCES screen_devices(id) ON DELETE CASCADE,
  PRIMARY KEY (suite_id, device_id)
);

CREATE TABLE screen_temporary_closures (
  id          text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  screen_id   text NOT NULL REFERENCES screens(id) ON DELETE CASCADE,
  start_date  date NOT NULL,
  end_date    date,
  reason      text NOT NULL,
  notes       text,
  active      boolean NOT NULL DEFAULT true
);

-- ---------------------------------------------------------------------------
-- TDL (Trusted Device List) devices
-- ---------------------------------------------------------------------------

CREATE TABLE tdl_devices (
  id                       text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  manufacturer             text NOT NULL,
  model                    text NOT NULL,
  serial_number            text NOT NULL,
  software_version         text,
  firmware_version         text,
  device_role              text,
  certificate_status       certificate_status NOT NULL DEFAULT 'Valid',
  certificate_auto_sync    boolean NOT NULL DEFAULT true,
  auto_update_certificate  boolean NOT NULL DEFAULT true,
  valid_till               timestamptz,
  public_key_thumbprint    text,
  issuer_thumbprint        text,
  source                   text,
  retired                  boolean NOT NULL DEFAULT false,
  updated_at               timestamptz NOT NULL DEFAULT now(),
  updated_by               text,
  UNIQUE (manufacturer, serial_number)
);
CREATE INDEX tdl_devices_model_idx ON tdl_devices(manufacturer, model);

-- ---------------------------------------------------------------------------
-- Qube appliances
-- ---------------------------------------------------------------------------

CREATE TABLE wiretap_devices (
  id                         text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  theatre_id                 text REFERENCES theatres(id) ON DELETE SET NULL,
  hardware_serial_number     text NOT NULL UNIQUE,
  application_serial_number  text,
  host_name                  text,
  cluster_name               text,
  connectivity_type          text,
  isp_name                   text,
  storage_capacity           text,
  bandwidth                  text,
  appliance_type             text NOT NULL DEFAULT 'Standard' CHECK (appliance_type IN ('Standard', 'Pro', 'Enterprise')),
  activation_status          text NOT NULL DEFAULT 'Inactive' CHECK (activation_status IN ('Active', 'Inactive')),
  mapping_status             text NOT NULL DEFAULT 'Unmapped' CHECK (mapping_status IN ('Mapped', 'Unmapped', 'Pending')),
  vpn_status                 text NOT NULL DEFAULT 'Disabled' CHECK (vpn_status IN ('Enabled', 'Disabled')),
  pull_out_status            text NOT NULL DEFAULT 'Installed' CHECK (pull_out_status IN ('Installed', 'Pulled Out', 'Maintenance')),
  connectivity               jsonb,   -- latest ConnectivityInfo snapshot
  created_at                 timestamptz NOT NULL DEFAULT now(),
  updated_at                 timestamptz NOT NULL DEFAULT now(),
  updated_by                 text
);
CREATE INDEX wiretap_devices_theatre_id_idx ON wiretap_devices(theatre_id);
CREATE INDEX wiretap_devices_app_serial_idx ON wiretap_devices(application_serial_number);

-- Theatre-level enrolment in an appliance programme (Qube ACS / Pulse / Edge).
CREATE TABLE theatre_appliance_configs (
  theatre_id        text NOT NULL REFERENCES theatres(id) ON DELETE CASCADE,
  appliance_type    appliance_type NOT NULL,
  network_id        text,
  network_password  text,
  updated_at        timestamptz NOT NULL DEFAULT now(),
  updated_by        text,
  PRIMARY KEY (theatre_id, appliance_type)
);

-- One appliance installed on a screen.
CREATE TABLE screen_appliances (
  id                       bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  screen_id                text NOT NULL REFERENCES screens(id) ON DELETE CASCADE,
  appliance_type           appliance_type NOT NULL,
  appliance_id             text,         -- e.g. "PULSE-1100"
  serial_number            text,         -- CM serial (Qube ACS) / Lionis serial
  ip_address               inet,
  screen_network_id        text,
  screen_network_password  text,
  status                   appliance_status NOT NULL DEFAULT 'Active',
  installed_at             timestamptz,
  installed_by             text,
  last_active_at           timestamptz,
  comments                 text,
  updated_at               timestamptz NOT NULL DEFAULT now(),
  updated_by               text,
  UNIQUE (screen_id, appliance_type)
);
CREATE INDEX screen_appliances_type_idx ON screen_appliances(appliance_type, status);

CREATE TABLE icount_cameras (
  id             text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  screen_id      text NOT NULL REFERENCES screens(id) ON DELETE CASCADE,
  label          text NOT NULL,
  make           text,
  model          text,
  serial_number  text,
  ownership      text CHECK (ownership IN ('Theatre', 'Qube')),
  ip_address     inet,
  updated_at     timestamptz NOT NULL DEFAULT now(),
  updated_by     text
);
CREATE INDEX icount_cameras_screen_id_idx ON icount_cameras(screen_id);

-- ---------------------------------------------------------------------------
-- Screen Pulse telemetry
-- ---------------------------------------------------------------------------

CREATE TABLE screen_sensor_readings (
  screen_id    text NOT NULL REFERENCES screens(id) ON DELETE CASCADE,
  metric       text NOT NULL CHECK (metric IN ('temperature', 'humidity', 'dust')),
  recorded_at  timestamptz NOT NULL,
  value        double precision NOT NULL,
  is_on_period boolean NOT NULL,     -- projector on vs. off
  PRIMARY KEY (screen_id, metric, recorded_at)
);

CREATE TABLE screen_sensor_thresholds (
  screen_id   text NOT NULL REFERENCES screens(id) ON DELETE CASCADE,
  metric      text NOT NULL CHECK (metric IN ('temperature', 'humidity', 'dust')),
  on_upper    double precision,
  on_lower    double precision,
  off_upper   double precision,
  off_lower   double precision,
  PRIMARY KEY (screen_id, metric)
);

CREATE TABLE screen_quality_checks (
  id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  screen_id           text NOT NULL REFERENCES screens(id) ON DELETE CASCADE,
  checked_at          timestamptz NOT NULL DEFAULT now(),
  score               integer CHECK (score BETWEEN 0 AND 100),
  projection_quality  text,
  projection_ok       boolean,
  sound_quality       text,
  sound_ok            boolean
);
CREATE INDEX screen_quality_checks_screen_idx ON screen_quality_checks(screen_id, checked_at DESC);

-- ---------------------------------------------------------------------------
-- FLM feeds
-- ---------------------------------------------------------------------------

CREATE TABLE flm_feeds (
  id                    text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  source                text NOT NULL,   -- MACCS | DCIP | Qube Radar | Cinergy | Sony | KDMx
  feed_theatre_id       text NOT NULL,   -- e.g. "maccs.com:DE20235311"
  theatre_uuid          text,
  theatre_name          text NOT NULL,
  theatre_display_name  text,
  chain_name            text,
  address               text,
  location              text,
  is_new_theatre        boolean NOT NULL DEFAULT false,
  status                text NOT NULL CHECK (status IN ('Auto-Updated', 'Manual', 'Auto-Updated / Mapped')),
  mapped_theatre_id     text REFERENCES theatres(id) ON DELETE SET NULL,
  details               jsonb,           -- FlmFacilityDetails payload as received
  received_at           timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX flm_feeds_received_idx ON flm_feeds(received_at DESC);
CREATE INDEX flm_feeds_status_idx   ON flm_feeds(status);

-- ---------------------------------------------------------------------------
-- Approvals & conflicts
-- ---------------------------------------------------------------------------

CREATE TABLE company_claims (
  id               text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  company_name     text NOT NULL,
  legal_name       text,
  company_type     text,
  company_role     text,
  street_address   text,
  city             text,
  location         text,
  website          text,
  phone            text,
  chain_claims     integer NOT NULL DEFAULT 0,
  theatre_claims   integer NOT NULL DEFAULT 0,
  theatre_count    integer,
  screen_count     integer,
  claimed_by       text,
  claimed_at       timestamptz,
  last_claimed_at  timestamptz
);

CREATE TABLE partner_requests (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  company         text NOT NULL,
  name            text,
  legal_name      text,
  company_role    text,
  street_address  text,
  city            text,
  state           text,
  country         text,
  location        text,
  website         text,
  phone           text,
  requested_by    text,
  requested_at    timestamptz NOT NULL DEFAULT now(),
  status          text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected'))
);

CREATE TABLE partner_operation_regions (
  id                  text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  partner_request_id  text NOT NULL REFERENCES partner_requests(id) ON DELETE CASCADE,
  parameter_type      text NOT NULL CHECK (parameter_type IN ('Location', 'Chain', 'Theatre')),
  value               text NOT NULL
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'companies', 'chains', 'theatres', 'screens', 'tdl_devices', 'wiretap_devices',
    'theatre_appliance_configs', 'screen_appliances', 'icount_cameras'
  ] LOOP
    EXECUTE format('CREATE TRIGGER %I_set_updated_at BEFORE UPDATE ON %I
                    FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t, t);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- Convenience views (match list-page columns)
-- ---------------------------------------------------------------------------

CREATE VIEW theatre_summary AS
SELECT t.*,
       c.name  AS chain_name,
       co.name AS company_name,
       (SELECT count(*) FROM screens s WHERE s.theatre_id = t.id AND s.status <> 'Deleted') AS screen_count
FROM theatres t
LEFT JOIN chains c     ON c.id = t.chain_id
LEFT JOIN companies co ON co.id = t.company_id;

CREATE VIEW appliance_theatre_summary AS
SELECT t.id AS theatre_id, t.code, t.name AS theatre_name, t.city, t.state, t.country,
       c.name AS chain_name, cfg.appliance_type, cfg.network_id,
       count(s.id)                                        AS total_screens,
       count(sa.id) FILTER (WHERE sa.status <> 'Inactive') AS enabled_screens,
       greatest(cfg.updated_at, max(sa.updated_at))       AS updated_at
FROM theatre_appliance_configs cfg
JOIN theatres t      ON t.id = cfg.theatre_id
LEFT JOIN chains c   ON c.id = t.chain_id
LEFT JOIN screens s  ON s.theatre_id = t.id
LEFT JOIN screen_appliances sa ON sa.screen_id = s.id AND sa.appliance_type = cfg.appliance_type
GROUP BY t.id, c.name, cfg.appliance_type, cfg.network_id, cfg.updated_at;
