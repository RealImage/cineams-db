import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { FilterDrawer, FilterGroup, useFilterDraft } from "@/components/ui/filter-drawer";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface IcountFilters {
  chain: string;
  location: string;
  updatedFrom?: Date;
  updatedTo?: Date;
}

export const emptyIcountFilters: IcountFilters = { chain: "all", location: "all" };

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  chains: string[];
  locations: string[];
  /** Applied filters; the drawer edits a draft copy until "Apply filters". */
  filters: IcountFilters;
  /** Called with the draft when "Apply filters" is pressed. */
  onChange: (next: IcountFilters) => void;
  onClear: () => void;
}

export const IcountFilterPanel = ({ open, onOpenChange, chains, locations, filters, onChange, onClear }: Props) => {
  const [draft, setDraft] = useFilterDraft(filters, open);
  const set = (patch: Partial<IcountFilters>) => setDraft((d) => ({ ...d, ...patch }));
  return (
    <FilterDrawer
      open={open}
      onOpenChange={onOpenChange}
      onApply={() => onChange(draft)}
      onClear={() => { setDraft(emptyIcountFilters); onClear(); }}
    >
      <FilterGroup title="Chain">
        <Combobox
          aria-label="Chain"
          value={draft.chain}
          onChange={(v) => set({ chain: v ?? "all" })}
          options={[{ value: "all", label: "All chains" }, ...chains.map((c) => ({ value: c, label: c }))]}
          searchPlaceholder="Search chains…"
        />
      </FilterGroup>
      <FilterGroup title="Location">
        <Combobox
          aria-label="Location"
          value={draft.location}
          onChange={(v) => set({ location: v ?? "all" })}
          options={[{ value: "all", label: "All locations" }, ...locations.map((l) => ({ value: l, label: l }))]}
          searchPlaceholder="Search locations…"
        />
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
