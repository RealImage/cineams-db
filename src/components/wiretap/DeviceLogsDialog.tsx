
import { format } from "date-fns";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { WireTAPDevice } from "@/types/wireTAP";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeviceLogsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  device: WireTAPDevice | null;
}

export function DeviceLogsDialog({ isOpen, onOpenChange, device }: DeviceLogsDialogProps) {
  if (!device) return null;

  const mockLogs = [
    { timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), action: "Status Check", details: "Device heartbeat received" },
    { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), action: "VPN Connection", details: "VPN connection established" },
    { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), action: "Bandwidth Test", details: "Bandwidth test completed: 98.5Mbps" },
    { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), action: "Firmware Update", details: "Firmware updated to v2.3.4" },
    { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), action: "Configuration Change", details: "Network settings updated" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Device Logs</DialogTitle>
          <DialogDescription>
            Activity logs for {device.hardwareSerialNumber}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto border rounded-md p-4 bg-muted/30">
          <div className="space-y-3">
            {mockLogs.map((log, index) => (
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
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="outline" onClick={() => toast.success("Log report downloaded")}>
            <Download className="h-4 w-4 mr-2" /> Download Logs
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
