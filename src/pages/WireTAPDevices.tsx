
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Eye, RefreshCw, Signal } from "lucide-react";
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
import { ConnectivityStatusOverlay } from "@/components/wiretap/ConnectivityStatusOverlay";
import { WireTAPFilterPanel, AppliedFilterPills, WireTAPFilters, emptyFilters } from "@/components/wiretap/WireTAPFilterPanel";

const WireTAPDevices = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<WireTAPDevice[]>(wireTapDevices);
  const [filters, setFilters] = useState<WireTAPFilters>({ ...emptyFilters });
  const [isViewLogsDialogOpen, setIsViewLogsDialogOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isFetchNewDevicesDialogOpen, setIsFetchNewDevicesDialogOpen] = useState(false);
  const [isConnectivityOverlayOpen, setIsConnectivityOverlayOpen] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<WireTAPDevice | null>(null);
  const [lastFetchedDate, setLastFetchedDate] = useState<Date>(new Date());

  const filteredDevices = useMemo(() => {
    return devices.filter(d => {
      if (filters.connectivityType.length && !filters.connectivityType.includes(d.connectivityType)) return false;
      if (filters.theatreChain.length && !filters.theatreChain.includes(d.theatreName)) return false;
      if (filters.storageCapacity.length && !filters.storageCapacity.includes(d.storageCapacity)) return false;
      if (filters.applianceType.length && !filters.applianceType.includes(d.wireTapApplianceType)) return false;
      if (filters.activationStatus.length && !filters.activationStatus.includes(d.activationStatus)) return false;
      if (filters.mappingStatus.length && !filters.mappingStatus.includes(d.mappingStatus)) return false;
      if (filters.internetConnectivity.length && !filters.internetConnectivity.includes(d.connectivity?.status || "Unknown")) return false;
      if (filters.vpnStatus.length && !filters.vpnStatus.includes(d.vpnStatus)) return false;
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
    setIsFetchNewDevicesDialogOpen(true);
  };

  const handleAddNewDevices = (selectedDevices: WireTAPDevice[]) => {
    // Add selected devices to the inventory
    setDevices([...devices, ...selectedDevices]);
    toast.success(`${selectedDevices.length} device${selectedDevices.length !== 1 ? 's' : ''} added to inventory`);
  };

  const columns = getDeviceColumns();

  const handleViewConnectivity = (device: WireTAPDevice) => {
    setCurrentDevice(device);
    setIsConnectivityOverlayOpen(true);
  };

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
    },
    {
      label: "View Connectivity",
      icon: <Signal className="h-4 w-4" />,
      onClick: handleViewConnectivity
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
        <p className="text-muted-foreground">
          Manage your WireTAP devices across all theatres
        </p>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <WireTAPFilterPanel devices={devices} filters={filters} onFiltersChange={setFilters} />
            <Button onClick={handleFetchNewDevices} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" /> Fetch New Devices
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Last Fetched on: {format(lastFetchedDate, "dd MMM yyyy hh:mm a")}
          </p>
        </div>
      </div>

      <AppliedFilterPills filters={filters} onFiltersChange={setFilters} />
      
      <DataTable
        data={filteredDevices}
        columns={columns}
        searchable={true}
        searchPlaceholder="Search WireTAP devices..."
        actions={getActions}
        onRowClick={handleViewConnectivity}
        showFilters={false}
      />
      
      <ConnectivityStatusOverlay
        device={currentDevice}
        isOpen={isConnectivityOverlayOpen}
        onOpenChange={setIsConnectivityOverlayOpen}
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
