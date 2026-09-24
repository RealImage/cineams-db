import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterDrawer, FilterGroup, useFilterDraft } from "@/components/ui/filter-drawer";

export interface ScreenFilters {
  chain: string;
  location: string;
  pulseStatus: string;
  lionisStatus: string;
}

interface ScreenFilterPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chains: string[];
  locations: string[];
  /** Applied filters. */
  filters: ScreenFilters;
  /** The empty/default filter set, used to reset the draft on "Clear all". */
  defaultFilters: ScreenFilters;
  onApply: (filters: ScreenFilters) => void;
  onClear: () => void;
}

export const ScreenFilterPanel = ({
  open,
  onOpenChange,
  chains,
  locations,
  filters,
  defaultFilters,
  onApply,
  onClear,
}: ScreenFilterPanelProps) => {
  const [draft, setDraft] = useFilterDraft(filters, open);
  const set = (key: keyof ScreenFilters, value: string) => setDraft((prev) => ({ ...prev, [key]: value }));

  return (
    <FilterDrawer
      open={open}
      onOpenChange={onOpenChange}
      onApply={() => onApply(draft)}
      onClear={() => {
        setDraft(defaultFilters);
        onClear();
      }}
    >
      <FilterGroup title="Chain">
        <Select value={draft.chain} onValueChange={(v) => set("chain", v)}>
          <SelectTrigger aria-label="Chain name"><SelectValue placeholder="All chains" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All chains</SelectItem>
            {chains.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterGroup>

      <FilterGroup title="Location">
        <Select value={draft.location} onValueChange={(v) => set("location", v)}>
          <SelectTrigger aria-label="Location"><SelectValue placeholder="All locations" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            {locations.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterGroup>

      <FilterGroup title="Pulse installation">
        <Select value={draft.pulseStatus} onValueChange={(v) => set("pulseStatus", v)}>
          <SelectTrigger aria-label="Pulse installation"><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      </FilterGroup>

      <FilterGroup title="Lionis installation">
        <Select value={draft.lionisStatus} onValueChange={(v) => set("lionisStatus", v)}>
          <SelectTrigger aria-label="Lionis installation"><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      </FilterGroup>
    </FilterDrawer>
  );
};
