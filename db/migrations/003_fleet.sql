-- Fleet management: images (OS / agents / apps) and their versions, the
-- appliances ("nodes") that run them, and update tasks targeting appliances.

CREATE TABLE fleet_images (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  provider        text NOT NULL,
  agent_os_name   text NOT NULL,
  default_install boolean NOT NULL DEFAULT false,  -- installed on new WireTAPs
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  created_by      text,
  updated_by      text,
  UNIQUE (provider, agent_os_name)
);
CREATE TRIGGER fleet_images_updated_at BEFORE UPDATE ON fleet_images
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE fleet_image_versions (
  id                text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  image_id          text NOT NULL REFERENCES fleet_images(id) ON DELETE CASCADE,
  version           text NOT NULL,
  status            text NOT NULL DEFAULT 'stable' CHECK (status IN ('stable', 'deprecated')),
  is_default        boolean NOT NULL DEFAULT false,
  release_date      timestamptz NOT NULL DEFAULT now(),
  image_url         text NOT NULL DEFAULT '',
  release_notes     text NOT NULL DEFAULT '',
  internal_notes    text NOT NULL DEFAULT '',
  added_on          timestamptz NOT NULL DEFAULT now(),
  added_by          text,
  deprecated_on     timestamptz,
  deprecated_by     text,
  deprecation_notes text,
  UNIQUE (image_id, version)
);
CREATE INDEX fleet_image_versions_image_idx ON fleet_image_versions(image_id);
-- At most one default version per image.
CREATE UNIQUE INDEX fleet_image_versions_one_default ON fleet_image_versions(image_id) WHERE is_default;

CREATE TABLE fleet_image_logs (
  id         bigserial PRIMARY KEY,
  image_id   text NOT NULL REFERENCES fleet_images(id) ON DELETE CASCADE,
  logged_at  timestamptz NOT NULL DEFAULT now(),
  action     text NOT NULL,
  details    text NOT NULL DEFAULT '',
  user_name  text,
  status     text NOT NULL DEFAULT 'info' CHECK (status IN ('success', 'info', 'warning', 'error'))
);
CREATE INDEX fleet_image_logs_image_idx ON fleet_image_logs(image_id, logged_at DESC);

-- An appliance in the fleet. Linked to a theatre when one exists; the
-- theatre_* / chain_* / location columns are the appliance's own record and
-- are used when there is no linked theatre (or it lacks the field).
CREATE TABLE fleet_nodes (
  id                      text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  node_id                 text NOT NULL UNIQUE,
  appliance_serial_number text NOT NULL UNIQUE,
  hardware_serial_number  text NOT NULL,
  cluster_name            text NOT NULL DEFAULT '',
  theatre_id              text REFERENCES theatres(id) ON DELETE SET NULL,
  theatre_name            text NOT NULL,
  theatre_code            text,
  theatre_uuid            text,
  alternate_names         text[] NOT NULL DEFAULT '{}',
  address                 text,
  city                    text,
  state                   text,
  country                 text,
  chain_name              text,
  chain_city              text,
  chain_state             text,
  chain_country           text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  updated_by              text
);
CREATE INDEX fleet_nodes_theatre_idx ON fleet_nodes(theatre_id);
CREATE TRIGGER fleet_nodes_updated_at BEFORE UPDATE ON fleet_nodes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Which version of each image a node runs, and that agent's health.
CREATE TABLE fleet_node_images (
  node_id          text NOT NULL REFERENCES fleet_nodes(id) ON DELETE CASCADE,
  image_id         text NOT NULL REFERENCES fleet_images(id) ON DELETE CASCADE,
  version          text NOT NULL,
  status           text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Unresponsive')),
  last_heartbeat   timestamptz,
  last_update_task text,
  PRIMARY KEY (node_id, image_id)
);
CREATE INDEX fleet_node_images_image_idx ON fleet_node_images(image_id);

CREATE SEQUENCE fleet_task_number_seq;

CREATE TABLE fleet_tasks (
  id               text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  task_id          text NOT NULL UNIQUE,  -- "FT-001"
  task_type        text NOT NULL CHECK (task_type IN ('WireOS Update', 'Agent Update', 'Agent Deactivate', 'PartnerOS Update', 'Others')),
  image_id         text REFERENCES fleet_images(id) ON DELETE SET NULL,  -- the agent / OS being updated
  target_version   text,
  trigger_date     date NOT NULL,
  trigger_time     text NOT NULL CHECK (trigger_time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  trigger_timezone text NOT NULL,
  description      text NOT NULL DEFAULT '',
  status           text NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Failed')),
  created_by       text,
  created_on       date NOT NULL DEFAULT current_date,
  updated_at       timestamptz NOT NULL DEFAULT now(),
  updated_by       text
);
CREATE TRIGGER fleet_tasks_updated_at BEFORE UPDATE ON fleet_tasks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE fleet_task_targets (
  id            bigserial PRIMARY KEY,
  task_id       text NOT NULL REFERENCES fleet_tasks(id) ON DELETE CASCADE,
  node_id       text NOT NULL REFERENCES fleet_nodes(id) ON DELETE CASCADE,
  update_status text NOT NULL DEFAULT 'Pending' CHECK (update_status IN ('Pending', 'In Progress', 'Completed', 'Failed', 'Cancelled')),
  added_on      timestamptz NOT NULL DEFAULT now(),
  updated_on    timestamptz,
  UNIQUE (task_id, node_id)
);
CREATE INDEX fleet_task_targets_node_idx ON fleet_task_targets(node_id);

CREATE TABLE fleet_task_attempt_logs (
  id             bigserial PRIMARY KEY,
  target_id      bigint NOT NULL REFERENCES fleet_task_targets(id) ON DELETE CASCADE,
  attempt_number integer NOT NULL,
  attempted_at   timestamptz NOT NULL,
  status         text NOT NULL CHECK (status IN ('Success', 'Failed')),
  message        text NOT NULL DEFAULT '',
  UNIQUE (target_id, attempt_number)
);
