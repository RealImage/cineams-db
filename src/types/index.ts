
export type Operator = {
  name: string;
  email: string;
  phone?: string;
};

export type IPAddress = {
  address: string;
  subnet: string;
  gateway: string;
};

export type ScreenDevice = {
  id: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  role?: string;
  certificateStatus: "Valid" | "Invalid" | "Expired";
  certificateLockStatus: "Locked" | "Unlocked";
  softwareVersion: string;
};

export type Suite = {
  id: string;
  name: string;
  devices: string[];
  ipAddresses: number[];
  status: "Valid" | "Invalid";
};

export type Dimensions = {
  auditoriumWidth?: number;
  auditoriumHeight?: number;
  auditoriumDepth?: number;
  screenWidth?: number;
  screenHeight?: number;
  throwDistance?: number;
  gain?: number;
};

export type Projection = {
  type?: string;
  manufacturer?: string;
  masking?: boolean;
};

export type Sound = {
  processor?: string;
  speakers?: string;
  soundMixes: string[];
  iabSupported?: boolean;
};

export type TemporaryClosure = {
  id: string;
  startDate: string;
  endDate?: string;
  reason: string;
  notes?: string;
  active: boolean;
};

export type Screen = {
  id: string;
  theatreId: string;
  number: string;
  name: string;
  uuid: string;
  thirdPartyId?: string;
  operators?: Operator[];
  autoScreenUpdateLock: boolean;
  flmManagementLock: boolean;
  multiThumbprintKdmScreen: boolean;
  status: "Active" | "Inactive" | "Deleted";
  closureNotes?: string;
  seatingCapacity?: number;
  coolingType?: string;
  wheelchairAccessibility: boolean;
  motionSeats: boolean;
  dimensions?: Dimensions;
  projection?: Projection;
  sound?: Sound;
  devices: ScreenDevice[];
  ipAddresses: IPAddress[];
  suites: Suite[];
  temporaryClosures?: TemporaryClosure[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
};

export type DeliveryAddress = {
  useTheatreAddress: boolean;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type DeliveryTimeSlot = {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
};

export type DCPPhysicalDeliveryMethod = {
  id: string;
  mediaType: string;
  details: string;
};

export type DCPNetworkDeliveryMethod = {
  id: string;
  networkURL: string;
};

export type DCPModemDeliveryMethod = {
  id: string;
  modemPhoneNumber: string;
};

export type Contact = {
  id: string;
  name?: string;
  email: string;
  phone?: string;
};

export type Theatre = {
  id: string;
  name: string;
  displayName: string;
  alternateNames?: string[];
  uuid: string;
  thirdPartyId?: string;
  chainId: string;
  chainName: string;
  companyId: string;
  companyName: string;
  listing?: "Listed" | "Private";
  type: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phoneNumber: string;
  email: string;
  website?: string;
  timezone?: string;
  wireTap?: string;
  screenCount: number;
  status: "Active" | "Inactive" | "Closed";
  adIntegrators?: string[];
  screens?: Screen[];
  notes?: string;
  closureDetails?: string;
  latitude?: number;
  longitude?: number;
  locationType?: string;
  bikeParkingAvailable?: boolean;
  bikeParkingCapacity?: number;
  carParkingAvailable?: boolean;
  carParkingCapacity?: number;
  theatreManagementSystem?: string;
  ticketingSystem?: string;
  startDate?: string;
  contact?: string;
  deliveryAddress?: DeliveryAddress;
  deliveryInstructions?: string;
  deliveryTimeSlots?: DeliveryTimeSlot[];
  dcpPhysicalDeliveryMethods?: DCPPhysicalDeliveryMethod[];
  dcpNetworkDeliveryMethods?: DCPNetworkDeliveryMethod[];
  dcpModemDeliveryMethods?: DCPModemDeliveryMethod[];
  dcpDeliveryContacts?: Contact[];
  sendEmailsForDCPDelivery?: boolean;
  dcpContentTypesForEmail?: string[];
  keyDeliveryContacts?: Contact[];
  kdmDeliveryEmailsInFLMX?: string;
  autoIngestOfContentEnabled?: boolean;
  autoIngestContentTypes?: string[];
  qcnTheatreIPAddressRange?: string;
  wireTAPDevices?: WireTAPDevice[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
};

export type WireTAPDevice = {
  id: string;
  serialNumber: string;
  mappingStatus: string;
  theatreId: string;
  theatreName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type Chain = {
  id: string;
  name: string;
  companyId: string;
  companyName: string;
  theatreCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type Company = {
  id: string;
  name: string;
  chainCount: number;
  theatreCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type TDLDevice = {
  id: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  publicKeyThumbprint: string;
  issuerThumbprint: string;
  source: string;
  updatedBy: string;
  updatedOn: string;
  certificateStatus: string;
  firmwareVersion: string;
  autoUpdateCertificate: boolean;
};

export type DashboardStats = {
  totalTheatres: number;
  activeTheatres: number;
  totalScreens: number;
  totalDevices: number;
  totalCompanies: number;
  totalChains: number;
  recentlyAddedTheatres: Theatre[];
  recentlyUpdatedTheatres: Theatre[];
  theatresByStatus: { status: string; count: number }[];
  theatresByType: { type: string; count: number }[];
};
