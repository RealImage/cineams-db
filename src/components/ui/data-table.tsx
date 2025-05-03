
import { useState, ReactNode, useEffect, useMemo, useCallback } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Download, 
  Search,
  SlidersHorizontal,
  FilterX,
  MoreHorizontal
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import debounce from 'lodash/debounce';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterOptions?: string[] | ((data: T[]) => string[]);
}

type SortDirection = 'asc' | 'desc' | null;

interface SortConfig<T> {
  key: keyof T | null;
  direction: SortDirection;
}

type Action<T> = {
  label: string;
  onClick: (row: T) => void;
  icon?: React.ReactNode;
};

interface Filter<T> {
  column: keyof T;
  value: string | string[];
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
  actions?: ((row: T) => Action<T>[]) | Action<T>[];
  pageSize?: number;
  serverSide?: boolean;
  totalCount?: number;
  onPaginationChange?: (page: number, pageSize: number) => void;
  onSearchChange?: (searchTerm: string) => void;
  onSortChange?: (sortKey: keyof T | null, direction: SortDirection) => void;
  onFilterChange?: (filters: Filter<T>[]) => void;
}

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
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({ key: null, direction: null });
  const [activeFilters, setActiveFilters] = useState<Filter<T>[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Debounce search changes to minimize unnecessary filtering operations
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      if (onSearchChange) {
        onSearchChange(term);
      }
      // Reset to first page when searching
      setCurrentPage(1);
    }, 300),
    [onSearchChange]
  );
  
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
    const validatedPage = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(validatedPage);
    
    if (serverSide && onPaginationChange) {
      onPaginationChange(validatedPage, rowsPerPage);
    }
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (newPageSize: number) => {
    setRowsPerPage(newPageSize);
    setCurrentPage(1); // Reset to first page
    
    if (serverSide && onPaginationChange) {
      onPaginationChange(1, newPageSize);
    }
  };
  
  // Handle sort change
  const handleSort = (column: Column<T>) => {
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
  const handleFilterChange = (column: keyof T, value: string | string[]) => {
    const newFilters = activeFilters.filter(filter => filter.column !== column);
    
    if (value !== "" && !(Array.isArray(value) && value.length === 0)) {
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
  const getFilterOptions = (column: Column<T>, columnKey: keyof T) => {
    if (!column.filterOptions) return [];

    if (typeof column.filterOptions === 'function') {
      return column.filterOptions(data);
    }
    
    return column.filterOptions;
  };
  
  // Get active filter count
  const getActiveFilterCount = () => activeFilters.length;
  
  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Show at most 5 page links
    
    if (totalPages <= maxPagesToShow) {
      // If we have fewer pages than the max, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      if (currentPage > 3) {
        pageNumbers.push("ellipsis-start");
      }
      
      // Show current page and surrounding pages
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pageNumbers.push("ellipsis-end");
      }
      
      // Always show last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };
  
  return (
    <div className="w-full space-y-4 animate-fade-in">
      {searchable && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
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
            <PopoverContent className="w-72 p-3" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  {getActiveFilterCount() > 0 && (
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
                <div className="space-y-2">
                  {columns
                    .filter(col => col.filterable)
                    .map((column, idx) => {
                      const columnKey = column.accessor as keyof T;
                      const filterOptions = getFilterOptions(column, columnKey);
                      const activeFilter = activeFilters.find(f => f.column === columnKey);
                      
                      return (
                        <div key={`filter-${idx}`} className="grid gap-1">
                          <label className="text-sm font-medium">{column.header}</label>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="justify-between w-full">
                                <span className="truncate">
                                  {activeFilter 
                                    ? Array.isArray(activeFilter.value)
                                      ? `${activeFilter.value.length} selected`
                                      : activeFilter.value
                                    : "Select..."}
                                </span>
                                <ChevronRight className="h-4 w-4 ml-2 -rotate-90" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="start">
                              {filterOptions.map((option) => (
                                <DropdownMenuCheckboxItem
                                  key={option}
                                  checked={activeFilter ? 
                                    Array.isArray(activeFilter.value) 
                                      ? activeFilter.value.includes(option)
                                      : activeFilter.value === option
                                    : false
                                  }
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      handleFilterChange(columnKey, option);
                                    } else if (activeFilter) {
                                      handleFilterChange(columnKey, "");
                                    }
                                  }}
                                >
                                  {option}
                                </DropdownMenuCheckboxItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      );
                    })}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Export <Download className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>CSV</DropdownMenuItem>
              <DropdownMenuItem>Excel</DropdownMenuItem>
              <DropdownMenuItem>PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      
      <div className="rounded-md border overflow-hidden animate-scale-in">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead 
                    key={index} 
                    className={`bg-muted/30 ${column.sortable ? 'cursor-pointer hover:bg-muted' : ''}`}
                    onClick={() => column.sortable && handleSort(column)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.header}</span>
                      {column.sortable && sortConfig.key === column.accessor && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
                {actions && <TableHead className="bg-muted/30 w-[60px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, rowIndex) => (
                  <TableRow 
                    key={row.id}
                    className={`${onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}`}
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    {columns.map((column, colIndex) => {
                      const accessorValue = typeof column.accessor === "function"
                        ? column.accessor(row)
                        : row[column.accessor as keyof T];
                        
                      return (
                        <TableCell key={`${row.id}-${colIndex}`}>
                          {column.cell 
                            ? column.cell(row)
                            : String(accessorValue || "")}
                        </TableCell>
                      );
                    })}
                    {actions && (
                      <TableCell className="p-2 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {getRowActions(row).map((action, i) => (
                              <DropdownMenuItem 
                                key={i}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  action.onClick(row);
                                }}
                              >
                                {action.icon && <span className="mr-2">{action.icon}</span>}
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {rowsPerPage} <ChevronRight className="ml-1 h-4 w-4 -rotate-90" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {[10, 25, 50, 100].map((size) => (
                  <DropdownMenuItem 
                    key={size}
                    onClick={() => handleRowsPerPageChange(size)}
                  >
                    {size}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto">
            <p className="text-sm text-muted-foreground mr-4">
              Showing {Math.min((currentPage - 1) * rowsPerPage + 1, totalItems)} to {Math.min(currentPage * rowsPerPage, totalItems)} of {totalItems} entries
            </p>
            
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {getPageNumbers().map((page, i) => {
                  if (page === "ellipsis-start" || page === "ellipsis-end") {
                    return (
                      <PaginationItem key={`ellipsis-${i}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  
                  return (
                    <PaginationItem key={`page-${page}`}>
                      <PaginationLink 
                        isActive={currentPage === page}
                        onClick={() => handlePageChange(page as number)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </div>
  );
}
