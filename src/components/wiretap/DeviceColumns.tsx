import { format } from "date-fns";
import { Info, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Column } from "@/components/ui/data-table";
import { WireTAPDevice } from "@/types/wireTAP";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { getActivationStatusIcon, getMappingStatusIcon, getVPNStatusIcon } from "./StatusIcons";

const CopyableField = ({ label, value }: { label: string; value: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="flex items-center justify-between group">
      <span><strong>{label}:</strong> {value}</span>
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1 hover:bg-gray-100 rounded"
        title="Copy to clipboard"
      >
        {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
      </button>
    </div>
  );
};

export const getDeviceColumns = (): Column<WireTAPDevice>[] => [
  {
    header: "Appliance Serial Number",
    accessor: "hardwareSerialNumber",
    cell: (row: WireTAPDevice) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="flex items-center gap-1">
            {row.hardwareSerialNumber} <Info className="h-4 w-4 text-gray-500" />
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <div className="space-y-2">
              <CopyableField label="H/W Serial Number" value={row.hardwareSerialNumber} />
              <CopyableField label="Appliance Serial Number" value={row.applicationSerialNumber} />
              <CopyableField label="Cluster Name" value={row.clusterName || 'N/A'} />
              <CopyableField label="Host Name / Node ID" value={row.hostName} />
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
            <div className="space-y-1">
              <p><strong>ISP:</strong> {row.ispName}</p>
              <p><strong>Mapped Bandwidth:</strong> {row.bandwidth}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
    sortable: true,
    filterable: true,
    filterOptions: (data: WireTAPDevice[]) => {
      const types = new Set(data.map(d => d.connectivityType));
      return Array.from(types).sort();
    }
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
    header: "Appliance Type",
    accessor: "wireTapApplianceType",
    sortable: true,
    filterable: true,
    filterOptions: ["Standard", "Pro", "Enterprise"]
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
    sortable: true,
    filterable: true,
    filterOptions: ["Active", "Inactive"]
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
    sortable: true,
    filterable: true,
    filterOptions: ["Mapped", "Unmapped", "Pending"]
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
    sortable: true,
    filterable: true,
    filterOptions: ["Enabled", "Disabled"]
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
    sortable: true,
    filterable: true,
    filterType: 'dateRange' as const
  }
];