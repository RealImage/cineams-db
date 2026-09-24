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
import { MoreHorizontal, Star, Eye, Copy, AlertTriangle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FilterButton, FilterDrawer, FilterGroup, useFilterDraft } from "@/components/ui/filter-drawer";
import { usePagination } from "@/hooks/use-pagination";
import { PaginationControls } from "@/components/ui/data-table/pagination";
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

interface VersionFilters {
  status: string;
  defaultVersion: string;
  addedBy: string;
  releasedFrom: string;
  releasedTo: string;
}

const EMPTY_FILTERS: VersionFilters = {
  status: "all",
  defaultVersion: "all",
  addedBy: "all",
  releasedFrom: "",
  releasedTo: "",
};

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

// Mock image data - matches ImageManagement.tsx
const getMockImageData = (imageId: string) => {
  const images: Record<string, { provider: string; agentOsName: string }> = {
    "1": { provider: "Appliance OS", agentOsName: "WireOS" },
    "2": { provider: "Appliance OS", agentOsName: "QWA-OS" },
    "3": { provider: "Appliance OS", agentOsName: "PartnerOS" },
    "4": { provider: "iCount", agentOsName: "iCount" },
    "5": { provider: "Qlog", agentOsName: "Qlog Agent" },
    "6": { provider: "Qube Wire", agentOsName: "Kadet (Agent Zero)" },
    "7": { provider: "Qube Wire", agentOsName: "Agent Redux" },
    "8": { provider: "Qube Wire", agentOsName: "Manifest Agent" },
    "9": { provider: "Qube Wire", agentOsName: "Content Ingest Agent" },
    "10": { provider: "Qube Wire", agentOsName: "KDM Agent" },
    "11": { provider: "Qube Wire", agentOsName: "Inventory Agent" },
    "12": { provider: "Qube Wire", agentOsName: "TDL Agent" },
    "13": { provider: "Qube Wire", agentOsName: "Configuration Agent" },
    "14": { provider: "Qube Wire", agentOsName: "Live Wire" },
    "15": { provider: "Scheduler", agentOsName: "Scheduler Agent" },
    "16": { provider: "Scheduler", agentOsName: "Content Agent" },
    "17": { provider: "Scheduler", agentOsName: "AgentQS" },
    "18": { provider: "Slate", agentOsName: "AgentQ" },
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
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<VersionFilters>(EMPTY_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [draft, setDraft] = useFilterDraft(filters, filterOpen);

  const imageData = getMockImageData(imageId || "1");

  useEffect(() => {
    if (imageId) {
      setVersions(getMockVersions(imageId));
    }
  }, [imageId]);

  const addedByOptions = useMemo(() => [...new Set(versions.map((v) => v.addedBy))].sort(), [versions]);

  // Search + filters apply to the full list; pagination slices the result.
  const filteredVersions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return versions.filter((v) => {
      if (
        q &&
        ![v.version, v.status, v.releaseNotes, v.internalNotes, v.addedBy, v.imageUrl, v.deprecationNotes ?? "", v.deprecatedBy ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
        return false;
      if (filters.status !== "all" && v.status !== filters.status) return false;
      if (filters.defaultVersion === "yes" && !v.isDefault) return false;
      if (filters.defaultVersion === "no" && v.isDefault) return false;
      if (filters.addedBy !== "all" && v.addedBy !== filters.addedBy) return false;
      const released = v.releaseDate.slice(0, 10);
      if (filters.releasedFrom && released < filters.releasedFrom) return false;
      if (filters.releasedTo && released > filters.releasedTo) return false;
      return true;
    });
  }, [versions, searchTerm, filters]);

  const resetKey = useMemo(() => [searchTerm, filters], [searchTerm, filters]);
  const {
    page: currentPage,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    pageItems: paginatedVersions,
  } = usePagination(filteredVersions, resetKey);

  const activeFilterCount =
    (filters.status !== "all" ? 1 : 0) +
    (filters.defaultVersion !== "all" ? 1 : 0) +
    (filters.addedBy !== "all" ? 1 : 0) +
    (filters.releasedFrom ? 1 : 0) +
    (filters.releasedTo ? 1 : 0);

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setDraft(EMPTY_FILTERS);
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

      {/* Header */}
      <p className="text-muted-foreground">
        View and manage versions for {imageData.agentOsName} ({imageData.provider})
      </p>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search version, status, notes, added by..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <span className="text-sm text-muted-foreground ml-auto">
          {filteredVersions.length} version{filteredVersions.length !== 1 ? "s" : ""}
        </span>
        <FilterButton count={activeFilterCount} onClick={() => setFilterOpen(true)} />
      </div>

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
            {paginatedVersions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No versions match the current search or filters.
                </TableCell>
              </TableRow>
            )}
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
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        rowsPerPage={pageSize}
        handlePageChange={setPage}
        handleRowsPerPageChange={setPageSize}
      />

      <FilterDrawer
        open={filterOpen}
        onOpenChange={setFilterOpen}
        description="Narrow down versions by status, default, author and release date."
        onApply={() => setFilters(draft)}
        onClear={clearFilters}
      >
        <FilterGroup title="Status">
          <Select value={draft.status} onValueChange={(v) => setDraft((d) => ({ ...d, status: v }))}>
            <SelectTrigger aria-label="Status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="stable">Stable</SelectItem>
              <SelectItem value="deprecated">Deprecated</SelectItem>
            </SelectContent>
          </Select>
        </FilterGroup>
        <FilterGroup title="Default version">
          <Select value={draft.defaultVersion} onValueChange={(v) => setDraft((d) => ({ ...d, defaultVersion: v }))}>
            <SelectTrigger aria-label="Default version">
              <SelectValue placeholder="Default version" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All versions</SelectItem>
              <SelectItem value="yes">Default only</SelectItem>
              <SelectItem value="no">Non-default only</SelectItem>
            </SelectContent>
          </Select>
        </FilterGroup>
        <FilterGroup title="Added by">
          <Select value={draft.addedBy} onValueChange={(v) => setDraft((d) => ({ ...d, addedBy: v }))}>
            <SelectTrigger aria-label="Added by">
              <SelectValue placeholder="Added by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Anyone</SelectItem>
              {addedByOptions.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterGroup>
        <FilterGroup title="Release date">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              aria-label="Released from"
              value={draft.releasedFrom}
              max={draft.releasedTo || undefined}
              onChange={(e) => setDraft((d) => ({ ...d, releasedFrom: e.target.value }))}
            />
            <Input
              type="date"
              aria-label="Released to"
              value={draft.releasedTo}
              min={draft.releasedFrom || undefined}
              onChange={(e) => setDraft((d) => ({ ...d, releasedTo: e.target.value }))}
            />
          </div>
        </FilterGroup>
      </FilterDrawer>

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
