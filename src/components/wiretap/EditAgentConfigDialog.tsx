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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface Agent {
  id: number;
  provider: string;
  agentName: string;
  version: string;
  updatedOn: string;
}

interface EditAgentConfigDialogProps {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wireTapSerialNumber?: string;
  applianceSerialNumber?: string;
  hostname?: string;
}

const EditAgentConfigDialog = ({
  agent,
  open,
  onOpenChange,
  wireTapSerialNumber,
  applianceSerialNumber,
  hostname,
}: EditAgentConfigDialogProps) => {
  const [config, setConfig] = useState({
    enabled: true,
    autoUpdate: false,
    logLevel: "info",
    customParam1: "",
    customParam2: "",
  });

  const handleSave = () => {
    // Handle save configuration
    console.log("Saving configuration for agent:", agent?.agentName, config);
    onOpenChange(false);
  };

  if (!agent) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Agent Configuration</DialogTitle>
          <DialogDescription>
            Configure settings for {agent.agentName} ({agent.provider})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">WireTAP Serial Number</p>
                <p className="text-sm font-semibold">{wireTapSerialNumber || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Appliance Serial Number</p>
                <p className="text-sm font-semibold">{applianceSerialNumber || "—"}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Hostname</p>
              <p className="text-sm font-semibold">{hostname || "—"}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Enable Agent</Label>
              <p className="text-sm text-muted-foreground">
                Activate or deactivate this agent
              </p>
            </div>
            <Switch
              id="enabled"
              checked={config.enabled}
              onCheckedChange={(checked) =>
                setConfig({ ...config, enabled: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoUpdate">Auto Update</Label>
              <p className="text-sm text-muted-foreground">
                Automatically update agent when new version is available
              </p>
            </div>
            <Switch
              id="autoUpdate"
              checked={config.autoUpdate}
              onCheckedChange={(checked) =>
                setConfig({ ...config, autoUpdate: checked })
              }
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="logLevel">Log Level</Label>
            <Input
              id="logLevel"
              value={config.logLevel}
              onChange={(e) =>
                setConfig({ ...config, logLevel: e.target.value })
              }
              placeholder="e.g., info, debug, error"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customParam1">Custom Parameter 1</Label>
            <Input
              id="customParam1"
              value={config.customParam1}
              onChange={(e) =>
                setConfig({ ...config, customParam1: e.target.value })
              }
              placeholder="Enter custom parameter"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customParam2">Custom Parameter 2</Label>
            <Input
              id="customParam2"
              value={config.customParam2}
              onChange={(e) =>
                setConfig({ ...config, customParam2: e.target.value })
              }
              placeholder="Enter custom parameter"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Configuration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditAgentConfigDialog;
