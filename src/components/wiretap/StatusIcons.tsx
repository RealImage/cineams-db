
import { CheckCircle, XCircle, AlertCircle, Wifi, WifiOff, Clock } from "lucide-react";

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

// New function to check if a device has been offline for over 24 hours
export const isDeviceOfflineTooLong = (lastUpdatedTime: string): boolean => {
  const lastUpdated = new Date(lastUpdatedTime);
  const now = new Date();
  const diffInHours = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
  return diffInHours > 24;
};

// New icon for devices offline for too long
export const getOfflineStatusIcon = (lastUpdatedTime: string) => {
  if (isDeviceOfflineTooLong(lastUpdatedTime)) {
    return <Clock className="h-4 w-4 text-red-600" />;
  }
  return null;
};
