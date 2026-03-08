
import { useState, useMemo, useCallback } from "react";
import { Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import { EnvironmentFilterPanel, type EnvironmentFilters } from "@/components/environment-manager/EnvironmentFilterPanel";
import { environmentScreenData, scoreRangeBins, type EnvironmentScreenRecord, type RatingStatus } from "@/data/environmentManagerData";

const PAGE_SIZE = 100;

const defaultFilters: EnvironmentFilters = {
  chain: "all",
  scoreRange: "all",
  onTemperature: "all",
  onHumidity: "all",
  onDust: "all",
  offTemperature: "all",
  offHumidity: "all",
  offDust: "all",
};

const ratingLabel = (status: RatingStatus) => {
  switch (status) {
    case "within_theatre_baseline": return "Theatre Baseline";
    case "within_recommended_baseline": return "Recommended";
    case "out_of_range": return "Out of Range";
  }
};

const ratingVariant = (status: RatingStatus): "default" | "secondary" | "destructive" => {
  switch (status) {
    case "within_theatre_baseline": return "default";
    case "within_recommended_baseline": return "secondary";
    case "out_of_range": return "destructive";
  }
};

const chartConfig = {
  count: { label: "Screens", color: "hsl(var(--primary))" },
};

const EnvironmentManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<EnvironmentFilters>(defaultFilters);
  const [selectedBar, setSelectedBar] = useState<string | null>(null);

  const chains = useMemo(() => [...new Set(environmentScreenData.map((s) => s.chainName))].sort(), []);

  // Build histogram data
  const histogramData = useMemo(() => {
    return scoreRangeBins.map((bin) => ({
      range: bin.label,
      count: environmentScreenData.filter((s) => s.score >= bin.min && s.score <= bin.max).length,
      min: bin.min,
      max: bin.max,
    }));
  }, []);

  // Apply all filters
  const filteredData = useMemo(() => {
    let result = [...environmentScreenData];

    // Bar click filter
    if (selectedBar) {
      const bin = scoreRangeBins.find((b) => b.label === selectedBar);
      if (bin) result = result.filter((s) => s.score >= bin.min && s.score <= bin.max);
    }

    // Search
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

    // Panel filters
    if (filters.chain !== "all") result = result.filter((s) => s.chainName === filters.chain);
    if (filters.scoreRange !== "all") {
      const bin = scoreRangeBins.find((b) => b.label === filters.scoreRange);
      if (bin) result = result.filter((s) => s.score >= bin.min && s.score <= bin.max);
    }
    if (filters.onTemperature !== "all") result = result.filter((s) => s.onTemperature === filters.onTemperature);
    if (filters.onHumidity !== "all") result = result.filter((s) => s.onHumidity === filters.onHumidity);
    if (filters.onDust !== "all") result = result.filter((s) => s.onDust === filters.onDust);
    if (filters.offTemperature !== "all") result = result.filter((s) => s.offTemperature === filters.offTemperature);
    if (filters.offHumidity !== "all") result = result.filter((s) => s.offHumidity === filters.offHumidity);
    if (filters.offDust !== "all") result = result.filter((s) => s.offDust === filters.offDust);

    return result;
  }, [searchTerm, filters, selectedBar]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const activeFilterCount = Object.values(filters).filter((v) => v !== "all").length + (selectedBar ? 1 : 0);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleBarClick = useCallback((data: any) => {
    if (data && data.activePayload) {
      const clickedRange = data.activePayload[0]?.payload?.range;
      setSelectedBar((prev) => (prev === clickedRange ? null : clickedRange));
      setCurrentPage(1);
    }
  }, []);

  const clearAll = () => {
    setFilters(defaultFilters);
    setSelectedBar(null);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <p className="text-muted-foreground">Environment score distribution and screen-level ratings</p>

      {/* Histogram */}
      <DashboardCard
        title="Environment Score Distribution"
        description={selectedBar ? `Filtered to: ${selectedBar} — click again to clear` : "Click a bar to filter the table below"}
      >
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={histogramData} margin={{ top: 10, right: 20, bottom: 40, left: 20 }} onClick={handleBarClick}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="range"
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
              label={{ value: "Score Range", position: "insideBottom", offset: -20, className: "fill-muted-foreground text-xs" }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
              label={{ value: "Screens", angle: -90, position: "insideLeft", offset: -5, className: "fill-muted-foreground text-xs" }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} className="cursor-pointer">
              {histogramData.map((entry) => (
                <Cell
                  key={entry.range}
                  fill={selectedBar === entry.range ? "hsl(var(--primary))" : selectedBar ? "hsl(var(--muted-foreground) / 0.3)" : "hsl(var(--primary))"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </DashboardCard>

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
        {selectedBar && (
          <Badge variant="secondary" className="cursor-pointer" onClick={() => { setSelectedBar(null); setCurrentPage(1); }}>
            Score: {selectedBar} ✕
          </Badge>
        )}
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
                <TableHead>Score</TableHead>
                <TableHead>Screen</TableHead>
                <TableHead>Theatre</TableHead>
                <TableHead>Chain</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-center" colSpan={3}>
                  <span className="text-xs uppercase tracking-wider">ON Ratings</span>
                </TableHead>
                <TableHead className="text-center" colSpan={3}>
                  <span className="text-xs uppercase tracking-wider">OFF Ratings</span>
                </TableHead>
              </TableRow>
              <TableRow>
                <TableHead />
                <TableHead />
                <TableHead />
                <TableHead />
                <TableHead />
                <TableHead className="text-xs">Temp</TableHead>
                <TableHead className="text-xs">Humidity</TableHead>
                <TableHead className="text-xs">Dust</TableHead>
                <TableHead className="text-xs">Temp</TableHead>
                <TableHead className="text-xs">Humidity</TableHead>
                <TableHead className="text-xs">Dust</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                    No screens match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((screen) => (
                  <TableRow key={screen.id}>
                    <TableCell className="font-bold text-center">{screen.score}</TableCell>
                    <TableCell className="font-medium">{screen.screenName}</TableCell>
                    <TableCell>{screen.theatreName}</TableCell>
                    <TableCell>{screen.chainName}</TableCell>
                    <TableCell className="text-muted-foreground">{screen.city}, {screen.state}, {screen.country}</TableCell>
                    <TableCell><Badge variant={ratingVariant(screen.onTemperature)} className="text-[10px] whitespace-nowrap">{ratingLabel(screen.onTemperature)}</Badge></TableCell>
                    <TableCell><Badge variant={ratingVariant(screen.onHumidity)} className="text-[10px] whitespace-nowrap">{ratingLabel(screen.onHumidity)}</Badge></TableCell>
                    <TableCell><Badge variant={ratingVariant(screen.onDust)} className="text-[10px] whitespace-nowrap">{ratingLabel(screen.onDust)}</Badge></TableCell>
                    <TableCell><Badge variant={ratingVariant(screen.offTemperature)} className="text-[10px] whitespace-nowrap">{ratingLabel(screen.offTemperature)}</Badge></TableCell>
                    <TableCell><Badge variant={ratingVariant(screen.offHumidity)} className="text-[10px] whitespace-nowrap">{ratingLabel(screen.offHumidity)}</Badge></TableCell>
                    <TableCell><Badge variant={ratingVariant(screen.offDust)} className="text-[10px] whitespace-nowrap">{ratingLabel(screen.offDust)}</Badge></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      <EnvironmentFilterPanel
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        chains={chains}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={clearAll}
      />
    </div>
  );
};

export default EnvironmentManager;
