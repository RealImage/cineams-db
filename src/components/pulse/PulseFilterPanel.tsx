import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface PulseFilters {
  chain: string;
  location: string;
  updatedFrom?: Date;
  updatedTo?: Date;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  chains: string[];
  locations: string[];
  filters: PulseFilters;
  onChange: (next: PulseFilters) => void;
  onClear: () => void;
}

export const PulseFilterPanel = ({ open, onOpenChange, chains, locations, filters, onChange, onClear }: Props) => {
  const set = (patch: Partial<PulseFilters>) => onChange({ ...filters, ...patch });
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[320px] sm:w-[380px]">
        <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
        <div className="space-y-5 mt-6">
          <div className="space-y-2">
            <Label>Chain Name</Label>
            <Select value={filters.chain} onValueChange={(v) => set({ chain: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chains</SelectItem>
                {chains.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Select value={filters.location} onValueChange={(v) => set({ location: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Updated Between</Label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("justify-start text-left font-normal", !filters.updatedFrom && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.updatedFrom ? format(filters.updatedFrom, "dd MMM yyyy") : "From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={filters.updatedFrom} onSelect={(d) => set({ updatedFrom: d })} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("justify-start text-left font-normal", !filters.updatedTo && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.updatedTo ? format(filters.updatedTo, "dd MMM yyyy") : "To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={filters.updatedTo} onSelect={(d) => set({ updatedTo: d })} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={onClear}>Clear All Filters</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
