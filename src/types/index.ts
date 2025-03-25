
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

export type Theatre = {
  id: string;
  name: string;
  displayName: string;
  chainName: string;
  companyName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phoneNumber: string;
  email: string;
  website: string;
  timezone: string;
  wireTap?: string;
  screenCount: number;
  status: "Active" | "Inactive" | "Closed";
  adIntegrators?: string[];
  screens?: Screen[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
};
