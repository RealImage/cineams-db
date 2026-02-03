import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Download, Plus, LayoutGrid, Table as TableIcon, List, AlertTriangle, Activity, XCircle, Clock, AlertOctagon, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Column, Action } from "@/components/ui/data-table/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatDate, formatDateTime } from "@/lib/dateUtils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

// Types
interface FleetNode {
  id: string;
  nodeId: string;
  theatreChain: string;
  theatreName: string;
  theatreId: string;
  city: string;
  state: string;
  country: string;
  version: string;
  status: "Active" | "Inactive" | "Unresponsive";
  deprecated: boolean;
  lastHeartbeat: string;
  lastUpdateTask: string | null;
  alternateNames: string[];
  uuid: string;
  address: string;
}

interface VersionData {
  version: string;
  active: number;
  inactive: number;
  unresponsive: number;
  deprecated: boolean;
  isDefault: boolean;
}

// Mock images data with specific versions per OS/Agent
const mockImages = [
  { id: "1", name: "WireOS", provider: "Appliance OS", defaultVersion: "v2.4.1", versions: ["v2.4.1", "v2.4.0", "v2.3.5", "v2.3.0", "v2.2.1", "v2.1.0"] },
  { id: "2", name: "QWA-OS", provider: "Appliance OS", defaultVersion: "v3.1.2", versions: ["v3.1.2", "v3.1.0", "v3.0.8", "v3.0.5", "v2.9.1", "v2.8.0"] },
  { id: "3", name: "PartnerOS", provider: "Appliance OS", defaultVersion: "v1.8.0", versions: ["v1.8.0", "v1.7.5", "v1.7.0", "v1.6.2", "v1.5.0", "v1.4.3"] },
  { id: "4", name: "iCount", provider: "iCount", defaultVersion: "v5.2.0", versions: ["v5.2.0", "v5.1.3", "v5.1.0", "v5.0.2", "v4.9.1", "v4.8.0"] },
  { id: "5", name: "Qlog Agent", provider: "Qlog", defaultVersion: "v2.1.4", versions: ["v2.1.4", "v2.1.0", "v2.0.5", "v2.0.0", "v1.9.2", "v1.8.1"] },
  { id: "6", name: "Kadet (Agent Zero)", provider: "Qube Wire", defaultVersion: "v1.3.0", versions: ["v1.3.0", "v1.2.5", "v1.2.0", "v1.1.3", "v1.0.5", "v1.0.0"] },
  { id: "7", name: "Agent Redux", provider: "Qube Wire", defaultVersion: "v4.0.2", versions: ["v4.0.2", "v4.0.0", "v3.9.5", "v3.9.0", "v3.8.2", "v3.7.0"] },
  { id: "8", name: "Manifest Agent", provider: "Qube Wire", defaultVersion: "v2.5.1", versions: ["v2.5.1", "v2.5.0", "v2.4.3", "v2.4.0", "v2.3.1", "v2.2.0"] },
  { id: "9", name: "Content Ingest Agent", provider: "Qube Wire", defaultVersion: "v3.2.0", versions: ["v3.2.0", "v3.1.5", "v3.1.0", "v3.0.3", "v2.9.0", "v2.8.2"] },
  { id: "10", name: "KDM Agent", provider: "Qube Wire", defaultVersion: "v1.6.2", versions: ["v1.6.2", "v1.6.0", "v1.5.4", "v1.5.0", "v1.4.1", "v1.3.0"] },
];

