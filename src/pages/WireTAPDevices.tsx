
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { WireTAPDevice } from "@/types/wireTAP";
import { wireTapDevices } from "@/data/wireTapDevices";
import { getDeviceColumns } from "@/components/wiretap/DeviceColumns";
import { DeviceLogsDialog } from "@/components/wiretap/DeviceLogsDialog";

const WireTAPDevices = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<WireTAPDevice[]>(wireTapDevices);
  const [isViewLogsDialogOpen, setIsViewLogsDialogOpen] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<WireTAPDevice | null>(null);

  const handleDeactivateDevice = (device: WireTAPDevice) => {
    const updatedDevices = devices.map(d => {
      if (d.id === device.id) {
        return {
          ...d,
          activationStatus: "Inactive" as const,
          vpnStatus: "Disabled" as const,
          updatedBy: "current.user@example.com",
          updatedAt: new Date().toISOString(),
        };
      }
      return d;
    });
    
    setDevices(updatedDevices);
    toast.success(`Device ${device.hardwareSerialNumber} deactivated successfully`);
  };
  
  const handleViewLogs = (device: WireTAPDevice) => {
    setCurrentDevice(device);
    setIsViewLogsDialogOpen(true);
  };

  const columns = getDeviceColumns();

  const actions = [
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: (device: WireTAPDevice) => {
        navigate(`/wiretap-devices/${device.id}/edit`);
      }
    },
    {
      label: "Deactivate",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDeactivateDevice
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
        <Link to="/wiretap-devices/add">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Add Device
          </Button>
        </Link>
      </div>
      
      <DataTable
        data={devices}
        columns={columns}
        searchable={true}
        searchPlaceholder="Search WireTAP devices..."
        actions={actions}
      />
      
      <DeviceLogsDialog
        isOpen={isViewLogsDialogOpen}
        onOpenChange={setIsViewLogsDialogOpen}
        device={currentDevice}
      />
    </motion.div>
  );
};

export default WireTAPDevices;
