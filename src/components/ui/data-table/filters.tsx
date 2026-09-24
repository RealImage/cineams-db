import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { FilterButton, FilterDrawer, FilterGroup, useFilterDraft } from "@/components/ui/filter-drawer";
import { cn } from "@/lib/utils";
import { Column, Filter } from "./types";

type FilterValue = Filter<unknown>["value"];
type DateRange = { from?: Date; to?: Date };

const isEmptyValue = (value: FilterValue) =>
  value === "" ||
  (Array.isArray(value) && value.length === 0) ||
  (typeof value === "object" && !Array.isArray(value) && !value.from && !value.to);

/** Set/replace one column's value in a filter list, dropping empty values. */
export function setFilterValue<T>(filters: Filter<T>[], column: keyof T, value: FilterValue): Filter<T>[] {
  const rest = filters.filter((f) => f.column !== column);
  return isEmptyValue(value) ? rest : [...rest, { column, value } as Filter<T>];
}

interface FiltersProps<T> {
  columns: Column<T>[];
  activeFilters: Filter<T>[];
  /** Commit a full set of filters (from Apply / Clear all). */
  applyFilters: (filters: Filter<T>[]) => void;
  getFilterOptions: (column: Column<T>, columnKey: keyof T) => string[];
}

const DateField = ({ label, value, onChange }: { label: string; value?: Date; onChange: (d?: Date) => void }) => (
  <div className="grid gap-1">
    <span className="text-xs text-muted-foreground">{label}</span>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("justify-start font-normal", !value && "text-muted-foreground")}>
          <CalendarIcon className="h-4 w-4" />
          {value ? format(value, "dd MMM yyyy") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} initialFocus />
      </PopoverContent>
    </Popover>
  </div>
);

/** DataTable's built-in column filters, in the standard right-hand FilterDrawer. */
export function Filters<T>({ columns, activeFilters, applyFilters, getFilterOptions }: FiltersProps<T>) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useFilterDraft(activeFilters, open);
  const [optionSearch, setOptionSearch] = useState<Record<string, string>>({});

  const setDraftValue = (column: keyof T, value: FilterValue) => setDraft((d) => setFilterValue(d, column, value));
  const filterable = columns.filter((c) => c.filterable);

  return (
    <>
      <FilterButton count={activeFilters.length} onClick={() => setOpen(true)} />
      <FilterDrawer
        open={open}
        onOpenChange={setOpen}
        onApply={() => applyFilters(draft)}
        onClear={() => { setDraft([]); applyFilters([]); }}
      >
        {filterable.map((column, idx) => {
          const columnKey = column.accessor as keyof T;
          const current = draft.find((f) => f.column === columnKey)?.value;

          if (column.filterType === "dateRange") {
            const range = (current as DateRange | undefined) ?? {};
            return (
              <FilterGroup key={idx} title={column.header}>
                <div className="grid grid-cols-2 gap-2">
                  <DateField label="From" value={range.from} onChange={(d) => setDraftValue(columnKey, { ...range, from: d })} />
                  <DateField label="To" value={range.to} onChange={(d) => setDraftValue(columnKey, { ...range, to: d })} />
                </div>
              </FilterGroup>
            );
          }

          const term = (optionSearch[String(columnKey)] ?? "").toLowerCase();
          const allOptions = getFilterOptions(column, columnKey);
          const options = term ? allOptions.filter((o) => o.toLowerCase().includes(term)) : allOptions;
          return (
            <FilterGroup key={idx} title={column.header}>
              {allOptions.length > 8 && (
                <Input
                  placeholder="Search options"
                  value={optionSearch[String(columnKey)] ?? ""}
                  onChange={(e) => setOptionSearch((s) => ({ ...s, [String(columnKey)]: e.target.value }))}
                />
              )}
              <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
                {options.map((option) => {
                  const checked = current === option;
                  return (
                    <label key={option} className="flex cursor-pointer items-center gap-2 rounded-sm px-1 py-1 text-sm hover:bg-black/[.03]">
                      <Checkbox checked={checked} onCheckedChange={() => setDraftValue(columnKey, checked ? "" : option)} />
                      <span className="truncate">{option}</span>
                    </label>
                  );
                })}
                {options.length === 0 && <p className="py-2 text-center text-sm text-muted-foreground">No matches</p>}
              </div>
            </FilterGroup>
          );
        })}
      </FilterDrawer>
    </>
  );
}
