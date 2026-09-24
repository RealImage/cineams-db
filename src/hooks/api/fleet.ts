import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  FleetNode,
  FleetTask,
  FleetTaskDetail,
  FleetTaskOptions,
  FleetTheatre,
  ImageItem,
  ImageLog,
  SaveFleetTaskInput,
  TaskAppliance,
  VersionItem,
} from "@/data/fleetData";

export const fleetKeys = {
  all: ["fleet"] as const,
  images: () => [...fleetKeys.all, "images"] as const,
  image: (id: string) => [...fleetKeys.images(), id] as const,
  versions: (imageId: string) => [...fleetKeys.image(imageId), "versions"] as const,
  imageLogs: (imageId: string) => [...fleetKeys.image(imageId), "logs"] as const,
  status: (imageId: string) => [...fleetKeys.all, "status", imageId] as const,
  appliances: () => [...fleetKeys.all, "appliances"] as const,
  theatres: () => [...fleetKeys.all, "theatres"] as const,
  taskOptions: () => [...fleetKeys.all, "task-options"] as const,
  tasks: () => [...fleetKeys.all, "tasks"] as const,
  task: (id: string) => [...fleetKeys.tasks(), id] as const,
};

// Images & versions -----------------------------------------------------------

export const useFleetImages = () =>
  useQuery({ queryKey: fleetKeys.images(), queryFn: () => api.get<ImageItem[]>("/fleet/images") });

export const useFleetImage = (id: string | undefined) =>
  useQuery({ queryKey: fleetKeys.image(id ?? ""), queryFn: () => api.get<ImageItem>(`/fleet/images/${id}`), enabled: !!id });

export const useImageVersions = (imageId: string | undefined) =>
  useQuery({
    queryKey: fleetKeys.versions(imageId ?? ""),
    queryFn: () => api.get<VersionItem[]>(`/fleet/images/${imageId}/versions`),
    enabled: !!imageId,
  });

export const useImageLogs = (imageId: string | undefined) =>
  useQuery({
    queryKey: fleetKeys.imageLogs(imageId ?? ""),
    queryFn: () => api.get<ImageLog[]>(`/fleet/images/${imageId}/logs`),
    enabled: !!imageId,
  });

/** Images, versions, status and task pickers all derive from version data. */
const invalidateImageData = (qc: ReturnType<typeof useQueryClient>) =>
  Promise.all([
    qc.invalidateQueries({ queryKey: fleetKeys.images() }),
    qc.invalidateQueries({ queryKey: [...fleetKeys.all, "status"] }),
    qc.invalidateQueries({ queryKey: fleetKeys.taskOptions() }),
  ]);

export const useSetDefaultInstall = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, defaultInstall }: { id: string; defaultInstall: boolean }) =>
      api.patch<ImageItem>(`/fleet/images/${id}`, { defaultInstall }),
    onSuccess: () => invalidateImageData(qc),
  });
};

export interface AddVersionInput {
  imageId: string;
  version: string;
  imageUrl: string;
  releaseNotes: string;
  internalNotes: string;
}

export const useAddImageVersion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ imageId, ...body }: AddVersionInput) => api.post<VersionItem>(`/fleet/images/${imageId}/versions`, body),
    onSuccess: () => invalidateImageData(qc),
  });
};

export const useSetDefaultVersion = (imageId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (versionId: string) => api.post<VersionItem>(`/fleet/images/${imageId}/versions/${versionId}/default`),
    onSuccess: () => invalidateImageData(qc),
  });
};

export const useDeprecateVersion = (imageId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ versionId, notes }: { versionId: string; notes: string }) =>
      api.post<VersionItem>(`/fleet/images/${imageId}/versions/${versionId}/deprecate`, { notes }),
    onSuccess: () => invalidateImageData(qc),
  });
};

// Fleet status / appliances ---------------------------------------------------

export const useFleetStatus = (imageId: string) =>
  useQuery({
    queryKey: fleetKeys.status(imageId),
    queryFn: () => api.get<FleetNode[]>(`/fleet/status?imageId=${encodeURIComponent(imageId)}`),
    enabled: !!imageId,
  });

export const useFleetAppliances = () =>
  useQuery({ queryKey: fleetKeys.appliances(), queryFn: () => api.get<TaskAppliance[]>("/fleet/appliances") });

export const useFleetTheatres = () =>
  useQuery({ queryKey: fleetKeys.theatres(), queryFn: () => api.get<FleetTheatre[]>("/fleet/theatres") });

export const useFleetTaskOptions = () =>
  useQuery({ queryKey: fleetKeys.taskOptions(), queryFn: () => api.get<FleetTaskOptions>("/fleet/task-options") });

// Tasks -----------------------------------------------------------------------

export const useFleetTasks = () =>
  useQuery({ queryKey: fleetKeys.tasks(), queryFn: () => api.get<FleetTask[]>("/fleet/tasks") });

export const useFleetTask = (id: string | undefined) =>
  useQuery({ queryKey: fleetKeys.task(id ?? ""), queryFn: () => api.get<FleetTaskDetail>(`/fleet/tasks/${id}`), enabled: !!id });

const invalidateTasks = (qc: ReturnType<typeof useQueryClient>) =>
  qc.invalidateQueries({ queryKey: fleetKeys.tasks() });

export const useSaveFleetTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: SaveFleetTaskInput & { id?: string }) =>
      id ? api.put<FleetTaskDetail>(`/fleet/tasks/${id}`, body) : api.post<FleetTaskDetail>("/fleet/tasks", body),
    onSuccess: () => invalidateTasks(qc),
  });
};

export const useCancelFleetTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<FleetTaskDetail>(`/fleet/tasks/${id}/cancel`),
    onSuccess: () => invalidateTasks(qc),
  });
};

export const useCancelTaskAppliance = (taskId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (nodeId: string) => api.post<FleetTaskDetail>(`/fleet/tasks/${taskId}/appliances/${nodeId}/cancel`),
    onSuccess: () => invalidateTasks(qc),
  });
};

export const useDeleteFleetTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/fleet/tasks/${id}`),
    onSuccess: () => invalidateTasks(qc),
  });
};
