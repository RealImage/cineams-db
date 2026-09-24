import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { WireTAPDevice, WireTAPDeviceDetail, WireTAPTheatreOption } from "@/types/wireTAP";

export const wiretapKeys = {
  all: ["wiretap"] as const,
  list: ["wiretap", "list"] as const,
  newDevices: ["wiretap", "new"] as const,
  detail: (id: string) => ["wiretap", "detail", id] as const,
  theatres: ["wiretap", "theatres"] as const,
};

/** The add/edit page's form state; sent as-is (dates as YYYY-MM-DD). */
export type WireTAPDeviceForm = Record<string, unknown>;

export const useWireTAPDevices = () =>
  useQuery({ queryKey: wiretapKeys.list, queryFn: () => api.get<WireTAPDevice[]>("/wiretap") });

/** Devices registered but not yet in the inventory. */
export const useNewWireTAPDevices = (enabled = true) =>
  useQuery({ queryKey: wiretapKeys.newDevices, queryFn: () => api.get<WireTAPDevice[]>("/wiretap/new"), enabled });

export const useWireTAPDevice = (id: string | undefined) =>
  useQuery({
    queryKey: wiretapKeys.detail(id ?? ""),
    queryFn: () => api.get<WireTAPDeviceDetail>(`/wiretap/${id}`),
    enabled: !!id,
  });

/** Theatres a device can be mapped to. */
export const useWireTAPTheatreOptions = () =>
  useQuery({ queryKey: wiretapKeys.theatres, queryFn: () => api.get<WireTAPTheatreOption[]>("/wiretap/theatres") });

const useInvalidatingMutation = <TInput, TResult>(fn: (input: TInput) => Promise<TResult>) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: wiretapKeys.all }) });
};

export const useAddWireTAPDevicesToInventory = () =>
  useInvalidatingMutation((ids: string[]) => api.post<{ added: number }>("/wiretap/inventory", { ids }));

export const useCreateWireTAPDevice = () =>
  useInvalidatingMutation((form: WireTAPDeviceForm) => api.post<{ id: string }>("/wiretap", form));

export const useUpdateWireTAPDevice = () =>
  useInvalidatingMutation(({ id, form }: { id: string; form: WireTAPDeviceForm }) =>
    api.put<{ id: string }>(`/wiretap/${id}`, form));

export const useSetWireTAPActivation = () =>
  useInvalidatingMutation(({ id, status, reason }: { id: string; status: "Active" | "Inactive"; reason?: string }) =>
    api.patch<{ id: string }>(`/wiretap/${id}/activation`, { status, reason }));

const FORM_DATE_KEYS = ["pullOutDate", "internetInstallationDate", "planStartDate"] as const;

const toDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Form state → request body: Date pickers become local YYYY-MM-DD strings. */
export function toWireTAPPayload(form: Record<string, unknown>): WireTAPDeviceForm {
  return Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v instanceof Date ? toDay(v) : v]));
}

/** Stored details → form state: YYYY-MM-DD strings back to Dates for the pickers. */
export function fromWireTAPDetails(details: Record<string, unknown>) {
  const out: Record<string, unknown> = { ...details };
  for (const key of FORM_DATE_KEYS) {
    const v = out[key];
    if (typeof v === "string" && v) {
      const [y, m, d] = v.slice(0, 10).split("-").map(Number);
      out[key] = new Date(y, m - 1, d);
    }
  }
  return out;
}
