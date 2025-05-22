import { useState, useCallback, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Column } from "@/components/ui/data-table"; // Import Column type from data-table
import { Theatre } from "@/types";
import { useTheatreColumns, useEnhancedColumns } from "./TheatreColumns";
import { getTheatreActions, useTheatreActions } from "./TheatreActions";

type TheatreTableProps = {
  theatres: Theatre[];
  onViewTheatre: (theatre: Theatre) => void;
  onViewLogs: (theatre: Theatre) => void;
  onToggleStatus: (theatre: Theatre) => void;
  onDelete: (theatre: Theatre) => void;
};

export const TheatreTable = ({
  theatres,
  onViewTheatre,
  onViewLogs,
  onToggleStatus,
  onDelete
}: TheatreTableProps) => {
  const [filteredTheatres, setFilteredTheatres] = useState<Theatre[]>([]);
  const [totalTheatres, setTotalTheatres] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [paginationState, setPaginationState] = useState({
    page: 1,
    pageSize: 10,
    searchTerm: "",
    sortColumn: "",
    sortDirection: null as "asc" | "desc" | null,
    filters: [] as any[]
  });
  
  const columns = useTheatreColumns();
  const enhancedColumns = useEnhancedColumns(columns);
  const { handleEditTheatre } = useTheatreActions();
  
  // Handle pagination change
  const handlePaginationChange = (page: number, pageSize: number) => {
    setPaginationState(prev => ({
      ...prev,
      page,
      pageSize
    }));
  };
  
  // Handle search change
  const handleSearchChange = (searchTerm: string) => {
    setPaginationState(prev => ({
      ...prev,
      searchTerm,
      page: 1 // Reset to first page on new search
    }));
  };
  
  // Handle sort change
  const handleSortChange = (sortColumn: keyof Theatre | null, sortDirection: "asc" | "desc" | null) => {
    setPaginationState(prev => ({
      ...prev,
      sortColumn: sortColumn as string,
      sortDirection,
      page: 1 // Reset to first page on sort change
    }));
  };
  
  // Handle filter change
  const handleFilterChange = (filters: any[]) => {
    setPaginationState(prev => ({
      ...prev,
      filters,
      page: 1 // Reset to first page on filter change
    }));
  };
  
  // Fetch data based on pagination, filtering, and sorting
  const fetchData = useCallback(() => {
    setLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      // Apply search filtering
      let filtered = [...theatres];
      
      if (paginationState.searchTerm) {
        filtered = filtered.filter(theatre => {
          return (
            theatre.name.toLowerCase().includes(paginationState.searchTerm.toLowerCase()) ||
            theatre.displayName.toLowerCase().includes(paginationState.searchTerm.toLowerCase()) ||
            theatre.chainName.toLowerCase().includes(paginationState.searchTerm.toLowerCase()) ||
            theatre.companyName.toLowerCase().includes(paginationState.searchTerm.toLowerCase()) ||
            theatre.address.toLowerCase().includes(paginationState.searchTerm.toLowerCase())
          );
        });
      }
      
      // Apply filters
      if (paginationState.filters.length > 0) {
        filtered = filtered.filter(theatre => {
          return paginationState.filters.every(filter => {
            const { column, value } = filter;
            
            if (column === "status") {
              return theatre.status === value;
            }
            
            if (column === "screenCount") {
              const count = parseInt(value as string, 10);
              return theatre.screenCount === count;
            }
            
            if (column === "chainName") {
              return theatre.chainName === value;
            }
            
            if (column === "companyName") {
              return theatre.companyName === value;
            }
            
            return true;
          });
        });
      }
      
      // Apply sorting
      if (paginationState.sortColumn && paginationState.sortDirection) {
        filtered.sort((a, b) => {
          const aValue = a[paginationState.sortColumn as keyof Theatre];
          const bValue = b[paginationState.sortColumn as keyof Theatre];
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return paginationState.sortDirection === 'asc'
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          }
          
          if (aValue < bValue) return paginationState.sortDirection === 'asc' ? -1 : 1;
          if (aValue > bValue) return paginationState.sortDirection === 'asc' ? 1 : -1;
          return 0;
        });
      }
      
      // Store the total for pagination
      setTotalTheatres(filtered.length);
      
      // Apply pagination 
      const start = (paginationState.page - 1) * paginationState.pageSize;
      const paginatedResults = filtered.slice(
        start, 
        start + paginationState.pageSize
      );
      
      setFilteredTheatres(paginatedResults);
      setLoading(false);
    }, 300);
  }, [theatres, paginationState]);
  
  // Fetch data whenever pagination state changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const getActionsForTheatre = (theatre: Theatre) => {
    return getTheatreActions({
      theatre,
      onViewDetails: onViewTheatre,
      onViewLogs: onViewLogs,
      onEdit: handleEditTheatre,
      onDelete: onDelete,
      onToggleStatus: onToggleStatus
    });
  };
  
  return (
    <DataTable
      data={filteredTheatres}
      columns={enhancedColumns}
      searchPlaceholder="Search theatres by name, chain, company, location..."
      actions={(row) => getActionsForTheatre(row)}
      onRowClick={onViewTheatre}
      serverSide={true}
      totalCount={totalTheatres}
      onPaginationChange={handlePaginationChange}
      onSearchChange={handleSearchChange}
      onSortChange={handleSortChange}
      onFilterChange={handleFilterChange}
      pageSize={10}
    />
  );
};
