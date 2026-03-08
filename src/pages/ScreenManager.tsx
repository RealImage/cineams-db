
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Building2, Monitor, Activity, Eye, EyeOff, Filter, Pencil } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScreenFilterPanel } from "@/components/screen-manager/ScreenFilterPanel";
import { EditScreenDialog } from "@/components/screen-manager/EditScreenDialog";
import { screenManagerData, ScreenRecord } from "@/data/screenManagerData";

const PAGE_SIZE = 100;

const ScreenManager = () => {
  const [data, setData] = useState<ScreenRecord[]>(screenManagerData);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [editScreen, setEditScreen] = useState<ScreenRecord | null>(null);
  const [filters, setFilters] = useState({ chain: "all", location: "all", pulseStatus: "all", lionisStatus: "all" });

  const chains = useMemo(() => [...new Set(data.map((s) => s.chainName))].sort(), [data]);
  const locations = useMemo(() => [...new Set(data.map((s) => `${s.city}, ${s.state}, ${s.country}`))].sort(), [data]);

  const filteredData = useMemo(() => {
    let result = data;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.theatreName.toLowerCase().includes(lower) ||
          s.city.toLowerCase().includes(lower) ||
          s.state.toLowerCase().includes(lower) ||
          s.country.toLowerCase().includes(lower)
      );
    }
    if (filters.chain !== "all") result = result.filter((s) => s.chainName === filters.chain);
    if (filters.location !== "all") result = result.filter((s) => `${s.city}, ${s.state}, ${s.country}` === filters.location);
    if (filters.pulseStatus !== "all") result = result.filter((s) => (filters.pulseStatus === "yes" ? s.pulseInstalled : !s.pulseInstalled));
    if (filters.lionisStatus !== "all") result = result.filter((s) => (filters.lionisStatus === "yes" ? s.lionisInstalled : !s.lionisInstalled));
    return result;
  }, [data, searchTerm, filters]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Stats
  const theatreCount = new Set(data.map((s) => s.theatreName)).size;
  const totalScreens = data.length;
  const pulseCount = data.filter((s) => s.pulseInstalled).length;
  const lionisCount = data.filter((s) => s.lionisInstalled).length;
  const notTracked = data.filter((s) => !s.pulseInstalled && !s.lionisInstalled).length;

  const activeFilterCount = Object.values(filters).filter((v) => v !== "all").length;

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSave = (updated: ScreenRecord) => {
    setData((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Screen Manager</h1>
        <p className="text-muted-foreground">Manage screen installations and tracking status</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Theatres Monitored" value={theatreCount} icon={<Building2 size={28} />} />
        <StatCard title="Total Screens" value={totalScreens} icon={<Monitor size={28} />} />
        <StatCard title="Pulse Installed" value={pulseCount} icon={<Activity size={28} />} />
        <StatCard title="Lionis Installed" value={lionisCount} icon={<Eye size={28} />} />
        <StatCard title="Not Tracked" value={notTracked} icon={<EyeOff size={28} />} />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search theatre name or location..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
        <span className="text-sm text-muted-foreground ml-auto">
          {filteredData.length} screen{filteredData.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Theatre</TableHead>
                <TableHead>Chain</TableHead>
                <TableHead>Screen</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Pulse</TableHead>
                <TableHead>Lionis</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((screen) => (
                <TableRow key={screen.id}>
                  <TableCell className="font-medium">{screen.theatreName}</TableCell>
                  <TableCell>{screen.chainName}</TableCell>
                  <TableCell>{screen.screenName}</TableCell>
                  <TableCell className="text-muted-foreground">{screen.city}, {screen.state}, {screen.country}</TableCell>
                  <TableCell>
                    <Badge variant={screen.pulseInstalled ? "default" : "secondary"}>
                      {screen.pulseInstalled ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={screen.lionisInstalled ? "default" : "secondary"}>
                      {screen.lionisInstalled ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <div>{format(new Date(screen.updatedOn), "MMM d, yyyy h:mm a")}</div>
                    <div>{screen.updatedBy}</div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => setEditScreen(screen)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      <ScreenFilterPanel
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        chains={chains}
        locations={locations}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={() => { setFilters({ chain: "all", location: "all", pulseStatus: "all", lionisStatus: "all" }); setCurrentPage(1); }}
      />

      {/* Edit Dialog */}
      <EditScreenDialog open={!!editScreen} onOpenChange={(o) => !o && setEditScreen(null)} screen={editScreen} onSave={handleSave} />
    </div>
  );
};

export default ScreenManager;
