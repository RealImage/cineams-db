import { useState } from "react";
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
import type { FleetTask } from "@/pages/FleetManagement";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTask: (task: Omit<FleetTask, "id">) => void;
}

const generateTaskId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "TK";
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const timezones = ["PST", "EST", "CST", "MST", "GMT", "UTC", "IST", "AEST"];

export const AddTaskDialog = ({ open, onOpenChange, onAddTask }: AddTaskDialogProps) => {
  const [formData, setFormData] = useState({
    taskType: "" as FleetTask["taskType"] | "",
    triggerDate: "",
    triggerTime: "",
    triggerTimezone: "PST",
    description: "",
    targetAppliances: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.taskType || !formData.triggerDate || !formData.triggerTime || !formData.description || !formData.targetAppliances) {
      return;
    }

    const task: Omit<FleetTask, "id"> = {
      taskId: generateTaskId(),
      taskType: formData.taskType as FleetTask["taskType"],
      triggerDate: `${formData.triggerDate}T${formData.triggerTime}:00`,
      triggerTimezone: formData.triggerTimezone,
      description: formData.description,
      targetAppliances: parseInt(formData.targetAppliances),
      status: "Pending",
      updatedOn: new Date().toISOString(),
      updatedBy: "John Smith", // Mock current user
    };

    onAddTask(task);
    setFormData({
      taskType: "",
      triggerDate: "",
      triggerTime: "",
      triggerTimezone: "PST",
      description: "",
      targetAppliances: "",
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="taskType">Task Type</Label>
            <Select
              value={formData.taskType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, taskType: value as FleetTask["taskType"] }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WireOS Update">WireOS Update</SelectItem>
                <SelectItem value="Agent Update">Agent Update</SelectItem>
                <SelectItem value="PartnerOS Update">PartnerOS Update</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="targetAppliances">Target Appliances Count</Label>
            <Input
              id="targetAppliances"
              type="number"
              min="1"
              placeholder="Enter number of appliances"
              value={formData.targetAppliances}
              onChange={(e) => setFormData(prev => ({ ...prev, targetAppliances: e.target.value }))}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
