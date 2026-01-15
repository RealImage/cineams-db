import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MoreHorizontal, Eye, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import { Column, Action } from "@/components/ui/data-table/types";
import { FleetTask } from "./TaskManagement";

interface TaskAppliance {
  id: string;
  applianceSerialNumber: string;
  hardwareSerialNumber: string;
  nodeId: string;
  clusterId: string;
  theatreName: string;
  chainName: string;
  updateStatus: "Pending" | "In Progress" | "Completed" | "Failed";
  updatedOn: string | null;
  attemptLogs: AttemptLog[];
}

interface AttemptLog {
  attemptNumber: number;
  timestamp: string;
  status: "Success" | "Failed";
  message: string;
}

// Mock data for appliances
const mockAppliances: TaskAppliance[] = [
  {
    id: "1",
    applianceSerialNumber: "APP-2024-001",
    hardwareSerialNumber: "HW-A1B2C3D4",
    nodeId: "NODE-001",
    clusterId: "CLUSTER-A",
    theatreName: "AMC Empire 25",
    chainName: "AMC Theatres",
    updateStatus: "Completed",
    updatedOn: "2024-01-15 10:45",
    attemptLogs: [
      { attemptNumber: 1, timestamp: "2024-01-15 10:30", status: "Success", message: "Update completed successfully" },
    ],
  },
  {
    id: "2",
    applianceSerialNumber: "APP-2024-002",
    hardwareSerialNumber: "HW-E5F6G7H8",
    nodeId: "NODE-002",
    clusterId: "CLUSTER-A",
    theatreName: "AMC Lincoln Square 13",
    chainName: "AMC Theatres",
    updateStatus: "In Progress",
    updatedOn: "2024-01-15 10:35",
    attemptLogs: [
      { attemptNumber: 1, timestamp: "2024-01-15 10:30", status: "Failed", message: "Connection timeout" },
      { attemptNumber: 2, timestamp: "2024-01-15 10:35", status: "Failed", message: "Package verification failed" },
    ],
  },
  {
    id: "3",
    applianceSerialNumber: "APP-2024-003",
    hardwareSerialNumber: "HW-I9J0K1L2",
    nodeId: "NODE-003",
    clusterId: "CLUSTER-B",
    theatreName: "Regal Union Square",
    chainName: "Regal Cinemas",
    updateStatus: "Failed",
    updatedOn: "2024-01-15 11:20",
    attemptLogs: [
      { attemptNumber: 1, timestamp: "2024-01-15 10:30", status: "Failed", message: "Connection timeout" },
      { attemptNumber: 2, timestamp: "2024-01-15 10:40", status: "Failed", message: "Disk space insufficient" },
      { attemptNumber: 3, timestamp: "2024-01-15 10:50", status: "Failed", message: "Connection refused" },
      { attemptNumber: 4, timestamp: "2024-01-15 11:00", status: "Failed", message: "Service unavailable" },
      { attemptNumber: 5, timestamp: "2024-01-15 11:10", status: "Failed", message: "Maximum retries exceeded" },
      { attemptNumber: 6, timestamp: "2024-01-15 11:20", status: "Failed", message: "Final attempt failed - marked as failed" },
    ],
  },
  {
    id: "4",
    applianceSerialNumber: "APP-2024-004",
    hardwareSerialNumber: "HW-M3N4O5P6",
    nodeId: "NODE-004",
    clusterId: "CLUSTER-B",
    theatreName: "Cinemark Century City",
    chainName: "Cinemark",
    updateStatus: "Pending",
    updatedOn: null,
    attemptLogs: [],
  },
  {
    id: "5",
    applianceSerialNumber: "APP-2024-005",
    hardwareSerialNumber: "HW-Q7R8S9T0",
    nodeId: "NODE-005",
    clusterId: "CLUSTER-C",
    theatreName: "Landmark Sunshine Cinema",
    chainName: "Landmark Theatres",
    updateStatus: "Completed",
    updatedOn: "2024-01-15 10:32",
    attemptLogs: [
      { attemptNumber: 1, timestamp: "2024-01-15 10:30", status: "Success", message: "Update completed successfully" },
    ],
  },
  {
    id: "6",
    applianceSerialNumber: "APP-2024-006",
    hardwareSerialNumber: "HW-U1V2W3X4",
    nodeId: "NODE-006",
    clusterId: "CLUSTER-C",
    theatreName: "Marcus Majestic Cinema",
    chainName: "Marcus Theatres",
    updateStatus: "In Progress",
    updatedOn: "2024-01-15 10:38",
    attemptLogs: [
      { attemptNumber: 1, timestamp: "2024-01-15 10:30", status: "Failed", message: "Network error" },
      { attemptNumber: 2, timestamp: "2024-01-15 10:38", status: "Failed", message: "Retrying..." },
    ],
  },
];

