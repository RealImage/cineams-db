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
import { toast } from "sonner";

interface ImageItem {
  id: string;
  provider: string;
  agentOsName: string;
  latestVersion: string;
  updatedOn: string;
  updatedBy: string;
}

interface AddVersionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: ImageItem | null;
  onSubmit: (data: any) => void;
}

export function AddVersionDialog({
  open,
  onOpenChange,
  image,
  onSubmit,
}: AddVersionDialogProps) {
  const [formData, setFormData] = useState({
    version: "",
    imageUrl: "",
    releaseNotes: "",
    changelog: "",
  });

  const handleSubmit = () => {
    if (!formData.version) {
      toast.error("Please enter a version number");
      return;
    }

    onSubmit({
      imageId: image?.id,
      ...formData,
    });

    toast.success(`Version ${formData.version} added for ${image?.agentOsName}`);
    onOpenChange(false);
    setFormData({ version: "", imageUrl: "", releaseNotes: "", changelog: "" });
  };

  const handleClose = () => {
    onOpenChange(false);
    setFormData({ version: "", imageUrl: "", releaseNotes: "", changelog: "" });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Version</DialogTitle>
          <DialogDescription>
            Add a new version for {image?.agentOsName} ({image?.provider})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="version">Version Number</Label>
            <Input
              id="version"
              placeholder="e.g., v4.2.0"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL / Link</Label>
            <Input
              id="imageUrl"
              placeholder="e.g., s3://bucket-name/path or https://sharepoint.com/..."
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="releaseNotes">Release Notes</Label>
            <Textarea
              id="releaseNotes"
              placeholder="Enter release notes..."
              value={formData.releaseNotes}
              onChange={(e) => setFormData({ ...formData, releaseNotes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="changelog">Changelog</Label>
            <Textarea
              id="changelog"
              placeholder="Enter changelog details..."
              value={formData.changelog}
              onChange={(e) => setFormData({ ...formData, changelog: e.target.value })}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Version</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
