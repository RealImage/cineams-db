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

import type { ImageItem, VersionItem } from "@/data/fleetData";
import { useDeprecateVersion, useImageVersions, useSetDefaultVersion } from "@/hooks/api/fleet";

interface ManageVersionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: ImageItem | null;
}

export function ManageVersionsDialog({
  open,
  onOpenChange,
  image,
}: ManageVersionsDialogProps) {
  const versionsQuery = useImageVersions(open ? image?.id : undefined);
  const versions = versionsQuery.data ?? [];
  const setDefaultVersion = useSetDefaultVersion(image?.id ?? "");
  const deprecateVersion = useDeprecateVersion(image?.id ?? "");
  const [selectedVersion, setSelectedVersion] = useState<VersionItem | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [deprecateDialogOpen, setDeprecateDialogOpen] = useState(false);
  const [versionToDeprecate, setVersionToDeprecate] = useState<VersionItem | null>(null);

  const handleViewDetails = (version: VersionItem) => {
    setSelectedVersion(version);
    setViewDetailsOpen(true);
  };

  const handleMarkAsDefault = (version: VersionItem) => {
    setDefaultVersion.mutate(version.id, {
      onSuccess: () => toast.success(`${version.version} marked as default version`),
      onError: (err) => toast.error(`Could not mark ${version.version} as default: ${err.message}`),
    });
  };

  const handleCopyImageLink = (imageUrl: string) => {
    navigator.clipboard.writeText(imageUrl);
    toast.success("Image URL copied to clipboard");
  };

  const handleDeprecateClick = (version: VersionItem) => {
    setVersionToDeprecate(version);
    setDeprecateDialogOpen(true);
  };

  const handleDeprecateConfirm = (notes: string) => {
    const target = versionToDeprecate;
    if (!target) return;
    deprecateVersion.mutate(
      { versionId: target.id, notes },
      {
        onSuccess: () => toast.success(`${target.version} has been deprecated`),
        onError: (err) => toast.error(`Could not deprecate ${target.version}: ${err.message}`),
      },
    );
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
                {(versionsQuery.isPending || versionsQuery.isError) && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      {versionsQuery.isError ? `Could not load versions: ${versionsQuery.error.message}` : "Loading versions…"}
                    </TableCell>
                  </TableRow>
                )}
                {versions.map((v) => (
                  <TableRow key={v.id}>
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
                            <DropdownMenuItem onClick={() => handleMarkAsDefault(v)}>
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
                              onClick={() => handleDeprecateClick(v)}
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
        version={versionToDeprecate?.version ?? ""}
        onConfirm={handleDeprecateConfirm}
      />
    </>
  );
}
