import { useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MoreHorizontal, Star, Eye, Copy, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/dateUtils";
import { ViewVersionDetailsDialog } from "./ViewVersionDetailsDialog";
import { DeprecateVersionDialog } from "./DeprecateVersionDialog";

interface ImageItem {
  id: string;
  provider: string;
  agentOsName: string;
  latestVersion: string;
  updatedOn: string;
  updatedBy: string;
}

interface VersionItem {
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
  isDefault?: boolean;
}

interface ManageVersionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: ImageItem | null;
}

// Mock versions data
const getMockVersions = (imageId: string): VersionItem[] => [
  { 
    version: "v4.2.0", 
    releaseDate: "2024-01-15T10:30:00", 
    status: "stable", 
    imageUrl: "https://registry.example.com/images/agent-os/v4.2.0",
    releaseNotes: "Added support for new hardware configurations.\nImproved performance by 15%.",
    internalNotes: "Tested on 50 devices. Ready for production.",
    addedOn: "2024-01-15T10:30:00",
    addedBy: "John Smith",
    isDefault: true
  },
  { 
    version: "v4.1.9", 
    releaseDate: "2024-01-10T14:15:00", 
    status: "stable",
    imageUrl: "https://registry.example.com/images/agent-os/v4.1.9",
    releaseNotes: "Bug fixes and stability improvements.",
    internalNotes: "Patch release for v4.1.8 issues.",
    addedOn: "2024-01-10T14:15:00",
    addedBy: "Jane Doe"
  },
  { 
    version: "v4.1.8", 
    releaseDate: "2024-01-05T09:00:00", 
    status: "stable",
    imageUrl: "https://registry.example.com/images/agent-os/v4.1.8",
    releaseNotes: "Minor updates and security patches.",
    internalNotes: "",
    addedOn: "2024-01-05T09:00:00",
    addedBy: "Mike Johnson"
  },
  { 
    version: "v4.1.7", 
    releaseDate: "2023-12-20T16:45:00", 
    status: "deprecated",
    imageUrl: "https://registry.example.com/images/agent-os/v4.1.7",
    releaseNotes: "Feature release with new monitoring capabilities.",
    internalNotes: "Superseded by v4.1.8",
    addedOn: "2023-12-20T16:45:00",
    addedBy: "Sarah Wilson",
    deprecatedOn: "2024-01-05T09:30:00",
    deprecationNotes: "Contains known memory leak issue. Upgrade to v4.1.8 or later.",
    deprecatedBy: "Mike Johnson"
  },
  { 
    version: "v4.1.6", 
    releaseDate: "2023-12-15T11:20:00", 
    status: "deprecated",
    imageUrl: "https://registry.example.com/images/agent-os/v4.1.6",
    releaseNotes: "Initial release for Q4 2023.",
    internalNotes: "",
    addedOn: "2023-12-15T11:20:00",
    addedBy: "John Smith",
    deprecatedOn: "2023-12-20T17:00:00",
    deprecationNotes: "Replaced by v4.1.7 with additional features.",
    deprecatedBy: "Sarah Wilson"
  },
];

export function ManageVersionsDialog({
  open,
  onOpenChange,
  image,
}: ManageVersionsDialogProps) {
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<VersionItem | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [deprecateDialogOpen, setDeprecateDialogOpen] = useState(false);
  const [versionToDeprecate, setVersionToDeprecate] = useState<string>("");

  // Load versions when dialog opens
  useState(() => {
    if (image) {
      setVersions(getMockVersions(image.id));
    }
  });

  // Reset versions when image changes
  if (image && versions.length === 0) {
    setVersions(getMockVersions(image.id));
  }

  const handleViewDetails = (version: VersionItem) => {
    setSelectedVersion(version);
    setViewDetailsOpen(true);
  };

  const handleMarkAsDefault = (versionId: string) => {
    setVersions(prev => prev.map(v => ({
      ...v,
      isDefault: v.version === versionId
    })));
    toast.success(`${versionId} marked as default version`);
  };

  const handleCopyImageLink = (imageUrl: string) => {
    navigator.clipboard.writeText(imageUrl);
    toast.success("Image URL copied to clipboard");
  };

  const handleDeprecateClick = (version: string) => {
    setVersionToDeprecate(version);
    setDeprecateDialogOpen(true);
  };

  const handleDeprecateConfirm = (notes: string) => {
    const now = new Date().toISOString();
    setVersions(prev => prev.map(v => 
      v.version === versionToDeprecate
        ? {
            ...v,
            status: "deprecated",
            deprecatedOn: now,
            deprecationNotes: notes,
            deprecatedBy: "Current User" // In real app, get from auth context
          }
        : v
    ));
    toast.success(`${versionToDeprecate} has been deprecated`);
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px]">
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
                  <TableHead>Release Date / Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added On</TableHead>
                  <TableHead>Deprecated On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versions.map((v) => (
                  <TableRow key={v.version}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {v.version}
                        {v.isDefault && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Default Version</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatDateTime(v.releaseDate)}</TableCell>
                    <TableCell>{getStatusBadge(v.status)}</TableCell>
                    <TableCell>{formatDateTime(v.addedOn)}</TableCell>
                    <TableCell>{v.deprecatedOn ? formatDateTime(v.deprecatedOn) : "—"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(v)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {!v.isDefault && v.status !== "deprecated" && (
                            <DropdownMenuItem onClick={() => handleMarkAsDefault(v.version)}>
                              <Star className="h-4 w-4 mr-2" />
                              Mark as Default
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleCopyImageLink(v.imageUrl)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Image Link
                          </DropdownMenuItem>
                          {v.status !== "deprecated" && (
                            <DropdownMenuItem 
                              onClick={() => handleDeprecateClick(v.version)}
                              className="text-destructive focus:text-destructive"
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Deprecate Version
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      <ViewVersionDetailsDialog
        open={viewDetailsOpen}
        onOpenChange={setViewDetailsOpen}
        version={selectedVersion}
      />

      <DeprecateVersionDialog
        open={deprecateDialogOpen}
        onOpenChange={setDeprecateDialogOpen}
        version={versionToDeprecate}
        onConfirm={handleDeprecateConfirm}
      />
    </>
  );
}
