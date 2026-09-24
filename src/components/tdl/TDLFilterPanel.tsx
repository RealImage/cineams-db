import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FilterDrawer, FilterGroup, useFilterDraft } from "@/components/ui/filter-drawer";
import { X, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TDLDevice } from "@/types";

export interface TDLFilters {
  manufacturer?: string;
  deviceRole?: string;
  certificateAutoSync?: string;
  validTillFrom?: Date;
  validTillTo?: Date;
  source?: string;
  retired?: string;
  updatedFrom?: Date;
  updatedTo?: Date;
}

const FILTER_LABELS: Record<string, string> = {
  manufacturer: "Manufacturer",
  deviceRole: "Device role",
  certificateAutoSync: "Certificate auto-sync",
  validTillFrom: "Valid till from",
  validTillTo: "Valid till to",
  source: "Source",
  retired: "Retired",
  updatedFrom: "Updated from",
  updatedTo: "Updated to",
};

export const formatTDLFilterValue = (key: string, value: unknown): string => {
  if (value instanceof Date) return format(value, "dd MMM yyyy");
  if (key === "certificateAutoSync") return value === "true" ? "Yes" : "No";
  if (key === "retired") return value === "true" ? "Yes" : "No";
  return String(value);
};

/** Set or remove a key ("all"/undefined removes it). */
const withFilter = (filters: TDLFilters, key: keyof TDLFilters, value: string | Date | undefined): TDLFilters => {
  const next = { ...filters };
  if (value === undefined || value === "all") {
    delete next[key];
  } else {
    (next as Record<string, string | Date>)[key] = value;
  }
  return next;
};

const DatePickerButton = ({
  value,
  placeholder,
  onChange,
}: {
  value?: Date;
  placeholder: string;
  onChange: (date: Date | undefined) => void;
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        className={cn("justify-start text-left font-normal text-xs h-9", !value && "text-muted-foreground")}
      >
        <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
        {value ? format(value, "dd MMM yyyy") : placeholder}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
      <Calendar mode="single" selected={value} onSelect={(date) => onChange(date || undefined)} initialFocus />
    </PopoverContent>
  </Popover>
);

interface TDLFilterPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  devices: TDLDevice[];
  /** Applied filters. */
  filters: TDLFilters;
  onApply: (filters: TDLFilters) => void;
  onClear: () => void;
}

export const TDLFilterPanel = ({ open, onOpenChange, devices, filters, onApply, onClear }: TDLFilterPanelProps) => {
  const [draft, setDraft] = useFilterDraft(filters, open);

  const getUniqueValues = (field: keyof TDLDevice): string[] => {
    const values = new Set<string>();
    devices.forEach((device) => {
      const value = device[field];
      if (value != null && typeof value === "string") {
        values.add(value);
      }
    });
    return Array.from(values).sort();
  };

  const handleChange = (key: keyof TDLFilters, value: string | Date | undefined) =>
    setDraft((prev) => withFilter(prev, key, value));

  const renderSelect = (key: "manufacturer" | "deviceRole" | "source", field: keyof TDLDevice) => (
    <Select value={draft[key] || "all"} onValueChange={(v) => handleChange(key, v)}>
      <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        {getUniqueValues(field).map((v) => (
          <SelectItem key={v} value={v}>{v}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const renderYesNo = (key: "certificateAutoSync" | "retired") => (
    <Select value={draft[key] || "all"} onValueChange={(v) => handleChange(key, v)}>
      <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        <SelectItem value="true">Yes</SelectItem>
        <SelectItem value="false">No</SelectItem>
      </SelectContent>
    </Select>
  );

  const renderDateRange = (fromKey: "validTillFrom" | "updatedFrom", toKey: "validTillTo" | "updatedTo") => (
    <div className="grid grid-cols-2 gap-2">
      <DatePickerButton value={draft[fromKey]} placeholder="From" onChange={(d) => handleChange(fromKey, d)} />
      <DatePickerButton value={draft[toKey]} placeholder="To" onChange={(d) => handleChange(toKey, d)} />
    </div>
  );

  return (
    <FilterDrawer
      open={open}
      onOpenChange={onOpenChange}
      onApply={() => onApply(draft)}
      onClear={() => {
        setDraft({});
        onClear();
      }}
    >
      <FilterGroup title="Manufacturer">{renderSelect("manufacturer", "manufacturer")}</FilterGroup>
      <FilterGroup title="Device role">{renderSelect("deviceRole", "deviceRole")}</FilterGroup>
      <FilterGroup title="Certificate auto-sync">{renderYesNo("certificateAutoSync")}</FilterGroup>
      <FilterGroup title="Valid till">{renderDateRange("validTillFrom", "validTillTo")}</FilterGroup>
      <FilterGroup title="Source">{renderSelect("source", "source")}</FilterGroup>
      <FilterGroup title="Retired">{renderYesNo("retired")}</FilterGroup>
      <FilterGroup title="Updated">{renderDateRange("updatedFrom", "updatedTo")}</FilterGroup>
    </FilterDrawer>
  );
};

interface TDLFilterBadgesProps {
  filters: TDLFilters;
  onRemove: (key: keyof TDLFilters) => void;
  onClearAll: () => void;
  formatValue?: (key: string, value: unknown) => string;
}

export const TDLFilterBadges = ({
  filters,
  onRemove,
  onClearAll,
  formatValue = formatTDLFilterValue,
}: TDLFilterBadgesProps) => {
  const entries = Object.entries(filters);
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground font-medium">Active filters</span>
      {entries.map(([key, value]) => (
        <Badge key={key} variant="secondary" className="flex items-center gap-1 text-xs">
          {FILTER_LABELS[key] || key}: {formatValue(key, value)}
          <button
            type="button"
            aria-label={`Remove ${FILTER_LABELS[key] || key} filter`}
            className="hover:text-destructive"
            onClick={() => onRemove(key as keyof TDLFilters)}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {entries.length > 1 && (
        <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={onClearAll}>
          Clear all
        </Button>
      )}
    </div>
  );
};
