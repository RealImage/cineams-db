
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, User } from "lucide-react";
import { Theatre } from "@/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TheatreLogsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theatre?: Theatre;
}

type LogEntry = {
  id: string;
  date: string;
  section: "General Information" | "Location & Systems" | "Connectivity Details" | "Content & Key Delivery" | "Screen Management" | "IP & Suites";
  action: "Created" | "Updated" | "Listed" | "Unlisted" | "Deleted";
  updatedBy: {
    name: string;
    email: string;
    phone?: string;
  };
  oldValue?: string;
  newValue?: string;
};

export function TheatreLogsDialog({ open, onOpenChange, theatre }: TheatreLogsDialogProps) {
  const [showAllLogs, setShowAllLogs] = useState(false);

  // Mock data for theatre logs
  const mockLogs: LogEntry[] = [
    {
      id: "1",
      date: new Date().toISOString(),
      section: "General Information",
      action: "Created",
      updatedBy: {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 234-567-8901"
      },
      newValue: theatre?.name || "Cinema City Metropolis"
    },
    {
      id: "2",
      date: new Date(Date.now() - 86400000).toISOString(),
      section: "Screen Management",
      action: "Updated",
      updatedBy: {
        name: "Jane Smith",
        email: "jane.smith@example.com"
      },
      oldValue: "7 screens",
      newValue: "8 screens"
    },
    {
      id: "3",
      date: new Date(Date.now() - 86400000 * 3).toISOString(),
      section: "Connectivity Details",
      action: "Updated",
      updatedBy: {
        name: "Alice Johnson",
        email: "alice.johnson@example.com",
        phone: "+1 234-567-8902"
      },
      oldValue: "192.168.1.100",
      newValue: "192.168.1.150"
    },
    {
      id: "4",
      date: new Date(Date.now() - 86400000 * 7).toISOString(),
      section: "General Information",
      action: "Listed",
      updatedBy: {
        name: "Bob Wilson",
        email: "bob.wilson@example.com"
      },
      oldValue: "Inactive",
      newValue: "Active"
    },
    {
      id: "5",
      date: new Date(Date.now() - 86400000 * 14).toISOString(),
      section: "Content & Key Delivery",
      action: "Updated",
      updatedBy: {
        name: "Carol Davis",
        email: "carol.davis@example.com"
      },
      oldValue: "FTP",
      newValue: "SFTP"
    }
  ];

  const displayedLogs = showAllLogs ? mockLogs : mockLogs.slice(0, 3);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  const getActionColor = (action: string) => {
    switch(action) {
      case 'Created': return 'text-green-600 bg-green-50 border-green-200';
      case 'Updated': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Listed': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'Unlisted': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Deleted': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!theatre) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Change History for {theatre.name}</DialogTitle>
          <DialogDescription>
            View all changes made to this theatre
          </DialogDescription>
        </DialogHeader>
        
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Date/Time</TableHead>
                <TableHead className="w-[140px]">Section</TableHead>
                <TableHead className="w-[90px]">Action</TableHead>
                <TableHead className="w-[120px]">Updated By</TableHead>
                <TableHead>Old Value</TableHead>
                <TableHead>New Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedLogs.length > 0 ? (
                displayedLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        {formatDate(log.date)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.section}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center cursor-help text-sm">
                              <User className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                              <span>{log.updatedBy.name}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="p-2">
                            <div className="text-xs">
                              <div>Email: {log.updatedBy.email}</div>
                              {log.updatedBy.phone && <div>Phone: {log.updatedBy.phone}</div>}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      {log.oldValue ? (
                        <span className="text-sm text-red-600 bg-red-50 px-2 py-0.5 rounded">
                          {log.oldValue}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.newValue ? (
                        <span className="text-sm text-green-600 bg-green-50 px-2 py-0.5 rounded">
                          {log.newValue}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No logs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button 
            variant="default" 
            onClick={() => setShowAllLogs(!showAllLogs)}
          >
            {showAllLogs ? "Show Recent" : "View All Logs"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
