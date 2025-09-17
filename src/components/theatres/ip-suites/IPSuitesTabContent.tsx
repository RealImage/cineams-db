import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Monitor } from "lucide-react";
import { ScreenIPsTable } from "./ScreenIPsTable";
import { ScreenDevicesTable } from "./ScreenDevicesTable";
import { ScreenSuitesSection } from "./ScreenSuitesSection";

interface Screen {
  id: string;
  name: string;
  number: string;
  status: string;
}

interface ScreenIP {
  id: string;
  ipAddress: string;
  subnetMask: string;
  gateway: string;
}

interface ScreenDevice {
  id: string;
  deviceModel: string;
  serialNumber: string;
  deviceRole: string;
  certificateStatus: 'Active' | 'Inactive' | 'Unknown';
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
  certificateStatus: 'Active' | 'Inactive' | 'Unknown';
  softwareVersion: string;
}

interface ScreenSuite {
  id: string;
  suiteNumber: string;
  creationDate: string;
  effectiveFromDate: string;
  devices: SuiteDevice[];
}

interface IPSuitesTabContentProps {
  screens: Screen[];
  onScreenDataChange: (screenId: string, dataType: 'ips' | 'devices' | 'suites', data: any) => void;
}

export const IPSuitesTabContent = ({ screens, onScreenDataChange }: IPSuitesTabContentProps) => {
  // Mock data - in a real application, this would come from props or API
  const [screenData, setScreenData] = useState<Record<string, {
    ips: ScreenIP[];
    devices: ScreenDevice[];
    suites: ScreenSuite[];
  }>>({});

  const handleIPsChange = (screenId: string, ips: ScreenIP[]) => {
    setScreenData(prev => ({
      ...prev,
      [screenId]: {
        ...prev[screenId],
        ips
      }
    }));
    onScreenDataChange(screenId, 'ips', ips);
  };

  const handleDevicesChange = (screenId: string, devices: ScreenDevice[]) => {
    setScreenData(prev => ({
      ...prev,
      [screenId]: {
        ...prev[screenId],
        devices
      }
    }));
    onScreenDataChange(screenId, 'devices', devices);
  };

  const handleSuitesChange = (screenId: string, suites: ScreenSuite[]) => {
    setScreenData(prev => ({
      ...prev,
      [screenId]: {
        ...prev[screenId],
        suites
      }
    }));
    onScreenDataChange(screenId, 'suites', suites);
  };

  const getScreenData = (screenId: string) => {
    return screenData[screenId] || {
      ips: [],
      devices: [],
      suites: []
    };
  };

  const getAvailableDevicesForSuite = (screenId: string): SuiteDevice[] => {
    const data = getScreenData(screenId);
    const assignedDeviceIds = data.suites.flatMap(suite => suite.devices.map(device => device.id));
    
    return data.devices
      .filter(device => 
        device.certificateStatus === 'Active' && 
        !assignedDeviceIds.includes(device.id)
      )
      .map(device => ({
        id: device.id,
        deviceModel: device.deviceModel,
        serialNumber: device.serialNumber,
        deviceRole: device.deviceRole,
        certificateStatus: device.certificateStatus,
        softwareVersion: device.softwareVersion
      }));
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