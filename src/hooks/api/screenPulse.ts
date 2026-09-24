import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { api } from "@/lib/api";
import type { EnvironmentScreenRecord } from "@/data/environmentManagerData";
import type { ProjectionScreenRecord } from "@/data/projectionManagerData";
import type { ScreenRecord } from "@/data/screenManagerData";
import type { TimeRange, TimeSeriesPoint } from "@/data/environmentTimeSeriesData";
import type { PulseDashboardData, ScreenInstallUpdate, ScreenTimeSeriesResponse } from "@/types/screenPulse";

export const screenPulseKeys = {
  all: ["screen-pulse"] as const,
  dashboard: ["screen-pulse", "dashboard"] as const,
  environment: ["screen-pulse", "environment"] as const,
  series: (screenId: string, range: TimeRange) => ["screen-pulse", "environment", screenId, "series", range] as const,
  projection: ["screen-pulse", "projection"] as const,
  screens: ["screen-pulse", "screens"] as const,
};

export const usePulseDashboard = () =>
  useQuery({ queryKey: screenPulseKeys.dashboard, queryFn: () => api.get<PulseDashboardData>("/screen-pulse/dashboard") });

export const useEnvironmentScreens = () =>
  useQuery({ queryKey: screenPulseKeys.environment, queryFn: () => api.get<EnvironmentScreenRecord[]>("/screen-pulse/environment") });

/** Re-label points in the viewer's time zone (the server labels in its own). */
const relabel = (range: TimeRange) => (points: TimeSeriesPoint[]) =>
  points.map((p) => ({ ...p, dateLabel: format(p.timestamp, range === "1D" ? "HH:mm" : "dd MMM HH:mm") }));

export const useScreenTimeSeries = (screenId: string | undefined, range: TimeRange) =>
  useQuery({
    queryKey: screenPulseKeys.series(screenId ?? "", range),
    enabled: !!screenId,
    // Keep the previous range on screen while a new one loads (same screen only).
    placeholderData: (prev, prevQuery) => (prevQuery?.queryKey[2] === screenId ? prev : undefined),
    queryFn: () =>
      api.get<ScreenTimeSeriesResponse>(`/screen-pulse/environment/${encodeURIComponent(screenId!)}/series?range=${range}`),
    select: (d): ScreenTimeSeriesResponse => {
      const fix = relabel(range);
      return { ...d, temperature: fix(d.temperature), humidity: fix(d.humidity), dust: fix(d.dust) };
    },
  });

export const useProjectionScreens = () =>
  useQuery({ queryKey: screenPulseKeys.projection, queryFn: () => api.get<ProjectionScreenRecord[]>("/screen-pulse/projection") });

export const usePulseScreens = () =>
  useQuery({ queryKey: screenPulseKeys.screens, queryFn: () => api.get<ScreenRecord[]>("/screen-pulse/screens") });

export const useUpdatePulseScreen = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: ScreenInstallUpdate & { id: string }) =>
      api.patch<ScreenRecord>(`/screen-pulse/screens/${encodeURIComponent(id)}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: screenPulseKeys.all }),
  });
};
