export interface PulseScreenDevice {
  screenId: string;
  screenName: string;
  applianceId?: string;
  ipAddress?: string;
  installedDate?: string;
  installedBy?: string;
  lastActiveOn?: string;
  status: "Active" | "Device Paused" | "Inactive";
  hasDevice: boolean;
}

export interface PulseTheatre {
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
  networkId?: string;
  networkPassword?: string;
  screens: PulseScreenDevice[];
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
  { city: "Tokyo", state: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
  { city: "Paris", state: "Île-de-France", country: "France", lat: 48.8566, lng: 2.3522 },
];
const theatreNames = [
  "Empire 25", "Lincoln Square", "Union Square", "Times Square", "Century City",
  "Playa Vista", "Leicester Square", "Luxe Holloway", "Phoenix Mall", "INOX Citi",
  "Yongsan IPark", "Gangnam Star", "Diana Centro", "Perisur Plaza", "Crown Casino",
  "Jam Factory", "Schouwburgplein", "De Munt", "Lincoln IMAX", "Waterloo IMAX",
];
const operators = ["John Smith", "Sarah Connor", "James Lee", "Maria Garcia", "Anil Kumar", "Kim Soo-jin", "Carlos Mendez", "Emily Watson"];

function rand<T>(arr: T[], i: number): T { return arr[i % arr.length]; }
function randomDate(start: Date, end: Date): string {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

function makeScreens(count: number, enabledCount: number, theatreSeed: number): PulseScreenDevice[] {
  return Array.from({ length: count }, (_, i) => {
    const hasDevice = i < enabledCount;
    const status: PulseScreenDevice["status"] = hasDevice
      ? (i % 7 === 0 ? "Device Paused" : "Active")
      : "Inactive";
    return {
      screenId: `SCR-${theatreSeed}-${i + 1}`,
      screenName: `Screen ${i + 1}`,
      hasDevice,
      applianceId: hasDevice ? `PULSE-${1000 + theatreSeed * 100 + i}` : undefined,
      ipAddress: hasDevice ? `10.${theatreSeed % 250}.${i + 1}.${(i * 7) % 250}` : undefined,
      installedDate: hasDevice ? randomDate(new Date(2023, 0, 1), new Date(2025, 6, 1)) : undefined,
      installedBy: hasDevice ? operators[(theatreSeed + i) % operators.length] : undefined,
      lastActiveOn: hasDevice ? randomDate(new Date(2026, 3, 1), new Date(2026, 4, 28)) : undefined,
      status,
    };
  });
}

export const pulseTheatres: PulseTheatre[] = Array.from({ length: 60 }, (_, i) => {
  const loc = rand(cities, i + 2);
  const chain = rand(chains, i + 4);
  const tName = rand(theatreNames, i + 1);
  const total = 6 + (i % 10);
  const enabled = 2 + (i % (total - 1));
  return {
    id: `pulse-th-${i + 1}`,
    theatreId: `T${String(30000 + i)}`,
    theatreName: `${chain} ${tName}`,
    alsoKnownAs: i % 3 === 0 ? `${tName} Cineplex` : undefined,
    city: loc.city,
    state: loc.state,
    country: loc.country,
    chainName: chain,
    enabledScreens: enabled,
    totalScreens: total,
    updatedAt: randomDate(new Date(2025, 11, 1), new Date(2026, 4, 28)),
    updatedBy: operators[i % operators.length],
    latitude: loc.lat + (Math.random() - 0.5) * 0.05,
    longitude: loc.lng + (Math.random() - 0.5) * 0.05,
    networkId: `NET-${2000 + i}`,
    networkPassword: "********",
    screens: makeScreens(total, enabled, i + 1),
  };
});

export interface PulseLookupTheatre {
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

export const pulseLookupTheatres: PulseLookupTheatre[] = Array.from({ length: 80 }, (_, i) => {
  const loc = rand(cities, i + 5);
  const chain = rand(chains, i + 2);
  const tName = rand(theatreNames, i + 7);
  return {
    id: `pulse-lk-${i + 1}`,
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
