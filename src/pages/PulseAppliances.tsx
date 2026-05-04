import { useMemo, useState } from "react";
import { Filter, Plus, Copy, Check, MoreHorizontal, Eye, Pencil } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { pulseTheatres, PulseTheatre } from "@/data/pulseData";
import { PulseFilterPanel, PulseFilters } from "@/components/pulse/PulseFilterPanel";
import { AddPulseTheatreLookupDialog } from "@/components/pulse/AddPulseTheatreLookupDialog";
import { PulseDetailSheet } from "@/components/pulse/PulseDetailSheet";

const PAGE_SIZE = 100;

const PulseAppliances = () => {
  const navigate = useNavigate();
  const [data] = useState(pulseTheatres);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<PulseFilters>({ chain: "all", location: "all" });
  const [detailTheatre, setDetailTheatre] = useState<PulseTheatre | null>(null);

  const openDetails = (t: PulseTheatre) => setDetailTheatre(t);
  const goEdit = (t: PulseTheatre) => navigate(`/qube-appliances/pulse/${t.id}/edit`);

  const chains = useMemo(() => [...new Set(data.map((t) => t.chainName))].sort(), [data]);
  const locations = useMemo(() => [...new Set(data.map((t) => `${t.city}, ${t.state}, ${t.country}`))].sort(), [data]);

  const filtered = useMemo(() => {
    let r = data;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      r = r.filter((t) =>
        t.theatreName.toLowerCase().includes(q) ||
        t.theatreId.toLowerCase().includes(q) ||
        t.chainName.toLowerCase().includes(q) ||
        `${t.city}, ${t.state}, ${t.country}`.toLowerCase().includes(q)
      );
    }
    if (filters.chain !== "all") r = r.filter((t) => t.chainName === filters.chain);
    if (filters.location !== "all") r = r.filter((t) => `${t.city}, ${t.state}, ${t.country}` === filters.location);
    if (filters.updatedFrom) r = r.filter((t) => new Date(t.updatedAt) >= filters.updatedFrom!);
    if (filters.updatedTo) r = r.filter((t) => new Date(t.updatedAt) <= filters.updatedTo!);
    return r;
  }, [data, searchTerm, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeFilterCount =
    (filters.chain !== "all" ? 1 : 0) +
    (filters.location !== "all" ? 1 : 0) +
    (filters.updatedFrom ? 1 : 0) +
    (filters.updatedTo ? 1 : 0);

  const copyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success(`Copied ${id}`);
    setTimeout(() => setCopiedId((v) => (v === id ? null : v)), 1500);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <p className="text-muted-foreground">Theatres where Pulse is enabled</p>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by theatre name, ID, chain or location..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          className="max-w-md"
        />
        <Button variant="outline" onClick={() => setFiltersOpen(true)} className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        <span className="text-sm text-muted-foreground">
          {filtered.length} theatre{filtered.length !== 1 ? "s" : ""}
        </span>
        <Button className="ml-auto" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Theatre
        </Button>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Theatre Name (ID)</TableHead>
                <TableHead>Theatre Location</TableHead>
                <TableHead>Chain Name</TableHead>
                <TableHead>Screens Installed</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead>Updated By</TableHead>
                <TableHead className="w-12 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center h-24 text-muted-foreground">No results found.</TableCell></TableRow>
              ) : paginated.map((t) => (
                <TableRow key={t.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => openDetails(t)}>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="inline-flex items-center gap-2">
                          <div>
                            <div className="font-medium">{t.theatreName}</div>
                            <div className="text-xs text-muted-foreground">{t.theatreId}</div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => copyId(e, t.theatreId)}
                            aria-label="Copy Theatre ID"
                          >
                            {copiedId === t.theatreId
                              ? <Check className="h-3.5 w-3.5 text-[hsl(142_76%_36%)]" />
                              : <Copy className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs space-y-1">
                        <div><span className="font-semibold">Theatre Name:</span> {t.theatreName}</div>
                        <div><span className="font-semibold">Also Known As:</span> {t.alsoKnownAs || "—"}</div>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{t.city}, {t.state}, {t.country}</TableCell>
                  <TableCell>{t.chainName}</TableCell>
                  <TableCell>{t.enabledScreens} / {t.totalScreens}</TableCell>
                  <TableCell className="text-xs">{format(new Date(t.updatedAt), "dd MMM yyyy hh:mm a")}</TableCell>
                  <TableCell className="text-xs">{t.updatedBy}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDetails(t)}>
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => goEdit(t)}>
                          <Pencil className="h-4 w-4 mr-2" /> Edit Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      <PulseFilterPanel
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        chains={chains}
        locations={locations}
        filters={filters}
        onChange={(f) => { setFilters(f); setPage(1); }}
        onClear={() => { setFilters({ chain: "all", location: "all" }); setPage(1); }}
      />

      <AddPulseTheatreLookupDialog open={addOpen} onOpenChange={setAddOpen} />

      <PulseDetailSheet
        theatre={detailTheatre}
        open={!!detailTheatre}
        onOpenChange={(o) => !o && setDetailTheatre(null)}
        onEdit={(t) => { setDetailTheatre(null); goEdit(t); }}
      />
    </div>
  );
};

export default PulseAppliances;
