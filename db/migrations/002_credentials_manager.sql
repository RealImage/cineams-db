-- Credentials Manager: device models (with alternate names) and the
-- credentials recorded for them at global / chain / theatre / device scope.

CREATE TABLE credential_devices (
  id                text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  brand             text NOT NULL,
  model             text NOT NULL,
  roles             text[] NOT NULL DEFAULT '{}',
  type              text NOT NULL
                    CHECK (type IN ('Playback Server', 'Projector', 'Audio Processor', 'TMS', 'Ticketing System')),
  dci               text NOT NULL DEFAULT 'NA' CHECK (dci IN ('true', 'false', 'NA')),
  translations      text[] NOT NULL DEFAULT '{}',
  credential_format text NOT NULL DEFAULT 'username_password'
                    CHECK (credential_format IN ('username_password', 'siteid_password', 'siteid_username_password', 'password')),
  updated_by        text NOT NULL DEFAULT '',
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (brand, model)
);

CREATE TABLE device_credentials (
  id          text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  device_id   text NOT NULL REFERENCES credential_devices(id) ON DELETE CASCADE,
  scope       text NOT NULL CHECK (scope IN ('global', 'chain', 'theatre', 'device')),
  -- "Global" or a country (global), chain name, theatre name, or serial number (device).
  ref         text NOT NULL CHECK (ref <> ''),
  -- Device scope only: where that unit is installed.
  location    text,
  values      jsonb NOT NULL DEFAULT '{}',
  updated_by  text NOT NULL DEFAULT '',
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (device_id, scope, ref)
);

CREATE INDEX device_credentials_device_idx ON device_credentials (device_id);
