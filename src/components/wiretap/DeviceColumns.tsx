
import { format } from "date-fns";
import { Info } from "lucide-react";
import { Column } from "@/components/ui/data-table";
import { WireTAPDevice } from "@/types/wireTAP";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { getActivationStatusIcon, getMappingStatusIcon, getVPNStatusIcon } from "./StatusIcons";

export const getDeviceColumns = (): Column<WireTAPDevice>[] => [
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
              <p><strong>Appliance S/N:</strong> {row.applicationSerialNumber}</p>
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
