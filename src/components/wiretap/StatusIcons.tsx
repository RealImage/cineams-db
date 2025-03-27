
import { CheckCircle, XCircle, AlertCircle, Wifi, WifiOff } from "lucide-react";

export const getActivationStatusIcon = (status: string) => {
  if (status === "Active") {
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  }
  return <XCircle className="h-4 w-4 text-red-600" />;
};

export const getMappingStatusIcon = (status: string) => {
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

export const getVPNStatusIcon = (status: string) => {
  if (status === "Enabled") {
    return <Wifi className="h-4 w-4 text-green-600" />;
  }
  return <WifiOff className="h-4 w-4 text-red-600" />;
};
