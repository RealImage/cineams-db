
export interface WireTAPDevice {
  id: string;
  hardwareSerialNumber: string;
  applicationSerialNumber: string;
  hostName: string;
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
  updatedBy: string;
  updatedAt: string;
}
