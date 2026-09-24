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
import { formatDateTime } from "@/lib/dateUtils";

import type { ImageItem } from "@/data/fleetData";
import { useImageLogs } from "@/hooks/api/fleet";

interface ViewImageLogsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: ImageItem | null;
}

export function ViewImageLogsDialog({
  open,
  onOpenChange,
  image,
}: ViewImageLogsDialogProps) {
  const logsQuery = useImageLogs(open ? image?.id : undefined);
  const logs = logsQuery.data ?? [];

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
              {logsQuery.isPending && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Loading logs…</TableCell>
                </TableRow>
              )}
              {logsQuery.isError && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-red-500">
                    Could not load logs: {logsQuery.error.message}
                  </TableCell>
                </TableRow>
              )}
              {logsQuery.isSuccess && logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No activity yet.</TableCell>
                </TableRow>
              )}
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">{formatDateTime(log.timestamp)}</TableCell>
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
