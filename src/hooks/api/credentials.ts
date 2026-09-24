import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  CredentialDeviceInput,
  CredentialDeviceWithStatus,
  CredentialInput,
  ScopedCredential,
} from "@/data/credentialsManagerData";

export const credentialKeys = {
  all: ["credentials"] as const,
  devices: () => [...credentialKeys.all, "devices"] as const,
  device: (id: string) => [...credentialKeys.devices(), id] as const,
  deviceCredentials: (id: string) => [...credentialKeys.all, "device-credentials", id] as const,
  refOptions: () => [...credentialKeys.all, "ref-options"] as const,
};

export type DevicePatch = Partial<CredentialDeviceInput>;

export const useCredentialDevices = () =>
  useQuery({
    queryKey: credentialKeys.devices(),
    queryFn: () => api.get<CredentialDeviceWithStatus[]>("/credentials/devices"),
  });

export const useCredentialDevice = (id: string | undefined) =>
  useQuery({
    queryKey: credentialKeys.device(id ?? ""),
    queryFn: () => api.get<CredentialDeviceWithStatus>(`/credentials/devices/${id}`),
    enabled: !!id,
  });

export const useDeviceCredentials = (deviceId: string | undefined, enabled = true) =>
  useQuery({
    queryKey: credentialKeys.deviceCredentials(deviceId ?? ""),
    queryFn: () => api.get<ScopedCredential[]>(`/credentials/devices/${deviceId}/credentials`),
    enabled: !!deviceId && enabled,
  });

export const useCredentialRefOptions = (enabled = true) =>
  useQuery({
    queryKey: credentialKeys.refOptions(),
    queryFn: () => api.get<{ chains: string[]; theatres: string[] }>("/credentials/ref-options"),
    enabled,
    staleTime: 5 * 60_000,
  });

export const useCreateCredentialDevice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CredentialDeviceInput) => api.post<CredentialDeviceWithStatus>("/credentials/devices", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: credentialKeys.devices() }),
  });
};

export const useUpdateCredentialDevice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: DevicePatch }) =>
      api.patch<CredentialDeviceWithStatus>(`/credentials/devices/${id}`, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: credentialKeys.devices() }),
  });
};

/** Create (no `id`) or update (with `id`) one of a device's credentials. */
export const useSaveDeviceCredential = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ deviceId, id, ...input }: CredentialInput & { deviceId: string; id?: string }) =>
      id
        ? api.put<ScopedCredential>(`/credentials/devices/${deviceId}/credentials/${id}`, input)
        : api.post<ScopedCredential>(`/credentials/devices/${deviceId}/credentials`, input),
    onSuccess: (_data, { deviceId }) => {
      qc.invalidateQueries({ queryKey: credentialKeys.deviceCredentials(deviceId) });
      qc.invalidateQueries({ queryKey: credentialKeys.devices() }); // default-credentials badge
    },
  });
};

export const useDeleteDeviceCredential = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ deviceId, id }: { deviceId: string; id: string }) =>
      api.delete(`/credentials/devices/${deviceId}/credentials/${id}`),
    onSuccess: (_data, { deviceId }) => {
      qc.invalidateQueries({ queryKey: credentialKeys.deviceCredentials(deviceId) });
      qc.invalidateQueries({ queryKey: credentialKeys.devices() });
    },
  });
};
