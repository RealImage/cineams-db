
import { WireTAPDevice } from "@/types/wireTAP";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditDeviceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  device: WireTAPDevice | null;
  onSubmit: (formData: FormData) => void;
}

export function EditDeviceDialog({ isOpen, onOpenChange, device, onSubmit }: EditDeviceDialogProps) {
  if (!device) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Edit WireTAP Device</DialogTitle>
          <DialogDescription>
            Update the details for this WireTAP device.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          onSubmit(formData);
        }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-hardwareSerialNumber">H/W Serial Number</Label>
              <Input 
                id="edit-hardwareSerialNumber" 
                name="hardwareSerialNumber" 
                defaultValue={device.hardwareSerialNumber}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-applicationSerialNumber">Application Serial Number</Label>
              <Input 
                id="edit-applicationSerialNumber" 
                name="applicationSerialNumber" 
                defaultValue={device.applicationSerialNumber}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-hostName">Host Name / Node ID</Label>
              <Input 
                id="edit-hostName" 
                name="hostName" 
                defaultValue={device.hostName}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-connectivityType">Connectivity Type</Label>
              <Select name="connectivityType" defaultValue={device.connectivityType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select connectivity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fixed Broadband">Fixed Broadband</SelectItem>
                  <SelectItem value="Mobile Broadband">Mobile Broadband</SelectItem>
                  <SelectItem value="4G">4G</SelectItem>
                  <SelectItem value="5G">5G</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ispName">ISP Name</Label>
              <Input 
                id="edit-ispName" 
                name="ispName" 
                defaultValue={device.ispName}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-theatreName">Theatre Name</Label>
              <Input 
                id="edit-theatreName" 
                name="theatreName" 
                defaultValue={device.theatreName}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-theatreId">Theatre ID</Label>
              <Input 
                id="edit-theatreId" 
                name="theatreId" 
                defaultValue={device.theatreId}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-theatreUUID">Theatre UUID</Label>
              <Input 
                id="edit-theatreUUID" 
                name="theatreUUID" 
                defaultValue={device.theatreUUID}
                required 
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-theatreAddress">Theatre Address</Label>
              <Input 
                id="edit-theatreAddress" 
                name="theatreAddress" 
                defaultValue={device.theatreAddress}
                required 
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-theatreAlternateNames">Theatre Alternate Names (comma-separated)</Label>
              <Input 
                id="edit-theatreAlternateNames" 
                name="theatreAlternateNames" 
                defaultValue={device.theatreAlternateNames?.join(", ")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-storageCapacity">Storage Capacity</Label>
              <Input 
                id="edit-storageCapacity" 
                name="storageCapacity" 
                defaultValue={device.storageCapacity}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-bandwidth">Bandwidth</Label>
              <Input 
                id="edit-bandwidth" 
                name="bandwidth" 
                defaultValue={device.bandwidth}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-activationStatus">Activation Status</Label>
              <Select name="activationStatus" defaultValue={device.activationStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-mappingStatus">Mapping Status</Label>
              <Select name="mappingStatus" defaultValue={device.mappingStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mapped">Mapped</SelectItem>
                  <SelectItem value="Unmapped">Unmapped</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-vpnStatus">VPN Status</Label>
              <Select name="vpnStatus" defaultValue={device.vpnStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Enabled">Enabled</SelectItem>
                  <SelectItem value="Disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Device</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
