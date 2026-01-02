import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Download, Star } from "lucide-react";
import { toast } from "sonner";

interface ImageItem {
  id: string;
  provider: string;
  agentOsName: string;
  latestVersion: string;
  updatedOn: string;
  updatedBy: string;
}

interface ManageVersionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: ImageItem | null;
}

// Mock versions data
const getMockVersions = (imageId: string) => [
  { version: "v4.2.0", releaseDate: "2024-01-15", status: "latest", downloads: 1250 },
  { version: "v4.1.9", releaseDate: "2024-01-10", status: "stable", downloads: 3420 },
  { version: "v4.1.8", releaseDate: "2024-01-05", status: "stable", downloads: 2100 },
  { version: "v4.1.7", releaseDate: "2023-12-20", status: "deprecated", downloads: 890 },
  { version: "v4.1.6", releaseDate: "2023-12-15", status: "deprecated", downloads: 450 },
];

export function ManageVersionsDialog({
  open,
  onOpenChange,
  image,
}: ManageVersionsDialogProps) {
  const versions = image ? getMockVersions(image.id) : [];

  const handleSetAsLatest = (version: string) => {
    toast.success(`${version} set as latest version`);
  };

  const handleDownload = (version: string) => {
    toast.info(`Downloading ${version}...`);
  };

  const handleDelete = (version: string) => {
    toast.success(`${version} deleted`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "latest":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Latest</Badge>;
      case "stable":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Stable</Badge>;
      case "deprecated":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Deprecated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Manage Versions</DialogTitle>
          <DialogDescription>
            View and manage versions for {image?.agentOsName} ({image?.provider})
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Release Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.map((v) => (
                <TableRow key={v.version}>
                  <TableCell className="font-medium">{v.version}</TableCell>
                  <TableCell>{v.releaseDate}</TableCell>
                  <TableCell>{getStatusBadge(v.status)}</TableCell>
                  <TableCell>{v.downloads.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {v.status !== "latest" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSetAsLatest(v.version)}
                          title="Set as Latest"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(v.version)}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(v.version)}
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
