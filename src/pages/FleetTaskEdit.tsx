import { useState } from "react";
import { format, parse } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Pencil } from "lucide-react";
import { AddApplianceDialog } from "@/components/fleet/AddApplianceDialog";
import { EditTaskDialog, TaskData } from "@/components/fleet/EditTaskDialog";
import { TargetAppliancesTable } from "@/components/fleet/TargetAppliancesTable";
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


const FleetTaskEdit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialTaskData = location.state?.taskData;

  const [taskData, setTaskData] = useState<TaskData | null>(initialTaskData);
  const [appliances, setAppliances] = useState<TaskAppliance[]>(mockAppliances);
  const [addApplianceOpen, setAddApplianceOpen] = useState(false);
  const [editTaskOpen, setEditTaskOpen] = useState(false);

  // If no task data, redirect back
  if (!taskData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/fleet-management")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <p className="text-muted-foreground">No task data found. Please start from Fleet Management.</p>
        </div>
      </div>
    );
  }


  const handleRemoveAppliance = (id: string) => {
    setAppliances(prev => prev.filter(app => app.id !== id));
    toast.success("Appliance removed from task");
  };

  const handleAddAppliance = (appliance: TaskAppliance) => {
    setAppliances(prev => [...prev, appliance]);
    setAddApplianceOpen(false);
    toast.success("Appliance added to task");
  };

  const handleEditTask = (updatedTaskData: TaskData) => {
    setTaskData(updatedTaskData);
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
          <p className="text-muted-foreground">Configure task details and target appliances</p>
        </div>
        <Button onClick={handleSaveTask}>Save Task</Button>
      </div>

      {/* Task Details Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Task Details</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setEditTaskOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
              <label className="text-sm font-medium text-muted-foreground">Scheduled Time</label>
              <p className="mt-1 font-medium">
                {(() => {
                  try {
                    const dateObj = parse(taskData.triggerDate, 'yyyy-MM-dd', new Date());
                    const formattedDate = format(dateObj, 'dd MMM yyyy');
                    return `${formattedDate} ${taskData.triggerTime} (${taskData.triggerTimezone})`;
                  } catch {
                    return `${taskData.triggerDate} ${taskData.triggerTime} (${taskData.triggerTimezone})`;
                  }
                })()}
              </p>
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
          <TargetAppliancesTable
            appliances={appliances}
            onRemoveAppliance={handleRemoveAppliance}
          />
        </CardContent>
      </Card>

      <AddApplianceDialog
        open={addApplianceOpen}
        onOpenChange={setAddApplianceOpen}
        onAddAppliance={handleAddAppliance}
        existingApplianceIds={appliances.map(a => a.id)}
      />

      {taskData && (
        <EditTaskDialog
          open={editTaskOpen}
          onOpenChange={setEditTaskOpen}
          taskData={taskData}
          onSaveTask={handleEditTask}
        />
      )}
    </div>
  );
};

export default FleetTaskEdit;