import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTask: (task: Omit<FleetTask, "id">) => void;
}

const timezones = ["PST", "EST", "CST", "MST", "GMT", "UTC", "IST", "AEST"];

// Mock data for versions
const wireOSVersions = ["3.2.1", "3.2.0", "3.1.5", "3.1.4", "3.0.9"];
const partnerOSVersions = ["2.5.0", "2.4.3", "2.4.2", "2.3.8", "2.3.7"];

// Agent list with their versions
const agents = [
  { id: "icount", name: "iCount - iCount", versions: ["1.4.2", "1.4.1", "1.4.0", "1.3.9"] },
  { id: "qlog", name: "QLog - Qlog Agent", versions: ["2.1.0", "2.0.8", "2.0.7"] },
  { id: "qw-redux", name: "QW - Agent Redux", versions: ["4.2.1", "4.2.0", "4.1.5"] },
  { id: "qw-config", name: "QW - Configuration Agent", versions: ["1.8.3", "1.8.2", "1.8.1"] },
  { id: "qw-ingest", name: "QW - Content Ingest Agent", versions: ["3.0.4", "3.0.3", "3.0.2"] },
  { id: "qw-inventory", name: "QW - Inventory Agent", versions: ["2.3.1", "2.3.0", "2.2.9"] },
  { id: "qw-kadet", name: "QW - Kadet (Agent Zero)", versions: ["5.1.0", "5.0.9", "5.0.8"] },
  { id: "qw-kdm", name: "QW - KDM Agent", versions: ["1.9.2", "1.9.1", "1.9.0"] },
  { id: "qw-livewire", name: "QW - Live Wire", versions: ["2.6.0", "2.5.9", "2.5.8"] },
  { id: "qw-manifest", name: "QW - Manifest Agent", versions: ["1.5.4", "1.5.3", "1.5.2"] },
  { id: "qw-tdl", name: "QW - TDL Agent", versions: ["3.2.1", "3.2.0", "3.1.9"] },
  { id: "scheduler-qs", name: "Scheduler - AgentQS", versions: ["2.0.5", "2.0.4", "2.0.3"] },
  { id: "scheduler-content", name: "Scheduler - Content Agent", versions: ["1.7.2", "1.7.1", "1.7.0"] },
  { id: "scheduler-scheduler", name: "Scheduler - Scheduler Agent", versions: ["3.4.1", "3.4.0", "3.3.9"] },
  { id: "slate-agentq", name: "Slate - AgentQ", versions: ["4.0.2", "4.0.1", "4.0.0"] },
];

export const AddTaskDialog = ({ open, onOpenChange, onAddTask }: AddTaskDialogProps) => {
  const navigate = useNavigate();
  
  // Get current date, time, and timezone
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().slice(0, 5);
  const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Map IANA timezone to abbreviated timezone
  const getAbbreviatedTimezone = () => {
    const tzMap: Record<string, string> = {
      "America/Los_Angeles": "PST",
      "America/New_York": "EST",
      "America/Chicago": "CST",
      "America/Denver": "MST",
      "Europe/London": "GMT",
      "UTC": "UTC",
      "Asia/Kolkata": "IST",
      "Australia/Sydney": "AEST",
    };
    return tzMap[currentTimezone] || "PST";
  };

  const [formData, setFormData] = useState({
    taskType: "" as FleetTask["taskType"] | "",
    triggerDate: currentDate,
    triggerTime: currentTime,
    triggerTimezone: getAbbreviatedTimezone(),
    description: "",
    targetVersion: "",
    selectedAgent: "",
    agentTargetVersion: "",
  });

  // Get versions for selected agent
  const selectedAgentData = agents.find(a => a.id === formData.selectedAgent);

  const handleTaskTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      taskType: value as FleetTask["taskType"],
      targetVersion: "",
      selectedAgent: "",
      agentTargetVersion: "",
    }));
  };

  const handleAgentChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAgent: value,
      agentTargetVersion: "",
    }));
  };

  const handleContinue = (e: React.FormEvent) => {
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

    // Navigate to edit task page with form data
    navigate("/fleet-management/task/new", {
      state: {
        taskData: {
          taskType: formData.taskType,
          triggerDate: formData.triggerDate,
          triggerTime: formData.triggerTime,
          triggerTimezone: formData.triggerTimezone,
          description: formData.description,
          targetVersion: formData.targetVersion,
          selectedAgent: formData.selectedAgent,
          agentTargetVersion: formData.agentTargetVersion,
          agentName: selectedAgentData?.name,
        }
      }
    });
    
    onOpenChange(false);
    setFormData({
      taskType: "",
      triggerDate: currentDate,
      triggerTime: currentTime,
      triggerTimezone: getAbbreviatedTimezone(),
      description: "",
      targetVersion: "",
      selectedAgent: "",
      agentTargetVersion: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Create a new fleet management task for your appliances.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleContinue} className="space-y-4">
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
                  <SelectValue placeholder="Select WireOS version" />
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
                    <SelectValue placeholder="Select agent" />
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
                  <SelectValue placeholder="Select PartnerOS version" />
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
            <Button type="submit">Continue</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
