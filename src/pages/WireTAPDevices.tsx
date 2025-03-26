import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  FileText,
  Eye,
  Info,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wifi,
  WifiOff
} from "lucide-react";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WireTAPDevice } from "@/types/wireTAP";
import { wireTapDevices } from "@/data/wireTapDevices";

const WireTAPDevices = () => {
  const [devices, setDevices] = useState<WireTAPDevice[]>(wireTapDevices);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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
  
  const handleDownloadReport = () => {
    toast.success("Downloading WireTAP Devices report");
    // In a real application, we would generate and download the report here
  };

  // Status icon components for better visual indicators
  const getActivationStatusIcon = (status: string) => {
    if (status === "Active") {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <XCircle className="h-4 w-4 text-red-600" />;
  };
  
  const getMappingStatusIcon = (status: string) => {
    switch (status) {
      case "Mapped":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "Unmapped":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "Pending":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };
  
  const getVPNStatusIcon = (status: string) => {
    if (status === "Enabled") {
      return <Wifi className="h-4 w-4 text-green-600" />;
    }
    return <WifiOff className="h-4 w-4 text-red-600" />;
  };

  // Define columns for the data table
  const columns: Column<WireTAPDevice>[] = [
    {
      header: "H/W Serial Number",
      accessor: "hardwareSerialNumber",
      cell: (row: WireTAPDevice) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-1">
              {row.hardwareSerialNumber} <Info className="h-4 w-4 text-gray-500" />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <div className="space-y-1">
                <p><strong>Application S/N:</strong> {row.applicationSerialNumber}</p>
                <p><strong>Host Name / Node ID:</strong> {row.hostName}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
      sortable: true
    },
    {
      header: "Connectivity Type",
      accessor: "connectivityType",
      cell: (row: WireTAPDevice) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-1">
              {row.connectivityType} <Info className="h-4 w-4 text-gray-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p><strong>ISP:</strong> {row.ispName}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
      sortable: true
    },
    {
      header: "Theatre",
      accessor: "theatreName",
      cell: (row: WireTAPDevice) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-1">
              {row.theatreName} <Info className="h-4 w-4 text-gray-500" />
            </TooltipTrigger>
            <TooltipContent className="max-w-md">
              <div className="space-y-1">
                <p><strong>Alternate Names:</strong> {row.theatreAlternateNames?.join(", ") || "None"}</p>
                <p><strong>UUID:</strong> {row.theatreUUID}</p>
                <p><strong>Address:</strong> {row.theatreAddress}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
      sortable: true
    },
    {
      header: "Storage Capacity",
      accessor: "storageCapacity",
      sortable: true
    },
    {
      header: "Bandwidth",
      accessor: "bandwidth",
      sortable: true
    },
    {
      header: "Activation Status",
      accessor: "activationStatus",
      cell: (row: WireTAPDevice) => (
        <div className="flex items-center gap-2">
          {getActivationStatusIcon(row.activationStatus)}
          <span className={row.activationStatus === "Active" ? "text-green-600" : "text-red-600"}>
            {row.activationStatus}
          </span>
        </div>
      ),
      sortable: true
    },
    {
      header: "Mapping Status",
      accessor: "mappingStatus",
      cell: (row: WireTAPDevice) => (
        <div className="flex items-center gap-2">
          {getMappingStatusIcon(row.mappingStatus)}
          <span className={
            row.mappingStatus === "Mapped" 
              ? "text-green-600" 
              : row.mappingStatus === "Unmapped" 
                ? "text-red-600" 
                : "text-yellow-600"
          }>
            {row.mappingStatus}
          </span>
        </div>
      ),
      sortable: true
    },
    {
      header: "VPN Status",
      accessor: "vpnStatus",
      cell: (row: WireTAPDevice) => (
        <div className="flex items-center gap-2">
          {getVPNStatusIcon(row.vpnStatus)}
          <span className={row.vpnStatus === "Enabled" ? "text-green-600" : "text-red-600"}>
            {row.vpnStatus}
          </span>
        </div>
      ),
      sortable: true
    },
    {
      header: "Updated By",
      accessor: "updatedBy",
      sortable: true
    },
    {
      header: "Updated At",
      accessor: "updatedAt",
      cell: (row: WireTAPDevice) => format(new Date(row.updatedAt), "MMM dd, yyyy 'at' h:mm a"),
      sortable: true
    }
  ];

  // Define row actions
  const actions = [
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: (device: WireTAPDevice) => {
        setCurrentDevice(device);
        setIsEditDialogOpen(true);
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
      
      {/* Edit Device Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit WireTAP Device</DialogTitle>
            <DialogDescription>
              Update the details for this WireTAP device.
            </DialogDescription>
          </DialogHeader>
          {currentDevice && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = Object.fromEntries(formData.entries());
              handleEditDevice(data);
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-hardwareSerialNumber">H/W Serial Number</Label>
                  <Input 
                    id="edit-hardwareSerialNumber" 
                    name="hardwareSerialNumber" 
                    defaultValue={currentDevice.hardwareSerialNumber}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-applicationSerialNumber">Application Serial Number</Label>
                  <Input 
                    id="edit-applicationSerialNumber" 
                    name="applicationSerialNumber" 
                    defaultValue={currentDevice.applicationSerialNumber}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-hostName">Host Name / Node ID</Label>
                  <Input 
                    id="edit-hostName" 
                    name="hostName" 
                    defaultValue={currentDevice.hostName}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-connectivityType">Connectivity Type</Label>
                  <Select name="connectivityType" defaultValue={currentDevice.connectivityType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select connectivity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fixed Broadband">Fixed Broadband</SelectItem>
                      <SelectItem value="Mobile Broadband">Mobile Broadband</SelectItem>
                      <SelectItem value="4G">4G</SelectItem>
                      <SelectItem value="5G">5G</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-ispName">ISP Name</Label>
                  <Input 
                    id="edit-ispName" 
                    name="ispName" 
                    defaultValue={currentDevice.ispName}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-theatreName">Theatre Name</Label>
                  <Input 
                    id="edit-theatreName" 
                    name="theatreName" 
                    defaultValue={currentDevice.theatreName}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-theatreId">Theatre ID</Label>
                  <Input 
                    id="edit-theatreId" 
                    name="theatreId" 
                    defaultValue={currentDevice.theatreId}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-theatreUUID">Theatre UUID</Label>
                  <Input 
                    id="edit-theatreUUID" 
                    name="theatreUUID" 
                    defaultValue={currentDevice.theatreUUID}
                    required 
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-theatreAddress">Theatre Address</Label>
                  <Input 
                    id="edit-theatreAddress" 
                    name="theatreAddress" 
                    defaultValue={currentDevice.theatreAddress}
                    required 
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-theatreAlternateNames">Theatre Alternate Names (comma-separated)</Label>
                  <Input 
                    id="edit-theatreAlternateNames" 
                    name="theatreAlternateNames" 
                    defaultValue={currentDevice.theatreAlternateNames?.join(", ")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-storageCapacity">Storage Capacity</Label>
                  <Input 
                    id="edit-storageCapacity" 
                    name="storageCapacity" 
                    defaultValue={currentDevice.storageCapacity}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-bandwidth">Bandwidth</Label>
                  <Input 
                    id="edit-bandwidth" 
                    name="bandwidth" 
                    defaultValue={currentDevice.bandwidth}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-activationStatus">Activation Status</Label>
                  <Select name="activationStatus" defaultValue={currentDevice.activationStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-mappingStatus">Mapping Status</Label>
                  <Select name="mappingStatus" defaultValue={currentDevice.mappingStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mapped">Mapped</SelectItem>
                      <SelectItem value="Unmapped">Unmapped</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-vpnStatus">VPN Status</Label>
                  <Select name="vpnStatus" defaultValue={currentDevice.vpnStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Enabled">Enabled</SelectItem>
                      <SelectItem value="Disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditDialogOpen(false);
                  setCurrentDevice(null);
                }}>
                  Cancel
                </Button>
                <Button type="submit">Update Device</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* View Logs Dialog */}
      <Dialog open={isViewLogsDialogOpen} onOpenChange={setIsViewLogsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Device Logs</DialogTitle>
            <DialogDescription>
              Activity logs for {currentDevice?.hardwareSerialNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto border rounded-md p-4 bg-muted/30">
            <div className="space-y-3">
              {currentDevice && [
                { timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), action: "Status Check", details: "Device heartbeat received" },
                { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), action: "VPN Connection", details: "VPN connection established" },
                { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), action: "Bandwidth Test", details: "Bandwidth test completed: 98.5Mbps" },
                { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), action: "Firmware Update", details: "Firmware updated to v2.3.4" },
                { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), action: "Configuration Change", details: "Network settings updated" },
              ].map((log, index) => (
                <div key={index} className="border-b pb-2 last:border-0">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{log.action}</span>
                    <span className="text-muted-foreground">{format(new Date(log.timestamp), "MMM dd, yyyy 'at' h:mm a")}</span>
                  </div>
                  <p className="text-sm mt-1">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              setIsViewLogsDialogOpen(false);
              setCurrentDevice(null);
            }}>
              Close
            </Button>
            <Button variant="outline" onClick={() => toast.success("Log report downloaded")}>
              <Download className="h-4 w-4 mr-2" /> Download Logs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default WireTAPDevices;
