import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { FilterDrawer, FilterGroup, useFilterDraft } from "@/components/ui/filter-drawer";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface QubeAcsFilters {
  chain: string;
  location: string;
  updatedFrom?: Date;
  updatedTo?: Date;
}

export const emptyQubeAcsFilters: QubeAcsFilters = { chain: "all", location: "all" };

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  chains: string[];
  locations: string[];
  /** Applied filters; the drawer edits a draft copy until "Apply filters". */
  filters: QubeAcsFilters;
  /** Called with the draft when "Apply filters" is pressed. */
  onChange: (next: QubeAcsFilters) => void;
  onClear: () => void;
}

export const QubeAcsFilterPanel = ({ open, onOpenChange, chains, locations, filters, onChange, onClear }: Props) => {
  const [draft, setDraft] = useFilterDraft(filters, open);
  const set = (patch: Partial<QubeAcsFilters>) => setDraft((d) => ({ ...d, ...patch }));
  return (
    <FilterDrawer
      open={open}
      onOpenChange={onOpenChange}
      onApply={() => onChange(draft)}
      onClear={() => { setDraft(emptyQubeAcsFilters); onClear(); }}
    >
      <FilterGroup title="Chain">
        <Select value={draft.chain} onValueChange={(v) => set({ chain: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All chains</SelectItem>
            {chains.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </FilterGroup>
      <FilterGroup title="Location">
        <Select value={draft.location} onValueChange={(v) => set({ location: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            {locations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </FilterGroup>
      <FilterGroup title="Last updated">
        <div className="grid grid-cols-2 gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("justify-start text-left font-normal", !draft.updatedFrom && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {draft.updatedFrom ? format(draft.updatedFrom, "dd MMM yyyy") : "From"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={draft.updatedFrom} onSelect={(d) => set({ updatedFrom: d })} initialFocus className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("justify-start text-left font-normal", !draft.updatedTo && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {draft.updatedTo ? format(draft.updatedTo, "dd MMM yyyy") : "To"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={draft.updatedTo} onSelect={(d) => set({ updatedTo: d })} initialFocus className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
        </div>
      </FilterGroup>
    </FilterDrawer>
  );
};