// Mock fleet data generator
const generateMockFleetData = (imageId: string): FleetNode[] => {
  const chains = ["AMC Theatres", "Regal Cinemas", "Cinemark", "Marcus Theatres", "Harkins Theatres"];
  const countries = ["USA", "Canada", "Mexico", "Brazil", "UK"];
  const states = ["California", "Texas", "New York", "Florida", "Ontario", "London"];
  const cities = ["Los Angeles", "Dallas", "New York City", "Miami", "Toronto", "London"];
  
  // Get versions specific to the selected image
  const selectedImage = mockImages.find(img => img.id === imageId);
  const versions = selectedImage?.versions || ["v1.0.0", "v1.0.1", "v1.0.2", "v1.0.3", "v1.0.4", "v1.0.5"];
  const deprecatedVersions = versions.slice(-2); // Last 2 versions are deprecated
  
  const statuses: ("Active" | "Inactive" | "Unresponsive")[] = ["Active", "Inactive", "Unresponsive"];

  const alternateNamesOptions = [
    ["GA Cinema", "Grand Theatre"],
    ["Metro Movies", "City Cinema"],
    ["Star Cinema", "Premium Theatre"],
    ["Galaxy Films", "Space Cinema"],
  ];
  const streetNames = ["Grand Ave", "Main St", "Broadway", "Cinema Blvd", "Theatre Way"];
  const zipCodes = ["90012", "10001", "75201", "33101", "M5V 1J1", "SW1A 1AA"];

  return Array.from({ length: 250 }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * (i < 200 ? 1 : 3))];
    const version = versions[Math.floor(Math.random() * versions.length)];
    const deprecated = deprecatedVersions.includes(version);
    const city = cities[Math.floor(Math.random() * cities.length)];
    const state = states[Math.floor(Math.random() * states.length)];
    const country = countries[Math.floor(Math.random() * countries.length)];
    
    return {
      id: `node-${imageId}-${i}`,
      nodeId: `NODE-${String(i + 1000).padStart(6, '0')}`,
      theatreChain: chains[Math.floor(Math.random() * chains.length)],
      theatreName: `Theatre ${i + 1}`,
      theatreId: `TH-${String(i + 1).padStart(4, '0')}`,
      city,
      state,
      country,
      version,
      status,
      deprecated,
      lastHeartbeat: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      lastUpdateTask: Math.random() > 0.5 ? `TASK-${Math.floor(Math.random() * 1000)}` : null,
      alternateNames: alternateNamesOptions[Math.floor(Math.random() * alternateNamesOptions.length)],
      uuid: `${Math.random().toString(36).substring(2, 10)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 14)}`,
      address: `${Math.floor(Math.random() * 999) + 1} ${streetNames[Math.floor(Math.random() * streetNames.length)]}, ${city}, ${state} ${zipCodes[Math.floor(Math.random() * zipCodes.length)]}`,
    };
  });
};

// Generate version chart data
const generateVersionChartData = (nodes: FleetNode[], defaultVersion: string): VersionData[] => {
  const versionMap = new Map<string, VersionData>();
  
  nodes.forEach(node => {
    if (!versionMap.has(node.version)) {
      versionMap.set(node.version, {
        version: node.version,
        active: 0,
        inactive: 0,
        unresponsive: 0,
        deprecated: node.deprecated,
        isDefault: node.version === defaultVersion,
      });
    }
    const data = versionMap.get(node.version)!;
    if (node.status === "Active") data.active++;
    else if (node.status === "Inactive") data.inactive++;
    else data.unresponsive++;
  });

  return Array.from(versionMap.values()).sort((a, b) => a.version.localeCompare(b.version));
};

const chartConfig: ChartConfig = {
  active: { label: "Active", color: "hsl(var(--chart-1))" },
  inactive: { label: "Inactive", color: "hsl(var(--chart-2))" },
  unresponsive: { label: "Unresponsive", color: "hsl(var(--chart-3))" },
};

