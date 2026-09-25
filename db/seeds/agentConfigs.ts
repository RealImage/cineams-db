import { chains, theatres } from "../../src/data/mockData";
import type { ConfigFieldDef } from "../../src/data/agentConfigData";
import { GLOBAL_REF } from "../../src/data/agentConfigData";
import { AGENT_CONFIG_SECRETS, syncEncryption } from "../secrets";
import type { ExtraSeeder } from "./types";

const storage: ConfigFieldDef = { key: "storage", name: "Storage", valueType: "storage_gb", masked: false };

/** Configurations format per agent (by agent name). Agents not listed have none. */
const formats: Record<string, ConfigFieldDef[]> = {
  iCount: [storage],
  "Qlog Agent": [storage],
  "Agent Redux": [storage],
  "Live Wire": [
    { key: "multicastIp", name: "Multicast IP", valueType: "ip", masked: false },
    { key: "port", name: "Port", valueType: "integer", masked: false },
    { key: "lanIp", name: "LAN IP", valueType: "ip", masked: false },
    { key: "productionUsername", name: "Production Username", valueType: "string", masked: false },
    { key: "productionPassword", name: "Production Password", valueType: "string", masked: true },
  ],
};

/**
 * Entitlements beyond the always-on theatre_metadata. A first guess from each
 * agent's job, to be reviewed; agents not listed have only theatre_metadata.
 */
const entitlements: Record<string, string[]> = {
  iCount: ["screen_metadata"],
  "Live Wire": ["screen_metadata"],
  "Qlog Agent": ["device_log"],
  "Agent Redux": ["device_log"],
  "Manifest Agent": ["screen_metadata", "device_ingest"],
  "Content Ingest Agent": ["device_ingest"],
  "KDM Agent": ["screen_metadata", "device_ingest"],
  "Inventory Agent": ["screen_metadata"],
  "TDL Agent": ["screen_metadata"],
  "Scheduler Agent": ["screen_metadata"],
  AgentQS: ["screen_metadata"],
  "Content Agent": ["device_ingest"],
  AgentQ: ["screen_metadata"],
};

// Placeholder values so the tabs have something to show. Not real settings.
const chainNames = Array.from(new Set(chains.map((c) => c.name))).sort();
const theatreNames = Array.from(new Set(theatres.map((t) => t.name))).sort();

function sampleValues(agent: string, n: number): Record<string, string> {
  if (agent === "Live Wire") {
    return {
      multicastIp: `239.10.${n}.1`,
      port: String(5000 + n),
      lanIp: `192.168.${10 + n}.20`,
      productionUsername: n === 0 ? "livewire" : `livewire-${n}`,
      productionPassword: `Demo@LW${3000 + n}`,
    };
  }
  return { storage: String([500, 1000, 250, 2000][n % 4]) };
}

export const agentConfigsSeeder: ExtraSeeder = {
  name: "agentConfigs",
  tables: ["agent_configurations"],
  async run(client) {
    const { rows: images } = await client.query<{ id: string; agent_os_name: string }>(
      "SELECT id, agent_os_name FROM fleet_images WHERE provider <> 'Appliance OS'",
    );
    for (const image of images) {
      const fields = formats[image.agent_os_name] ?? [];
      await client.query(
        `UPDATE fleet_images SET entitlements = $2, config_fields = $3,
           config_updated_by = coalesce(updated_by, 'System'), config_updated_at = updated_at
         WHERE id = $1`,
        [image.id, ["theatre_metadata", ...(entitlements[image.agent_os_name] ?? [])], JSON.stringify(fields)],
      );
      if (fields.length === 0) continue;

      // One Global row, two chains and three theatres, all distinct (fewer if the lists are shorter)
      const seed = Number(image.id) || image.agent_os_name.length;
      const pickDistinct = (names: string[], start: number, n: number) =>
        Array.from({ length: Math.min(n, names.length) }, (_, i) => names[(start + i) % names.length]);
      const rows: [string, string][] = [
        ["global", GLOBAL_REF],
        ...pickDistinct(chainNames, seed * 3, 2).map((ref): [string, string] => ["chain", ref]),
        ...pickDistinct(theatreNames, seed * 7, 3).map((ref): [string, string] => ["theatre", ref]),
      ];
      for (const [n, [scope, ref]] of rows.entries()) {
        await client.query(
          `INSERT INTO agent_configurations (id, image_id, scope, ref, "values", updated_by, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, now() - make_interval(days => $7))
           ON CONFLICT (image_id, scope, ref) DO NOTHING`,
          [`agent-${image.id}-${scope}-${n}`, image.id, scope, ref, JSON.stringify(sampleValues(image.agent_os_name, n)),
            ["Ketan Mehta", "Sam Mary", "Aarthi Videep"][n % 3], 3 + n * 9],
        );
      }
    }
    // Sample values are plain text; encrypt the masked ones (e.g. Production Password)
    await syncEncryption(client, AGENT_CONFIG_SECRETS);
  },
};
