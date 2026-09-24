import { insertMany } from "../client";
import {
  fleetImages,
  fleetTasks,
  generateFleetNodes,
  generateImageLogs,
  generateImageVersions,
  generateNodeImages,
  generateTaskTargets,
  type NodeTheatre,
} from "../../src/data/fleetData";
import type { ExtraSeeder } from "./types";

export const fleetSeeder: ExtraSeeder = {
  name: "fleet",
  tables: [
    "fleet_task_attempt_logs",
    "fleet_task_targets",
    "fleet_tasks",
    "fleet_node_images",
    "fleet_nodes",
    "fleet_image_logs",
    "fleet_image_versions",
    "fleet_images",
  ],
  async run(client) {
    // Images, versions, activity logs
    await insertMany(client, "fleet_images", fleetImages.map((i) => ({
      id: i.id,
      provider: i.provider,
      agent_os_name: i.agentOsName,
      default_install: !!i.defaultInstall,
      created_at: `${i.updatedOn}T09:00:00Z`,
      updated_at: `${i.updatedOn}T09:00:00Z`,
      created_by: i.updatedBy,
      updated_by: i.updatedBy,
    })));
    const versions = generateImageVersions();
    await insertMany(client, "fleet_image_versions", versions.map((v) => ({
      image_id: v.imageId,
      version: v.version,
      status: v.status,
      is_default: !!v.isDefault,
      release_date: v.releaseDate,
      image_url: v.imageUrl,
      release_notes: v.releaseNotes,
      internal_notes: v.internalNotes,
      added_on: v.addedOn,
      added_by: v.addedBy,
      deprecated_on: v.deprecatedOn ?? null,
      deprecated_by: v.deprecatedBy ?? null,
      deprecation_notes: v.deprecationNotes ?? null,
    })));
    await insertMany(client, "fleet_image_logs", generateImageLogs(versions).map((l) => ({
      image_id: l.imageId,
      logged_at: l.timestamp,
      action: l.action,
      details: l.details,
      user_name: l.user,
      status: l.status,
    })));

    // Nodes placed in existing theatres (theatre FK by name where one exists)
    const { rows: theatres } = await client.query<NodeTheatre & { id: string }>(
      `SELECT t.id, t.name, t.code, c.name AS "chainName", t.city, t.state, t.country
       FROM theatres t LEFT JOIN chains c ON c.id = t.chain_id
       ORDER BY t.code NULLS LAST, t.name, t.id`,
    );
    const theatreIdByName = new Map<string, string>();
    theatres.forEach((t) => { if (!theatreIdByName.has(t.name)) theatreIdByName.set(t.name, t.id); });
    const theatreIdByCode = new Map(theatres.filter((t) => t.code).map((t) => [t.code as string, t.id]));

    const nodes = generateFleetNodes(theatres);
    await insertMany(client, "fleet_nodes", nodes.map((n) => ({
      id: n.id,
      node_id: n.nodeId,
      appliance_serial_number: n.applianceSerialNumber,
      hardware_serial_number: n.hardwareSerialNumber,
      cluster_name: n.clusterName,
      theatre_id: theatreIdByCode.get(n.theatreCode) ?? theatreIdByName.get(n.theatreName) ?? null,
      theatre_name: n.theatreName,
      theatre_code: n.theatreCode,
      theatre_uuid: n.theatreUuid,
      alternate_names: n.alternateNames,
      address: n.address,
      city: n.city,
      state: n.state,
      country: n.country,
      chain_name: n.chainName,
      chain_city: n.chainAddress.city,
      chain_state: n.chainAddress.state,
      chain_country: n.chainAddress.country,
      updated_by: "System",
    })));
    await insertMany(client, "fleet_node_images", generateNodeImages(nodes, versions).map((ni) => ({
      node_id: ni.nodeId,
      image_id: ni.imageId,
      version: ni.version,
      status: ni.status,
      last_heartbeat: ni.lastHeartbeat,
      last_update_task: ni.lastUpdateTask,
    })));

    // Tasks, targets, attempt logs
    await insertMany(client, "fleet_tasks", fleetTasks.map((t) => {
      const [day, time] = t.triggerDate.split(" ");
      return {
        id: t.id,
        task_id: t.taskId,
        task_type: t.taskType,
        image_id: t.imageId,
        target_version: t.targetVersion ?? null,
        trigger_date: day,
        trigger_time: time,
        trigger_timezone: t.triggerTimezone,
        description: t.description,
        status: t.status,
        created_by: t.createdBy,
        created_on: t.createdOn,
        updated_by: t.createdBy,
      };
    }));
    await client.query(`SELECT setval('fleet_task_number_seq', $1)`, [fleetTasks.length]);

    const targets = generateTaskTargets(nodes);
    const { rows: inserted } = await client.query<{ id: string; task_id: string; node_id: string }>(
      `INSERT INTO fleet_task_targets (task_id, node_id, update_status, added_on, updated_on)
       SELECT * FROM unnest($1::text[], $2::text[], $3::text[], $4::timestamptz[], $5::timestamptz[])
       RETURNING id, task_id, node_id`,
      [
        targets.map((t) => t.taskId),
        targets.map((t) => t.nodeId),
        targets.map((t) => t.updateStatus),
        targets.map((t) => t.addedOn),
        targets.map((t) => t.updatedOn),
      ],
    );
    const targetId = new Map(inserted.map((r) => [`${r.task_id}/${r.node_id}`, r.id]));
    await insertMany(client, "fleet_task_attempt_logs", targets.flatMap((t) => t.attemptLogs.map((l) => ({
      target_id: targetId.get(`${t.taskId}/${t.nodeId}`),
      attempt_number: l.attemptNumber,
      attempted_at: l.timestamp,
      status: l.status,
      message: l.message,
    }))));
  },
};
