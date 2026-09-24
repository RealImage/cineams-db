import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CompanyClaim } from "@/data/companyClaimsData";
import type { OperationsRegion, PartnerRequest } from "@/data/partnersData";

export const approvalKeys = {
  all: ["approvals"] as const,
  summary: ["approvals", "summary"] as const,
  claims: ["approvals", "company-claims"] as const,
  partners: ["approvals", "partners"] as const,
  regionOptions: ["approvals", "partners", "region-options"] as const,
  regions: (partnerId: string) => ["approvals", "partners", partnerId, "regions"] as const,
};

export type DashboardCount = { label: string; count: number };
export type ApprovalsSummary = { approvals: DashboardCount[]; conflicts: DashboardCount[]; thirdParty: DashboardCount[] };

export const useApprovalsSummary = () =>
  useQuery({ queryKey: approvalKeys.summary, queryFn: () => api.get<ApprovalsSummary>("/approvals/summary") });

export const useCompanyClaims = () =>
  useQuery({ queryKey: approvalKeys.claims, queryFn: () => api.get<CompanyClaim[]>("/approvals/company-claims") });

export const useReviewCompanyClaim = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: "accept" | "reject" }) =>
      api.post<CompanyClaim>(`/approvals/company-claims/${id}/${decision}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: approvalKeys.all }),
  });
};

export const usePartnerRequests = () =>
  useQuery({ queryKey: approvalKeys.partners, queryFn: () => api.get<PartnerRequest[]>("/approvals/partners") });

export const usePartnerRegionOptions = () =>
  useQuery({
    queryKey: approvalKeys.regionOptions,
    queryFn: () => api.get<{ locations: string[]; chains: string[]; theatres: string[] }>("/approvals/partners/region-options"),
  });

export const usePartnerRegions = (partnerId: string | undefined) =>
  useQuery({
    queryKey: approvalKeys.regions(partnerId ?? ""),
    queryFn: () => api.get<OperationsRegion[]>(`/approvals/partners/${partnerId}/regions`),
    enabled: !!partnerId,
  });

export const useAddPartnerRegion = (partnerId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (region: Omit<OperationsRegion, "id">) =>
      api.post<OperationsRegion>(`/approvals/partners/${partnerId}/regions`, region),
    onSuccess: () => qc.invalidateQueries({ queryKey: approvalKeys.regions(partnerId) }),
  });
};

export const useDeletePartnerRegion = (partnerId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (regionId: string) => api.delete(`/approvals/partners/${partnerId}/regions/${regionId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: approvalKeys.regions(partnerId) }),
  });
};

export const useReviewPartnerRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: "accept" | "reject" }) =>
      api.post<PartnerRequest>(`/approvals/partners/${id}/${decision}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: approvalKeys.all }),
  });
};
