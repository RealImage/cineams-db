
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export interface ProjectionFilters {
  chain: string;
  location: string;
  scoreRange: string;
  projectionQuality: string;
  soundQuality: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chains: string[];
  locations: string[];
  filters: ProjectionFilters;
  onFilterChange: (key: string, value: string) => void;
  onClear: () => void;
}

export const ProjectionFilterPanel = ({ open, onOpenChange, chains, locations, filters, onFilterChange, onClear }: Props) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="right" className="w-[320px] sm:w-[380px] overflow-y-auto">
      <SheetHeader>
        <SheetTitle>Filter Screens</SheetTitle>
      </SheetHeader>
      <div className="space-y-5 mt-6">
        <FilterSelect label="Chain Name" value={filters.chain} onChange={(v) => onFilterChange("chain", v)} options={chains} />
        <FilterSelect label="Location" value={filters.location} onChange={(v) => onFilterChange("location", v)} options={locations} />
        <FilterSelect
          label="Score Range"
          value={filters.scoreRange}
          onChange={(v) => onFilterChange("scoreRange", v)}
          options={["good", "average", "poor"]}
          optionLabels={{ good: "Good (71-100)", average: "Average (41-70)", poor: "Poor (1-40)" }}
        />
        <FilterSelect
          label="Projection Quality"
          value={filters.projectionQuality}
          onChange={(v) => onFilterChange("projectionQuality", v)}
          options={["within_limits", "outside_limits"]}
          optionLabels={{ within_limits: "Within Recommended Limits", outside_limits: "Outside Recommended Limits" }}
        />
        <FilterSelect
          label="Sound Quality"
          value={filters.soundQuality}
          onChange={(v) => onFilterChange("soundQuality", v)}
          options={["within_limits", "outside_limits"]}
          optionLabels={{ within_limits: "Within Recommended Limits", outside_limits: "Outside Recommended Limits" }}
        />
        <Button variant="outline" className="w-full" onClick={onClear}>Clear All Filters</Button>
      </div>
    </SheetContent>
  </Sheet>
);

const FilterSelect = ({
  label, value, onChange, options, optionLabels,
}: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; optionLabels?: Record<string, string>;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium">{label}</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>{optionLabels?.[o] ?? o}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
