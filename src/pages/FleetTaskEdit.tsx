import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddApplianceDialog } from "@/components/fleet/AddApplianceDialog";
import { toast } from "sonner";

export interface TaskAppliance {
  id: string;
  applianceSerialNumber: string;
  hardwareSerialNumber: string;
  nodeId: string;
  clusterName: string;
  theatreName: string;
  theatreLocation: {
    city: string;
    state: string;
    country: string;
  };
  chainName: string;
  chainAddress: {
    city: string;
    state: string;
    country: string;
  };
  updateStatus: "Pending" | "In Progress" | "Completed" | "Failed" | "Cancelled";
  updatedOn: string;
}

// Mock appliances for demonstration
const mockAppliances: TaskAppliance[] = [
  {
    id: "1",
    applianceSerialNumber: "QWA-L28038",
    hardwareSerialNumber: "HWS-L28038",
    nodeId: "NODE-001",
    clusterName: "Cluster Alpha",
    theatreName: "AMC Empire 25",
    theatreLocation: { city: "New York", state: "NY", country: "USA" },
    chainName: "AMC Theatres",
    chainAddress: { city: "Leawood", state: "KS", country: "USA" },
    updateStatus: "Pending",
    updatedOn: "2024-03-15T10:30:00",
  },
  {
    id: "2",
    applianceSerialNumber: "QWA-M12304",
    hardwareSerialNumber: "HWS-M12304",
    nodeId: "NODE-002",
    clusterName: "Cluster Beta",
    theatreName: "Regal LA Live",
    theatreLocation: { city: "Los Angeles", state: "CA", country: "USA" },
    chainName: "Regal Cinemas",
    chainAddress: { city: "Knoxville", state: "TN", country: "USA" },
    updateStatus: "In Progress",
    updatedOn: "2024-03-16T14:22:00",
  },
];

const getStatusColor = (status: TaskAppliance["updateStatus"]) => {
  switch (status) {
    case "Completed":
      return "bg-green-500/10 text-green-600 border-green-500/20";
    case "In Progress":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "Pending":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    case "Failed":
      return "bg-red-500/10 text-red-600 border-red-500/20";
    case "Cancelled":
      return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    default:
      return "";
  }
};

const FleetTaskEdit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const taskData = location.state?.taskData;

  const [appliances, setAppliances] = useState<TaskAppliance[]>(mockAppliances);
  const [addApplianceOpen, setAddApplianceOpen] = useState(false);

  // If no task data, redirect back
  if (!taskData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/fleet-management")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Edit Task</h1>
        </div>
        <p className="text-muted-foreground">No task data found. Please start from Fleet Management.</p>
      </div>
    );
  }

  const formatLocation = (loc: { city: string; state: string; country: string }) => {
    return `${loc.city}, ${loc.state}, ${loc.country}`;
  };

  const handleRemoveAppliance = (id: string) => {
    setAppliances(prev => prev.filter(app => app.id !== id));
    toast.success("Appliance removed from task");
  };

  const handleAddAppliance = (appliance: TaskAppliance) => {
    setAppliances(prev => [...prev, appliance]);
    setAddApplianceOpen(false);
    toast.success("Appliance added to task");
  };

  const handleSaveTask = () => {
    toast.success("Task saved successfully");
    navigate("/fleet-management");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/fleet-management")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Task</h1>
            <p className="text-muted-foreground">Configure task details and target appliances</p>
          </div>
        </div>
        <Button onClick={handleSaveTask}>Save Task</Button>
      </div>

      {/* Task Details Section */}
      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Task Type</label>
              <p className="mt-1 font-medium">{taskData.taskType}</p>
            </div>
            {taskData.agentName && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Agent</label>
                <p className="mt-1 font-medium">{taskData.agentName}</p>
              </div>
            )}
            {(taskData.targetVersion || taskData.agentTargetVersion) && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Target Version</label>
                <p className="mt-1 font-medium">{taskData.targetVersion || taskData.agentTargetVersion}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Trigger Date</label>
              <p className="mt-1 font-medium">{taskData.triggerDate}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Time</label>
              <p className="mt-1 font-medium">{taskData.triggerTime}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Timezone</label>
              <p className="mt-1 font-medium">{taskData.triggerTimezone}</p>
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <p className="mt-1 font-medium">{taskData.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Target Appliances Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle>Target Appliances</CardTitle>
              <Badge variant="secondary">{appliances.length} appliances</Badge>
            </div>
            <Button onClick={() => setAddApplianceOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Appliance
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Appliance Serial Number</TableHead>
                  <TableHead>Node ID</TableHead>
                  <TableHead>Theatre Name</TableHead>
                  <TableHead>Chain Name</TableHead>
                  <TableHead>Update Status</TableHead>
                  <TableHead>Updated On</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appliances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No appliances added. Click "Add Appliance" to add appliances to this task.
                    </TableCell>
                  </TableRow>
                ) : (
                  appliances.map((appliance) => (
                    <TableRow key={appliance.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{appliance.applianceSerialNumber}</div>
                          <div className="text-sm text-muted-foreground">{appliance.hardwareSerialNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{appliance.nodeId}</div>
                          <div className="text-sm text-muted-foreground">{appliance.clusterName}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{appliance.theatreName}</div>
                          <div className="text-sm text-muted-foreground">{formatLocation(appliance.theatreLocation)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{appliance.chainName}</div>
                          <div className="text-sm text-muted-foreground">{formatLocation(appliance.chainAddress)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(appliance.updateStatus)}>
                          {appliance.updateStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(appliance.updatedOn).toLocaleDateString()}{" "}
                        {new Date(appliance.updatedOn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAppliance(appliance.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddApplianceDialog
        open={addApplianceOpen}
        onOpenChange={setAddApplianceOpen}
        onAddAppliance={handleAddAppliance}
        existingApplianceIds={appliances.map(a => a.id)}
      />
    </div>
  );
};

export default FleetTaskEdit;