import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { TDLDevice } from "@/types";

export const tdlKeys = { all: ["tdl"] as const };

/** The whole Trusted Device List (~10k rows). */
export const useTDLDevices = () =>
  useQuery({ queryKey: tdlKeys.all, queryFn: () => api.get<TDLDevice[]>("/tdl"), staleTime: 60_000 });

export const useRetireTDLDevice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<TDLDevice>(`/tdl/${id}/retire`),
    onSuccess: (device) => {
      qc.setQueryData<TDLDevice[]>(tdlKeys.all, (rows) => rows?.map((d) => (d.id === device.id ? device : d)));
      qc.invalidateQueries({ queryKey: ["approvals"] });
    },
  });
};
