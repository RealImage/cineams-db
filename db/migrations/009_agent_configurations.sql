-- Agent configurations: per agent (a fleet image), its entitlements, the
-- format of its configuration values, and those values at Global, Chain and
-- Theatre scope. Masked values are stored encrypted (see db/secrets.ts).

ALTER TABLE fleet_images
  -- Entitlement ids (src/data/agentConfigData.ts). Theatre metadata is always on.
  ADD COLUMN entitlements        text[] NOT NULL DEFAULT '{theatre_metadata}',
  -- [{key, name, valueType, masked}]
  ADD COLUMN config_fields       jsonb  NOT NULL DEFAULT '[]'
    CHECK (jsonb_typeof(config_fields) = 'array'),
  -- Who last changed the entitlements or configurations format
  ADD COLUMN config_updated_by   text,
  ADD COLUMN config_updated_at   timestamptz;

CREATE TABLE agent_configurations (
  id          text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  image_id    text NOT NULL REFERENCES fleet_images(id) ON DELETE CASCADE,
  scope       text NOT NULL CHECK (scope IN ('global', 'chain', 'theatre')),
  -- "Global" (global), chain name (chain) or theatre name (theatre)
  ref         text NOT NULL CHECK (ref <> ''),
  values      jsonb NOT NULL DEFAULT '{}',
  updated_by  text NOT NULL DEFAULT '',
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (image_id, scope, ref)
);

CREATE INDEX agent_configurations_image_idx ON agent_configurations (image_id);
