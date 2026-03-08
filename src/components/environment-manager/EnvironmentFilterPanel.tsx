
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { scoreRangeBins } from "@/data/environmentManagerData";

export interface EnvironmentFilters {
  chain: string;
  scoreRange: string;
  onTemperature: string;
  onHumidity: string;
  onDust: string;
  offTemperature: string;
  offHumidity: string;
  offDust: string;
}

const ratingOptions = [
  { value: "all", label: "All" },
  { value: "within_theatre_baseline", label: "Within Theatre Baseline" },
  { value: "within_recommended_baseline", label: "Within Recommended Baseline" },
];

interface EnvironmentFilterPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chains: string[];
  filters: EnvironmentFilters;
  onFilterChange: (key: string, value: string) => void;
  onClear: () => void;
}

export const EnvironmentFilterPanel = ({
  open,
  onOpenChange,
  chains,
  filters,
  onFilterChange,
  onClear,
}: EnvironmentFilterPanelProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[320px] sm:w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label>Chain Name</Label>
            <Select value={filters.chain} onValueChange={(v) => onFilterChange("chain", v)}>
              <SelectTrigger><SelectValue placeholder="All Chains" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chains</SelectItem>
                {chains.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Score Range</Label>
            <Select value={filters.scoreRange} onValueChange={(v) => onFilterChange("scoreRange", v)}>
              <SelectTrigger><SelectValue placeholder="All Ranges" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ranges</SelectItem>
                {scoreRangeBins.map((b) => (
                  <SelectItem key={b.label} value={b.label}>{b.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-semibold mb-3">ON Ratings</p>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Temperature</Label>
                <Select value={filters.onTemperature} onValueChange={(v) => onFilterChange("onTemperature", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ratingOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Humidity</Label>
                <Select value={filters.onHumidity} onValueChange={(v) => onFilterChange("onHumidity", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ratingOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Dust</Label>
                <Select value={filters.onDust} onValueChange={(v) => onFilterChange("onDust", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ratingOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-semibold mb-3">OFF Ratings</p>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Temperature</Label>
                <Select value={filters.offTemperature} onValueChange={(v) => onFilterChange("offTemperature", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ratingOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Humidity</Label>
                <Select value={filters.offHumidity} onValueChange={(v) => onFilterChange("offHumidity", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ratingOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Dust</Label>
                <Select value={filters.offDust} onValueChange={(v) => onFilterChange("offDust", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ratingOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={onClear}>
            Clear All Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
