import { insertMany } from "../client";
import { credentialDevices, initialScopedCredentials } from "../../src/data/credentialsManagerSeedData";
import type { ExtraSeeder } from "./types";

export const credentialsSeeder: ExtraSeeder = {
  name: "credentials",
  tables: ["credential_devices", "device_credentials"],
  async run(client) {
    await insertMany(client, "credential_devices", credentialDevices.map((d) => ({
      id: d.id,
      brand: d.brand,
      model: d.model,
      roles: d.roles,
      type: d.type,
      dci: d.dci,
      translations: d.translations,
      credential_format: d.credentialFormat,
      updated_by: d.updatedBy,
      updated_at: d.updatedAt,
    })));
    await insertMany(client, "device_credentials", initialScopedCredentials.map((c) => ({
      id: c.id,
      device_id: c.deviceId,
      scope: c.scope,
      ref: c.ref,
      location: c.location ?? null,
      values: c.values,
      updated_by: c.updatedBy,
      updated_at: c.updatedAt,
    })));
  },
};
