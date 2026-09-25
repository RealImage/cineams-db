import { insertMany } from "../client";
import { credentialDevices, initialScopedCredentials } from "../../src/data/credentialsManagerSeedData";
import { syncCredentialEncryption } from "../secrets";
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
      primary_role: d.primaryRole,
      certificate_roles: d.certificateRoles,
      additional_roles: d.additionalRoles,
      type: d.type,
      dci: d.dci,
      translations: d.translations,
      serial_number_required: d.serialNumberRequired,
      credential_fields: JSON.stringify(d.credentialFields),
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
    // Sample values are plain text; encrypt the masked ones (e.g. Password)
    await syncCredentialEncryption(client);
  },
};
