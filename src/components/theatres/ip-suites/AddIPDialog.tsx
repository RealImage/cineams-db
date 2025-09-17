import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddIPDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (ipData: { ipAddress: string; subnetMask: string; gateway: string }) => void;
}

const commonSubnetMasks = [
  "255.255.255.0",
  "255.255.0.0", 
  "255.0.0.0",
  "255.255.255.128",
  "255.255.255.192",
  "255.255.255.224",
  "255.255.255.240",
  "255.255.255.248",
  "255.255.255.252"
];

const validateIPAddress = (ip: string): boolean => {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

export const AddIPDialog = ({ open, onOpenChange, onSave }: AddIPDialogProps) => {
  const [formData, setFormData] = useState({
    ipAddress: "",
    subnetMask: "",
    gateway: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.ipAddress) {
      newErrors.ipAddress = "IP Address is required";
    } else if (!validateIPAddress(formData.ipAddress)) {
      newErrors.ipAddress = "Please enter a valid IP address";
    }

    if (!formData.subnetMask) {
      newErrors.subnetMask = "Subnet Mask is required";
    }

    if (formData.gateway && !validateIPAddress(formData.gateway)) {
      newErrors.gateway = "Please enter a valid gateway address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
      onOpenChange(false);
      setFormData({ ipAddress: "", subnetMask: "", gateway: "" });
      setErrors({});
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setFormData({ ipAddress: "", subnetMask: "", gateway: "" });
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add IP Configuration</DialogTitle>
          <DialogDescription>
            Add a new IP configuration for this screen.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ipAddress">IP Address *</Label>
              <Input
                id="ipAddress"
                value={formData.ipAddress}
                onChange={(e) => handleChange("ipAddress", e.target.value)}
                placeholder="192.168.1.100"
                className={errors.ipAddress ? "border-destructive" : ""}
              />
              {errors.ipAddress && (
                <p className="text-sm text-destructive">{errors.ipAddress}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subnetMask">Subnet Mask *</Label>
              <Select
                value={formData.subnetMask}
                onValueChange={(value) => handleChange("subnetMask", value)}
              >
                <SelectTrigger className={errors.subnetMask ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select subnet mask" />
                </SelectTrigger>
                <SelectContent>
                  {commonSubnetMasks.map((mask) => (
                    <SelectItem key={mask} value={mask}>{mask}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subnetMask && (
                <p className="text-sm text-destructive">{errors.subnetMask}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gateway">Gateway (Optional)</Label>
              <Input
                id="gateway"
                value={formData.gateway}
                onChange={(e) => handleChange("gateway", e.target.value)}
                placeholder="192.168.1.1"
                className={errors.gateway ? "border-destructive" : ""}
              />
              {errors.gateway && (
                <p className="text-sm text-destructive">{errors.gateway}</p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Add IP</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};