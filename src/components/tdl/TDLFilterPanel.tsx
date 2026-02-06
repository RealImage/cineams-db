import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { X, Filter, RotateCcw, CalendarIcon } from "lucide-react";
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

interface TDLFilterPanelProps {
  devices: TDLDevice[];
  filters: TDLFilters;
  onFiltersChange: (filters: TDLFilters) => void;
}

const FILTER_LABELS: Record<string, string> = {
  manufacturer: "Manufacturer / Make",
  deviceRole: "Device Role",
  certificateAutoSync: "Certificate Auto-Sync",
  validTillFrom: "Valid From",
  validTillTo: "Valid Till",
  source: "Source",
  retired: "Retired Status",
  updatedFrom: "Updated From",
  updatedTo: "Updated To",
};

export const TDLFilterPanel = ({ devices, filters, onFiltersChange }: TDLFilterPanelProps) => {
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

  const handleChange = (key: keyof TDLFilters, value: string | Date | undefined) => {
    const next = { ...filters };
    if (value === undefined || value === "all") {
      delete next[key];
    } else {
      (next as any)[key] = value;
    }
    onFiltersChange(next);
  };

  const clearAll = () => onFiltersChange({});

  const removeFilter = (key: keyof TDLFilters) => {
    const next = { ...filters };
    delete next[key];
    onFiltersChange(next);
  };

  const activeCount = Object.keys(filters).length;

  const formatFilterValue = (key: string, value: any): string => {
    if (value instanceof Date) return format(value, "dd MMM yyyy");
    if (key === "certificateAutoSync") return value === "true" ? "Yes" : "No";
    if (key === "retired") return value === "true" ? "Yes" : "No";
    return String(value);
  };

  const DateRangePicker = ({
    label,
    fromKey,
    toKey,
    fromValue,
    toValue,
  }: {
    label: string;
    fromKey: keyof TDLFilters;
    toKey: keyof TDLFilters;
    fromValue?: Date;
    toValue?: Date;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("justify-start text-left font-normal text-xs h-9", !fromValue && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
              {fromValue ? format(fromValue, "dd MMM yyyy") : "From"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={fromValue}
              onSelect={(date) => handleChange(fromKey, date || undefined)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("justify-start text-left font-normal text-xs h-9", !toValue && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
              {toValue ? format(toValue, "dd MMM yyyy") : "To"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={toValue}
              onSelect={(date) => handleChange(toKey, date || undefined)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  const filterContent = (
    <div className="space-y-5 py-2">
      {/* Manufacturer / Make */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Manufacturer / Make</Label>
        <Select value={filters.manufacturer || "all"} onValueChange={(v) => handleChange("manufacturer", v)}>
          <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {getUniqueValues("manufacturer").map((v) => (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Device Role */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Device Role</Label>
        <Select value={filters.deviceRole || "all"} onValueChange={(v) => handleChange("deviceRole", v)}>
          <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {getUniqueValues("deviceRole").map((v) => (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Certificate Auto-Sync */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Certificate Auto-Sync</Label>
        <Select value={filters.certificateAutoSync || "all"} onValueChange={(v) => handleChange("certificateAutoSync", v)}>
          <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Yes</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Validity Ends Between */}
      <DateRangePicker
        label="Validity Ends Between"
        fromKey="validTillFrom"
        toKey="validTillTo"
        fromValue={filters.validTillFrom}
        toValue={filters.validTillTo}
      />

      {/* Source */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Source</Label>
        <Select value={filters.source || "all"} onValueChange={(v) => handleChange("source", v)}>
          <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {getUniqueValues("source").map((v) => (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Retired Status */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Retired Status</Label>
        <Select value={filters.retired || "all"} onValueChange={(v) => handleChange("retired", v)}>
          <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Yes</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Updated Between */}
      <DateRangePicker
        label="Updated Between"
        fromKey="updatedFrom"
        toKey="updatedTo"
        fromValue={filters.updatedFrom}
        toValue={filters.updatedTo}
      />

      <Separator />

      <Button variant="outline" className="w-full" onClick={clearAll}>
        <RotateCcw className="h-4 w-4 mr-2" /> Clear All Filters
      </Button>
    </div>
  );

  return { activeCount, filterContent, filters, removeFilter, formatFilterValue, clearAll };
};

interface TDLFilterBadgesProps {
  filters: TDLFilters;
  onRemove: (key: keyof TDLFilters) => void;
  onClearAll: () => void;
  formatValue: (key: string, value: any) => string;
}

export const TDLFilterBadges = ({ filters, onRemove, onClearAll, formatValue }: TDLFilterBadgesProps) => {
  const entries = Object.entries(filters);
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground font-medium">Active Filters:</span>
      {entries.map(([key, value]) => (
        <Badge key={key} variant="secondary" className="flex items-center gap-1 text-xs">
          {FILTER_LABELS[key] || key}: {formatValue(key, value)}
          <X
            className="h-3 w-3 cursor-pointer hover:text-destructive"
            onClick={() => onRemove(key as keyof TDLFilters)}
          />
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
