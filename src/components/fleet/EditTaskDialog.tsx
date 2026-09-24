import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FleetTask } from "@/pages/TaskManagement";
import { FLEET_TIMEZONES as timezones, type FleetTaskOptions } from "@/data/fleetData";
import { useFleetTaskOptions } from "@/hooks/api/fleet";

export interface TaskData {
  taskType: FleetTask["taskType"];
  triggerDate: string;
  triggerTime: string;
  triggerTimezone: string;
  description: string;
  targetVersion?: string;
  selectedAgent?: string;
  agentTargetVersion?: string;
  agentName?: string;
}

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskData: TaskData;
  onSaveTask: (taskData: TaskData) => void;
}

const EMPTY_OPTIONS: FleetTaskOptions = { wireOSVersions: [], partnerOSVersions: [], agents: [] };

export const EditTaskDialog = ({ open, onOpenChange, taskData, onSaveTask }: EditTaskDialogProps) => {
  const optionsQuery = useFleetTaskOptions();
  const { wireOSVersions, partnerOSVersions, agents } = optionsQuery.data ?? EMPTY_OPTIONS;
  const [formData, setFormData] = useState<TaskData>({
    taskType: taskData.taskType,
    triggerDate: taskData.triggerDate,
    triggerTime: taskData.triggerTime,
    triggerTimezone: taskData.triggerTimezone,
    description: taskData.description,
    targetVersion: taskData.targetVersion || "",
    selectedAgent: taskData.selectedAgent || "",
    agentTargetVersion: taskData.agentTargetVersion || "",
    agentName: taskData.agentName || "",
  });

  // Update form data when taskData changes
  useEffect(() => {
    setFormData({
      taskType: taskData.taskType,
      triggerDate: taskData.triggerDate,
      triggerTime: taskData.triggerTime,
      triggerTimezone: taskData.triggerTimezone,
      description: taskData.description,
      targetVersion: taskData.targetVersion || "",
      selectedAgent: taskData.selectedAgent || "",
      agentTargetVersion: taskData.agentTargetVersion || "",
      agentName: taskData.agentName || "",
    });
  }, [taskData]);

  // Get versions for selected agent
  const selectedAgentData = agents.find(a => a.id === formData.selectedAgent);

  const handleTaskTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      taskType: value as FleetTask["taskType"],
      targetVersion: "",
      selectedAgent: "",
      agentTargetVersion: "",
      agentName: "",
    }));
  };

  const handleAgentChange = (value: string) => {
    const agent = agents.find(a => a.id === value);
    setFormData(prev => ({
      ...prev,
      selectedAgent: value,
      agentTargetVersion: "",
      agentName: agent?.name || "",
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.taskType || !formData.triggerDate || !formData.triggerTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate version fields based on task type
    if (formData.taskType === "WireOS Update" && !formData.targetVersion) {
      toast.error("Please select a target version for WireOS");
      return;
    }
    if (formData.taskType === "Agent Update" && (!formData.selectedAgent || !formData.agentTargetVersion)) {
      toast.error("Please select an agent and target version");
      return;
    }
    if (formData.taskType === "Agent Deactivate" && !formData.selectedAgent) {
      toast.error("Please select an agent to deactivate");
      return;
    }
    if (formData.taskType === "PartnerOS Update" && !formData.targetVersion) {
      toast.error("Please select a target version for PartnerOS");
      return;
    }

    onSaveTask(formData);
    onOpenChange(false);
    toast.success("Task details updated");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Task Details</DialogTitle>
          <DialogDescription>
            Modify the task configuration and schedule.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="taskType">Task Type</Label>
            <Select
              value={formData.taskType}
              onValueChange={handleTaskTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WireOS Update">WireOS Update</SelectItem>
                <SelectItem value="Agent Update">Agent Update</SelectItem>
                <SelectItem value="Agent Deactivate">Agent Deactivate</SelectItem>
                <SelectItem value="PartnerOS Update">PartnerOS Update</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* WireOS Update - Target Version */}
          {formData.taskType === "WireOS Update" && (
            <div className="space-y-2">
              <Label htmlFor="wireOSVersion">Target Version</Label>
              <Select
                value={formData.targetVersion}
                onValueChange={(value) => setFormData(prev => ({ ...prev, targetVersion: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={optionsQuery.isPending ? "Loading versions…" : "Select WireOS version"} />
                </SelectTrigger>
                <SelectContent>
                  {wireOSVersions.map(version => (
                    <SelectItem key={version} value={version}>{version}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Agent Update - Agent Selection + Target Version */}
          {formData.taskType === "Agent Update" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="agent">Agent</Label>
                <Select
                  value={formData.selectedAgent}
                  onValueChange={handleAgentChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={optionsQuery.isPending ? "Loading agents…" : "Select agent"} />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agentVersion">Target Version</Label>
                <Select
                  value={formData.agentTargetVersion}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, agentTargetVersion: value }))}
                  disabled={!formData.selectedAgent}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.selectedAgent ? "Select version" : "Select agent first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedAgentData?.versions.map(version => (
                      <SelectItem key={version} value={version}>{version}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Agent Deactivate - Agent Selection */}
          {formData.taskType === "Agent Deactivate" && (
            <div className="space-y-2">
              <Label htmlFor="deactivateAgent">Agent</Label>
              <Select
                value={formData.selectedAgent}
                onValueChange={handleAgentChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select agent to deactivate" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* PartnerOS Update - Target Version */}
          {formData.taskType === "PartnerOS Update" && (
            <div className="space-y-2">
              <Label htmlFor="partnerOSVersion">Target Version</Label>
              <Select
                value={formData.targetVersion}
                onValueChange={(value) => setFormData(prev => ({ ...prev, targetVersion: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={optionsQuery.isPending ? "Loading versions…" : "Select PartnerOS version"} />
                </SelectTrigger>
                <SelectContent>
                  {partnerOSVersions.map(version => (
                    <SelectItem key={version} value={version}>{version}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="triggerDate">Trigger Date</Label>
              <Input
                id="triggerDate"
                type="date"
                value={formData.triggerDate}
                onChange={(e) => setFormData(prev => ({ ...prev, triggerDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="triggerTime">Time</Label>
              <Input
                id="triggerTime"
                type="time"
                value={formData.triggerTime}
                onChange={(e) => setFormData(prev => ({ ...prev, triggerTime: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={formData.triggerTimezone}
                onValueChange={(value) => setFormData(prev => ({ ...prev, triggerTimezone: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map(tz => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter task description..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
