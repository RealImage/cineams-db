import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { SlidersHorizontal, FilterX, X, Search } from "lucide-react";
import { WireTAPDevice } from "@/types/wireTAP";

export interface WireTAPFilters {
  connectivityType: string[];
  theatreChain: string[];
  storageCapacity: string[];
  applianceType: string[];
  activationStatus: string[];
  mappingStatus: string[];
  internetConnectivity: string[];
  vpnStatus: string[];
}

export const emptyFilters: WireTAPFilters = {
  connectivityType: [],
  theatreChain: [],
  storageCapacity: [],
  applianceType: [],
  activationStatus: [],
  mappingStatus: [],
  internetConnectivity: [],
  vpnStatus: [],
};

interface FilterSectionProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  smartSearch?: boolean;
}

const FilterSection = ({ label, options, selected, onChange, smartSearch }: FilterSectionProps) => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return options;
    return options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  }, [options, search]);

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter(v => v !== value)
        : [...selected, value]
    );
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {smartSearch && (
        <div className="relative">
          <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder={`Search ${label.toLowerCase()}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-7 h-8 text-sm"
          />
        </div>
      )}
      <div className="max-h-36 overflow-y-auto border rounded-md p-2 space-y-1">
        {filtered.map(option => (
          <div
            key={option}
            className="flex items-center gap-2 py-1 px-2 hover:bg-muted rounded-sm cursor-pointer"
            onClick={() => toggle(option)}
          >
            <Checkbox checked={selected.includes(option)} />
            <span className="text-sm">{option}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">No matches</p>
        )}
      </div>
    </div>
  );
};

interface WireTAPFilterPanelProps {
  devices: WireTAPDevice[];
  filters: WireTAPFilters;
  onFiltersChange: (filters: WireTAPFilters) => void;
}

export const WireTAPFilterPanel = ({ devices, filters, onFiltersChange }: WireTAPFilterPanelProps) => {
  const [open, setOpen] = useState(false);

  const activeCount = Object.values(filters).reduce((sum, arr) => sum + arr.length, 0);

  const options = useMemo(() => {
    const unique = (fn: (d: WireTAPDevice) => string) =>
      Array.from(new Set(devices.map(fn))).filter(Boolean).sort();

    return {
      connectivityType: unique(d => d.connectivityType),
      theatreChain: unique(d => d.theatreName),
      storageCapacity: unique(d => d.storageCapacity),
      applianceType: ["Standard", "Pro", "Enterprise"],
      activationStatus: ["Active", "Inactive"],
      mappingStatus: ["Mapped", "Unmapped", "Pending"],
      internetConnectivity: ["Healthy", "Acceptable", "Degraded", "Unhealthy"],
      vpnStatus: ["Enabled", "Disabled"],
    };
  }, [devices]);

  const updateFilter = (key: keyof WireTAPFilters) => (values: string[]) => {
    onFiltersChange({ ...filters, [key]: values });
  };

  const clearAll = () => onFiltersChange({ ...emptyFilters });

  return (
    <>
      <Button variant="outline" size="icon" className="relative" onClick={() => setOpen(true)}>
        <SlidersHorizontal className="h-4 w-4" />
        {activeCount > 0 && (
          <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
            {activeCount}
          </Badge>
        )}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle>Filters</SheetTitle>
              {activeCount > 0 && (
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={clearAll}>
                  <FilterX className="h-3 w-3 mr-1" /> Clear all
                </Button>
              )}
            </div>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            <FilterSection label="Connectivity Type" options={options.connectivityType} selected={filters.connectivityType} onChange={updateFilter("connectivityType")} />
            <Separator />
            <FilterSection label="Theatre Chain" options={options.theatreChain} selected={filters.theatreChain} onChange={updateFilter("theatreChain")} smartSearch />
            <Separator />
            <FilterSection label="Storage Capacity" options={options.storageCapacity} selected={filters.storageCapacity} onChange={updateFilter("storageCapacity")} />
            <Separator />
            <FilterSection label="Appliance Type" options={options.applianceType} selected={filters.applianceType} onChange={updateFilter("applianceType")} />
            <Separator />
            <FilterSection label="Activation Status" options={options.activationStatus} selected={filters.activationStatus} onChange={updateFilter("activationStatus")} />
            <Separator />
            <FilterSection label="Mapping Status" options={options.mappingStatus} selected={filters.mappingStatus} onChange={updateFilter("mappingStatus")} />
            <Separator />
            <FilterSection label="Internet Connectivity" options={options.internetConnectivity} selected={filters.internetConnectivity} onChange={updateFilter("internetConnectivity")} />
            <Separator />
            <FilterSection label="VPN Status" options={options.vpnStatus} selected={filters.vpnStatus} onChange={updateFilter("vpnStatus")} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

interface AppliedFilterPillsProps {
  filters: WireTAPFilters;
  onFiltersChange: (filters: WireTAPFilters) => void;
}

const filterLabels: Record<keyof WireTAPFilters, string> = {
  connectivityType: "Connectivity Type",
  theatreChain: "Theatre",
  storageCapacity: "Storage",
  applianceType: "Appliance Type",
  activationStatus: "Activation",
  mappingStatus: "Mapping",
  internetConnectivity: "Internet",
  vpnStatus: "VPN",
};

export const AppliedFilterPills = ({ filters, onFiltersChange }: AppliedFilterPillsProps) => {
  const hasFilters = Object.values(filters).some(arr => arr.length > 0);
  if (!hasFilters) return null;

  const removeFilter = (key: keyof WireTAPFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: filters[key].filter(v => v !== value),
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(filters) as (keyof WireTAPFilters)[]).map(key =>
        filters[key].map(value => (
          <Badge
            key={`${key}-${value}`}
            variant="secondary"
            className="flex items-center gap-1 pl-2 pr-1 py-1 cursor-pointer hover:bg-muted"
            onClick={() => removeFilter(key, value)}
          >
            <span className="text-xs">
              {filterLabels[key]}: {value}
            </span>
            <X className="h-3 w-3" />
          </Badge>
        ))
      )}
    </div>
  );
};
