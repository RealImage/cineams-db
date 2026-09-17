export const cameraMakes = ["CP-Vision", "Hikvision", "Dahua", "Axis", "Bosch", "Uniview"] as const;

export type CameraMake = (typeof cameraMakes)[number];

export const cameraModelsByMake: Record<string, string[]> = {
  "CP-Vision": ["CPV-100", "CPV-200 Pro", "CPV-300 Dome", "CPV-450 Bullet"],
  Hikvision: ["DS-2CD1023G0", "DS-2CD2143G2", "DS-2DE4425IW", "DS-2CD2T87G2"],
  Dahua: ["IPC-HFW2431", "IPC-HDW3849H", "SD49225XA", "IPC-HDBW5442E"],
  Axis: ["M3085-V", "P3245-LVE", "Q1656", "M2036-LE"],
  Bosch: ["FLEXIDOME 3000i", "DINION 5100i", "AUTODOME 5000i"],
  Uniview: ["IPC2124SR3", "IPC3614LE", "IPC6412LR"],
};

export type CameraOwnership = "Theatre" | "Qube";

export interface IcountCamera {
  cameraId: string;
  label: string;
  make?: string;
  model?: string;
  serialNumber?: string;
  ownership?: CameraOwnership;
  ipAddress?: string;
}

export interface IcountScreen {
  screenId: string;
  screenName: string;
  hasCameras: boolean;
  cameras: IcountCamera[];
}

export interface IcountTheatre {
  id: string;
  theatreId: string;
  theatreName: string;
  alsoKnownAs?: string;
  city: string;
  state: string;
  country: string;
  chainName: string;
  enabledScreens: number;
  totalScreens: number;
  updatedAt: string;
  updatedBy: string;
  latitude: number;
  longitude: number;
  screens: IcountScreen[];
}

const chains = ["AMC", "Regal", "Cinemark", "Odeon", "PVR", "CGV", "Cinépolis", "Village", "Pathé", "IMAX"];
const cities = [
  { city: "New York", state: "NY", country: "USA", lat: 40.7128, lng: -74.006 },
  { city: "Los Angeles", state: "CA", country: "USA", lat: 34.0522, lng: -118.2437 },
  { city: "Chicago", state: "IL", country: "USA", lat: 41.8781, lng: -87.6298 },
  { city: "London", state: "England", country: "UK", lat: 51.5074, lng: -0.1278 },
  { city: "Mumbai", state: "Maharashtra", country: "India", lat: 19.076, lng: 72.8777 },
  { city: "Seoul", state: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.978 },
  { city: "Mexico City", state: "CDMX", country: "Mexico", lat: 19.4326, lng: -99.1332 },
  { city: "Melbourne", state: "VIC", country: "Australia", lat: -37.8136, lng: 144.9631 },
  { city: "Toronto", state: "ON", country: "Canada", lat: 43.6532, lng: -79.3832 },
  { city: "Berlin", state: "Berlin", country: "Germany", lat: 52.52, lng: 13.405 },
];
const theatreNames = [
  "Empire 25", "Lincoln Square", "Union Square", "Times Square", "Century City",
  "Playa Vista", "Leicester Square", "Luxe Holloway", "Phoenix Mall", "INOX Citi",
  "Yongsan IPark", "Gangnam Star", "Diana Centro", "Perisur Plaza", "Crown Casino",
];
const operators = ["John Smith", "Sarah Connor", "James Lee", "Maria Garcia", "Anil Kumar", "Kim Soo-jin"];

function rand<T>(arr: T[], i: number): T { return arr[i % arr.length]; }
function randomDate(start: Date, end: Date): string {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

export function makeEmptyCamera(index: number, screenId: string): IcountCamera {
  return { cameraId: `${screenId}-CAM-${index}`, label: `Camera ${index}` };
}

function makeScreens(count: number, enabledCount: number, seed: number): IcountScreen[] {
  return Array.from({ length: count }, (_, i) => {
    const screenId = `SCR-${seed}-${i + 1}`;
    const hasCameras = i < enabledCount;
    const make = chainsSafeMake(seed + i);
    const models = cameraModelsByMake[make];
    return {
      screenId,
      screenName: `Screen ${i + 1}`,
      hasCameras,
      cameras: hasCameras
        ? [
            {
              cameraId: `${screenId}-CAM-1`,
              label: "Camera 1",
              make,
              model: models[(seed + i) % models.length],
              serialNumber: `ICT-${String(100000 + seed * 137 + i * 11)}`,
              ownership: (seed + i) % 3 === 0 ? "Theatre" : "Qube",
              ipAddress: `10.${seed % 250}.${i + 1}.${(i * 9) % 250}`,
            },
          ]
        : [makeEmptyCamera(1, screenId)],
    };
  });
}

function chainsSafeMake(i: number): string {
  return cameraMakes[i % cameraMakes.length];
}

export const icountTheatres: IcountTheatre[] = Array.from({ length: 45 }, (_, i) => {
  const loc = rand(cities, i);
  const chain = rand(chains, i);
  const tName = rand(theatreNames, i);
  const total = 6 + (i % 9);
  const enabled = 2 + (i % (total - 1));
  return {
    id: `icount-th-${i + 1}`,
    theatreId: `T${String(30000 + i)}`,
    theatreName: `${chain} ${tName}`,
    alsoKnownAs: i % 3 === 0 ? `${tName} Cineplex` : undefined,
    city: loc.city,
    state: loc.state,
    country: loc.country,
    chainName: chain,
    enabledScreens: enabled,
    totalScreens: total,
    updatedAt: randomDate(new Date(2025, 11, 1), new Date(2026, 8, 15)),
    updatedBy: operators[i % operators.length],
    latitude: loc.lat + (Math.random() - 0.5) * 0.05,
    longitude: loc.lng + (Math.random() - 0.5) * 0.05,
    screens: makeScreens(total, enabled, i + 1),
  };
});

export interface IcountLookupTheatre {
  id: string;
  theatreId: string;
  theatreName: string;
  city: string;
  state: string;
  country: string;
  chainName: string;
  totalScreens: number;
  latitude: number;
  longitude: number;
}

export const icountLookupTheatres: IcountLookupTheatre[] = Array.from({ length: 70 }, (_, i) => {
  const loc = rand(cities, i + 2);
  const chain = rand(chains, i + 1);
  const tName = rand(theatreNames, i + 4);
  return {
    id: `icount-lk-${i + 1}`,
    theatreId: `T${String(40000 + i)}`,
    theatreName: `${chain} ${tName} ${i + 1}`,
    city: loc.city,
    state: loc.state,
    country: loc.country,
    chainName: chain,
    totalScreens: 5 + (i % 10),
    latitude: loc.lat,
    longitude: loc.lng,
  };
});
