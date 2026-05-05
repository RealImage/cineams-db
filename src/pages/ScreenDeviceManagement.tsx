import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Filter, MoreHorizontal, Eye, Pencil, History } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { theatres as mockTheatres } from "@/data/mockData";
import { Theatre } from "@/types";
import { TheatreLogsDialog } from "@/components/TheatreLogsDialog";
import { ScreenDeviceFilterPanel, ScreenDeviceFilters } from "@/components/screen-device-management/ScreenDeviceFilterPanel";

const PAGE_SIZE = 25;

const defaultFilters: ScreenDeviceFilters = {
  location: "all",
  chain: "all",
  nameContains: "",
  suiteAvailability: "all",
  screenExperience: "all",
};

const ScreenDeviceManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<ScreenDeviceFilters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [logsTheatre, setLogsTheatre] = useState<Theatre | undefined>(undefined);

  const chains = useMemo(() => [...new Set(mockTheatres.map((t) => t.chainName))].sort(), []);
  const locations = useMemo(
    () => [...new Set(mockTheatres.map((t) => `${t.city}, ${t.state}, ${t.country}`))].sort(),
    []
  );

  const filtered = useMemo(() => {
    let r = mockTheatres;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      r = r.filter((t) => {
        const idMatch =
          t.id.toLowerCase().includes(q) ||
          t.uuid.toLowerCase().includes(q) ||
          (t.thirdPartyId || "").toLowerCase().includes(q);
        const nameMatch =
          t.name.toLowerCase().includes(q) || (t.displayName || "").toLowerCase().includes(q);
        const screenMatch = (t.screens || []).some(
          (s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
        );
        return idMatch || nameMatch || screenMatch;
      });
    }
    if (filters.location !== "all")
      r = r.filter((t) => `${t.city}, ${t.state}, ${t.country}` === filters.location);
    if (filters.chain !== "all") r = r.filter((t) => t.chainName === filters.chain);
    if (filters.nameContains.trim())
      r = r.filter((t) => t.name.toLowerCase().includes(filters.nameContains.trim().toLowerCase()));
    if (filters.suiteAvailability !== "all") {
      r = r.filter((t) => {
        const screens = t.screens || [];
        switch (filters.suiteAvailability) {
          case "valid":
            return screens.some((s) => s.suites?.some((su) => su.status === "Valid"));
          case "invalid":
            return screens.some((s) => s.suites?.some((su) => su.status === "Invalid"));
          case "multiple":
            return screens.some((s) => (s.suites?.length || 0) > 1);
          case "none":
            return screens.some((s) => !s.suites || s.suites.length === 0);
          default:
            return true;
        }
      });
    }
    if (filters.screenExperience !== "all") {
      r = r.filter((t) =>
        (t.screens || []).some((s) => {
          const proj = s.projection?.type || "";
          const sound = s.sound?.processor || "";
          if (filters.screenExperience === "IAB") return s.sound?.iabSupported;
          if (filters.screenExperience === "Atmos") return /atmos/i.test(sound);
          if (filters.screenExperience === "IMAX") return /imax/i.test(t.type) || /imax/i.test(proj);
          if (filters.screenExperience === "PLF") return /laser|plf/i.test(proj);
          return true;
        })
      );
    }
    return r;
  }, [searchTerm, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeFilterCount =
    (filters.location !== "all" ? 1 : 0) +
    (filters.chain !== "all" ? 1 : 0) +
    (filters.nameContains ? 1 : 0) +
    (filters.suiteAvailability !== "all" ? 1 : 0) +
    (filters.screenExperience !== "all" ? 1 : 0);

  const goEdit = (t: Theatre) => navigate(`/theatre-device-management/screen-devices/${t.id}/edit`);
  const goView = (t: Theatre) => navigate(`/theatre-device-management/screen-devices/${t.id}/edit`);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <p className="text-muted-foreground">Manage screen device configurations across all theatres</p>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by Theatre ID, Third Party ID, Theatre Name, Screen Name or Screen ID..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
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
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Theatre Name</TableHead>
                <TableHead>Chain Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Screens</TableHead>
                <TableHead>Updated On</TableHead>
                <TableHead>Updated By</TableHead>
                <TableHead className="w-12 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                    No results found.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((t) => (
                  <TableRow
                    key={t.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => goView(t)}
                  >
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="font-medium">{t.name}</div>
                          </TooltipTrigger>
                          <TooltipContent className="text-xs space-y-1">
                            <div>
                              <span className="font-semibold">Also Known As:</span>{" "}
                              {t.alternateNames?.join(", ") || t.displayName || "—"}
                            </div>
                            <div>
                              <span className="font-semibold">Theatre ID:</span> {t.id}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>{t.chainName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {t.city}, {t.state}, {t.country}
                    </TableCell>
                    <TableCell>{t.screenCount}</TableCell>
                    <TableCell className="text-xs">
                      {format(new Date(t.updatedAt), "dd MMM yyyy hh:mm a")}
                    </TableCell>
                    <TableCell className="text-xs">{t.updatedBy || "—"}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => goView(t)}>
                            <Eye className="h-4 w-4 mr-2" /> View Screen Device List
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => goEdit(t)}>
                            <Pencil className="h-4 w-4 mr-2" /> Edit Screen Device List
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setLogsTheatre(t)}>
                            <History className="h-4 w-4 mr-2" /> View Logs
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <ScreenDeviceFilterPanel
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        chains={chains}
        locations={locations}
        filters={filters}
        onChange={(f) => {
          setFilters(f);
          setPage(1);
        }}
        onClear={() => {
          setFilters(defaultFilters);
          setPage(1);
        }}
      />

      <TheatreLogsDialog
        open={!!logsTheatre}
        onOpenChange={(o) => !o && setLogsTheatre(undefined)}
        theatre={logsTheatre}
      />
    </motion.div>
  );
};

export default ScreenDeviceManagement;