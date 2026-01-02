import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ImageItem {
  id: string;
  provider: string;
  agentOsName: string;
  latestVersion: string;
  updatedOn: string;
  updatedBy: string;
}

interface ViewImageLogsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: ImageItem | null;
}

// Mock logs data
const getMockLogs = (imageId: string) => [
  { timestamp: "2024-01-15 14:32:15", action: "Version Added", details: "Added v4.2.0", user: "Admin", status: "success" },
  { timestamp: "2024-01-15 14:30:00", action: "Build Started", details: "Building v4.2.0", user: "System", status: "info" },
  { timestamp: "2024-01-10 09:15:22", action: "Version Updated", details: "Set v4.1.9 as latest", user: "John Doe", status: "success" },
  { timestamp: "2024-01-10 09:10:00", action: "Version Added", details: "Added v4.1.9", user: "John Doe", status: "success" },
  { timestamp: "2024-01-08 16:45:33", action: "Version Deprecated", details: "Deprecated v4.1.6", user: "Admin", status: "warning" },
  { timestamp: "2024-01-05 11:20:00", action: "Download", details: "v4.1.8 downloaded by 15 devices", user: "System", status: "info" },
  { timestamp: "2024-01-03 08:00:00", action: "Build Failed", details: "Failed to build v4.1.8-beta", user: "System", status: "error" },
  { timestamp: "2024-01-02 14:22:11", action: "Configuration Changed", details: "Updated build parameters", user: "Jane Smith", status: "info" },
];

export function ViewImageLogsDialog({
  open,
  onOpenChange,
  image,
}: ViewImageLogsDialogProps) {
  const logs = image ? getMockLogs(image.id) : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Success</Badge>;
      case "error":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Error</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Warning</Badge>;
      case "info":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Info</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Activity Logs</DialogTitle>
          <DialogDescription>
            View activity logs for {image?.agentOsName} ({image?.provider})
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                  <TableCell className="font-medium">{log.action}</TableCell>
                  <TableCell>{log.details}</TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
