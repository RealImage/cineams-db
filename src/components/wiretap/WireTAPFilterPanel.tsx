import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterDrawer, FilterGroup, useFilterDraft } from "@/components/ui/filter-drawer";
import { X, Search } from "lucide-react";
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
  searchPlaceholder?: string;
}

const FilterSection = ({ label, options, selected, onChange, smartSearch, searchPlaceholder }: FilterSectionProps) => {
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
    <FilterGroup title={label}>
      {smartSearch && (
        <div className="relative">
          <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder ?? `Search ${label.toLowerCase()}...`}
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
    </FilterGroup>
  );
};

/** Number of applied filter values (for the toolbar FilterButton badge). */
export const countWireTAPFilters = (filters: WireTAPFilters) =>
  Object.values(filters).reduce((sum, arr) => sum + arr.length, 0);

interface WireTAPFilterPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  devices: WireTAPDevice[];
  /** Applied filters; the drawer edits a draft copy until "Apply filters". */
  filters: WireTAPFilters;
  onFiltersChange: (filters: WireTAPFilters) => void;
}

export const WireTAPFilterPanel = ({ open, onOpenChange, devices, filters, onFiltersChange }: WireTAPFilterPanelProps) => {
  const [draft, setDraft] = useFilterDraft(filters, open);

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
    setDraft(d => ({ ...d, [key]: values }));
  };

  const clearAll = () => {
    setDraft({ ...emptyFilters });
    onFiltersChange({ ...emptyFilters });
  };

  return (
    <FilterDrawer
      open={open}
      onOpenChange={onOpenChange}
      onApply={() => onFiltersChange(draft)}
      onClear={clearAll}
    >
      <FilterSection label="Connectivity type" options={options.connectivityType} selected={draft.connectivityType} onChange={updateFilter("connectivityType")} />
      <FilterSection label="Theatre" options={options.theatreChain} selected={draft.theatreChain} onChange={updateFilter("theatreChain")} smartSearch searchPlaceholder="Search theatres..." />
      <FilterSection label="Storage" options={options.storageCapacity} selected={draft.storageCapacity} onChange={updateFilter("storageCapacity")} />
      <FilterSection label="Appliance type" options={options.applianceType} selected={draft.applianceType} onChange={updateFilter("applianceType")} />
      <FilterSection label="Activation" options={options.activationStatus} selected={draft.activationStatus} onChange={updateFilter("activationStatus")} />
      <FilterSection label="Mapping" options={options.mappingStatus} selected={draft.mappingStatus} onChange={updateFilter("mappingStatus")} />
      <FilterSection label="Internet" options={options.internetConnectivity} selected={draft.internetConnectivity} onChange={updateFilter("internetConnectivity")} />
      <FilterSection label="VPN" options={options.vpnStatus} selected={draft.vpnStatus} onChange={updateFilter("vpnStatus")} />
    </FilterDrawer>
  );
};

interface AppliedFilterPillsProps {
  filters: WireTAPFilters;
  onFiltersChange: (filters: WireTAPFilters) => void;
}

const filterLabels: Record<keyof WireTAPFilters, string> = {
  connectivityType: "Connectivity type",
  theatreChain: "Theatre",
  storageCapacity: "Storage",
  applianceType: "Appliance type",
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
