import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Chain } from "@/types";

export const chainKeys = { all: ["chains"] as const };

export const useChains = () => useQuery({ queryKey: chainKeys.all, queryFn: () => api.get<Chain[]>("/chains") });

export const useDeleteChain = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/chains/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: chainKeys.all }),
  });
};
