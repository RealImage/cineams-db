import { subDays, subMonths, subHours, format, startOfYear } from "date-fns";

export interface TimeSeriesPoint {
  timestamp: number;
  dateLabel: string;
  value: number;
  isBreach: boolean;
  isOnPeriod: boolean;
}

export interface ScreenTimeSeries {
  temperature: TimeSeriesPoint[];
  humidity: TimeSeriesPoint[];
  dust: TimeSeriesPoint[];
  thresholds: {
    temperature: { upper: number; lower: number };
    humidity: { upper: number; lower: number };
    dust: { upper: number; lower: number };
  };
}

type TimeRange = "1D" | "5D" | "1M" | "3M" | "6M" | "YTD" | "Max";

function getStartDate(range: TimeRange): Date {
  const now = new Date();
  switch (range) {
    case "1D": return subDays(now, 1);
    case "5D": return subDays(now, 5);
    case "1M": return subMonths(now, 1);
    case "3M": return subMonths(now, 3);
    case "6M": return subMonths(now, 6);
    case "YTD": return startOfYear(now);
    case "Max": return subMonths(now, 12);
  }
}

function getIntervalHours(range: TimeRange): number {
  switch (range) {
    case "1D": return 0.25;
    case "5D": return 1;
    case "1M": return 6;
    case "3M": return 12;
    case "6M": return 24;
    case "YTD": return 24;
    case "Max": return 48;
  }
}

function isOnPeriod(hour: number): boolean {
  // Simulate ON periods: 10am-2pm and 5pm-11pm (show times)
  return (hour >= 10 && hour < 14) || (hour >= 17 && hour < 23);
}

function generateSeries(
  range: TimeRange,
  seedBase: number,
  baseValue: number,
  variance: number,
  upperThreshold: number,
  lowerThreshold: number,
): TimeSeriesPoint[] {
  const start = getStartDate(range);
  const now = new Date();
  const intervalMs = getIntervalHours(range) * 3600000;
  const points: TimeSeriesPoint[] = [];
  let current = start.getTime();
  let value = baseValue;
  let seed = seedBase;

  const seededRandom = () => {
    seed = (seed * 16807 + 7) % 2147483647;
    return (seed % 10000) / 10000;
  };

  while (current <= now.getTime()) {
    const dt = new Date(current);
    const hour = dt.getHours();
    const drift = (seededRandom() - 0.5) * variance;
    value = value + drift;
    // occasional spikes
    if (seededRandom() > 0.92) value += (seededRandom() > 0.5 ? 1 : -1) * variance * 2;
    // keep value loosely bounded
    if (value > upperThreshold + variance * 3) value = upperThreshold + variance;
    if (value < lowerThreshold - variance * 3) value = lowerThreshold - variance;
    
    const isBreach = value > upperThreshold || value < lowerThreshold;
    const dateLabel = format(dt, range === "1D" ? "HH:mm" : "dd MMM HH:mm");
    
    points.push({
      timestamp: current,
      dateLabel,
      value: Math.round(value * 10) / 10,
      isBreach,
      isOnPeriod: isOnPeriod(hour),
    });
    current += intervalMs;
  }
  return points;
}

export function generateScreenTimeSeries(screenId: string, range: TimeRange): ScreenTimeSeries {
  // Use screenId to create a deterministic seed
  let seed = 0;
  for (let i = 0; i < screenId.length; i++) seed += screenId.charCodeAt(i) * (i + 1);

  const thresholds = {
    temperature: { upper: 26, lower: 20 },
    humidity: { upper: 55, lower: 38 },
    dust: { upper: 48, lower: -2 },
  };

  return {
    temperature: generateSeries(range, seed, 23, 0.8, thresholds.temperature.upper, thresholds.temperature.lower),
    humidity: generateSeries(range, seed + 100, 45, 2.5, thresholds.humidity.upper, thresholds.humidity.lower),
    dust: generateSeries(range, seed + 200, 30, 4, thresholds.dust.upper, thresholds.dust.lower),
    thresholds,
  };
}

export const TIME_RANGES: TimeRange[] = ["1D", "5D", "1M", "3M", "6M", "YTD", "Max"];
export type { TimeRange };
