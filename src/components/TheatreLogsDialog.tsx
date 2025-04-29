
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Calendar, User } from "lucide-react";
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
  action: "Created" | "Updated" | "Deactivated" | "Deleted";
  updatedBy: {
    name: string;
    email: string;
    phone?: string;
  };
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
};

export function TheatreLogsDialog({ open, onOpenChange, theatre }: TheatreLogsDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for theatre logs
  const mockLogs: LogEntry[] = [
    {
      id: "1",
      date: new Date().toISOString(),
      action: "Created",
      updatedBy: {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 234-567-8901"
      },
      newData: {
        name: theatre?.name,
        status: "Active",
        address: theatre?.address,
        screenCount: theatre?.screenCount
      }
    },
    {
      id: "2",
      date: new Date(Date.now() - 86400000).toISOString(), // One day ago
      action: "Updated",
      updatedBy: {
        name: "Jane Smith",
        email: "jane.smith@example.com"
      },
      oldData: {
        screenCount: theatre ? theatre.screenCount - 1 : 0
      },
      newData: {
        screenCount: theatre?.screenCount
      }
    },
    {
      id: "3",
      date: new Date(Date.now() - 86400000 * 7).toISOString(), // One week ago
      action: "Updated",
      updatedBy: {
        name: "Alice Johnson",
        email: "alice.johnson@example.com",
        phone: "+1 234-567-8902"
      },
      oldData: {
        status: "Inactive"
      },
      newData: {
        status: "Active"
      }
    }
  ];

  const filteredLogs = mockLogs.filter(log => {
    const logValues = [
      log.action,
      log.updatedBy.name,
      log.date,
      ...Object.keys(log.oldData || {}),
      ...Object.keys(log.newData || {})
    ];
    
    return logValues.some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  const renderDataChanges = (oldData?: Record<string, any>, newData?: Record<string, any>) => {
    if (!oldData && newData) {
      // Creation event - show all new data
      return (
        <div className="space-y-1">
          {Object.entries(newData).map(([key, value]) => (
            <div key={key} className="text-xs">
              <span className="font-medium">{key}:</span>{" "}
              <span className="text-green-500">{String(value)}</span>
            </div>
          ))}
        </div>
      );
    } else if (oldData && newData) {
      // Update event - show changes
      const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
      const changes: { key: string; old: any; new: any }[] = [];
      
      allKeys.forEach(key => {
        const oldValue = oldData[key];
        const newValue = newData[key];
        if (oldValue !== newValue) {
          changes.push({ key, old: oldValue, new: newValue });
        }
      });
      
      return (
        <div className="space-y-1">
          {changes.map(({ key, old, new: newVal }) => (
            <div key={key} className="text-xs">
              <span className="font-medium">{key}:</span>{" "}
              <span className="text-red-500">{String(old)}</span>{" "}
              <span className="text-muted-foreground">→</span>{" "}
              <span className="text-green-500">{String(newVal)}</span>
            </div>
          ))}
        </div>
      );
    } else {
      return null;
    }
  };

  const getActionColor = (action: string) => {
    switch(action) {
      case 'Created': return 'text-green-500 bg-green-50 border-green-200';
      case 'Updated': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'Deactivated': return 'text-amber-500 bg-amber-50 border-amber-200';
      case 'Deleted': return 'text-red-500 bg-red-50 border-red-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  if (!theatre) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Change History for {theatre.name}</DialogTitle>
          <DialogDescription>
            View all changes made to this theatre
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Date</TableHead>
                <TableHead className="w-[100px]">Action</TableHead>
                <TableHead className="w-[150px]">Updated By</TableHead>
                <TableHead>Changes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      {formatDate(log.date)}
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
                            <div className="flex items-center cursor-help">
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
                      {renderDataChanges(log.oldData, log.newData)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No logs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
