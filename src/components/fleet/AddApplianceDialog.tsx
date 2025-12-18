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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import type { TaskAppliance } from "@/pages/FleetTaskEdit";

interface AddApplianceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAppliance: (appliance: TaskAppliance) => void;
  existingApplianceIds: string[];
}

// Mock available appliances for search
const availableAppliances: TaskAppliance[] = [
  {
    id: "3",
    applianceSerialNumber: "QWA-T23893",
    hardwareSerialNumber: "HWS-T23893",
    nodeId: "NODE-003",
    clusterName: "Cluster Gamma",
    theatreName: "Cinemark XD",
    theatreLocation: { city: "Dallas", state: "TX", country: "USA" },
    chainName: "Cinemark",
    chainAddress: { city: "Plano", state: "TX", country: "USA" },
    updateStatus: "Pending",
    updatedOn: new Date().toISOString(),
  },
  {
    id: "4",
    applianceSerialNumber: "QWA-L45678",
    hardwareSerialNumber: "HWS-L45678",
    nodeId: "NODE-004",
    clusterName: "Cluster Delta",
    theatreName: "Marcus Theatres",
    theatreLocation: { city: "Milwaukee", state: "WI", country: "USA" },
    chainName: "Marcus Corporation",
    chainAddress: { city: "Milwaukee", state: "WI", country: "USA" },
    updateStatus: "Pending",
    updatedOn: new Date().toISOString(),
  },
  {
    id: "5",
    applianceSerialNumber: "QWA-M98765",
    hardwareSerialNumber: "HWS-M98765",
    nodeId: "NODE-005",
    clusterName: "Cluster Epsilon",
    theatreName: "Alamo Drafthouse",
    theatreLocation: { city: "Austin", state: "TX", country: "USA" },
    chainName: "Alamo Drafthouse Cinema",
    chainAddress: { city: "Austin", state: "TX", country: "USA" },
    updateStatus: "Pending",
    updatedOn: new Date().toISOString(),
  },
];

export const AddApplianceDialog = ({
  open,
  onOpenChange,
  onAddAppliance,
  existingApplianceIds,
}: AddApplianceDialogProps) => {
  const [searchType, setSearchType] = useState<"appliance" | "hardware" | "nodeId">("appliance");
  const [searchValue, setSearchValue] = useState("");
  const [foundAppliance, setFoundAppliance] = useState<TaskAppliance | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    setSearched(true);
    const searchLower = searchValue.toLowerCase();
    
    const found = availableAppliances.find(app => {
      if (searchType === "appliance") {
        return app.applianceSerialNumber.toLowerCase().includes(searchLower);
      } else if (searchType === "hardware") {
        return app.hardwareSerialNumber.toLowerCase().includes(searchLower);
      } else {
        return app.nodeId.toLowerCase().includes(searchLower);
      }
    });

    setFoundAppliance(found || null);
  };

  const handleConfirm = () => {
    if (foundAppliance) {
      onAddAppliance(foundAppliance);
      resetForm();
    }
  };

  const resetForm = () => {
    setSearchType("appliance");
    setSearchValue("");
    setFoundAppliance(null);
    setSearched(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const isAlreadyAdded = foundAppliance ? existingApplianceIds.includes(foundAppliance.id) : false;

  const formatLocation = (loc: { city: string; state: string; country: string }) => {
    return `${loc.city}, ${loc.state}, ${loc.country}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Appliance</DialogTitle>
          <DialogDescription>
            Search for an appliance to add to this task.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="w-[180px]">
              <Select value={searchType} onValueChange={(v) => setSearchType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appliance">Appliance Serial #</SelectItem>
                  <SelectItem value="hardware">Hardware Serial #</SelectItem>
                  <SelectItem value="nodeId">Node ID</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Enter search value..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button type="button" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {searched && !foundAppliance && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No appliance found matching your search criteria.
            </p>
          )}

          {foundAppliance && (
            <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-muted-foreground text-xs">Appliance Serial Number</Label>
                  <p className="font-medium">{foundAppliance.applianceSerialNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Hardware Serial Number</Label>
                  <p className="font-medium">{foundAppliance.hardwareSerialNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Node ID</Label>
                  <p className="font-medium">{foundAppliance.nodeId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Cluster Name</Label>
                  <p className="font-medium">{foundAppliance.clusterName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Theatre Name</Label>
                  <p className="font-medium">{foundAppliance.theatreName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Theatre Location</Label>
                  <p className="font-medium">{formatLocation(foundAppliance.theatreLocation)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Chain Name</Label>
                  <p className="font-medium">{foundAppliance.chainName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Chain Address</Label>
                  <p className="font-medium">{formatLocation(foundAppliance.chainAddress)}</p>
                </div>
              </div>

              {isAlreadyAdded && (
                <p className="text-sm text-amber-600 font-medium">
                  This appliance is already added to the task.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleConfirm}
            disabled={!foundAppliance || isAlreadyAdded}
          >
            Add Appliance
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};