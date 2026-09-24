import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { FilterDrawer, FilterGroup, useFilterDraft } from "@/components/ui/filter-drawer";

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
  /** Applied filters. */
  filters: ScreenDeviceFilters;
  /** The empty/default filter set, used to reset the draft on "Clear all". */
  defaultFilters: ScreenDeviceFilters;
  onApply: (next: ScreenDeviceFilters) => void;
  onClear: () => void;
}

export const ScreenDeviceFilterPanel = ({
  open,
  onOpenChange,
  chains,
  locations,
  filters,
  defaultFilters,
  onApply,
  onClear,
}: Props) => {
  const [draft, setDraft] = useFilterDraft(filters, open);
  const set = (patch: Partial<ScreenDeviceFilters>) => setDraft((prev) => ({ ...prev, ...patch }));

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
      <FilterGroup title="Location">
        <Combobox
          aria-label="Theatre location (city, state, country)"
          value={draft.location}
          onChange={(v) => set({ location: v ?? "all" })}
          options={[{ value: "all", label: "All locations" }, ...locations.map((l) => ({ value: l, label: l }))]}
          searchPlaceholder="Search locations…"
        />
      </FilterGroup>
      <FilterGroup title="Chain">
        <Combobox
          aria-label="Chain name"
          value={draft.chain}
          onChange={(v) => set({ chain: v ?? "all" })}
          options={[{ value: "all", label: "All chains" }, ...chains.map((c) => ({ value: c, label: c }))]}
          searchPlaceholder="Search chains…"
        />
      </FilterGroup>
      <FilterGroup title="Theatre name">
        <Input
          aria-label="Theatre name contains"
          placeholder="Contains, e.g. Cinema City"
          value={draft.nameContains}
          onChange={(e) => set({ nameContains: e.target.value })}
        />
      </FilterGroup>
      <FilterGroup title="Suite availability">
        <Select
          value={draft.suiteAvailability}
          onValueChange={(v) => set({ suiteAvailability: v as ScreenDeviceFilters["suiteAvailability"] })}
        >
          <SelectTrigger aria-label="Suite availability"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="valid">Screens with valid suites</SelectItem>
            <SelectItem value="invalid">Screens with invalid suites</SelectItem>
            <SelectItem value="multiple">Screens with multiple suites</SelectItem>
            <SelectItem value="none">Screens with no suites</SelectItem>
          </SelectContent>
        </Select>
      </FilterGroup>
      <FilterGroup title="Screen experience">
        <Select
          value={draft.screenExperience}
          onValueChange={(v) => set({ screenExperience: v as ScreenDeviceFilters["screenExperience"] })}
        >
          <SelectTrigger aria-label="Screen experience"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All experiences</SelectItem>
            <SelectItem value="IAB">IAB</SelectItem>
            <SelectItem value="Atmos">Atmos</SelectItem>
            <SelectItem value="IMAX">IMAX</SelectItem>
            <SelectItem value="PLF">PLF</SelectItem>
          </SelectContent>
        </Select>
      </FilterGroup>
    </FilterDrawer>
  );
};