const FleetStatus = () => {
  const navigate = useNavigate();
  // Global Context State
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter State
  const [locationSearch, setLocationSearch] = useState<string>("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [chainFilter, setChainFilter] = useState<string>("");
  const [theatreNameFilter, setTheatreNameFilter] = useState<string>("");
  const [theatreIdFilter, setTheatreIdFilter] = useState<string>("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [versionFilters, setVersionFilters] = useState<string[]>([]);
  const [deprecatedOnly, setDeprecatedOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // View State
  const [viewMode, setViewMode] = useState<"visual" | "table" | "list">("table");
  const [activeKPI, setActiveKPI] = useState<string | null>(null);

  // Data
  const fleetData = useMemo(() => {
    if (!selectedImage) return [];
    return generateMockFleetData(selectedImage);
  }, [selectedImage]);

  const filteredData = useMemo(() => {
    let data = [...fleetData];

    // Location filter - matches city, state, or country
    if (selectedLocations.length > 0) {
      data = data.filter(n => 
        selectedLocations.some(loc => 
          n.city === loc || n.state === loc || n.country === loc
        )
      );
    }
    if (chainFilter) data = data.filter(n => n.theatreChain === chainFilter);
    if (theatreNameFilter) data = data.filter(n => n.theatreName.toLowerCase().includes(theatreNameFilter.toLowerCase()));
    if (theatreIdFilter) data = data.filter(n => n.theatreId.toLowerCase().includes(theatreIdFilter.toLowerCase()));
    if (statusFilters.length > 0) data = data.filter(n => statusFilters.includes(n.status));
    if (versionFilters.length > 0) data = data.filter(n => versionFilters.includes(n.version));
    if (deprecatedOnly) data = data.filter(n => n.deprecated);
    
    // KPI filter
    if (activeKPI === "active") data = data.filter(n => n.status === "Active");
    if (activeKPI === "inactive") data = data.filter(n => n.status === "Inactive");
    if (activeKPI === "unresponsive") data = data.filter(n => n.status === "Unresponsive");
    if (activeKPI === "deprecated") data = data.filter(n => n.deprecated);

    return data;
  }, [fleetData, selectedLocations, chainFilter, theatreNameFilter, theatreIdFilter, statusFilters, versionFilters, deprecatedOnly, activeKPI]);

  const selectedImageData = mockImages.find(img => img.id === selectedImage);
  const versionChartData = useMemo(() => generateVersionChartData(filteredData, selectedImageData?.defaultVersion || "v4.1.9"), [filteredData, selectedImageData]);

  // KPIs
  const kpis = useMemo(() => ({
    total: filteredData.length,
    active: filteredData.filter(n => n.status === "Active").length,
    inactive: filteredData.filter(n => n.status === "Inactive").length,
    unresponsive: filteredData.filter(n => n.status === "Unresponsive").length,
    deprecated: filteredData.filter(n => n.deprecated).length,
  }), [filteredData]);

  // Risk spotlight
  const riskSpotlight = useMemo(() => {
    const deprecatedUnresponsive = fleetData.filter(n => n.deprecated && n.status === "Unresponsive").length;
    const risks = [];
    if (deprecatedUnresponsive > 0) {
      risks.push({ message: `${deprecatedUnresponsive} unresponsive nodes on deprecated versions`, type: "critical" });
    }
    const brazilInactive = fleetData.filter(n => n.country === "Brazil" && n.status === "Inactive").length;
    if (brazilInactive > 20) {
      risks.push({ message: `Highest inactive rate detected in Brazil (${brazilInactive} nodes)`, type: "warning" });
    }
    return risks;
  }, [fleetData]);

  // Unique values for filters
  const uniqueValues = useMemo(() => ({
    countries: [...new Set(fleetData.map(n => n.country))],
    states: [...new Set(fleetData.map(n => n.state))],
    cities: [...new Set(fleetData.map(n => n.city))],
    chains: [...new Set(fleetData.map(n => n.theatreChain))],
    versions: [...new Set(fleetData.map(n => n.version))],
  }), [fleetData]);

  // All locations combined for smart search
  const allLocations = useMemo(() => {
    const locs = new Set<string>();
    fleetData.forEach(n => {
      locs.add(n.city);
      locs.add(n.state);
      locs.add(n.country);
    });
    return [...locs].sort();
  }, [fleetData]);

  const filteredLocations = useMemo(() => {
    if (!locationSearch) return allLocations.filter(loc => !selectedLocations.includes(loc));
    return allLocations.filter(loc => 
      loc.toLowerCase().includes(locationSearch.toLowerCase()) && !selectedLocations.includes(loc)
    );
  }, [allLocations, locationSearch, selectedLocations]);

  // Active filters for pill display
  const activeFilters = useMemo(() => {
    const filters: { key: string; label: string; value: string }[] = [];
    
    selectedLocations.forEach(loc => {
      filters.push({ key: `location-${loc}`, label: "Location", value: loc });
    });
    if (chainFilter) {
      filters.push({ key: "chain", label: "Chain", value: chainFilter });
    }
    if (theatreNameFilter) {
      filters.push({ key: "theatreName", label: "Theatre Name", value: theatreNameFilter });
    }
    if (theatreIdFilter) {
      filters.push({ key: "theatreId", label: "Theatre ID", value: theatreIdFilter });
    }
    statusFilters.forEach(status => {
      filters.push({ key: `status-${status}`, label: "Agent / OS Status", value: status });
    });
    versionFilters.forEach(version => {
      filters.push({ key: `version-${version}`, label: "Version", value: version });
    });
    if (deprecatedOnly) {
      filters.push({ key: "deprecated", label: "Deprecated", value: "Only" });
    }
    
    return filters;
  }, [selectedLocations, chainFilter, theatreNameFilter, theatreIdFilter, statusFilters, versionFilters, deprecatedOnly]);

  const removeFilter = (key: string) => {
    if (key.startsWith("location-")) {
      const loc = key.replace("location-", "");
      setSelectedLocations(prev => prev.filter(l => l !== loc));
    } else if (key === "chain") {
      setChainFilter("");
    } else if (key === "theatreName") {
      setTheatreNameFilter("");
    } else if (key === "theatreId") {
      setTheatreIdFilter("");
    } else if (key.startsWith("status-")) {
      const status = key.replace("status-", "");
      setStatusFilters(prev => prev.filter(s => s !== status));
    } else if (key.startsWith("version-")) {
      const version = key.replace("version-", "");
      setVersionFilters(prev => prev.filter(v => v !== version));
    } else if (key === "deprecated") {
      setDeprecatedOnly(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastRefreshed(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  const handleResetFilters = () => {
    setLocationSearch("");
    setSelectedLocations([]);
    setChainFilter("");
    setTheatreNameFilter("");
    setTheatreIdFilter("");
    setStatusFilters([]);
    setVersionFilters([]);
    setDeprecatedOnly(false);
    setActiveKPI(null);
  };

  const toggleKPI = (kpi: string) => {
    setActiveKPI(activeKPI === kpi ? null : kpi);
  };

  // Table columns
  const columns: Column<FleetNode>[] = [
    { accessor: "nodeId", header: "Node ID", sortable: true },
    { accessor: "theatreChain", header: "Theatre Chain", sortable: true, filterable: true, filterOptions: uniqueValues.chains },
    { accessor: "theatreName", header: "Theatre Name", sortable: true, cell: (row) => (
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="cursor-pointer">
            <div className="font-medium">{row.theatreName}</div>
            <div className="text-xs text-muted-foreground">{row.city}, {row.state}, {row.country}</div>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Alternate Names: </span>
              <span className="text-sm">{row.alternateNames.join(", ")}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">UUID: </span>
              <span className="text-sm font-mono">{row.uuid}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Address: </span>
              <span className="text-sm">{row.address}</span>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    )},
    { accessor: "version", header: "Version", sortable: true, cell: (row) => (
      <div className="flex items-center gap-2">
        <span>{row.version}</span>
        {row.deprecated && <Badge variant="destructive" className="text-xs">Deprecated</Badge>}
        {row.version === "v4.1.9" && <Badge variant="default" className="text-xs bg-green-600">Recommended</Badge>}
      </div>
    )},
    { accessor: "status", header: "Status", sortable: true, filterable: true, filterOptions: ["Active", "Inactive", "Unresponsive"], cell: (row) => (
      <Badge variant={row.status === "Active" ? "default" : row.status === "Inactive" ? "secondary" : "destructive"}>
        {row.status}
      </Badge>
    )},
    { accessor: "lastHeartbeat", header: "Last Heartbeat", sortable: true, cell: (row) => formatDateTime(row.lastHeartbeat) },
    { accessor: "lastUpdateTask", header: "Last Update Task", sortable: true, cell: (row) => row.lastUpdateTask || "-" },
  ];

  const tableActions: Action<FleetNode>[] = [
    { label: "View Details", onClick: (row) => console.log("View", row) },
    { label: "Create Task", onClick: (row) => console.log("Create task for", row) },
  ];

  return (
    <div className="space-y-4">
      {/* A1. Global Context Bar */}
      <div className="sticky top-0 z-10 bg-background border-b pb-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <Label className="text-sm text-muted-foreground mb-1 block">Select OS / Agent / App</Label>
            <Select value={selectedImage} onValueChange={setSelectedImage}>
              <SelectTrigger>
                <SelectValue placeholder="Select App ▾" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {mockImages.map(img => (
                  <SelectItem key={img.id} value={img.id}>
                    {img.name} ({img.provider})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Last refreshed: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing || !selectedImage}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh now
            </Button>
          </div>
        </div>
      </div>

      {selectedImage && (
        <>
          {/* A2. Filter Bar with Applied Filters Pills */}
          <div id="fleet-filter-panel" className="sticky top-16 z-10 bg-background border rounded-lg p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 flex items-center gap-2 flex-wrap">
                {activeFilters.length > 0 ? (
                  <>
                    {activeFilters.map(filter => (
                      <Badge 
                        key={filter.key} 
                        variant="secondary" 
                        className="flex items-center gap-1 pl-2 pr-1 py-1"
                      >
                        <span className="text-xs text-muted-foreground">{filter.label}:</span>
                        <span className="text-xs font-medium">{filter.value}</span>
                        <button 
                          onClick={() => removeFilter(filter.key)}
                          className="ml-1 hover:bg-muted rounded p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleResetFilters}
                      className="text-xs text-muted-foreground"
                    >
                      Clear All
                    </Button>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">No filters applied</span>
                )}
              </div>
              
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {activeFilters.length > 0 && (
                      <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                        {activeFilters.length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[450px]">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
                    <div className="space-y-6">
                      {/* Theatre Location - Smart Search */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Theatre Location</Label>
                        <div className="space-y-2">
                          <Input 
                            placeholder="Search city, state, or country..." 
                            value={locationSearch}
                            onChange={(e) => setLocationSearch(e.target.value)}
                          />
                          {selectedLocations.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {selectedLocations.map(loc => (
                                <Badge key={loc} variant="secondary" className="flex items-center gap-1">
                                  {loc}
                                  <button 
                                    onClick={() => setSelectedLocations(prev => prev.filter(l => l !== loc))}
                                    className="hover:bg-muted rounded p-0.5"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                          {locationSearch && filteredLocations.length > 0 && (
                            <div className="border rounded-md max-h-40 overflow-y-auto">
                              {filteredLocations.slice(0, 10).map(loc => (
                                <button
                                  key={loc}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                                  onClick={() => {
                                    setSelectedLocations(prev => [...prev, loc]);
                                    setLocationSearch("");
                                  }}
                                >
                                  {loc}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Theatre Hierarchy */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Theatre Hierarchy</Label>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Theatre Chain</Label>
                            <Select value={chainFilter || "all"} onValueChange={(v) => setChainFilter(v === "all" ? "" : v)}>
                              <SelectTrigger><SelectValue placeholder="All Chains" /></SelectTrigger>
                              <SelectContent className="bg-popover z-50">
                                <SelectItem value="all">All Chains</SelectItem>
                                {uniqueValues.chains.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Theatre Name</Label>
                            <Input 
                              placeholder="Search theatre name..." 
                              value={theatreNameFilter} 
                              onChange={(e) => setTheatreNameFilter(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Theatre ID</Label>
                            <Input 
                              placeholder="Search theatre ID..." 
                              value={theatreIdFilter} 
                              onChange={(e) => setTheatreIdFilter(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Agent / OS Status Multi-select */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Agent / OS Status</Label>
                        <div className="space-y-2">
                          {["Active", "Inactive", "Unresponsive"].map(status => (
                            <div key={status} className="flex items-center gap-2">
                              <Checkbox 
                                id={`status-${status}`}
                                checked={statusFilters.includes(status)}
                                onCheckedChange={(checked) => {
                                  if (checked) setStatusFilters([...statusFilters, status]);
                                  else setStatusFilters(statusFilters.filter(s => s !== status));
                                }}
                              />
                              <Label htmlFor={`status-${status}`} className="text-sm cursor-pointer">{status}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Version Multi-select */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Version</Label>
                        <div className="space-y-2">
                          {uniqueValues.versions.map(version => (
                            <div key={version} className="flex items-center gap-2">
                              <Checkbox 
                                id={`version-${version}`}
                                checked={versionFilters.includes(version)}
                                onCheckedChange={(checked) => {
                                  if (checked) setVersionFilters([...versionFilters, version]);
                                  else setVersionFilters(versionFilters.filter(v => v !== version));
                                }}
                              />
                              <Label htmlFor={`version-${version}`} className="text-sm cursor-pointer flex items-center gap-1">
                                {version}
                                {(version === "v3.9.2" || version === "v3.8.1") && (
                                  <Badge variant="destructive" className="text-xs">Deprecated</Badge>
                                )}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Deprecated Toggle */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="deprecated-only"
                            checked={deprecatedOnly} 
                            onCheckedChange={(checked) => setDeprecatedOnly(!!checked)} 
                          />
                          <Label htmlFor="deprecated-only" className="text-sm cursor-pointer">Deprecated only</Label>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t">
                        <Button variant="outline" className="flex-1" onClick={handleResetFilters}>
                          Reset All
                        </Button>
                        <Button className="flex-1" onClick={() => setIsFilterOpen(false)}>
                          Apply Filters
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* A3. Fleet Summary KPI Strip */}
          <div id="fleet-kpi-strip" className="grid grid-cols-5 gap-4">
            <Card 
              className={`cursor-pointer transition-all ${activeKPI === 'total' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => toggleKPI('total')}
            >
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Nodes in Scope</p>
                    <p className="text-3xl font-bold">{kpis.total}</p>
                  </div>
                  <Activity className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card 
              className={`cursor-pointer transition-all ${activeKPI === 'active' ? 'ring-2 ring-green-500' : ''}`}
              onClick={() => toggleKPI('active')}
            >
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-3xl font-bold text-green-600">{kpis.active}</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card 
              className={`cursor-pointer transition-all ${activeKPI === 'inactive' ? 'ring-2 ring-yellow-500' : ''}`}
              onClick={() => toggleKPI('inactive')}
            >
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Inactive</p>
                    <p className="text-3xl font-bold text-yellow-600">{kpis.inactive}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card 
              className={`cursor-pointer transition-all ${activeKPI === 'unresponsive' ? 'ring-2 ring-red-500' : ''}`}
              onClick={() => toggleKPI('unresponsive')}
            >
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Unresponsive</p>
                    <p className="text-3xl font-bold text-red-600">{kpis.unresponsive}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card 
              className={`cursor-pointer transition-all ${activeKPI === 'deprecated' ? 'ring-2 ring-orange-500' : ''}`}
              onClick={() => toggleKPI('deprecated')}
            >
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Deprecated Versions</p>
                    <p className="text-3xl font-bold text-orange-600">{kpis.deprecated}</p>
                  </div>
                  <AlertOctagon className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* A4. Version × Status Distribution Chart */}
          <Card id="version-status-chart">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Version × Status Distribution</h3>
              <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={versionChartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="version" 
                      tick={({ x, y, payload }) => {
                        const data = versionChartData.find(d => d.version === payload.value);
                        return (
                          <g transform={`translate(${x},${y})`}>
                            <text x={0} y={0} dy={16} textAnchor="middle" fill="currentColor" fontSize={12}>
                              {payload.value}
                            </text>
                            {data?.deprecated && (
                              <text x={0} y={0} dy={30} textAnchor="middle" fill="hsl(var(--destructive))" fontSize={10}>
                                Deprecated
                              </text>
                            )}
                            {data?.isDefault && (
                              <text x={0} y={0} dy={30} textAnchor="middle" fill="hsl(142 76% 36%)" fontSize={10}>
                                ★ Default
                              </text>
                            )}
                          </g>
                        );
                      }}
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Bar dataKey="active" stackId="a" fill="hsl(142 76% 36%)" name="Active" />
                    <Bar dataKey="inactive" stackId="a" fill="hsl(25 95% 53%)" name="Inactive" />
                    <Bar dataKey="unresponsive" stackId="a" fill="hsl(0 84% 60%)" name="Unresponsive" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* A5. Risk Spotlight Strip (Conditional) */}
          {riskSpotlight.length > 0 && (
            <div id="risk-spotlight" className="space-y-2">
              {riskSpotlight.map((risk, i) => (
                <Card key={i} className={`border-l-4 ${risk.type === 'critical' ? 'border-l-red-500 bg-red-50 dark:bg-red-950/20' : 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'}`}>
                  <CardContent className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`h-5 w-5 ${risk.type === 'critical' ? 'text-red-500' : 'text-yellow-500'}`} />
                      <span className="font-medium">{risk.message}</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Create Task
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* A6. View Toggle + Action Bar */}
          <div id="view-action-bar" className="flex items-center justify-between py-2">
            <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as any)}>
              <ToggleGroupItem value="visual" aria-label="Visual view">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="table" aria-label="Table view">
                <TableIcon className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button 
                size="sm"
                onClick={() => {
                  const selectedImageData = mockImages.find(img => img.id === selectedImage);
                  const now = new Date();
                  const currentDate = now.toISOString().split('T')[0];
                  const currentTime = now.toTimeString().slice(0, 5);
                  
                  // Map filtered data to appliance format
                  const appliances = filteredData.map((node, index) => ({
                    id: `appliance-${index + 1}`,
                    applianceSerial: node.nodeId,
                    hardwareSerial: `HW-${node.nodeId.replace('NODE-', '')}`,
                    theatreName: node.theatreName,
                    city: node.city,
                    state: node.state,
                    country: node.country,
                    chain: node.theatreChain,
                    cluster: `Cluster-${Math.floor(Math.random() * 10) + 1}`,
                    updateStatus: "Pending" as const,
                  }));
                  
                  navigate("/fleet-management/task/new", {
                    state: {
                      taskData: {
                        taskType: "Agent Update",
                        selectedAgent: selectedImageData?.name || "",
                        agentName: selectedImageData?.name || "",
                        triggerDate: currentDate,
                        triggerTime: currentTime,
                        triggerTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone.includes("America/Los_Angeles") ? "PST" : 
                                         Intl.DateTimeFormat().resolvedOptions().timeZone.includes("America/New_York") ? "EST" : "PST",
                        description: "",
                        targetVersion: selectedImageData?.defaultVersion || "",
                        agentTargetVersion: selectedImageData?.defaultVersion || "",
                      },
                      appliances,
                    }
                  });
                }}
                disabled={!selectedImage}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </div>
          </div>

          {/* A7. Data View Area */}
          <div id="fleet-data-view">
            {viewMode === "visual" && (
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{((kpis.active / kpis.total) * 100).toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">Active Rate</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{uniqueValues.versions.length}</p>
                      <p className="text-sm text-muted-foreground">Versions in Use</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{filteredData.length}</p>
                      <p className="text-sm text-muted-foreground">Theatres</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{uniqueValues.countries.length}</p>
                      <p className="text-sm text-muted-foreground">Countries</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {viewMode === "table" && (
              <DataTable
                data={filteredData}
                columns={columns}
                searchable
                searchPlaceholder="Search by Node ID, Theatre..."
                showFilters={false}
                actions={() => tableActions}
              />
            )}

            {viewMode === "list" && (
              <Card>
                <CardContent className="pt-4 divide-y">
                  {filteredData.slice(0, 50).map(node => (
                    <div key={node.id} id="fleet-list" className="py-2 flex items-center gap-4 font-mono text-sm">
                      <span className={`w-3 h-3 rounded-full ${
                        node.status === 'Active' ? 'bg-green-500' : 
                        node.status === 'Inactive' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="font-medium w-32">{node.nodeId}</span>
                      <span className="text-muted-foreground w-20">{node.version}</span>
                      <Badge variant={node.status === "Active" ? "default" : node.status === "Inactive" ? "secondary" : "destructive"} className="w-24 justify-center">
                        {node.status}
                      </Badge>
                      <span className="text-muted-foreground flex-1">{node.city}, {node.state}, {node.country}</span>
                      <span className="text-muted-foreground text-xs">{formatDateTime(node.lastHeartbeat)}</span>
                    </div>
                  ))}
                  {filteredData.length > 50 && (
                    <div className="py-4 text-center text-muted-foreground">
                      Showing 50 of {filteredData.length} nodes. Use filters to narrow results.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {!selectedImage && (
        <Card className="p-12 text-center">
          <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Select an OS / Agent / App</h3>
          <p className="text-muted-foreground">Choose an application from the dropdown above to view fleet status</p>
        </Card>
      )}
    </div>
  );
};

export default FleetStatus;
