
import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus, HardDrive, Check, X } from "lucide-react";
import { tdlDevices as mockDevices } from "@/data/mockData";
import { TDLDevice } from "@/types";

const TDLDevices = () => {
  const [devices, setDevices] = useState<TDLDevice[]>(mockDevices);
  
  const columns = [
    {
      header: "Manufacturer",
      accessor: "manufacturer"
    },
    {
      header: "Model",
      accessor: "model"
    },
    {
      header: "Serial Number",
      accessor: "serialNumber"
    },
    {
      header: "Certificate Status",
      accessor: "certificateStatus",
      cell: (row: TDLDevice) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.certificateStatus === "Valid" 
            ? "bg-green-100 text-green-800" 
            : row.certificateStatus === "Expired" 
              ? "bg-yellow-100 text-yellow-800" 
              : "bg-red-100 text-red-800"
        }`}>
          {row.certificateStatus}
        </span>
      )
    },
    {
      header: "Firmware Version",
      accessor: "firmwareVersion"
    },
    {
      header: "Auto-Update",
      accessor: "autoUpdateCertificate",
      cell: (row: TDLDevice) => (
        row.autoUpdateCertificate ? 
          <Check className="h-4 w-4 text-green-600 mx-auto" /> : 
          <X className="h-4 w-4 text-red-600 mx-auto" />
      )
    },
    {
      header: "Updated By",
      accessor: "updatedBy"
    },
    {
      header: "Updated On",
      accessor: "updatedOn",
      cell: (row: TDLDevice) => new Date(row.updatedOn).toLocaleDateString()
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
            <h1 className="text-2xl font-bold tracking-tight">TDL Devices Master</h1>
            <p className="text-muted-foreground mt-1">
              Manage all Trusted Device List (TDL) devices in the system
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Add Device
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: "Total Devices", count: devices.length, icon: <HardDrive className="h-5 w-5" /> },
            { title: "Valid Certificates", count: devices.filter(d => d.certificateStatus === "Valid").length, icon: <Check className="h-5 w-5" /> },
            { title: "Expired Certificates", count: devices.filter(d => d.certificateStatus === "Expired").length, icon: <X className="h-5 w-5" /> },
            { title: "Auto-Update Enabled", count: devices.filter(d => d.autoUpdateCertificate).length, icon: <HardDrive className="h-5 w-5" /> }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <div className="bg-primary/10 rounded-full p-2 text-primary">
                  {stat.icon}
                </div>
              </div>
              <h3 className="text-3xl font-bold mt-2">{stat.count.toLocaleString()}</h3>
            </motion.div>
          ))}
        </div>
        
        <DataTable
          data={devices}
          columns={columns}
          searchPlaceholder="Search devices..."
        />
      </motion.div>
    </Layout>
  );
};

export default TDLDevices;
