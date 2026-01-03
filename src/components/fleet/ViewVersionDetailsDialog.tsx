import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/dateUtils";

interface VersionDetails {
  version: string;
  releaseDate: string;
  status: string;
  imageUrl: string;
  releaseNotes: string;
  internalNotes: string;
  addedOn: string;
  addedBy: string;
  deprecatedOn?: string;
  deprecationNotes?: string;
  deprecatedBy?: string;
}

interface ViewVersionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  version: VersionDetails | null;
}

export function ViewVersionDetailsDialog({
  open,
  onOpenChange,
  version,
}: ViewVersionDetailsDialogProps) {
  const handleCopyLink = () => {
    if (version?.imageUrl) {
      navigator.clipboard.writeText(version.imageUrl);
      toast.success("Image URL copied to clipboard");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "stable":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Stable</Badge>;
      case "deprecated":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Deprecated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!version) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Version Details</DialogTitle>
          <DialogDescription>
            Details for version {version.version}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Version Number</label>
              <p className="text-sm">{version.version}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Release Date</label>
              <p className="text-sm">{formatDateTime(version.releaseDate)}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <div className="mt-1">{getStatusBadge(version.status)}</div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Image URL / Link</label>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm truncate flex-1 bg-muted px-2 py-1 rounded">{version.imageUrl}</p>
              <Button variant="ghost" size="icon" onClick={handleCopyLink} title="Copy to clipboard">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Release Notes</label>
            <p className="text-sm mt-1 bg-muted px-2 py-1 rounded whitespace-pre-wrap">
              {version.releaseNotes || "—"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Internal Reference Notes</label>
            <p className="text-sm mt-1 bg-muted px-2 py-1 rounded whitespace-pre-wrap">
              {version.internalNotes || "—"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Added On</label>
              <p className="text-sm">{formatDateTime(version.addedOn)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Added By</label>
              <p className="text-sm">{version.addedBy}</p>
            </div>
          </div>

          {version.status === "deprecated" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Deprecated On</label>
                  <p className="text-sm">{version.deprecatedOn ? formatDateTime(version.deprecatedOn) : "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Deprecated By</label>
                  <p className="text-sm">{version.deprecatedBy || "—"}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Deprecation Notes</label>
                <p className="text-sm mt-1 bg-muted px-2 py-1 rounded whitespace-pre-wrap">
                  {version.deprecationNotes || "—"}
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
