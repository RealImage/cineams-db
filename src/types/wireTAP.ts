
export type ConnectivityStatus = "Healthy" | "Acceptable" | "Degraded" | "Unhealthy";

export interface ConnectivityInfo {
  status: ConnectivityStatus;
  lastCheckAt: string;
  signalStrength?: number; // dBm for mobile
  signalLabel?: string; // "Good", "Weak", etc.
  actualDownloadSpeed?: number; // Mbps
  actualUploadSpeed?: number; // Mbps
  speedStatus?: "Meets" | "Below" | "Severely Degraded";
  routerBrand?: string;
  routerModel?: string;
  routerSerialNumber?: string;
  statusMessage?: string; // e.g., "Weak signal", "Below expected speed"
}

export interface WireTAPDevice {
  id: string;
  hardwareSerialNumber: string;
  applicationSerialNumber: string;
  hostName: string;
  clusterName?: string;
  connectivityType: string;
  ispName: string;
  theatreId: string;
  theatreName: string;
  theatreUUID: string;
  theatreAddress: string;
  theatreAlternateNames?: string[];
  storageCapacity: string;
  bandwidth: string;
  activationStatus: "Active" | "Inactive";
  mappingStatus: "Mapped" | "Unmapped" | "Pending";
  vpnStatus: "Enabled" | "Disabled";
  wireTapApplianceType: "Standard" | "Pro" | "Enterprise";
  pullOutStatus: "Installed" | "Pulled Out" | "Maintenance";
  updatedBy: string;
  updatedAt: string;
  connectivity?: ConnectivityInfo;
}

/** GET /api/wiretap/:id — a device plus the add/edit form fields stored with it. */
export interface WireTAPDeviceDetail extends WireTAPDevice {
  noMappingReason: string | null;
  pullOutDate: string | null;
  pullOutReason: string | null;
  deactivationReason: string | null;
  /** Remaining add/edit form fields as last submitted. */
  details: Record<string, unknown>;
}

/** A theatre the device can be mapped to (GET /api/wiretap/theatres). */
export interface WireTAPTheatreOption {
  id: string;
  name: string;
  code: string | null;
}
