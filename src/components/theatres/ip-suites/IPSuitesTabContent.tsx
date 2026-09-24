import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Monitor } from "lucide-react";
import { ScreenIPsTable } from "./ScreenIPsTable";
import { ScreenDevicesTable } from "./ScreenDevicesTable";
import { ScreenSuitesSection } from "./ScreenSuitesSection";

import type { IPAddress, Screen as ScreenRecord } from "@/types";
import type { ScreenDeviceConfig, SuiteConfig } from "@/hooks/api/screens";

/** A screen with whatever device configuration it already has. */
type Screen = Pick<ScreenRecord, "id" | "name" | "number" | "status"> &
  Partial<{ devices: ScreenDeviceConfig[]; ipAddresses: IPAddress[]; suites: SuiteConfig[] }>;

interface ScreenIP {
  id: string;
  ipAddress: string;
  subnetMask: string;
  gateway: string;
}

type LocalCertStatus = 'Active' | 'Inactive' | 'Unknown';

interface ScreenDevice {
  id: string;
  deviceModel: string;
  serialNumber: string;
  deviceRole: string;
  certificateStatus: LocalCertStatus;
  certificateAutoSync: boolean;
  softwareVersion: string;
  ipAddress?: string;
  subnetMask?: string;
  gateway?: string;
}

interface SuiteDevice {
  id: string;
  deviceModel: string;
  serialNumber: string;
  deviceRole: string;
  certificateStatus: LocalCertStatus;
  softwareVersion: string;
}

interface ScreenSuite {
  id: string;
  suiteNumber: string;
  creationDate: string;
  effectiveFromDate: string;
  devices: SuiteDevice[];
}

type DataType = 'devices' | 'ipAddresses' | 'suites';

interface IPSuitesTabContentProps {
  screens: Screen[];
  /** Called with the screen's new list in the API / `Screen` shape. */
  onScreenDataChange: (screenId: string, dataType: DataType, data: ScreenDeviceConfig[] | IPAddress[] | SuiteConfig[]) => void;
}

// --- Conversions between the stored screen shape and this tab's table rows ---

const toLocalCert = (status: ScreenDeviceConfig["certificateStatus"]): LocalCertStatus =>
  status === "Valid" ? "Active" : status === "Unknown" ? "Unknown" : "Inactive";

const fromLocalCert = (status: LocalCertStatus, original?: ScreenDeviceConfig): ScreenDeviceConfig["certificateStatus"] => {
  if (original && toLocalCert(original.certificateStatus) === status) return original.certificateStatus;
  return status === "Active" ? "Valid" : status === "Inactive" ? "Invalid" : "Unknown";
};

const toLocalDevice = (d: ScreenDeviceConfig): ScreenDevice => ({
  id: d.id,
  deviceModel: d.model,
  serialNumber: d.serialNumber,
  deviceRole: d.role ?? "",
  certificateStatus: toLocalCert(d.certificateStatus),
  certificateAutoSync: !!d.certificateAutoSync,
  softwareVersion: d.softwareVersion ?? "",
  ipAddress: d.ipAddress ?? undefined,
  subnetMask: d.subnetMask ?? undefined,
  gateway: d.gateway ?? undefined,
});

const fromLocalDevice = (d: ScreenDevice, original?: ScreenDeviceConfig): ScreenDeviceConfig => ({
  id: d.id,
  manufacturer: original?.manufacturer ?? "",
  model: d.deviceModel,
  serialNumber: d.serialNumber,
  role: d.deviceRole || undefined,
  certificateStatus: fromLocalCert(d.certificateStatus, original),
  certificateLockStatus: original?.certificateLockStatus ?? "Unlocked",
  softwareVersion: d.softwareVersion,
  certificateAutoSync: d.certificateAutoSync,
  ipAddress: d.ipAddress || null,
  subnetMask: d.subnetMask || null,
  gateway: d.gateway || null,
});

const toSuiteDevice = (d: ScreenDevice): SuiteDevice => ({
  id: d.id,
  deviceModel: d.deviceModel,
  serialNumber: d.serialNumber,
  deviceRole: d.deviceRole,
  certificateStatus: d.certificateStatus,
  softwareVersion: d.softwareVersion,
});

/** Same rule the suite cards show: needs an SM/RMB and every device's certificate active. */
const suiteIsValid = (devices: SuiteDevice[]) =>
  devices.some((d) => d.deviceRole === "Server (SM)" || d.deviceRole === "Root Media Block (RMB)") &&
  devices.every((d) => d.certificateStatus === "Active");

