
import { useState, useEffect, useMemo, useRef } from "react";
import { Table } from "@/components/ui/table";
import { DataTableHeader } from "./table-header";
import { DataTableBody } from "./table-body";
import { SearchExport } from "./search-export";
import { Filters } from "./filters";
import { PaginationControls } from "./pagination";
import { DataTableProps, Action, Filter, SortDirection, SortConfig } from "./types";
import debounce from 'lodash/debounce';

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = "Search...",
  onRowClick,
  actions,
  pageSize = 10,
  serverSide = false,
  totalCount,
  onPaginationChange,
  onSearchChange,
  onSortChange,
  onFilterChange,
  showFilters = true,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({ key: null, direction: null });
  const [activeFilters, setActiveFilters] = useState<Filter<T>[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [useSheetFilter, setUseSheetFilter] = useState(window.innerWidth < 768);
  
  // Keep the latest onSearchChange without recreating the debounced function
  const onSearchChangeRef = useRef<typeof onSearchChange>(onSearchChange);
  useEffect(() => {
    onSearchChangeRef.current = onSearchChange;
  }, [onSearchChange]);

  // Debounce search changes to minimize unnecessary filtering operations
  const debouncedSearch = useMemo(
    () =>
      debounce((term: string) => {
        onSearchChangeRef.current?.(term);
        // Reset to first page when searching
        setCurrentPage(1);
      }, 300),
    []
  );

  // Cleanup any pending debounced calls on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Handle search changes
  useEffect(() => {
    if (serverSide) {
      debouncedSearch(searchTerm);
    } else {
      // Reset to first page when search term changes for client-side filtering
      setCurrentPage(1);
    }
  }, [searchTerm, serverSide, debouncedSearch]);

  // Filtering function for client-side filtering
  const filteredData = useMemo(() => {
    if (serverSide) return data; // Server handles filtering
    
    let filtered = [...data];
    
    // Apply text search
    if (searchTerm) {
      filtered = filtered.filter((item) => {
        return Object.entries(item).some(([key, value]) => {
          // Only search through string values
          return typeof value === "string" && 
                 value.toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }
    
    // Apply active filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter(item => {
        return activeFilters.every(filter => {
          const columnValue = item[filter.column];
          
          // Handle date range filtering
          if (typeof filter.value === 'object' && !Array.isArray(filter.value)) {
            const dateRange = filter.value as { from?: Date; to?: Date };
            const itemDate = new Date(columnValue as string);
            
            if (dateRange.from && dateRange.to) {
              return itemDate >= dateRange.from && itemDate <= dateRange.to;
            } else if (dateRange.from) {
              return itemDate >= dateRange.from;
            } else if (dateRange.to) {
              return itemDate <= dateRange.to;
            }
            return true;
          }
          
          if (Array.isArray(filter.value)) {
            if (Array.isArray(columnValue)) {
              return filter.value.some(v => columnValue.includes(v));
            } else {
              return filter.value.includes(String(columnValue));
            }
          } else {
            return String(columnValue) === filter.value;
          }
        });
      });
    }
    
    // Apply sorting if configured
    if (sortConfig.key && sortConfig.direction) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof T];
        const bValue = b[sortConfig.key as keyof T];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  }, [data, searchTerm, sortConfig, activeFilters, serverSide]);
  
  // Calculate pagination values
  const totalItems = serverSide ? totalCount || 0 : filteredData.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  
  const paginatedData = useMemo(() => {
    if (serverSide) return data;
    
    return filteredData.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }, [filteredData, currentPage, rowsPerPage, serverSide, data]);
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    // Prevent a pending debounced search from snapping back to page 1
    if (serverSide) {
      debouncedSearch.cancel();
    }

    const validatedPage = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(validatedPage);
    
    if (serverSide && onPaginationChange) {
      onPaginationChange(validatedPage, rowsPerPage);
    }
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (newPageSize: number) => {
    if (serverSide) {
      debouncedSearch.cancel();
    }

    setRowsPerPage(newPageSize);
    setCurrentPage(1); // Reset to first page
    
    if (serverSide && onPaginationChange) {
      onPaginationChange(1, newPageSize);
    }
  };
  
  // Handle sort change
  const handleSort = (column: typeof columns[0]) => {
    if (!column.sortable) return;
    
    const accessor = column.accessor as keyof T;
    let direction: SortDirection = 'asc';
    
    if (sortConfig.key === accessor) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }
    
    const newSortConfig: SortConfig<T> = {
      key: direction ? accessor : null,
      direction
    };
    
    setSortConfig(newSortConfig);
    
    if (serverSide && onSortChange) {
      onSortChange(newSortConfig.key, newSortConfig.direction);
    }
  };
  
  // Handle filter change
  const handleFilterChange = (column: keyof T, value: string | string[] | { from?: Date; to?: Date }) => {
    const newFilters = activeFilters.filter(filter => filter.column !== column);
    
    if (value !== "" && !(Array.isArray(value) && value.length === 0) && 
        !(typeof value === 'object' && !Array.isArray(value) && !value.from && !value.to)) {
      newFilters.push({ column, value });
    }
    
    setActiveFilters(newFilters);
    
    if (serverSide && onFilterChange) {
      onFilterChange(newFilters);
    }
    
    // Reset to first page when filter changes
    setCurrentPage(1);
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters([]);
    if (serverSide && onFilterChange) {
      onFilterChange([]);
    }
  };
  
  // Get row actions
  const getRowActions = (row: T) => {
    if (!actions) return [];
    return typeof actions === 'function' ? actions(row) : actions;
  };
  
  // Generate filter options for a column
  const getFilterOptions = (column: typeof columns[0], columnKey: keyof T) => {
    if (!column.filterOptions) return [];

    if (typeof column.filterOptions === 'function') {
      return column.filterOptions(data);
    }
    
    return column.filterOptions;
  };
  
  // Get active filter count
  const getActiveFilterCount = () => activeFilters.length;
  
  // Check screen size to determine filter UI type
  useEffect(() => {
    const handleResize = () => {
      setUseSheetFilter(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Show actions column flag
  const showActions = Boolean(actions && actions.length > 0);
  
  return (
    <div className="w-full space-y-4 animate-fade-in">
      {searchable && (
        <SearchExport
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchPlaceholder={searchPlaceholder}
        >
          {showFilters && (
            <Filters
              columns={columns}
              activeFilters={activeFilters}
              handleFilterChange={handleFilterChange}
              clearAllFilters={clearAllFilters}
              getFilterOptions={getFilterOptions}
              showFilters={filtersOpen}
              setShowFilters={setFiltersOpen}
              useSheetFilter={useSheetFilter}
              getActiveFilterCount={getActiveFilterCount}
            />
          )}
        </SearchExport>
      )}
      
      <div className="rounded-md border overflow-hidden animate-scale-in">
        <div className="overflow-x-auto">
          <Table>
            <DataTableHeader
              columns={columns}
              sortConfig={sortConfig}
              onSort={handleSort}
              showActions={showActions}
            />
            <DataTableBody
              data={paginatedData}
              columns={columns}
              onRowClick={onRowClick}
              getRowActions={getRowActions}
              showActions={showActions}
            />
          </Table>
        </div>
      </div>
      
      {totalPages > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          rowsPerPage={rowsPerPage}
          handlePageChange={handlePageChange}
          handleRowsPerPageChange={handleRowsPerPageChange}
        />
      )}
    </div>
  );
}
