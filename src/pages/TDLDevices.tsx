
import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, FileCheck, CheckCircle, XCircle, Clock } from "lucide-react";
import { tdlDevices as mockDevices } from "@/data/mockData";
import { TDLDevice } from "@/types";
import { toast } from "sonner";

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
  
  const getCertificateStatusIcon = (status: string) => {
    switch (status) {
      case "Valid":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "Expired":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "Revoked":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };
  
  const columns: Column<TDLDevice>[] = [
    {
      header: "Manufacturer",
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
      header: "Certificate Status",
      accessor: "certificateStatus" as keyof TDLDevice,
      cell: (row: TDLDevice) => (
        <div className="flex items-center space-x-2">
          {getCertificateStatusIcon(row.certificateStatus)}
          <span className={`${
            row.certificateStatus === "Valid" 
              ? "text-green-600" 
              : row.certificateStatus === "Expired" 
                ? "text-yellow-600" 
                : "text-red-600"
          }`}>
            {row.certificateStatus}
          </span>
        </div>
      )
    },
    {
      header: "Firmware",
      accessor: "firmwareVersion" as keyof TDLDevice
    },
    {
      header: "Updated On",
      accessor: "updatedOn" as keyof TDLDevice,
      cell: (row: TDLDevice) => new Date(row.updatedOn).toLocaleDateString()
    },
    {
      header: "Source",
      accessor: "source" as keyof TDLDevice
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
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">TDL Devices</h1>
            <p className="text-muted-foreground mt-1">
              Manage Trusted Device List (TDL) devices across all theatres
            </p>
          </div>
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
    </Layout>
  );
};

export default TDLDevices;
