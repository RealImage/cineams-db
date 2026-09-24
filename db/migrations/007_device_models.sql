-- Credentials Manager: richer device models.
-- * roles split into a primary role, roles read from certificates and
--   additional roles; `roles` stays as their combined list (kept by the API)
-- * "Others" device type; whether units carry serial numbers
-- * credentials format becomes a custom list of named, typed fields
--   (replaces the four fixed credential_format presets)

ALTER TABLE credential_devices
  ADD COLUMN primary_role           text,
  ADD COLUMN certificate_roles      text[] NOT NULL DEFAULT '{}',
  ADD COLUMN additional_roles       text[] NOT NULL DEFAULT '{}',
  ADD COLUMN serial_number_required boolean NOT NULL DEFAULT false,
  ADD COLUMN credential_fields      jsonb NOT NULL DEFAULT '[]';

-- Existing roles came from the device certificates.
UPDATE credential_devices SET certificate_roles = roles;

-- Presets → field lists. Keys match the keys existing values are stored under.
UPDATE credential_devices SET credential_fields = CASE credential_format
  WHEN 'username_password' THEN
    '[{"key":"username","name":"Username","valueType":"string"},{"key":"password","name":"Password","valueType":"string"}]'
  WHEN 'siteid_password' THEN
    '[{"key":"siteId","name":"Site ID","valueType":"string"},{"key":"password","name":"Password","valueType":"string"}]'
  WHEN 'siteid_username_password' THEN
    '[{"key":"siteId","name":"Site ID","valueType":"string"},{"key":"username","name":"Username","valueType":"string"},{"key":"password","name":"Password","valueType":"string"}]'
  ELSE
    '[{"key":"password","name":"Password","valueType":"string"}]'
END::jsonb;

ALTER TABLE credential_devices DROP COLUMN credential_format;

ALTER TABLE credential_devices DROP CONSTRAINT credential_devices_type_check;
ALTER TABLE credential_devices ADD CONSTRAINT credential_devices_type_check
  CHECK (type IN ('Projector', 'Playback Server', 'Audio Processor', 'Ticketing System', 'TMS', 'Others'));

ALTER TABLE credential_devices ADD CONSTRAINT credential_devices_fields_is_array
  CHECK (jsonb_typeof(credential_fields) = 'array');
