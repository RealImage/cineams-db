
import { Theatre, Chain, TDLDevice, Company, DashboardStats, Screen, ScreenDevice, WireTAPDevice } from "../types";

// Helper function to generate screens for a theatre
const generateScreens = (theatreId: string, count: number): Screen[] => {
  const screens: Screen[] = [];
  
  for (let i = 1; i <= count; i++) {
    screens.push({
      id: `${theatreId}-screen-${i}`,
      theatreId: theatreId,
      number: `${i}`,
      name: `Audi ${i}`,
      uuid: `screen-${theatreId}-${i}`,
      thirdPartyId: `TP-${theatreId}-${i}`,
      operators: [
        {
          name: "John Operator",
          email: "john@cinema.com",
          phone: "+1 555-123-4567"
        }
      ],
      autoScreenUpdateLock: false,
      flmManagementLock: false,
      multiThumbprintKdmScreen: false,
      status: "Active",
      seatingCapacity: 100 + (i * 10),
      coolingType: i % 2 === 0 ? "Central" : "Split Unit",
      wheelchairAccessibility: true,
      motionSeats: i % 3 === 0,
      dimensions: {
        auditoriumWidth: 15 + i,
        auditoriumHeight: 8 + (i * 0.5),
        auditoriumDepth: 20 + i,
        screenWidth: 12 + i,
        screenHeight: 6 + (i * 0.5),
        throwDistance: 18 + i,
        gain: 1.8
      },
      projection: {
        type: i % 2 === 0 ? "Digital 2D/3D" : "Laser",
        manufacturer: i % 3 === 0 ? "Christie" : i % 3 === 1 ? "Barco" : "Sony",
        masking: i % 2 === 0
      },
      sound: {
        processor: i % 2 === 0 ? "Dolby CP750" : "QSC Q-SYS",
        speakers: i % 3 === 0 ? "JBL" : i % 3 === 1 ? "Klipsch" : "Meyer Sound",
        soundMixes: ["5.1 Surround", "7.1 Surround"],
        iabSupported: i % 2 === 0
      },
      devices: [
        {
          id: `${theatreId}-projector-${i}`,
          manufacturer: i % 3 === 0 ? "Christie" : i % 3 === 1 ? "Barco" : "Sony",
          model: i % 3 === 0 ? "CP4325-RGB" : i % 3 === 1 ? "DP4K-60L" : "SRX-R815P",
          serialNumber: `PROJ-${100 + i}`,
          certificateStatus: "Valid",
          certificateLockStatus: "Unlocked",
          softwareVersion: "2.5.1"
        },
        {
          id: `${theatreId}-server-${i}`,
          manufacturer: i % 2 === 0 ? "Dolby" : "GDC",
          model: i % 2 === 0 ? "IMS3000" : "SR-1000",
          serialNumber: `SERVER-${200 + i}`,
          certificateStatus: "Valid",
          certificateLockStatus: "Unlocked",
          softwareVersion: "7.3.2"
        }
      ],
      ipAddresses: [
        {
          address: `192.168.1.${10 + i}`,
          subnet: "255.255.255.0",
          gateway: "192.168.1.1"
        }
      ],
      suites: [],
      createdAt: new Date(Date.now() - (i * 1000000)).toISOString(),
      updatedAt: new Date(Date.now() - (i * 500000)).toISOString()
    });
  }
  
  return screens;
};

// Helper function to generate WireTAP devices for a theatre
const generateWireTAPDevices = (theatreId: string, theatreName: string, count: number): WireTAPDevice[] => {
  const devices: WireTAPDevice[] = [];
  
  for (let i = 1; i <= count; i++) {
    devices.push({
      id: `${theatreId}-wiretap-${i}`,
      serialNumber: `WT-${theatreId}-${10000 + i}`,
      mappingStatus: i % 3 === 0 ? "Unmapped" : "Mapped",
      theatreId: theatreId,
      theatreName: theatreName,
      status: i % 4 === 0 ? "Inactive" : "Active",
      createdAt: new Date(Date.now() - (i * 1000000)).toISOString(),
      updatedAt: new Date(Date.now() - (i * 500000)).toISOString()
    });
  }
  
  return devices;
};

