import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface SuiteDevice {
  id: string;
  deviceModel: string;
  serialNumber: string;
  deviceRole: string;
  certificateStatus: 'Active' | 'Inactive' | 'Unknown';
  softwareVersion: string;
}

interface AddSuiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableDevices: SuiteDevice[];
  onSave: (suiteData: {
    effectiveFromDate: string;
    devices: SuiteDevice[];
  }) => void;
}

export const AddSuiteDialog = ({ open, onOpenChange, availableDevices, onSave }: AddSuiteDialogProps) => {
  const [effectiveFromDate, setEffectiveFromDate] = useState("");
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter devices to only show those with valid certificates
  const validDevices = availableDevices.filter(device => device.certificateStatus === "Active");

  const handleDeviceToggle = (deviceId: string) => {
    setSelectedDeviceIds(prev => 
      prev.includes(deviceId) 
        ? prev.filter(id => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!effectiveFromDate) {
      newErrors.effectiveFromDate = "Effective From Date is required";
    }

    if (selectedDeviceIds.length === 0) {
      newErrors.devices = "At least one device must be selected";
    } else {
      const selectedDevices = validDevices.filter(device => selectedDeviceIds.includes(device.id));
      const hasScreenManager = selectedDevices.some(device => 
        device.deviceRole === "Server (SM)" || device.deviceRole === "Root Media Block (RMB)"
      );
      
      if (!hasScreenManager) {
        newErrors.devices = "Suite must contain exactly one Server (SM) or Root Media Block (RMB)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const selectedDevices = validDevices.filter(device => selectedDeviceIds.includes(device.id));
      
      onSave({
        effectiveFromDate,
        devices: selectedDevices
      });
      
      onOpenChange(false);
      setEffectiveFromDate("");
      setSelectedDeviceIds([]);
      setErrors({});
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setEffectiveFromDate("");
    setSelectedDeviceIds([]);
    setErrors({});
  };

  const getCertificateStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge variant="default" className="bg-green-100 text-green-800">✅ Active</Badge>;
      case 'Inactive':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">⚠️ Inactive</Badge>;
      case 'Unknown':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">❓ Unknown</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Suite</DialogTitle>
          <DialogDescription>
            Create a new suite and assign devices to it. Only devices with active certificates can be assigned.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="effectiveFromDate">Effective From Date *</Label>
              <Input
                id="effectiveFromDate"
                type="date"
                value={effectiveFromDate}
                onChange={(e) => {
                  setEffectiveFromDate(e.target.value);
                  if (errors.effectiveFromDate) {
                    setErrors(prev => ({ ...prev, effectiveFromDate: "" }));
                  }
                }}
                className={errors.effectiveFromDate ? "border-destructive" : ""}
              />
              {errors.effectiveFromDate && (
                <p className="text-sm text-destructive">{errors.effectiveFromDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Select Devices *</Label>
              {errors.devices && (
                <p className="text-sm text-destructive">{errors.devices}</p>
              )}
              
              {validDevices.length > 0 ? (
                <div className="border rounded-md p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-3">
                    {validDevices.map((device) => (
                      <div key={device.id} className="flex items-center space-x-3 p-3 border rounded-md">
                        <Checkbox
                          id={`device-${device.id}`}
                          checked={selectedDeviceIds.includes(device.id)}
                          onCheckedChange={() => handleDeviceToggle(device.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="font-medium">{device.deviceModel}</p>
                              <p className="text-sm text-muted-foreground font-mono">{device.serialNumber}</p>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">{device.deviceRole}</Badge>
                                {getCertificateStatusBadge(device.certificateStatus)}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-mono">{device.softwareVersion}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border rounded-md p-8 text-center">
                  <p className="text-muted-foreground">
                    No devices with valid certificates are available for suite assignment.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-muted/50 p-3 rounded-md">
              <h4 className="font-medium text-sm mb-2">Suite Requirements:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Must contain exactly one Server (SM) or Root Media Block (RMB)</li>
                <li>• All devices must have valid certificates (Active status)</li>
                <li>• A device cannot belong to multiple suites</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Create Suite</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};