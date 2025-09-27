import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

interface DeviceLog {
  id: string;
  date: string;
  action: "Device Identifiers" | "Mapping Details" | "Temporary Pull Out" | "Deactivation";
  updatedBy: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
}

interface DeviceLogsTableProps {
  deviceId?: string;
}

const DeviceLogsTable = ({ deviceId }: DeviceLogsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - in a real app, this would come from an API
  const mockLogs: DeviceLog[] = [
    {
      id: "1",
      date: "2024-01-15 14:30:00",
      action: "Device Identifiers",
      updatedBy: "John Smith",
      oldData: { hardwareSerial: "WT-001-OLD", hostName: "old-hostname" },
      newData: { hardwareSerial: "WT-001", hostName: "cinema-main-01" }
    },
    {
      id: "2", 
      date: "2024-01-20 09:15:00",
      action: "Mapping Details",
      updatedBy: "Sarah Johnson",
      oldData: { mappingStatus: "Unmapped", theatreId: "" },
      newData: { mappingStatus: "Mapped", theatreId: "THR-001", theatreName: "Cineplex Downtown" }
    },
    {
      id: "3",
      date: "2024-02-01 16:45:00", 
      action: "Temporary Pull Out",
      updatedBy: "Mike Wilson",
      oldData: { pullOutStatus: false },
      newData: { pullOutStatus: true, pullOutReason: "Hardware maintenance", pullOutDate: "2024-02-01" }
    },
    {
      id: "4",
      date: "2024-02-10 11:20:00",
      action: "Deactivation",
      updatedBy: "Admin User",
      oldData: { activationStatus: "Active" },
      newData: { activationStatus: "Inactive", deactivationReason: "Hardware replacement" }
    }
  ];

  const filteredLogs = mockLogs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.updatedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.date.includes(searchTerm)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "Device Identifiers":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Mapping Details":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Temporary Pull Out":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Deactivation":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const renderDataChanges = (oldData?: Record<string, any>, newData?: Record<string, any>) => {
    if (!oldData && !newData) return "-";
    
    const changes: JSX.Element[] = [];
    
    if (oldData) {
      Object.entries(oldData).forEach(([key, value]) => {
        changes.push(
          <div key={`old-${key}`} className="text-sm">
            <span className="font-medium text-red-600 dark:text-red-400">- {key}:</span> {String(value)}
          </div>
        );
      });
    }
    
    if (newData) {
      Object.entries(newData).forEach(([key, value]) => {
        changes.push(
          <div key={`new-${key}`} className="text-sm">
            <span className="font-medium text-green-600 dark:text-green-400">+ {key}:</span> {String(value)}
          </div>
        );
      });
    }
    
    return <div className="space-y-1">{changes}</div>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Updated By</TableHead>
              <TableHead>Old Data</TableHead>
              <TableHead>New Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No logs found
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">
                    {formatDate(log.date)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getActionColor(log.action)}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.updatedBy}</TableCell>
                  <TableCell className="max-w-xs">
                    {renderDataChanges(log.oldData, undefined)}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    {renderDataChanges(undefined, log.newData)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DeviceLogsTable;