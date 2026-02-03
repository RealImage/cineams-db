
import { useState } from "react";
import { format } from "date-fns";
import { RefreshCw, Copy, Check, MapPin, AlertTriangle, Wifi, Signal, Router, X } from "lucide-react";
import { WireTAPDevice, ConnectivityStatus } from "@/types/wireTAP";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ConnectivityStatusOverlayProps {
  device: WireTAPDevice | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const getStatusColor = (status: ConnectivityStatus) => {
  switch (status) {
    case "Healthy":
      return "bg-green-500";
    case "Acceptable":
      return "bg-yellow-500";
    case "Degraded":
      return "bg-orange-500";
    case "Unhealthy":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusBadgeVariant = (status: ConnectivityStatus) => {
  switch (status) {
    case "Healthy":
      return "default";
    case "Acceptable":
      return "secondary";
    case "Degraded":
      return "outline";
    case "Unhealthy":
      return "destructive";
    default:
      return "secondary";
  }
};

const CopyableField = ({ label, value }: { label: string; value: string | undefined }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const displayValue = value || "—";
  const isMissing = !value;

  return (
    <div className="flex items-center justify-between py-2 group">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        {isMissing ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm text-muted-foreground cursor-help">{displayValue}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Not reported by device</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <>
            <span className="text-sm font-medium">{displayValue}</span>
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
              title="Copy to clipboard"
            >
              {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const StatusIndicator = ({ status }: { status: ConnectivityStatus }) => {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
      <Badge variant={getStatusBadgeVariant(status)} className="text-sm">
        {status}
      </Badge>
    </div>
  );
};

export const ConnectivityStatusOverlay = ({
  device,
  isOpen,
  onOpenChange,
}: ConnectivityStatusOverlayProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!device) return null;

  const connectivity = device.connectivity;
  const isMobileConnection = ["Mobile Broadband", "4G", "5G"].includes(device.connectivityType);
  const hasRouterInfo = connectivity?.routerBrand && connectivity?.routerSerialNumber;

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Connectivity status refreshed");
    }, 1500);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${getStatusColor(connectivity?.status || "Unhealthy")}`} />
              <SheetTitle className="text-lg">{device.applicationSerialNumber}</SheetTitle>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-muted-foreground">
              Last Connectivity Check: {connectivity?.lastCheckAt 
                ? format(new Date(connectivity.lastCheckAt), "dd MMM yyyy 'at' hh:mm a")
                : "—"}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh Status
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-4">
          {/* Section 1: Appliance Identity */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Appliance Identity
              </h3>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <CopyableField label="Appliance Serial Number" value={device.applicationSerialNumber} />
              <Separator className="my-1" />
              <CopyableField label="Hardware Serial Number" value={device.hardwareSerialNumber} />
              <Separator className="my-1" />
              <CopyableField label="Cluster Name" value={device.clusterName} />
              <Separator className="my-1" />
              <CopyableField label="Host Name / Node ID" value={device.hostName} />
            </div>
          </div>

          {/* Section 2: Connectivity Overview & Router Identification */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Router className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Connectivity Overview
              </h3>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 space-y-4">
              {/* 2.1 Connection Details */}
              <div>
                <CopyableField label="Connection Type" value={device.connectivityType} />
                <Separator className="my-1" />
                <CopyableField label="ISP / Carrier" value={device.ispName} />
                <Separator className="my-1" />
                <CopyableField label="Mapped Bandwidth" value={device.bandwidth} />
              </div>

              {/* 2.2 Router Identification */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 mt-4">Router Identification</p>
                <CopyableField label="Router Brand" value={connectivity?.routerBrand} />
                <Separator className="my-1" />
                <CopyableField label="Router Model" value={connectivity?.routerModel} />
                <Separator className="my-1" />
                <CopyableField label="Router Serial Number" value={connectivity?.routerSerialNumber} />
                
                {!hasRouterInfo && (
                  <div className="flex items-center gap-2 mt-3 p-2 bg-orange-50 border border-orange-200 rounded-md">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <p className="text-xs text-orange-700">
                      Router Brand + Serial required for signal status. Health capped at Degraded.
                    </p>
                  </div>
                )}
              </div>

              {/* 2.3 Signal / Speed Status */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 mt-4">Signal / Speed Status</p>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${getStatusColor(connectivity?.status || "Unhealthy")} flex items-center justify-center`}>
                      <Signal className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{connectivity?.status || "Unknown"}</p>
                      {connectivity?.statusMessage && (
                        <p className="text-xs text-muted-foreground">{connectivity.statusMessage}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile Signal Details */}
                {isMobileConnection && connectivity?.signalStrength !== undefined && (
                  <div className="flex items-center justify-between py-2 bg-muted/50 rounded-md px-3 mt-2">
                    <span className="text-sm text-muted-foreground">Signal Strength</span>
                    <div className="flex items-center gap-2">
                      <StatusIndicator status={connectivity.status} />
                      <span className="text-sm font-medium">{connectivity.signalStrength} dBm</span>
                      {connectivity.signalLabel && (
                        <span className="text-xs text-muted-foreground">({connectivity.signalLabel})</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Fixed Broadband Speed Details */}
                {!isMobileConnection && connectivity?.actualDownloadSpeed !== undefined && (
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between py-2 bg-muted/50 rounded-md px-3">
                      <span className="text-sm text-muted-foreground">Actual Speed (↓ / ↑)</span>
                      <span className="text-sm font-medium">
                        {connectivity.actualDownloadSpeed} / {connectivity.actualUploadSpeed || 0} Mbps
                      </span>
                    </div>
                    {connectivity.speedStatus && (
                      <div className="flex items-center justify-between py-2 bg-muted/50 rounded-md px-3">
                        <span className="text-sm text-muted-foreground">Speed Status</span>
                        <Badge 
                          variant={connectivity.speedStatus === "Meets" ? "default" : 
                                   connectivity.speedStatus === "Below" ? "secondary" : "destructive"}
                        >
                          {connectivity.speedStatus === "Meets" ? "Meets Expectations" :
                           connectivity.speedStatus === "Below" ? "Below Expected" : "Severely Degraded"}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Theatre Mapping */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Theatre Mapping
              </h3>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <CopyableField label="Theatre Name" value={device.theatreName} />
              <Separator className="my-1" />
              <CopyableField 
                label="Alternate Display Names" 
                value={device.theatreAlternateNames?.join(", ")} 
              />
              <Separator className="my-1" />
              <CopyableField label="Theatre UID" value={device.theatreUUID} />
              <Separator className="my-1" />
              <CopyableField label="Theatre Address" value={device.theatreAddress} />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