const getStatusColor = (status: TaskAppliance["updateStatus"]): string => {
  switch (status) {
    case "Completed":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "In Progress":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "Failed":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "Pending":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    default:
      return "";
  }
};

const getTaskStatusColor = (status: FleetTask["status"]): string => {
  switch (status) {
    case "Completed":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "In Progress":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "Failed":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "Cancelled":
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    case "Scheduled":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    default:
      return "";
  }
};

const FleetTaskView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const taskData = location.state?.task as FleetTask | undefined;

  const [appliances] = useState<TaskAppliance[]>(mockAppliances);
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);
  const [selectedAppliance, setSelectedAppliance] = useState<TaskAppliance | null>(null);
  const [showAllLogs, setShowAllLogs] = useState(false);

  // Get unique values for filters
  const clusterIds = [...new Set(appliances.map(a => a.clusterId))];
  const chainNames = [...new Set(appliances.map(a => a.chainName))];
  const statusOptions = ["Pending", "In Progress", "Completed", "Failed"];

  // Define columns for the DataTable
  const deviceColumns: Column<TaskAppliance>[] = [
    {
      accessor: "applianceSerialNumber",
      header: "Appliance Serial Number",
      cell: (appliance) => (
        <div>
          <p className="font-medium">{appliance.applianceSerialNumber}</p>
          <p className="text-xs text-muted-foreground">{appliance.hardwareSerialNumber}</p>
        </div>
      ),
    },
    {
      accessor: "nodeId",
      header: "Node ID",
      cell: (appliance) => (
        <div>
          <p className="font-medium">{appliance.nodeId}</p>
          <p className="text-xs text-muted-foreground">{appliance.clusterId}</p>
        </div>
      ),
    },
    {
      accessor: "theatreName",
      header: "Theatre Name",
    },
    {
      accessor: "chainName",
      header: "Chain Name",
      filterable: true,
      filterOptions: chainNames,
    },
    {
      accessor: "clusterId",
      header: "Cluster",
      filterable: true,
      filterOptions: clusterIds,
      cell: () => null, // Hidden but used for filtering
    },
    {
      accessor: "updateStatus",
      header: "Update Status",
      filterable: true,
      filterOptions: statusOptions,
      cell: (appliance) => (
        <Badge className={getStatusColor(appliance.updateStatus)} variant="outline">
          {appliance.updateStatus}
        </Badge>
      ),
    },
    {
      accessor: "updatedOn",
      header: "Updated On",
      cell: (appliance) => appliance.updatedOn || "-",
    },
  ];

  // Calculate progress stats
  const totalDevices = appliances.length;
  const completedCount = appliances.filter(a => a.updateStatus === "Completed").length;
  const failedCount = appliances.filter(a => a.updateStatus === "Failed").length;
  const inProgressCount = appliances.filter(a => a.updateStatus === "In Progress").length;
  const pendingCount = appliances.filter(a => a.updateStatus === "Pending").length;

  const completedPercentage = (completedCount / totalDevices) * 100;
  const failedPercentage = (failedCount / totalDevices) * 100;
  const inProgressPercentage = (inProgressCount / totalDevices) * 100;
  const pendingPercentage = (pendingCount / totalDevices) * 100;

  const handleViewLogs = (appliance: TaskAppliance) => {
    setSelectedAppliance(appliance);
    setShowAllLogs(false);
    setLogsDialogOpen(true);
  };

  const handleCancelDevice = (appliance: TaskAppliance) => {
    console.log("Cancel update for device:", appliance.applianceSerialNumber);
    // Implement cancel logic here
  };

  const displayedLogs = selectedAppliance
    ? showAllLogs
      ? [...selectedAppliance.attemptLogs].reverse()
      : [...selectedAppliance.attemptLogs].slice(-5).reverse()
    : [];

  // Fallback task data if not passed via state
  const task: FleetTask = taskData || {
    id: id || "1",
    taskId: "FT-001",
    taskType: "WireOS Update",
    triggerDate: "2024-01-15 10:00",
    triggerTimezone: "UTC",
    description: "Update WireOS to v4.2.0 for all devices in Region A",
    createdBy: "John Doe",
    createdOn: "2024-01-10",
    status: "In Progress",
    targetVersion: "v4.2.0",
    affectedDevices: totalDevices,
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="text-muted-foreground">Back to Task Management</span>
      </div>

      {/* Task Details */}
      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Task ID</p>
              <p className="font-medium">{task.taskId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Task Type</p>
              <p className="font-medium">{task.taskType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Target Version</p>
              <p className="font-medium">{task.targetVersion || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className={getTaskStatusColor(task.status)} variant="outline">
                {task.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trigger Date/Time</p>
              <p className="font-medium">{task.triggerDate} ({task.triggerTimezone})</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created By</p>
              <p className="font-medium">{task.createdBy}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created On</p>
              <p className="font-medium">{task.createdOn}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Devices</p>
              <p className="font-medium">{totalDevices}</p>
            </div>
            <div className="col-span-2 md:col-span-4">
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="font-medium">{task.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Update Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex h-4 w-full overflow-hidden rounded-full bg-secondary">
            <div 
              className="bg-green-500 transition-all" 
              style={{ width: `${completedPercentage}%` }}
            />
            <div 
              className="bg-blue-500 transition-all" 
              style={{ width: `${inProgressPercentage}%` }}
            />
            <div 
              className="bg-red-500 transition-all" 
              style={{ width: `${failedPercentage}%` }}
            />
            <div 
              className="bg-yellow-500 transition-all" 
              style={{ width: `${pendingPercentage}%` }}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-sm">
                Completed: {completedCount} ({completedPercentage.toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-sm">
                In Progress: {inProgressCount} ({inProgressPercentage.toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-sm">
                Failed: {failedCount} ({failedPercentage.toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <span className="text-sm">
                Pending: {pendingCount} ({pendingPercentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Status Table */}
      <Card>
        <CardHeader>
          <CardTitle>Device Status</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={appliances}
            columns={deviceColumns}
            searchPlaceholder="Search by serial number, node ID, or theatre..."
            searchable={true}
            pageSize={25}
            actions={(appliance) => {
              const actions: Action<TaskAppliance>[] = [
                {
                  label: "View Details",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => handleViewLogs(appliance),
                },
              ];
              if (appliance.updateStatus === "Pending") {
                actions.push({
                  label: "Cancel",
                  icon: <XCircle className="h-4 w-4" />,
                  onClick: () => handleCancelDevice(appliance),
                });
              }
              return actions;
            }}
          />
        </CardContent>
      </Card>

      {/* Logs Dialog */}
      <Dialog open={logsDialogOpen} onOpenChange={setLogsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Update Logs - {selectedAppliance?.applianceSerialNumber}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedAppliance && (
              <>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Hardware Serial</p>
                    <p className="font-medium">{selectedAppliance.hardwareSerialNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Current Status</p>
                    <Badge className={getStatusColor(selectedAppliance.updateStatus)} variant="outline">
                      {selectedAppliance.updateStatus}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">
                    Attempt Logs {!showAllLogs && selectedAppliance.attemptLogs.length > 5 && "(Last 5)"}
                  </h4>
                  {displayedLogs.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[80px]">Attempt</TableHead>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Message</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {displayedLogs.map((log) => (
                            <TableRow key={log.attemptNumber}>
                              <TableCell className="font-medium">#{log.attemptNumber}</TableCell>
                              <TableCell>{log.timestamp}</TableCell>
                              <TableCell>
                                <Badge 
                                  className={log.status === "Success" 
                                    ? "bg-green-500/10 text-green-500 border-green-500/20" 
                                    : "bg-red-500/10 text-red-500 border-red-500/20"
                                  } 
                                  variant="outline"
                                >
                                  {log.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{log.message}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No attempt logs available yet.</p>
                  )}

                  {selectedAppliance.attemptLogs.length > 5 && !showAllLogs && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowAllLogs(true)}
                    >
                      View More ({selectedAppliance.attemptLogs.length - 5} more)
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FleetTaskView;
