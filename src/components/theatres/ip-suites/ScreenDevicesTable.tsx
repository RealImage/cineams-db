import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Globe, RotateCcw, X, Plus } from "lucide-react";
import { AddDeviceDialog } from "./AddDeviceDialog";
import { EditDeviceDialog } from "./EditDeviceDialog";
import { toast } from "sonner";

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

interface ScreenDevicesTableProps {
  screenId: string;
  screenName: string;
  devices: ScreenDevice[];
  onDevicesChange: (screenId: string, devices: ScreenDevice[]) => void;
}

export const ScreenDevicesTable = ({ screenId, screenName, devices, onDevicesChange }: ScreenDevicesTableProps) => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<ScreenDevice | undefined>(undefined);

  const handleAddDevice = (deviceData: Omit<ScreenDevice, 'id'>) => {
    const newDevice: ScreenDevice = {
      id: crypto.randomUUID(),
      ...deviceData
    };
    const updatedDevices = [...devices, newDevice];
    onDevicesChange(screenId, updatedDevices);
    toast.success("Device added successfully");
  };

  const handleEditDevice = (deviceData: Omit<ScreenDevice, 'id'>) => {
    if (!editingDevice) return;
    
    const updatedDevices = devices.map(device => 
      device.id === editingDevice.id ? { ...device, ...deviceData } : device
    );
    onDevicesChange(screenId, updatedDevices);
    toast.success("Device updated successfully");
  };

  const handleMoveToStandby = (deviceId: string) => {
    if (confirm("Are you sure you want to move this device to facility standby?")) {
      const updatedDevices = devices.filter(device => device.id !== deviceId);
      onDevicesChange(screenId, updatedDevices);
      toast.success("Device moved to facility standby");
    }
  };

  const handleRemoveDevice = (deviceId: string) => {
    if (confirm("Are you sure you want to remove this device from the theatre?")) {
      const updatedDevices = devices.filter(device => device.id !== deviceId);
      onDevicesChange(screenId, updatedDevices);
      toast.success("Device removed from theatre");
    }
  };

  const openEditDialog = (device: ScreenDevice) => {
    setEditingDevice(device);
    setEditDialogOpen(true);
  };

  const getCertificateStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge variant="default" className="bg-green-100 text-green-800">✅ Active</Badge>;
      case 'Inactive':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">⚠️ Inactive</Badge>;
      case 'Unknown':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">❓ Unknown</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Screen Devices</h4>
        <Button
          type="button"
          onClick={() => setAddDialogOpen(true)}
          size="sm"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Device
        </Button>
      </div>

      {devices.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device Model</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Device Role</TableHead>
                <TableHead>Cert. Status</TableHead>
                <TableHead>Auto-Sync</TableHead>
                <TableHead>Software Version</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-medium">{device.deviceModel}</TableCell>
                  <TableCell className="font-mono">{device.serialNumber}</TableCell>
                  <TableCell>{device.deviceRole}</TableCell>
                  <TableCell>{getCertificateStatusBadge(device.certificateStatus)}</TableCell>
                  <TableCell>
                    <Badge variant={device.certificateAutoSync ? "default" : "secondary"}>
                      {device.certificateAutoSync ? "Enabled" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">{device.softwareVersion}</TableCell>
                  <TableCell className="font-mono">{device.ipAddress || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(device)}
                        title="Edit Device Metadata"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(device)}
                        title="Edit Device Network"
                      >
                        <Globe className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveToStandby(device.id)}
                        title="Move to Facility Standby"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDevice(device.id)}
                        title="Remove from Theatre"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="border rounded-md p-8 text-center">
          <p className="text-muted-foreground mb-4">No devices have been added yet</p>
          <Button
            type="button"
            onClick={() => setAddDialogOpen(true)}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Device
          </Button>
        </div>
      )}

      <AddDeviceDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSave={handleAddDevice}
      />

      <EditDeviceDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        device={editingDevice}
        onSave={handleEditDevice}
      />
    </div>
  );
};