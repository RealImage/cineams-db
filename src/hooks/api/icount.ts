import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { IcountLookupTheatre, IcountScreen, IcountTheatre } from "@/data/icountData";

export const icountKeys = {
  all: ["icount"] as const,
  list: ["icount", "list"] as const,
  detail: (id: string) => ["icount", "detail", id] as const,
  lookup: ["icount", "lookup"] as const,
  lookupDetail: (id: string) => ["icount", "lookup", id] as const,
};

export type IcountLookupDetail = IcountLookupTheatre & { screens: IcountScreen[] };

export interface IcountCamerasInput {
  latitude: number;
  longitude: number;
  screens: IcountScreen[];
}

export const useIcountTheatres = () =>
  useQuery({ queryKey: icountKeys.list, queryFn: () => api.get<IcountTheatre[]>("/icount") });

export const useIcountTheatre = (id: string | undefined) =>
  useQuery({ queryKey: icountKeys.detail(id ?? ""), queryFn: () => api.get<IcountTheatre>(`/icount/${id}`), enabled: !!id });

/** Theatres with no iCount cameras yet. */
export const useIcountLookup = (enabled = true) =>
  useQuery({ queryKey: icountKeys.lookup, queryFn: () => api.get<IcountLookupTheatre[]>("/icount/lookup"), enabled });

export const useIcountLookupTheatre = (id: string | undefined) =>
  useQuery({
    queryKey: icountKeys.lookupDetail(id ?? ""),
    queryFn: () => api.get<IcountLookupDetail>(`/icount/lookup/${id}`),
    enabled: !!id,
  });

export const useAddIcountTheatre = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: IcountCamerasInput & { theatreId: string }) => api.post<IcountTheatre>("/icount", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: icountKeys.all }),
  });
};

export const useUpdateIcountTheatre = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: IcountCamerasInput & { id: string }) => api.put<IcountTheatre>(`/icount/${id}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: icountKeys.all }),
  });
};