export const theatres: Theatre[] = [
  {
    id: "1",
    name: "Cinema City Metropolis",
    displayName: "Cinema City Metropolis",
    alternateNames: ["CCM", "Metropolis Cinema"],
    uuid: "cc-metro-001",
    thirdPartyId: "CCM001",
    chainId: "1",
    chainName: "Cinema City International",
    companyId: "1",
    companyName: "Global Entertainment Holdings",
    listing: "Listed",
    type: "Multiplex",
    address: "123 Main Street, New York, NY 10001, USA",
    city: "New York",
    state: "NY",
    country: "USA",
    postalCode: "10001",
    phoneNumber: "+1 212-555-0123",
    email: "info@cinemacity.com",
    latitude: 40.7128,
    longitude: -74.006,
    locationType: "Mall",
    bikeParkingAvailable: true,
    bikeParkingCapacity: 50,
    carParkingAvailable: true,
    carParkingCapacity: 200,
    theatreManagementSystem: "Arts Alliance Media",
    ticketingSystem: "Vista",
    startDate: "2010-05-15",
    website: "https://www.cinemacity.com/metropolis",
    contact: "+1 212-555-0123",
    status: "Active",
    screenCount: 8,
    screens: generateScreens("1", 8),
    wireTAPDevices: generateWireTAPDevices("1", "Cinema City Metropolis", 3),
    createdAt: "2021-01-15T08:30:00Z",
    updatedAt: "2023-11-10T14:45:00Z"
  },
  {
    id: "2",
    name: "Regal Cinema Downtown",
    displayName: "Regal Downtown",
    uuid: "regal-dt-002",
    thirdPartyId: "RDT002",
    chainId: "2",
    chainName: "Regal Cinemas",
    companyId: "2",
    companyName: "Cineworld Group",
    listing: "Listed",
    type: "Multiplex",
    address: "456 Broadway, New York, NY 10013, USA",
    city: "New York",
    state: "NY",
    country: "USA",
    postalCode: "10013",
    phoneNumber: "+1 212-555-0456",
    email: "info@regalcinemas.com",
    locationType: "Standalone",
    bikeParkingAvailable: false,
    carParkingAvailable: true,
    carParkingCapacity: 150,
    theatreManagementSystem: "GDC TMS",
    ticketingSystem: "Vista",
    status: "Active",
    screenCount: 12,
    screens: generateScreens("2", 12),
    wireTAPDevices: generateWireTAPDevices("2", "Regal Cinema Downtown", 2),
    createdAt: "2020-03-20T10:15:00Z",
    updatedAt: "2023-10-05T09:30:00Z"
  },
  {
    id: "3",
    name: "AMC Lincoln Square",
    displayName: "AMC Lincoln Square 13",
    uuid: "amc-linc-003",
    chainId: "3",
    chainName: "AMC Theatres",
    companyId: "3",
    companyName: "AMC Entertainment",
    listing: "Listed",
    type: "IMAX Multiplex",
    address: "1998 Broadway, New York, NY 10023, USA",
    city: "New York",
    state: "NY",
    country: "USA",
    postalCode: "10023",
    phoneNumber: "+1 212-555-0789",
    email: "info@amctheatres.com",
    locationType: "Mall",
    bikeParkingAvailable: true,
    bikeParkingCapacity: 30,
    carParkingAvailable: true,
    carParkingCapacity: 300,
    theatreManagementSystem: "Dolby TMS",
    ticketingSystem: "AMC Ticketing",
    status: "Active",
    screenCount: 13,
    screens: generateScreens("3", 13),
    wireTAPDevices: generateWireTAPDevices("3", "AMC Lincoln Square", 4),
    createdAt: "2019-11-08T15:40:00Z",
    updatedAt: "2023-09-12T11:20:00Z"
  },
  {
    id: "4",
    name: "Landmark Sunshine Cinema",
    displayName: "Sunshine Cinema",
    uuid: "lndmrk-sun-004",
    chainId: "4",
    chainName: "Landmark Theatres",
    companyId: "4",
    companyName: "Cohen Media Group",
    listing: "Listed",
    type: "Arthouse",
    address: "143 E Houston St, New York, NY 10002, USA",
    city: "New York",
    state: "NY",
    country: "USA",
    postalCode: "10002",
    phoneNumber: "+1 212-555-1010",
    email: "info@landmarktheatres.com",
    status: "Inactive",
    closureDetails: "Closed permanently in January 2018",
    screenCount: 5,
    screens: generateScreens("4", 5),
    createdAt: "2018-01-05T12:00:00Z",
    updatedAt: "2018-01-21T17:30:00Z"
  },
  {
    id: "5",
    name: "Alamo Drafthouse Brooklyn",
    displayName: "Alamo Brooklyn",
    uuid: "alamo-bk-005",
    chainId: "5",
    chainName: "Alamo Drafthouse",
    companyId: "5",
    companyName: "Alamo Drafthouse Cinema",
    listing: "Listed",
    type: "Dine-in Multiplex",
    address: "445 Albee Square West, Brooklyn, NY 11201, USA",
    city: "Brooklyn",
    state: "NY",
    country: "USA",
    postalCode: "11201",
    phoneNumber: "+1 718-555-2020",
    email: "info@alamodrafthouse.com",
    status: "Active",
    screenCount: 7,
    screens: generateScreens("5", 7),
    createdAt: "2020-06-23T09:10:00Z",
    updatedAt: "2023-10-30T16:15:00Z"
  },
  {
    id: "6",
    name: "Cinépolis Chelsea",
    displayName: "Cinépolis Chelsea",
    uuid: "cpolis-chls-006",
    chainId: "6",
    chainName: "Cinépolis",
    companyId: "6",
    companyName: "Cinépolis USA",
    listing: "Listed",
    type: "Luxury Multiplex",
    address: "260 W 23rd St, New York, NY 10011, USA",
    city: "New York",
    state: "NY",
    country: "USA",
    postalCode: "10011",
    phoneNumber: "+1 212-555-3030",
    email: "info@cinepolisusa.com",
    status: "Active",
    screenCount: 6,
    screens: generateScreens("6", 6),
    createdAt: "2021-02-12T14:20:00Z",
    updatedAt: "2023-08-17T13:45:00Z"
  },
  {
    id: "7",
    name: "iPic Theaters Fulton Market",
    displayName: "iPic Fulton Market",
    uuid: "ipic-flt-007",
    chainId: "7",
    chainName: "iPic Theaters",
    companyId: "7",
    companyName: "iPic Entertainment",
    listing: "Listed",
    type: "Premium Multiplex",
    address: "11 Fulton St, New York, NY 10038, USA",
    city: "New York",
    state: "NY",
    country: "USA",
    postalCode: "10038",
    phoneNumber: "+1 212-555-4040",
    email: "info@ipictheaters.com",
    status: "Active",
    screenCount: 8,
    screens: generateScreens("7", 8),
    createdAt: "2020-09-18T11:30:00Z",
    updatedAt: "2023-07-28T10:10:00Z"
  },
  {
    id: "8",
    name: "Nitehawk Cinema Prospect Park",
    displayName: "Nitehawk Prospect",
    uuid: "ntehwk-pp-008",
    chainId: "8",
    chainName: "Nitehawk Cinema",
    companyId: "8",
    companyName: "Nitehawk Cinema LLC",
    listing: "Listed",
    type: "Dine-in Arthouse",
    address: "188 Prospect Park West, Brooklyn, NY 11215, USA",
    city: "Brooklyn",
    state: "NY",
    country: "USA",
    postalCode: "11215",
    phoneNumber: "+1 718-555-5050",
    email: "info@nitehawkcinema.com",
    status: "Active",
    screenCount: 3,
    screens: generateScreens("8", 3),
    createdAt: "2021-05-07T16:50:00Z",
    updatedAt: "2023-11-02T12:35:00Z"
  }
];

