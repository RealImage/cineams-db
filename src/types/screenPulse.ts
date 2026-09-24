import type { ScreenTimeSeries } from "@/data/environmentTimeSeriesData";

/** A Pulse-enrolled theatre on the Screen Pulse dashboard. */
export interface PulseMonitoredTheatre {
  id: string;
  name: string;
  city: string;
  country: string;
  /** All screens in the theatre. */
  screens: number;
  /** Screens with an environment rating. */
  environment: number;
  /** Screens with a projection quality check. */
  projection: number;
}

export interface ScoreHistogramBin {
  range: string;
  count: number;
}

export interface PulseDashboardData {
  theatres: PulseMonitoredTheatre[];
  environmentHistogram: ScoreHistogramBin[];
  projectionHistogram: ScoreHistogramBin[];
}

/** GET /screen-pulse/environment/:screenId/series. "simulated" when the screen has no readings in the range. */
export interface ScreenTimeSeriesResponse extends ScreenTimeSeries {
  source: "readings" | "simulated";
}

/** PATCH /screen-pulse/screens/:id — the Screens page edit dialog. */
export interface ScreenInstallUpdate {
  pulseInstalled: boolean;
  pulseSerialNumber?: string;
  pulseInstalledOn?: string;
  pulseInstalledBy?: string;
  lionisInstalled: boolean;
  lionisSerialNumber?: string;
  lionisInstalledOn?: string;
  lionisInstalledBy?: string;
}
