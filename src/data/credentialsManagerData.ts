export const deviceTypes = [
  "Playback Server",
  "Projector",
  "Audio Processor",
  "TMS",
  "Ticketing System",
] as const;
export type DeviceType = (typeof deviceTypes)[number];

export const dciOptions = ["true", "false", "NA"] as const;
export type DciCompliance = (typeof dciOptions)[number];

export type CredentialField = "siteId" | "username" | "password";

export const credentialFieldLabels: Record<CredentialField, string> = {
  siteId: "Site ID",
  username: "Username",
  password: "Password",
};

/** Fields shown/masked as secrets in tables and dialogs. */
export const secretFields: CredentialField[] = ["password"];

export const credentialFormats = [
  { id: "username_password", label: "Username & Password", fields: ["username", "password"] },
  { id: "siteid_password", label: "Site ID & Password", fields: ["siteId", "password"] },
  { id: "siteid_username_password", label: "Site ID, Username & Password", fields: ["siteId", "username", "password"] },
  { id: "password", label: "Password Only", fields: ["password"] },
] as const satisfies readonly { id: string; label: string; fields: readonly CredentialField[] }[];
export type CredentialFormatId = (typeof credentialFormats)[number]["id"];

export const getCredentialFormat = (id: CredentialFormatId) =>
  credentialFormats.find((f) => f.id === id) ?? credentialFormats[0];

export const credentialScopes = [
  { id: "global", label: "Global Credentials", refLabel: "Region" },
  { id: "chain", label: "Chain Credentials", refLabel: "Chain" },
  { id: "theatre", label: "Theatre Credentials", refLabel: "Theatre" },
  { id: "device", label: "Device Credentials", refLabel: "Device (Serial No.)" },
] as const;
export type CredentialScope = (typeof credentialScopes)[number]["id"];

export const GLOBAL_REF = "Global";

/**
 * One set of credentials for a device model at a given scope. `ref` is the
 * scope target: "Global" or a country (global), chain name, theatre name, or
 * device serial number.
 */
export interface ScopedCredential {
  id: string;
  deviceId: string;
  scope: CredentialScope;
  ref: string;
  /** Device scope only: where that unit is installed. */
  location?: string;
  values: Partial<Record<CredentialField, string>>;
  updatedBy: string;
  updatedAt: string;
}

export interface CredentialDevice {
  id: string;
  brand: string;
  model: string;
  roles: string[];
  type: DeviceType;
  dci: DciCompliance;
  translations: string[];
  credentialFormat: CredentialFormatId;
  updatedBy: string;
  updatedAt: string;
}

/** Default credentials are the ones the device ships with, i.e. the Global row. */
export const hasDefaultCredentials = (deviceId: string, credentials: ScopedCredential[]) =>
  credentials.some((c) => c.deviceId === deviceId && c.scope === "global" && c.ref === GLOBAL_REF);

/** API shape of a device: the record plus whether a Global/"Global" credential exists. */
export type CredentialDeviceWithStatus = CredentialDevice & { hasDefaultCredentials: boolean };

/** Fields a credential save sends; the server stamps id (for new rows), updatedBy and updatedAt. */
export type CredentialInput = Pick<ScopedCredential, "scope" | "ref" | "location" | "values">;

export const CREDENTIALS_MANAGER_PATH = "/theatre-device-management/credentials-manager";
export const deviceCredentialsPath = (deviceId: string) => `${CREDENTIALS_MANAGER_PATH}/${deviceId}/credentials`;

export const countryOptions = [
  "Australia", "Canada", "France", "Germany", "India", "Ireland", "Japan", "Mexico",
  "South Korea", "United Arab Emirates", "UK", "USA",
];
/** Chains offered for chain-scoped credentials beyond the ones in the database. */
export const extraChainNames = ["Cinemark", "Odeon", "PVR INOX", "CGV", "Cinépolis", "Pathé"];
