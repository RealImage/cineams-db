import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { FilterDrawer, FilterGroup, useFilterDraft } from "@/components/ui/filter-drawer";

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
  /** Applied filters. */
  filters: ProjectionFilters;
  /** The empty/default filter set, used to reset the draft on "Clear all". */
  defaultFilters: ProjectionFilters;
  onApply: (filters: ProjectionFilters) => void;
  onClear: () => void;
}

const qualityLabels = { within_limits: "Within recommended limits", outside_limits: "Outside recommended limits" };

export const ProjectionFilterPanel = ({
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
  const set = (key: keyof ProjectionFilters, value: string) => setDraft((prev) => ({ ...prev, [key]: value }));

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
      <FilterCombobox title="Chain" value={draft.chain} onChange={(v) => set("chain", v)} options={chains} />
      <FilterCombobox title="Location" value={draft.location} onChange={(v) => set("location", v)} options={locations} />
      <FilterSelect
        title="Score range"
        value={draft.scoreRange}
        onChange={(v) => set("scoreRange", v)}
        options={["good", "average", "poor"]}
        optionLabels={{ good: "Good (71-100)", average: "Average (41-70)", poor: "Poor (1-40)" }}
      />
      <FilterSelect
        title="Projection quality"
        value={draft.projectionQuality}
        onChange={(v) => set("projectionQuality", v)}
        options={["within_limits", "outside_limits"]}
        optionLabels={qualityLabels}
      />
      <FilterSelect
        title="Sound quality"
        value={draft.soundQuality}
        onChange={(v) => set("soundQuality", v)}
        options={["within_limits", "outside_limits"]}
        optionLabels={qualityLabels}
      />
    </FilterDrawer>
  );
};

/** Searchable variant for data-driven lists (chains, locations). */
const FilterCombobox = ({
  title, value, onChange, options,
}: {
  title: string; value: string; onChange: (v: string) => void; options: string[];
}) => (
  <FilterGroup title={title}>
    <Combobox
      aria-label={title}
      value={value}
      onChange={(v) => onChange(v ?? "all")}
      options={[{ value: "all", label: "All" }, ...options.map((o) => ({ value: o, label: o }))]}
      searchPlaceholder={`Search ${title.toLowerCase()}…`}
    />
  </FilterGroup>
);

const FilterSelect = ({
  title, value, onChange, options, optionLabels,
}: {
  title: string; value: string; onChange: (v: string) => void; options: string[]; optionLabels?: Record<string, string>;
}) => (
  <FilterGroup title={title}>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={title}><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>{optionLabels?.[o] ?? o}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </FilterGroup>
);