export const chains: Chain[] = [
  {
    id: "1",
    name: "Cinema City International",
    companyId: "1",
    companyName: "Global Entertainment Holdings",
    theatreCount: 87,
    status: "Active",
    createdAt: "2010-01-15T08:30:00Z",
    updatedAt: "2023-10-10T14:45:00Z"
  },
  {
    id: "2",
    name: "Regal Cinemas",
    companyId: "2",
    companyName: "Cineworld Group",
    theatreCount: 542,
    status: "Active",
    createdAt: "1989-03-20T10:15:00Z",
    updatedAt: "2023-09-05T09:30:00Z"
  },
  {
    id: "3",
    name: "AMC Theatres",
    companyId: "3",
    companyName: "AMC Entertainment",
    theatreCount: 950,
    status: "Active",
    createdAt: "1920-11-08T15:40:00Z",
    updatedAt: "2023-08-12T11:20:00Z"
  },
  {
    id: "4",
    name: "Landmark Theatres",
    companyId: "4",
    companyName: "Cohen Media Group",
    theatreCount: 45,
    status: "Active",
    createdAt: "1974-01-05T12:00:00Z",
    updatedAt: "2023-07-21T17:30:00Z"
  },
  {
    id: "5",
    name: "Alamo Drafthouse",
    companyId: "5",
    companyName: "Alamo Drafthouse Cinema",
    theatreCount: 35,
    status: "Active",
    createdAt: "1997-06-23T09:10:00Z",
    updatedAt: "2023-10-15T16:15:00Z"
  }
];

