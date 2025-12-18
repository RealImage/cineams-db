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
import type { FleetTask } from "@/pages/FleetManagement";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTask: (task: Omit<FleetTask, "id">) => void;
}

const timezones = ["PST", "EST", "CST", "MST", "GMT", "UTC", "IST", "AEST"];

export const AddTaskDialog = ({ open, onOpenChange, onAddTask }: AddTaskDialogProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    taskType: "" as FleetTask["taskType"] | "",
    triggerDate: "",
    triggerTime: "",
    triggerTimezone: "PST",
    description: "",
  });

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.taskType || !formData.triggerDate || !formData.triggerTime || !formData.description) {
      toast.error("Please fill in all required fields");
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
        }
      }
    });
    
    onOpenChange(false);
    setFormData({
      taskType: "",
      triggerDate: "",
      triggerTime: "",
      triggerTimezone: "PST",
      description: "",
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
