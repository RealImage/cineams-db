
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { SlidersHorizontal, FilterX } from "lucide-react";
import { Column, Filter } from "./types";
import { format } from "date-fns";

interface FilterContentProps<T> {
  columns: Column<T>[];
  activeFilters: Filter<T>[];
  handleFilterChange: (column: keyof T, value: string | string[] | { from?: Date; to?: Date }) => void;
  clearAllFilters: () => void;
  getFilterOptions: (column: Column<T>, columnKey: keyof T) => string[];
}

interface FiltersProps<T> extends FilterContentProps<T> {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  useSheetFilter: boolean;
  getActiveFilterCount: () => number;
}

// Reusable filter content component
function FilterContent<T>({ 
  columns, 
  activeFilters, 
  handleFilterChange, 
  clearAllFilters, 
  getFilterOptions 
}: FilterContentProps<T>) {
  const [filterSearchTerms, setFilterSearchTerms] = useState<Record<string, string>>({});
  const [dateRanges, setDateRanges] = useState<Record<string, { from?: Date; to?: Date }>>({});
  
  // Filter options with search
  const getFilteredOptions = (column: Column<T>, columnKey: keyof T) => {
    const options = getFilterOptions(column, columnKey);
    const searchTerm = filterSearchTerms[columnKey.toString()] || '';
    
    if (!searchTerm) return options;
    
    return options.filter(option => 
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Filters</h4>
        {activeFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={clearAllFilters}
          >
            <FilterX className="h-3 w-3 mr-1" /> Clear all
          </Button>
        )}
      </div>
      <div className="space-y-4">
        {columns
          .filter(col => col.filterable)
          .map((column, idx) => {
            const columnKey = column.accessor as keyof T;
            const filterOptions = getFilterOptions(column, columnKey);
            const activeFilter = activeFilters.find(f => f.column === columnKey);
            const isDateRange = column.filterType === 'dateRange';
            
            return (
              <div key={`filter-${idx}`} className="grid gap-2">
                <label className="text-sm font-medium">{column.header}</label>
                
                {isDateRange ? (
                  // Date range filter
                  <div className="space-y-2">
                    <div className="grid gap-2">
                      <label className="text-xs text-muted-foreground">From Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="justify-start text-left font-normal">
                            {dateRanges[columnKey.toString()]?.from ? (
                              format(dateRanges[columnKey.toString()].from!, "dd MMM yyyy")
                            ) : (
                              <span className="text-muted-foreground">Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateRanges[columnKey.toString()]?.from}
                            onSelect={(date) => {
                              const newRange = {
                                ...dateRanges[columnKey.toString()],
                                from: date
                              };
                              setDateRanges(prev => ({
                                ...prev,
                                [columnKey.toString()]: newRange
                              }));
                              handleFilterChange(columnKey, newRange);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="grid gap-2">
                      <label className="text-xs text-muted-foreground">To Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="justify-start text-left font-normal">
                            {dateRanges[columnKey.toString()]?.to ? (
                              format(dateRanges[columnKey.toString()].to!, "dd MMM yyyy")
                            ) : (
                              <span className="text-muted-foreground">Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateRanges[columnKey.toString()]?.to}
                            onSelect={(date) => {
                              const newRange = {
                                ...dateRanges[columnKey.toString()],
                                to: date
                              };
                              setDateRanges(prev => ({
                                ...prev,
                                [columnKey.toString()]: newRange
                              }));
                              handleFilterChange(columnKey, newRange);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    {(dateRanges[columnKey.toString()]?.from || dateRanges[columnKey.toString()]?.to) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setDateRanges(prev => ({
                            ...prev,
                            [columnKey.toString()]: {}
                          }));
                          handleFilterChange(columnKey, "");
                        }}
                      >
                        Clear date range
                      </Button>
                    )}
                  </div>
                ) : (
                  // Select filter (existing functionality)
                  <>
                    {/* Search input for filter options */}
                    <Input 
                      placeholder="Search options..."
                      value={filterSearchTerms[columnKey.toString()] || ''}
                      onChange={(e) => {
                        setFilterSearchTerms(prev => ({
                          ...prev,
                          [columnKey.toString()]: e.target.value
                        }));
                      }}
                      className="mb-2"
                    />
                    
                    {/* Filter options list */}
                    <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                      {getFilteredOptions(column, columnKey).map((option) => (
                        <div 
                          key={option} 
                          className="flex items-center space-x-2 py-1 px-2 hover:bg-muted rounded-sm cursor-pointer"
                          onClick={() => {
                            const isSelected = activeFilter?.value === option;
                            handleFilterChange(columnKey, isSelected ? "" : option);
                          }}
                        >
                          <input 
                            type="checkbox" 
                            checked={activeFilter?.value === option}
                            readOnly
                            className="rounded"
                          />
                          <span className="text-sm">{option}</span>
                        </div>
                      ))}
                      
                      {getFilteredOptions(column, columnKey).length === 0 && (
                        <div className="text-sm text-muted-foreground p-2 text-center">
                          No matching options
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

export function Filters<T>({
  columns,
  activeFilters,
  handleFilterChange,
  clearAllFilters,
  getFilterOptions,
  showFilters,
  setShowFilters,
  useSheetFilter,
  getActiveFilterCount
}: FiltersProps<T>) {
  return (
    <>
      {useSheetFilter ? (
        // Sheet filter for mobile view
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <SlidersHorizontal className="h-4 w-4" />
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent 
                columns={columns}
                activeFilters={activeFilters}
                handleFilterChange={handleFilterChange}
                clearAllFilters={clearAllFilters}
                getFilterOptions={getFilterOptions}
              />
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        // Popover filter for desktop view
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <SlidersHorizontal className="h-4 w-4" />
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <FilterContent 
              columns={columns}
              activeFilters={activeFilters}
              handleFilterChange={handleFilterChange}
              clearAllFilters={clearAllFilters}
              getFilterOptions={getFilterOptions}
            />
          </PopoverContent>
        </Popover>
      )}
    </>
  );
}
