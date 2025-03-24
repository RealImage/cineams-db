export interface Theatre {
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
  listing: 'Listed' | 'Private';
  type: string;
  address: string;
  latitude?: number;
  longitude?: number;
  startDate?: string;
  website?: string;
  contact?: string;
  status: 'Active' | 'Inactive' | 'Deleted';
  closureDetails?: string;
  screenCount: number;
  screens?: Screen[];
  locationType?: string;
  bikeParkingAvailable?: boolean;
  bikeParkingCapacity?: number;
  carParkingAvailable?: boolean;
  carParkingCapacity?: number;
  theatreManagementSystem?: string;
  ticketingSystem?: string;
  wireTAPDevices?: WireTAPDevice[];
  createdAt: string;
  updatedAt: string;
}

export interface Chain {
  id: string;
  name: string;
  companyId: string;
  companyName: string;
  theatreCount: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  chainCount: number;
  theatreCount: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export interface TDLDevice {
  id: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  publicKeyThumbprint: string;
  issuerThumbprint: string;
  source: 'User' | 'FTP' | 'FLM Registry' | 'System';
  updatedBy: string;
  updatedOn: string;
  certificateStatus: 'Valid' | 'Expired' | 'Revoked';
  firmwareVersion: string;
  autoUpdateCertificate: boolean;
}

export interface Screen {
  id: string;
  theatreId: string;
  number: string;
  name: string;
  uuid: string;
  thirdPartyId?: string;
  operators?: ScreenOperator[];
  autoScreenUpdateLock: boolean;
  flmManagementLock: boolean;
  multiThumbprintKdmScreen: boolean;
  status: 'Active' | 'Inactive' | 'Deleted';
  closureNotes?: string;
  seatingCapacity?: number;
  coolingType?: string;
  wheelchairAccessibility: boolean;
  motionSeats: boolean;
  dimensions?: ScreenDimensions;
  projection?: ScreenProjection;
  sound?: ScreenSound;
  ipAddress?: string;
  subnet?: string;
  gateway?: string;
  devices: ScreenDevice[];
  createdAt: string;
  updatedAt: string;
}

export interface ScreenOperator {
  name: string;
  email: string;
  phone?: string;
}

export interface ScreenDimensions {
  auditoriumWidth?: number;
  auditoriumHeight?: number;
  auditoriumDepth?: number;
  screenWidth?: number;
  screenHeight?: number;
  throwDistance?: number;
  gain?: number;
}

export interface ScreenProjection {
  type?: string;
  manufacturer?: string;
  masking?: boolean;
}

export interface ScreenSound {
  processor?: string;
  speakers?: string;
  soundMixes?: string[];
  iabSupported?: boolean;
}

export interface ScreenDevice {
  id: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  certificate?: string;
  softwareVersion?: string;
}

export interface WireTAPDevice {
  id: string;
  serialNumber: string;
  mappingStatus: 'Mapped' | 'Unmapped';
  theatreId?: string;
  theatreName?: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalTheatres: number;
  activeTheatres: number;
  totalScreens: number;
  totalDevices: number;
  totalCompanies: number;
  totalChains: number;
  recentlyAddedTheatres: Theatre[];
  recentlyUpdatedTheatres: Theatre[];
  theatresByStatus: {
    status: string;
    count: number;
  }[];
  theatresByType: {
    type: string;
    count: number;
  }[];
}
