import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
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
        <Combobox
          aria-label="Chain name"
          value={draft.chain}
          onChange={(v) => set("chain", v ?? "all")}
          options={[{ value: "all", label: "All chains" }, ...chains.map((c) => ({ value: c, label: c }))]}
          placeholder="All chains"
          searchPlaceholder="Search chains…"
        />
      </FilterGroup>

      <FilterGroup title="Location">
        <Combobox
          aria-label="Location"
          value={draft.location}
          onChange={(v) => set("location", v ?? "all")}
          options={[{ value: "all", label: "All locations" }, ...locations.map((l) => ({ value: l, label: l }))]}
          placeholder="All locations"
          searchPlaceholder="Search locations…"
        />
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
