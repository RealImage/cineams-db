import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TheatreMapping } from "@/types";

interface EditTheatreMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mapping: TheatreMapping;
  onSave: (mapping: TheatreMapping) => void;
  isReadOnly: boolean;
}

const domainOptions = [
  { value: "amcnetworks.com", label: "amcnetworks.com" },
  { value: "cinemacloudworks.com", label: "cinemacloudworks.com" },
  { value: "cinemadb.io", label: "cinemadb.io" },
  { value: "cinemark.com", label: "cinemark.com" },
  { value: "dcddistribution.com", label: "dcddistribution.com" },
  { value: "disney.com", label: "disney.com" },
  { value: "eikon.group", label: "eikon.group" },
  { value: "emick.com", label: "Emick.com" },
  { value: "fathomevents.com", label: "fathomevents.com" },
  { value: "maccs.com", label: "maccs.com" },
  { value: "metameida.global", label: "metameida.global" },
  { value: "nbcuniversal.com", label: "nbcuniversal.com" },
  { value: "rentrak.com", label: "rentrak.com" },
  { value: "technicolor.com", label: "technicolor.com" },
  { value: "vert-ent.com", label: "vert-ent.com" },
  { value: "warnerbros.com", label: "warnerbros.com" },
  { value: "yashrajfilms.com", label: "yashrajfilms.com" },
].sort((a, b) => a.value.localeCompare(b.value));

export const EditTheatreMappingDialog = ({
  open,
  onOpenChange,
  mapping,
  onSave,
  isReadOnly,
}: EditTheatreMappingDialogProps) => {
  const [formData, setFormData] = useState<TheatreMapping>(mapping);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isReadOnly ? "View Thirdparty Identifier" : "Edit Thirdparty Identifier"}
          </DialogTitle>
          <DialogDescription>
            {isReadOnly 
              ? "This identifier is read-only and cannot be edited."
              : "Update the domain and ID for this thirdparty identifier."
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Select
                value={formData.domain}
                onValueChange={(value) => setFormData({ ...formData, domain: value })}
                disabled={isReadOnly}
              >
                <SelectTrigger id="domain">
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  {domainOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="theatreId">ID</Label>
              <Input
                id="theatreId"
                value={formData.theatreId}
                onChange={(e) => setFormData({ ...formData, theatreId: e.target.value })}
                placeholder="Enter ID"
                disabled={isReadOnly}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {isReadOnly ? "Close" : "Cancel"}
            </Button>
            {!isReadOnly && (
              <Button type="submit">Save Changes</Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
