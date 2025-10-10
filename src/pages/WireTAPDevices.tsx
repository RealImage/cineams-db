
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Eye, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { WireTAPDevice } from "@/types/wireTAP";
import { wireTapDevices } from "@/data/wireTapDevices";
import { getDeviceColumns } from "@/components/wiretap/DeviceColumns";
import { DeviceLogsDialog } from "@/components/wiretap/DeviceLogsDialog";
import { DeactivateDeviceDialog } from "@/components/wiretap/DeactivateDeviceDialog";
import { DeviceFiltersComponent, DeviceFilters } from "@/components/wiretap/DeviceFilters";
import AddDeviceDialog from "@/components/wiretap/AddDeviceDialog";

const WireTAPDevices = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<WireTAPDevice[]>(wireTapDevices);
  const [isViewLogsDialogOpen, setIsViewLogsDialogOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isAddDeviceDialogOpen, setIsAddDeviceDialogOpen] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<WireTAPDevice | null>(null);
  const [filters, setFilters] = useState<DeviceFilters>({});
  const [lastFetchedDate, setLastFetchedDate] = useState<Date>(new Date());
  // Filter devices based on active filters
  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      // Location filter (search in theatre address)
      if (filters.location) {
        const locationLower = filters.location.toLowerCase();
        const addressLower = device.theatreAddress.toLowerCase();
        if (!addressLower.includes(locationLower)) {
          return false;
        }
      }

      // Activation Status filter
      if (filters.activationStatus && device.activationStatus !== filters.activationStatus) {
        return false;
      }

      // Mapping Status filter
      if (filters.mappingStatus && device.mappingStatus !== filters.mappingStatus) {
        return false;
      }

      // VPN Status filter
      if (filters.vpnStatus && device.vpnStatus !== filters.vpnStatus) {
        return false;
      }

      // WireTAP Appliance Type filter
      if (filters.wireTapApplianceType && device.wireTapApplianceType !== filters.wireTapApplianceType) {
        return false;
      }

      // Pull-Out Status filter
      if (filters.pullOutStatus && device.pullOutStatus !== filters.pullOutStatus) {
        return false;
      }

      return true;
    });
  }, [devices, filters]);

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
    toast.success("Fetching new devices...");
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
          <h1 className="text-2xl font-bold tracking-tight">WireTAP Devices</h1>
          <p className="text-muted-foreground mt-1">
            Manage your WireTAP devices across all theatres
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsAddDeviceDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Device
            </Button>
            <Button onClick={handleFetchNewDevices} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" /> Fetch New Devices
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Last Fetched on: {format(lastFetchedDate, "MMM dd, yyyy hh:mm a")}
          </p>
        </div>
      </div>
      
      {/* Filters Component */}
      <DeviceFiltersComponent
        devices={devices}
        filters={filters}
        onFiltersChange={setFilters}
      />
      
      <DataTable
        data={filteredDevices}
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
      
      <AddDeviceDialog
        isOpen={isAddDeviceDialogOpen}
        onOpenChange={setIsAddDeviceDialogOpen}
        onDeviceRegister={(deviceData) => {
          // Navigate to edit page with pre-populated data
          navigate('/wiretap-devices/new/edit', { state: { deviceData } });
        }}
      />
    </motion.div>
  );
};

export default WireTAPDevices;
