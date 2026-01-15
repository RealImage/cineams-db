import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, Star, Eye, Copy, AlertTriangle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/dateUtils";
import { ViewVersionDetailsDialog } from "@/components/fleet/ViewVersionDetailsDialog";
import { DeprecateVersionDialog } from "@/components/fleet/DeprecateVersionDialog";

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

// Mock versions data - extended for pagination demo
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
  { 
    version: "v4.1.5", 
    releaseDate: "2023-12-10T08:00:00", 
    status: "deprecated",
    imageUrl: "https://registry.example.com/images/agent-os/v4.1.5",
    releaseNotes: "Performance improvements.",
    internalNotes: "",
    addedOn: "2023-12-10T08:00:00",
    addedBy: "Jane Doe",
    deprecatedOn: "2023-12-15T12:00:00",
    deprecationNotes: "Replaced by v4.1.6.",
    deprecatedBy: "John Smith"
  },
  { 
    version: "v4.1.4", 
    releaseDate: "2023-12-01T14:30:00", 
    status: "deprecated",
    imageUrl: "https://registry.example.com/images/agent-os/v4.1.4",
    releaseNotes: "Bug fixes.",
    internalNotes: "",
    addedOn: "2023-12-01T14:30:00",
    addedBy: "Mike Johnson",
    deprecatedOn: "2023-12-10T09:00:00",
    deprecationNotes: "Replaced by v4.1.5.",
    deprecatedBy: "Jane Doe"
  },
  { 
    version: "v4.1.3", 
    releaseDate: "2023-11-25T10:00:00", 
    status: "deprecated",
    imageUrl: "https://registry.example.com/images/agent-os/v4.1.3",
    releaseNotes: "Initial Q4 release.",
    internalNotes: "",
    addedOn: "2023-11-25T10:00:00",
    addedBy: "Sarah Wilson",
    deprecatedOn: "2023-12-01T15:00:00",
    deprecationNotes: "Replaced by v4.1.4.",
    deprecatedBy: "Mike Johnson"
  },
];

// Mock image data
const getMockImageData = (imageId: string) => {
  const images: Record<string, { provider: string; agentOsName: string }> = {
    "1": { provider: "Qlog", agentOsName: "Qlog Agent" },
    "2": { provider: "AAM", agentOsName: "AAM OS" },
    "3": { provider: "RealD", agentOsName: "RealD Agent" },
  };
  return images[imageId] || { provider: "Unknown", agentOsName: "Unknown Image" };
};

const ManageVersions = () => {
  const { imageId } = useParams();
  const navigate = useNavigate();
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<VersionItem | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [deprecateDialogOpen, setDeprecateDialogOpen] = useState(false);
  const [versionToDeprecate, setVersionToDeprecate] = useState<string>("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const imageData = getMockImageData(imageId || "1");

  useEffect(() => {
    if (imageId) {
      setVersions(getMockVersions(imageId));
    }
  }, [imageId]);

  // Pagination calculations
  const totalItems = versions.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  
  const paginatedVersions = useMemo(() => {
    return versions.slice(startIndex, endIndex);
  }, [versions, startIndex, endIndex]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1);
  };

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
            deprecatedBy: "Current User"
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

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/fleet-management/images">Image Management</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Manage Versions</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Table */}
      <div className="rounded-md border">
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
            {paginatedVersions.map((v) => (
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select value={String(rowsPerPage)} onValueChange={handleRowsPerPageChange}>
              <SelectTrigger className="w-[70px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground ml-4">
              {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {getPageNumbers().map((page, index) => (
              typeof page === "number" ? (
                <Button
                  key={index}
                  variant={currentPage === page ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ) : (
                <span key={index} className="px-2 text-muted-foreground">...</span>
              )
            ))}

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default ManageVersions;
