-- Qube appliances (WireTAP, Qube ACS, Pulse, Edge, iCount): columns the UI
-- edits that 001 did not model, plus a data backfill for lookup theatres.

-- WireTAP: devices reported by the fleet but not yet pulled into the
-- inventory portal ("Fetch new devices"), and fields from the add/edit form.
ALTER TABLE wiretap_devices
  ADD COLUMN in_inventory        boolean NOT NULL DEFAULT true,
  ADD COLUMN deactivation_reason text,
  ADD COLUMN no_mapping_reason   text,
  ADD COLUMN pull_out_date       date,
  ADD COLUMN pull_out_reason     text,
  -- Remaining add/edit form fields (RAM, SIM, ISP billing, ingest IP, …),
  -- kept as submitted because the shape is form-driven.
  ADD COLUMN details             jsonb NOT NULL DEFAULT '{}';

-- The old newWireTapDevices mock ("registered but not yet in inventory").
UPDATE wiretap_devices SET in_inventory = false WHERE id LIKE 'wt-new-%';
CREATE INDEX wiretap_devices_in_inventory_idx ON wiretap_devices(in_inventory);

-- Lookup-pool theatres (codes T2xxxx / T4xxxx / T6xxxx from the old mock
-- lookup lists) were seeded without screens; give each the screen count the
-- mock advertised (5 + index % 10) so the add flow has screens to enrol.
INSERT INTO screens (id, theatre_id, number, name)
SELECT t.code || ':SCR-' || t.code || '-' || n, t.id, n::text, 'Screen ' || n
FROM theatres t
CROSS JOIN LATERAL generate_series(1, 5 + (substring(t.code FROM 2)::int % 10)) AS n
WHERE t.code ~ '^T[246]\d{4}$'
  AND NOT EXISTS (SELECT 1 FROM screens s WHERE s.theatre_id = t.id)
ON CONFLICT (id) DO NOTHING;
