
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Eye, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { WireTAPDevice } from "@/types/wireTAP";
import { wireTapDevices } from "@/data/wireTapDevices";
import { newWireTapDevices } from "@/data/newWireTapDevices";
import { getDeviceColumns } from "@/components/wiretap/DeviceColumns";
import { DeviceLogsDialog } from "@/components/wiretap/DeviceLogsDialog";
import { DeactivateDeviceDialog } from "@/components/wiretap/DeactivateDeviceDialog";
import { FetchNewDevicesDialog } from "@/components/wiretap/FetchNewDevicesDialog";

const WireTAPDevices = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<WireTAPDevice[]>(wireTapDevices);
  const [isViewLogsDialogOpen, setIsViewLogsDialogOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isFetchNewDevicesDialogOpen, setIsFetchNewDevicesDialogOpen] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<WireTAPDevice | null>(null);
  const [lastFetchedDate, setLastFetchedDate] = useState<Date>(new Date());

  const handleActivateDevice = (device: WireTAPDevice) => {
    const updatedDevices = devices.map(d => {
      if (d.id === device.id) {
        return {
          ...d,
          activationStatus: "Active" as const,
          vpnStatus: "Enabled" as const,
          updatedBy: "current.user@example.com",
          updatedAt: new Date().toISOString(),
        };
      }
      return d;
    });
    
    setDevices(updatedDevices);
    toast.success(`Device ${device.hardwareSerialNumber} activated successfully`);
  };

  const handleDeactivateDevice = (device: WireTAPDevice, reason: string) => {
    const updatedDevices = devices.map(d => {
      if (d.id === device.id) {
        return {
          ...d,
          activationStatus: "Inactive" as const,
          vpnStatus: "Disabled" as const,
          updatedBy: "current.user@example.com",
          updatedAt: new Date().toISOString(),
          deactivationReason: reason,
        };
      }
      return d;
    });
    
    setDevices(updatedDevices);
    toast.success(`Device ${device.hardwareSerialNumber} deactivated successfully`);
  };

  const handleToggleDeviceActivation = (device: WireTAPDevice) => {
    if (device.activationStatus === "Active") {
      // Show confirmation dialog for deactivation
      setCurrentDevice(device);
      setIsDeactivateDialogOpen(true);
    } else {
      // Activate directly without confirmation
      handleActivateDevice(device);
    }
  };
  
  const handleViewLogs = (device: WireTAPDevice) => {
    setCurrentDevice(device);
    setIsViewLogsDialogOpen(true);
  };

  const handleFetchNewDevices = () => {
    setLastFetchedDate(new Date());
    setIsFetchNewDevicesDialogOpen(true);
  };

  const handleAddNewDevices = (selectedDevices: WireTAPDevice[]) => {
    // Add selected devices to the inventory
    setDevices([...devices, ...selectedDevices]);
    toast.success(`${selectedDevices.length} device${selectedDevices.length !== 1 ? 's' : ''} added to inventory`);
  };

  const columns = getDeviceColumns();

  const getActions = (device: WireTAPDevice) => [
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: (device: WireTAPDevice) => {
        navigate(`/wiretap-devices/${device.id}/edit`);
      }
    },
    {
      label: device.activationStatus === "Active" ? "Deactivate" : "Activate",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleToggleDeviceActivation
    },
    {
      label: "View Logs",
      icon: <Eye className="h-4 w-4" />,
      onClick: handleViewLogs
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">WireTAP Devices ({devices.length})</h1>
          <p className="text-muted-foreground mt-1">
            Manage your WireTAP devices across all theatres
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button onClick={handleFetchNewDevices} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" /> Fetch New Devices
          </Button>
          <p className="text-sm text-muted-foreground">
            Last Fetched on: {format(lastFetchedDate, "dd MMM yyyy hh:mm a")}
          </p>
        </div>
      </div>
      
      <DataTable
        data={devices}
        columns={columns}
        searchable={true}
        searchPlaceholder="Search WireTAP devices..."
        actions={getActions}
      />
      
      <DeviceLogsDialog
        isOpen={isViewLogsDialogOpen}
        onOpenChange={setIsViewLogsDialogOpen}
        device={currentDevice}
      />
      
      <DeactivateDeviceDialog
        isOpen={isDeactivateDialogOpen}
        onOpenChange={setIsDeactivateDialogOpen}
        device={currentDevice}
        onConfirm={handleDeactivateDevice}
      />
      
      <FetchNewDevicesDialog
        isOpen={isFetchNewDevicesDialogOpen}
        onOpenChange={setIsFetchNewDevicesDialogOpen}
        newDevices={newWireTapDevices}
        onAddDevices={handleAddNewDevices}
      />
    </motion.div>
  );
};

export default WireTAPDevices;
