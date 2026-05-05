import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export interface ScreenDeviceFilters {
  location: string;
  chain: string;
  nameContains: string;
  suiteAvailability: "all" | "valid" | "invalid" | "multiple" | "none";
  screenExperience: "all" | "IAB" | "Atmos" | "IMAX" | "PLF";
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  chains: string[];
  locations: string[];
  filters: ScreenDeviceFilters;
  onChange: (next: ScreenDeviceFilters) => void;
  onClear: () => void;
}

export const ScreenDeviceFilterPanel = ({
  open,
  onOpenChange,
  chains,
  locations,
  filters,
  onChange,
  onClear,
}: Props) => {
  const set = (patch: Partial<ScreenDeviceFilters>) => onChange({ ...filters, ...patch });
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[320px] sm:w-[380px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="space-y-5 mt-6">
          <div className="space-y-2">
            <Label>Theatre Location (City, State, Country)</Label>
            <Select value={filters.location} onValueChange={(v) => set({ location: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Chain Name</Label>
            <Select value={filters.chain} onValueChange={(v) => set({ chain: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chains</SelectItem>
                {chains.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Theatre Name Contains</Label>
            <Input
              placeholder="e.g. Cinema City"
              value={filters.nameContains}
              onChange={(e) => set({ nameContains: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Suite Availability</Label>
            <Select
              value={filters.suiteAvailability}
              onValueChange={(v) => set({ suiteAvailability: v as ScreenDeviceFilters["suiteAvailability"] })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="valid">Screens with Valid Suites</SelectItem>
                <SelectItem value="invalid">Screens with Invalid Suites</SelectItem>
                <SelectItem value="multiple">Screens with Multiple Suites</SelectItem>
                <SelectItem value="none">Screens with No Suites</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Screen Experience</Label>
            <Select
              value={filters.screenExperience}
              onValueChange={(v) => set({ screenExperience: v as ScreenDeviceFilters["screenExperience"] })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Experiences</SelectItem>
                <SelectItem value="IAB">IAB</SelectItem>
                <SelectItem value="Atmos">Atmos</SelectItem>
                <SelectItem value="IMAX">IMAX</SelectItem>
                <SelectItem value="PLF">PLF</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="w-full" onClick={onClear}>Clear All Filters</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};