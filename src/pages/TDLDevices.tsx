
import { useState } from "react";
import { motion } from "framer-motion";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, FileCheck, CheckCircle, XCircle } from "lucide-react";
import { tdlDevices as mockDevices } from "@/data/mockData";
import { TDLDevice } from "@/types";
import { toast } from "sonner";
import { formatDate } from "@/lib/dateUtils";

const TDLDevices = () => {
  const [devices, setDevices] = useState<TDLDevice[]>(mockDevices);
  
  const handleCreateDevice = () => {
    toast.info("Device creation will be implemented in a future update");
  };
  
  const handleEditDevice = (device: TDLDevice) => {
    toast.info(`Editing device: ${device.manufacturer} ${device.model} (${device.serialNumber})`);
  };
  
  const handleDeleteDevice = (device: TDLDevice) => {
    setDevices(devices.filter((d) => d.id !== device.id));
    toast.success(`Device "${device.manufacturer} ${device.model}" deleted successfully`);
  };
  
  const handleVerifyDevice = (device: TDLDevice) => {
    toast.info(`Verifying device: ${device.manufacturer} ${device.model} (${device.serialNumber})`);
  };
  
  const columns: Column<TDLDevice>[] = [
    {
      header: "Manufacturer / Make",
      accessor: "manufacturer" as keyof TDLDevice
    },
    {
      header: "Model",
      accessor: "model" as keyof TDLDevice
    },
    {
      header: "Serial Number",
      accessor: "serialNumber" as keyof TDLDevice
    },
    {
      header: "Software Version",
      accessor: "softwareVersion" as keyof TDLDevice
    },
    {
      header: "Device Role",
      accessor: "deviceRole" as keyof TDLDevice
    },
    {
      header: "Certificate Auto-Sync",
      accessor: "certificateAutoSync" as keyof TDLDevice,
      cell: (row: TDLDevice) => (
        <span className={row.certificateAutoSync ? "text-green-600" : "text-muted-foreground"}>
          {row.certificateAutoSync ? "Yes" : "No"}
        </span>
      )
    },
    {
      header: "Valid Till",
      accessor: "validTill" as keyof TDLDevice,
      cell: (row: TDLDevice) => {
        const isExpired = new Date(row.validTill) < new Date();
        return (
          <span className={isExpired ? "text-destructive" : ""}>
            {formatDate(row.validTill)}
          </span>
        );
      }
    },
    {
      header: "Public Key Thumbprint",
      accessor: "publicKeyThumbprint" as keyof TDLDevice
    },
    {
      header: "Issuer Thumbprint",
      accessor: "issuerThumbprint" as keyof TDLDevice
    },
    {
      header: "Source",
      accessor: "source" as keyof TDLDevice
    },
    {
      header: "Retired?",
      accessor: "retired" as keyof TDLDevice,
      cell: (row: TDLDevice) => (
        <span className={row.retired ? "text-destructive font-medium" : "text-muted-foreground"}>
          {row.retired ? "Yes" : "No"}
        </span>
      )
    },
    {
      header: "Updated By",
      accessor: "updatedBy" as keyof TDLDevice
    },
    {
      header: "Updated On",
      accessor: "updatedOn" as keyof TDLDevice,
      cell: (row: TDLDevice) => formatDate(row.updatedOn)
    }
  ];
  
  const actions = [
    {
      label: "Verify",
      icon: <FileCheck className="h-4 w-4" />,
      onClick: handleVerifyDevice
    },
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEditDevice
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDeleteDevice
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
          Manage Trusted Device List (TDL) devices across all theatres
        </p>
        <Button onClick={handleCreateDevice}>
          <Plus className="h-4 w-4 mr-2" /> Add Device
        </Button>
      </div>
      
      <DataTable
        data={devices}
        columns={columns}
        searchPlaceholder="Search devices..."
        actions={actions}
      />
    </motion.div>
  );
};

export default TDLDevices;
