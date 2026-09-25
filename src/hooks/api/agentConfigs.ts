import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AgentConfiguration, AgentConfigurationInput, AgentDetails, AgentUpdateInput } from "@/data/agentConfigData";

export const agentConfigKeys = {
  all: ["agent-configs"] as const,
  agent: (id: string) => [...agentConfigKeys.all, id] as const,
  configurations: (id: string) => [...agentConfigKeys.all, id, "configurations"] as const,
};

const base = (id: string) => `/agent-configs/${encodeURIComponent(id)}`;

export const useAgent = (id: string | undefined) =>
  useQuery({
    queryKey: agentConfigKeys.agent(id ?? ""),
    queryFn: () => api.get<AgentDetails>(base(id!)),
    enabled: !!id,
  });

export const useAgentConfigurations = (id: string | undefined) =>
  useQuery({
    queryKey: agentConfigKeys.configurations(id ?? ""),
    queryFn: () => api.get<AgentConfiguration[]>(`${base(id!)}/configurations`),
    enabled: !!id,
  });

/** Update entitlements and/or the configurations format. */
export const useUpdateAgent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<AgentUpdateInput> }) => api.patch<AgentDetails>(base(id), patch),
    // Covers the configurations too: a format change changes how their values are returned
    onSuccess: (_data, { id }) => qc.invalidateQueries({ queryKey: agentConfigKeys.agent(id) }),
  });
};

/** Create (no `configId`) or update one of an agent's configurations. */
export const useSaveAgentConfiguration = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ imageId, configId, ...input }: AgentConfigurationInput & { imageId: string; configId?: string }) =>
      configId
        ? api.put<AgentConfiguration>(`${base(imageId)}/configurations/${encodeURIComponent(configId)}`, input)
        : api.post<AgentConfiguration>(`${base(imageId)}/configurations`, input),
    onSuccess: (_data, { imageId }) => qc.invalidateQueries({ queryKey: agentConfigKeys.configurations(imageId) }),
  });
};

export const useDeleteAgentConfiguration = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ imageId, configId }: { imageId: string; configId: string }) =>
      api.delete(`${base(imageId)}/configurations/${encodeURIComponent(configId)}`),
    onSuccess: (_data, { imageId }) => qc.invalidateQueries({ queryKey: agentConfigKeys.configurations(imageId) }),
  });
};

/** Fetch one masked value for an explicit View or Copy; not cached. */
export const revealAgentConfigValue = (imageId: string, configId: string, fieldKey: string) =>
  api
    .get<{ value: string }>(`${base(imageId)}/configurations/${encodeURIComponent(configId)}/values/${encodeURIComponent(fieldKey)}`)
    .then((r) => r.value);
