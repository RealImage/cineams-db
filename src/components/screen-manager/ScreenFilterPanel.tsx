
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface ScreenFilterPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chains: string[];
  locations: string[];
  filters: {
    chain: string;
    location: string;
    pulseStatus: string;
    lionisStatus: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onClear: () => void;
}

export const ScreenFilterPanel = ({
  open,
  onOpenChange,
  chains,
  locations,
  filters,
  onFilterChange,
  onClear,
}: ScreenFilterPanelProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[320px] sm:w-[380px]">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="space-y-5 mt-6">
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
            <Label>Location</Label>
            <Select value={filters.location} onValueChange={(v) => onFilterChange("location", v)}>
              <SelectTrigger><SelectValue placeholder="All Locations" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Pulse Installation</Label>
            <Select value={filters.pulseStatus} onValueChange={(v) => onFilterChange("pulseStatus", v)}>
              <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Lionis Installation</Label>
            <Select value={filters.lionisStatus} onValueChange={(v) => onFilterChange("lionisStatus", v)}>
              <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" className="w-full" onClick={onClear}>
            Clear All Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
