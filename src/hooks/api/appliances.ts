import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { LookupTheatre, QubeAcsScreenDevice, QubeAcsTheatre } from "@/data/qubeAcsData";

/**
 * Qube ACS, Pulse and Edge share one API (/api/appliances/:type). Pulse and
 * Edge responses are the Qube ACS shape without the ACS-only fields, so they
 * satisfy PulseTheatre / EdgeTheatre as well.
 */
export type ApplianceKind = "qube-acs" | "pulse" | "edge";

export const applianceKeys = {
  all: (kind: ApplianceKind) => ["appliances", kind] as const,
  list: (kind: ApplianceKind) => ["appliances", kind, "list"] as const,
  detail: (kind: ApplianceKind, id: string) => ["appliances", kind, "detail", id] as const,
  lookup: (kind: ApplianceKind) => ["appliances", kind, "lookup"] as const,
  lookupDetail: (kind: ApplianceKind, id: string) => ["appliances", kind, "lookup", id] as const,
};

export type ApplianceLookupDetail = LookupTheatre & { screens: QubeAcsScreenDevice[] };

export interface ApplianceEnrolmentInput {
  latitude: number;
  longitude: number;
  networkId?: string;
  networkPassword?: string;
  screens: QubeAcsScreenDevice[];
}

export const useApplianceTheatres = (kind: ApplianceKind) =>
  useQuery({ queryKey: applianceKeys.list(kind), queryFn: () => api.get<QubeAcsTheatre[]>(`/appliances/${kind}`) });

export const useApplianceTheatre = (kind: ApplianceKind, id: string | undefined) =>
  useQuery({
    queryKey: applianceKeys.detail(kind, id ?? ""),
    queryFn: () => api.get<QubeAcsTheatre>(`/appliances/${kind}/${id}`),
    enabled: !!id,
  });

/** Theatres not yet enrolled for this type. */
export const useApplianceLookup = (kind: ApplianceKind, enabled = true) =>
  useQuery({
    queryKey: applianceKeys.lookup(kind),
    queryFn: () => api.get<LookupTheatre[]>(`/appliances/${kind}/lookup`),
    enabled,
  });

export const useApplianceLookupTheatre = (kind: ApplianceKind, id: string | undefined) =>
  useQuery({
    queryKey: applianceKeys.lookupDetail(kind, id ?? ""),
    queryFn: () => api.get<ApplianceLookupDetail>(`/appliances/${kind}/lookup/${id}`),
    enabled: !!id,
  });

export const useEnrolApplianceTheatre = (kind: ApplianceKind) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ApplianceEnrolmentInput & { theatreId: string }) =>
      api.post<QubeAcsTheatre>(`/appliances/${kind}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: applianceKeys.all(kind) }),
  });
};

export const useUpdateApplianceTheatre = (kind: ApplianceKind) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: ApplianceEnrolmentInput & { id: string }) =>
      api.put<QubeAcsTheatre>(`/appliances/${kind}/${id}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: applianceKeys.all(kind) }),
  });
};
