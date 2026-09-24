import { useSyncExternalStore } from "react";
import {
  CredentialDevice,
  ScopedCredential,
  credentialDevices,
  initialScopedCredentials,
} from "./credentialsManagerData";

// Shared in-memory state for the Credentials Manager pages, so edits survive
// navigating between the list and a device's credentials page (not reloads).
export const CURRENT_USER = "Harshit Thakkar";
export const CREDENTIALS_MANAGER_PATH = "/theatre-device-management/credentials-manager";
export const deviceCredentialsPath = (deviceId: string) => `${CREDENTIALS_MANAGER_PATH}/${deviceId}/credentials`;

type State = { devices: CredentialDevice[]; credentials: ScopedCredential[] };

let state: State = { devices: credentialDevices, credentials: initialScopedCredentials };
const listeners = new Set<() => void>();

const setState = (next: Partial<State>) => {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const stamp = () => ({ updatedBy: CURRENT_USER, updatedAt: new Date().toISOString() });

export const credentialsStore = {
  updateDevice(id: string, patch: Partial<CredentialDevice>) {
    setState({ devices: state.devices.map((d) => (d.id === id ? { ...d, ...patch, ...stamp() } : d)) });
  },
  saveCredential(credential: Omit<ScopedCredential, "id" | "updatedBy" | "updatedAt"> & { id?: string }) {
    if (credential.id && state.credentials.some((c) => c.id === credential.id)) {
      setState({
        credentials: state.credentials.map((c) => (c.id === credential.id ? { ...c, ...credential, id: c.id, ...stamp() } : c)),
      });
    } else {
      const id = `${credential.deviceId}-${credential.scope}-${Date.now()}`;
      setState({ credentials: [...state.credentials, { ...credential, id, ...stamp() }] });
    }
  },
  deleteCredential(id: string) {
    setState({ credentials: state.credentials.filter((c) => c.id !== id) });
  },
};

export const useCredentialsStore = () => useSyncExternalStore(subscribe, () => state);
