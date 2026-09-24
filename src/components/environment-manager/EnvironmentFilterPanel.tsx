import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterDrawer, FilterGroup, useFilterDraft } from "@/components/ui/filter-drawer";
import { scoreRangeBins } from "@/data/environmentManagerData";

export interface EnvironmentFilters {
  chain: string;
  scoreRange: string;
  onTemperature: string;
  onHumidity: string;
  onDust: string;
  offTemperature: string;
  offHumidity: string;
  offDust: string;
}

const ratingOptions = [
  { value: "all", label: "All" },
  { value: "within_theatre_baseline", label: "Within theatre baseline" },
  { value: "within_recommended_baseline", label: "Within recommended baseline" },
];

type RatingKey = "onTemperature" | "onHumidity" | "onDust" | "offTemperature" | "offHumidity" | "offDust";

const ratingGroups: { key: RatingKey; title: string }[] = [
  { key: "onTemperature", title: "On temperature" },
  { key: "onHumidity", title: "On humidity" },
  { key: "onDust", title: "On dust" },
  { key: "offTemperature", title: "Off temperature" },
  { key: "offHumidity", title: "Off humidity" },
  { key: "offDust", title: "Off dust" },
];

interface EnvironmentFilterPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chains: string[];
  /** Applied filters. */
  filters: EnvironmentFilters;
  /** The empty/default filter set, used to reset the draft on "Clear all". */
  defaultFilters: EnvironmentFilters;
  onApply: (filters: EnvironmentFilters) => void;
  onClear: () => void;
}

export const EnvironmentFilterPanel = ({
  open,
  onOpenChange,
  chains,
  filters,
  defaultFilters,
  onApply,
  onClear,
}: EnvironmentFilterPanelProps) => {
  const [draft, setDraft] = useFilterDraft(filters, open);
  const set = (key: keyof EnvironmentFilters, value: string) => setDraft((prev) => ({ ...prev, [key]: value }));

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

      <FilterGroup title="Score range">
        <Select value={draft.scoreRange} onValueChange={(v) => set("scoreRange", v)}>
          <SelectTrigger aria-label="Score range"><SelectValue placeholder="All ranges" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ranges</SelectItem>
            {scoreRangeBins.map((b) => (
              <SelectItem key={b.label} value={b.label}>{b.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterGroup>

      {ratingGroups.map(({ key, title }) => (
        <FilterGroup key={key} title={title}>
          <Select value={draft[key]} onValueChange={(v) => set(key, v)}>
            <SelectTrigger aria-label={title}><SelectValue /></SelectTrigger>
            <SelectContent>
              {ratingOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterGroup>
      ))}
    </FilterDrawer>
  );
};
