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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WireTAPDevice } from "@/types/wireTAP";

interface PullOutDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: WireTAPDevice | null;
  onConfirm: (device: WireTAPDevice, reason: string, comments: string) => void;
}

const pullOutReasons = [
  "Hardware Failure",
  "Maintenance Required",
  "Upgrade/Replacement",
  "Theatre Closure",
  "Relocation",
  "End of Contract",
  "Other",
];

export const PullOutDeviceDialog = ({
  open,
  onOpenChange,
  device,
  onConfirm,
}: PullOutDeviceDialogProps) => {
  const [reason, setReason] = useState("");
  const [comments, setComments] = useState("");

  const handleConfirm = () => {
    if (device && reason) {
      onConfirm(device, reason, comments);
      setReason("");
      setComments("");
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setReason("");
    setComments("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pull Out Device</DialogTitle>
          <DialogDescription>
            Are you sure you want to pull out device{" "}
            <span className="font-semibold">
              {device?.applicationSerialNumber}
            </span>
            ? This action will mark the device as pulled out from the theatre.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason for Pull Out <span className="text-destructive">*</span>
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent className="bg-background border">
                {pullOutReasons.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Comments</Label>
            <Textarea
              id="comments"
              placeholder="Add any additional comments..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!reason}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
