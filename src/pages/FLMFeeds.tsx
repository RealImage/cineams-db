import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, MoreHorizontal, Copy, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilterButton, FilterDrawer, FilterGroup, useFilterDraft } from "@/components/ui/filter-drawer";
import { usePagination } from "@/hooks/use-pagination";
import { PaginationControls } from "@/components/ui/data-table/pagination";
import { FlmFeed } from "@/data/flmFeedsData";
import { MapThirdPartyIdDialog } from "@/components/flm/MapThirdPartyIdDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { flmFeeds } from "@/data/flmFeedsData";
import { formatDate, formatTime } from "@/lib/dateUtils";

const SOURCES = ["MACCS", "DCIP", "Qube Radar", "Cinergy", "Sony", "KDMx"];

interface FlmFeedFilters {
  source: string;
  status: string;
  isNew: string;
}

const EMPTY_FILTERS: FlmFeedFilters = { source: "all", status: "all", isNew: "all" };

const FLMFeeds = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FlmFeedFilters>({ ...EMPTY_FILTERS, status: "Manual" });
  const [filterOpen, setFilterOpen] = useState(false);
  const [draft, setDraft] = useFilterDraft(filters, filterOpen);
  const { source, status, isNew } = filters;
  const [mapFeed, setMapFeed] = useState<FlmFeed | null>(null);
  const [ignoredIds, setIgnoredIds] = useState<Set<string>>(new Set());

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Copied", description: `${label} copied to clipboard.` });
    });
  };

  const handleIgnore = (feed: FlmFeed) => {
    setIgnoredIds((prev) => new Set(prev).add(feed.id));
    toast({ title: "Update ignored", description: `${feed.theatreName} feed update has been ignored.` });
  };

  const handleAddTheatre = (feed: FlmFeed) => {
    toast({ title: "Add Theatre", description: `Starting add-theatre flow for ${feed.theatreName}.` });
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setDraft(EMPTY_FILTERS);
  };

  const applyFilters = () => {
    setFilters(draft);
  };

  const removeFilter = (key: keyof FlmFeedFilters) =>
    setFilters((prev) => ({ ...prev, [key]: "all" }));

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = flmFeeds.map((f): FlmFeed => {
      const savedStatus = sessionStorage.getItem(`flm-feed-status:${f.id}`);
      return savedStatus === "Auto-Updated / Mapped" ? { ...f, status: "Auto-Updated / Mapped" } : f;
    }).filter((f) => {
      if (ignoredIds.has(f.id)) return false;
      const matchesSearch =
        !q ||
        [f.theatreName, f.chain, f.theatreIdFeed, f.theatreUuid]
          .join(" ")
          .toLowerCase()
          .includes(q);
      const matchesSource = source === "all" || f.source === source;
      const matchesStatus = status === "all" || f.status === status;
      const matchesNew =
        isNew === "all" || (isNew === "yes" ? f.isNewTheatre : !f.isNewTheatre);
      return matchesSearch && matchesSource && matchesStatus && matchesNew;
    });
    return [...filtered].sort(
      (a, b) => new Date(b.receivedOn).getTime() - new Date(a.receivedOn).getTime()
    );
  }, [search, source, status, isNew, ignoredIds]);

  const resetKey = useMemo(() => [search, filters], [search, filters]);
  const { page: currentPage, setPage, pageSize, setPageSize, totalPages, totalItems, pageItems: pagedRows } =
    usePagination(rows, resetKey);

  const activeFilters: { key: string; label: string; onRemove: () => void }[] = [];
  if (source !== "all")
    activeFilters.push({ key: "source", label: `Source: ${source}`, onRemove: () => removeFilter("source") });
  if (isNew !== "all")
    activeFilters.push({
      key: "isNew",
      label: isNew === "yes" ? "New theatre: Yes" : "New theatre: No",
      onRemove: () => removeFilter("isNew"),
    });
  if (status !== "all")
    activeFilters.push({ key: "status", label: `Status: ${status}`, onRemove: () => removeFilter("status") });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-muted-foreground text-sm">
          Theatre records received through FLM feeds ({rows.length})
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, UUID, chain, source ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-[280px]"
            />
          </div>
          <FilterButton count={activeFilters.length} onClick={() => setFilterOpen(true)} />
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map((f) => (
            <Badge key={f.key} variant="secondary" className="gap-1 pr-1">
              {f.label}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 hover:bg-transparent"
                onClick={f.onRemove}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground"
            onClick={clearFilters}
          >
            Clear all
          </Button>
        </div>
      )}

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Target Theatre Name</TableHead>
              <TableHead>Target Chain</TableHead>
              <TableHead>Source Feed</TableHead>
              <TableHead>Source Theatre ID</TableHead>
              <TableHead>New Theatre?</TableHead>
              <TableHead>Received On</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No feed records found.
                </TableCell>
              </TableRow>
            )}
            {pagedRows.map((f) => (
              <TableRow key={f.id} className="cursor-pointer" onClick={() => navigate(`/theatres/flm-feeds/${f.id}`)}>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-default">
                        <div className="font-medium">{f.theatreName}</div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs space-y-2 p-3">
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Theatre Name</p>
                            <p className="text-sm font-medium">{f.theatreName}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => copyToClipboard(f.theatreName, "Theatre Name")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Theatre Display Name</p>
                            <p className="text-sm">{f.theatreDisplayName}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => copyToClipboard(f.theatreDisplayName, "Theatre Display Name")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Theatre UUID</p>
                            <p className="font-mono text-xs break-all">{f.theatreUuid}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => copyToClipboard(f.theatreUuid, "Theatre UUID")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Theatre Address</p>
                            <p className="text-sm">{f.address}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => copyToClipboard(f.address, "Theatre Address")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="text-sm">{f.chain}</TableCell>
                <TableCell>
                  <Badge variant="outline">{f.source}</Badge>
                </TableCell>
                <TableCell>
                  <div className="font-mono text-xs">{f.theatreIdFeed}</div>
                  <div className="text-xs text-muted-foreground">{f.location}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={f.isNewTheatre ? "default" : "secondary"}>
                    {f.isNewTheatre ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  <div>{formatDate(f.receivedOn)}</div>
                  <div className="text-xs text-muted-foreground">{formatTime(f.receivedOn)}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={f.status === "Auto-Updated" ? "secondary" : "outline"}>
                    {f.status}
                  </Badge>
                </TableCell>
                <TableCell onClick={(event) => event.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/theatres/flm-feeds/${f.id}`)}>
                        View FLM Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setMapFeed(f)}>
                        Map Third Party ID
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleIgnore(f)}>
                        Ignore Update
                      </DropdownMenuItem>
                      {f.isNewTheatre && (
                        <DropdownMenuItem onClick={() => handleAddTheatre(f)}>
                          Add New Theatre
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
        description="Narrow down feed records by source, theatre type, and status."
        onApply={applyFilters}
        onClear={clearFilters}
      >
        <FilterGroup title="Source">
          <Select value={draft.source} onValueChange={(v) => setDraft((d) => ({ ...d, source: v }))}>
            <SelectTrigger aria-label="Source">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              {SOURCES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterGroup>
        <FilterGroup title="New theatre">
          <Select value={draft.isNew} onValueChange={(v) => setDraft((d) => ({ ...d, isNew: v }))}>
            <SelectTrigger aria-label="New theatre">
              <SelectValue placeholder="New theatre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All theatres</SelectItem>
              <SelectItem value="yes">New only</SelectItem>
              <SelectItem value="no">Existing only</SelectItem>
            </SelectContent>
          </Select>
        </FilterGroup>
        <FilterGroup title="Status">
          <Select value={draft.status} onValueChange={(v) => setDraft((d) => ({ ...d, status: v }))}>
            <SelectTrigger aria-label="Status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Auto-Updated">Auto-Updated</SelectItem>
              <SelectItem value="Manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </FilterGroup>
      </FilterDrawer>

      <MapThirdPartyIdDialog feed={mapFeed} onClose={() => setMapFeed(null)} />
    </motion.div>
  );
};

export default FLMFeeds;