export const companies: Company[] = [
  {
    id: "1",
    name: "Global Entertainment Holdings",
    chainCount: 3,
    theatreCount: 245,
    status: "Active",
    createdAt: "2000-01-15T08:30:00Z",
    updatedAt: "2023-10-10T14:45:00Z"
  },
  {
    id: "2",
    name: "Cineworld Group",
    chainCount: 2,
    theatreCount: 787,
    status: "Active",
    createdAt: "1995-03-20T10:15:00Z",
    updatedAt: "2023-09-05T09:30:00Z"
  },
  {
    id: "3",
    name: "AMC Entertainment",
    chainCount: 1,
    theatreCount: 950,
    status: "Active",
    createdAt: "1920-11-08T15:40:00Z",
    updatedAt: "2023-08-12T11:20:00Z"
  },
  {
    id: "4",
    name: "Cohen Media Group",
    chainCount: 1,
    theatreCount: 45,
    status: "Active",
    createdAt: "2008-01-05T12:00:00Z",
    updatedAt: "2023-07-21T17:30:00Z"
  },
  {
    id: "5",
    name: "Alamo Drafthouse Cinema",
    chainCount: 1,
    theatreCount: 35,
    status: "Active",
    createdAt: "1997-06-23T09:10:00Z",
    updatedAt: "2023-10-15T16:15:00Z"
  }
];

export const tdlDevices: TDLDevice[] = [
  {
    id: "1",
    manufacturer: "Christie",
    model: "CP4325-RGB",
    serialNumber: "CHR4325RGB001",
    publicKeyThumbprint: "a1b2c3d4e5f6g7h8i9j0",
    issuerThumbprint: "z9y8x7w6v5u4t3s2r1",
    source: "FLM Registry",
    updatedBy: "System",
    updatedOn: "2023-10-15T14:30:00Z",
    certificateStatus: "Valid",
    firmwareVersion: "2.5.1",
    autoUpdateCertificate: true
  },
  {
    id: "2",
    manufacturer: "Sony",
    model: "SRX-R815P",
    serialNumber: "SONY815P002",
    publicKeyThumbprint: "k1l2m3n4o5p6q7r8s9",
    issuerThumbprint: "q1w2e3r4t5y6u7i8o9",
    source: "User",
    updatedBy: "John Smith",
    updatedOn: "2023-09-20T10:15:00Z",
    certificateStatus: "Valid",
    firmwareVersion: "3.1.0",
    autoUpdateCertificate: true
  },
  {
    id: "3",
    manufacturer: "Barco",
    model: "DP4K-60L",
    serialNumber: "BRC60L003",
    publicKeyThumbprint: "t1u2v3w4x5y6z7a8b9",
    issuerThumbprint: "a9s8d7f6g5h4j3k2l1",
    source: "FTP",
    updatedBy: "System",
    updatedOn: "2023-11-05T16:45:00Z",
    certificateStatus: "Valid",
    firmwareVersion: "1.9.2",
    autoUpdateCertificate: false
  },
  {
    id: "4",
    manufacturer: "NEC",
    model: "NC3541L",
    serialNumber: "NEC3541L004",
    publicKeyThumbprint: "c1d2e3f4g5h6i7j8k9",
    issuerThumbprint: "z1x2c3v4b5n6m7q8w9",
    source: "System",
    updatedBy: "System",
    updatedOn: "2023-10-30T09:10:00Z",
    certificateStatus: "Expired",
    firmwareVersion: "2.2.3",
    autoUpdateCertificate: true
  },
  {
    id: "5",
    manufacturer: "Christie",
    model: "CP2308",
    serialNumber: "CHR2308005",
    publicKeyThumbprint: "l1m2n3o4p5q6r7s8t9",
    issuerThumbprint: "p9o8i7u6y5t4r3e2w1",
    source: "FLM Registry",
    updatedBy: "System",
    updatedOn: "2023-08-12T11:25:00Z",
    certificateStatus: "Valid",
    firmwareVersion: "1.5.4",
    autoUpdateCertificate: true
  }
];

export const mockDashboardStats: DashboardStats = {
  totalTheatres: 2458,
  activeTheatres: 2341,
  totalScreens: 28765,
  totalDevices: 54321,
  totalCompanies: 143,
  totalChains: 287,
  recentlyAddedTheatres: theatres.slice(0, 5).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  recentlyUpdatedTheatres: theatres.slice(0, 5).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
  theatresByStatus: [
    { status: "Active", count: 2341 },
    { status: "Inactive", count: 87 },
    { status: "Deleted", count: 30 }
  ],
  theatresByType: [
    { type: "Multiplex", count: 1589 },
    { type: "Single Screen", count: 342 },
    { type: "IMAX", count: 187 },
    { type: "Arthouse", count: 165 },
    { type: "Drive-in", count: 89 },
    { type: "Other", count: 86 }
  ]
};
