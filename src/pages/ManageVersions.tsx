import { useState, useMemo } from "react";
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
import { Combobox } from "@/components/ui/combobox";
import { MoreHorizontal, Star, Eye, Copy, AlertTriangle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FilterButton, FilterDrawer, FilterGroup, useFilterDraft } from "@/components/ui/filter-drawer";
import { usePagination } from "@/hooks/use-pagination";
import { PaginationControls } from "@/components/ui/data-table/pagination";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/dateUtils";
import { ViewVersionDetailsDialog } from "@/components/fleet/ViewVersionDetailsDialog";
import { DeprecateVersionDialog } from "@/components/fleet/DeprecateVersionDialog";
import { QueryState } from "@/components/ui/query-state";
import { useDeprecateVersion, useFleetImage, useImageVersions, useSetDefaultVersion } from "@/hooks/api/fleet";
import type { VersionItem } from "@/data/fleetData";

const EMPTY_VERSIONS: VersionItem[] = [];

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

const ManageVersions = () => {
  const { imageId } = useParams();
  const navigate = useNavigate();
  const imageQuery = useFleetImage(imageId);
  const versionsQuery = useImageVersions(imageId);
  const versions = versionsQuery.data ?? EMPTY_VERSIONS;
  const setDefaultVersion = useSetDefaultVersion(imageId ?? "");
  const deprecateVersion = useDeprecateVersion(imageId ?? "");
  const [selectedVersion, setSelectedVersion] = useState<VersionItem | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [deprecateDialogOpen, setDeprecateDialogOpen] = useState(false);
  const [versionToDeprecate, setVersionToDeprecate] = useState<VersionItem | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<VersionFilters>(EMPTY_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [draft, setDraft] = useFilterDraft(filters, filterOpen);

  const imageData = imageQuery.data;

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
        {imageData
          ? `View and manage versions for ${imageData.agentOsName} (${imageData.provider})`
          : imageQuery.isError
            ? "Image not found"
            : "View and manage versions"}
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
      <QueryState query={versionsQuery} label="versions">
        {() => (
      <>
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

      {/* Pagination */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        rowsPerPage={pageSize}
        handlePageChange={setPage}
        handleRowsPerPageChange={setPageSize}
      />
      </>
        )}
      </QueryState>

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
          <Combobox
            aria-label="Added by"
            value={draft.addedBy}
            onChange={(v) => setDraft((d) => ({ ...d, addedBy: v ?? "all" }))}
            options={[{ value: "all", label: "Anyone" }, ...addedByOptions.map((name) => ({ value: name, label: name }))]}
            placeholder="Added by"
            searchPlaceholder="Search people…"
          />
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
        version={versionToDeprecate?.version ?? ""}
        onConfirm={handleDeprecateConfirm}
      />
    </div>
  );
};

export default ManageVersions;