const toLocal = (screen: Screen) => {
  const devices = (screen.devices ?? []).map(toLocalDevice);
  const byId = new Map(devices.map((d) => [d.id, d]));
  return {
    ips: (screen.ipAddresses ?? []).map((ip, i): ScreenIP => ({
      id: `ip-${i}`, ipAddress: ip.address, subnetMask: ip.subnet ?? "", gateway: ip.gateway ?? "",
    })),
    devices,
    suites: (screen.suites ?? []).map((su): ScreenSuite => ({
      id: su.id,
      suiteNumber: su.name,
      creationDate: (su.createdAt ?? "").slice(0, 10),
      effectiveFromDate: su.effectiveFrom ?? "",
      devices: su.devices.flatMap((id) => (byId.has(id) ? [toSuiteDevice(byId.get(id)!)] : [])),
    })),
  };
};

export const IPSuitesTabContent = ({ screens, onScreenDataChange }: IPSuitesTabContentProps) => {
  // Rows are derived from the screens passed in; edits go straight back to the owner.
  const getScreenData = (screenId: string) => {
    const screen = screens.find((s) => s.id === screenId);
    return screen ? toLocal(screen) : { ips: [], devices: [], suites: [] };
  };

  const handleIPsChange = (screenId: string, ips: ScreenIP[]) => {
    onScreenDataChange(screenId, 'ipAddresses', ips.map((ip) => ({
      address: ip.ipAddress, subnet: ip.subnetMask, gateway: ip.gateway,
    })));
  };

  const handleDevicesChange = (screenId: string, devices: ScreenDevice[]) => {
    const originals = new Map((screens.find((s) => s.id === screenId)?.devices ?? []).map((d) => [d.id, d]));
    onScreenDataChange(screenId, 'devices', devices.map((d) => fromLocalDevice(d, originals.get(d.id))));
  };

  const handleSuitesChange = (screenId: string, suites: ScreenSuite[]) => {
    const originals = new Map((screens.find((s) => s.id === screenId)?.suites ?? []).map((su) => [su.id, su]));
    onScreenDataChange(screenId, 'suites', suites.map((su): SuiteConfig => ({
      id: su.id,
      name: su.suiteNumber,
      status: suiteIsValid(su.devices) ? "Valid" : "Invalid",
      devices: su.devices.map((d) => d.id),
      ipAddresses: originals.get(su.id)?.ipAddresses ?? [],
      effectiveFrom: su.effectiveFromDate || null,
      createdAt: originals.get(su.id)?.createdAt,
    })));
  };

  const getAvailableDevicesForSuite = (screenId: string): SuiteDevice[] => {
    const data = getScreenData(screenId);
    const assignedDeviceIds = data.suites.flatMap(suite => suite.devices.map(device => device.id));
    
    return data.devices
      .filter(device => 
        device.certificateStatus === 'Active' && 
        !assignedDeviceIds.includes(device.id)
      )
      .map(toSuiteDevice);
  };

  if (screens.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">IP Addresses & Suites</h3>
          <p className="text-sm text-muted-foreground">
            Manage IP configurations and suite information for this theatre
          </p>
        </div>
        
        <div className="border rounded-md p-8 text-center">
          <p className="text-muted-foreground mb-2">No screens have been added yet</p>
          <p className="text-sm text-muted-foreground">
            Add screens in the "Screen Management" tab to configure IP addresses and suites
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-medium">IP Addresses & Suites</h3>
        <p className="text-sm text-muted-foreground">
          Manage IP configurations and suite information for each screen in this theatre
        </p>
      </div>

      <div className="space-y-8">
        {screens.map((screen, index) => {
          const data = getScreenData(screen.id);
          const availableDevices = getAvailableDevicesForSuite(screen.id);
          
          return (
            <Card key={screen.id} className="border-2">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">
                    Screen {screen.number} - {screen.name}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Screen IPs Section */}
                <ScreenIPsTable
                  screenId={screen.id}
                  screenName={screen.name}
                  ips={data.ips}
                  onIPsChange={handleIPsChange}
                />
                
                <Separator />
                
                {/* Screen Devices Section */}
                <ScreenDevicesTable
                  screenId={screen.id}
                  screenName={screen.name}
                  devices={data.devices}
                  onDevicesChange={handleDevicesChange}
                />
                
                <Separator />
                
                {/* Screen Suites Section */}
                <ScreenSuitesSection
                  screenId={screen.id}
                  screenName={screen.name}
                  suites={data.suites}
                  availableDevices={availableDevices}
                  onSuitesChange={handleSuitesChange}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};