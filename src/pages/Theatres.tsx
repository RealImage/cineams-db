import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye, Calendar, User, Tag, Film, Activity, ToggleLeft, ToggleRight } from "lucide-react";
import { theatres as mockTheatres } from "@/data/mockData";
import { Screen, Theatre } from "@/types";
import { TheatreDialog } from "@/components/TheatreDialog";
import { AddTheatreDialog } from "@/components/AddTheatreDialog";
import { ViewTheatreDialog } from "@/components/ViewTheatreDialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { TheatreLogsDialog } from "@/components/TheatreLogsDialog";
import { DeleteTheatreDialog } from "@/components/DeleteTheatreDialog";

const Theatres = () => {
  const [theatres, setTheatres] = useState<Theatre[]>(mockTheatres);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTheatre, setEditingTheatre] = useState<Theatre | undefined>(undefined);
  const [viewingTheatre, setViewingTheatre] = useState<Theatre | undefined>(undefined);
  const [selectedTheatre, setSelectedTheatre] = useState<Theatre | undefined>(undefined);
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
  
  useEffect(() => {
    setLoading(true);
    
    // In a real app, you would fetch data here with proper parameters
    const fetchTheatres = () => {
      // Simulate network delay
      setTimeout(() => {
        // Apply search filtering
        let filtered = [...mockTheatres];
        
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
    };
    
    fetchTheatres();
  }, [paginationState]);
  
  const handleCreateTheatre = () => {
    setEditingTheatre(undefined);
    setAddDialogOpen(true);
  };
  
  const handleEditTheatre = (theatre: Theatre) => {
    const editUrl = `/theatre/${theatre.id}/edit`;
    window.open(editUrl, '_blank');
  };
  
  const handleViewTheatre = (theatre: Theatre) => {
    setViewingTheatre(theatre);
    setViewDialogOpen(true);
  };

  const handleViewLogs = (theatre: Theatre) => {
    setSelectedTheatre(theatre);
    setLogsDialogOpen(true);
  };
  
  const handleSaveTheatre = (theatreData: Partial<Theatre>) => {
    if (editingTheatre) {
      setTheatres(
        theatres.map((t) => 
          t.id === editingTheatre.id ? { ...t, ...theatreData, updatedAt: new Date().toISOString() } as Theatre : t
        )
      );
    } else {
      const newTheatre: Theatre = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...theatreData,
      } as Theatre;
      
      setTheatres([newTheatre, ...theatres]);
    }
  };
  
  const handleDeleteTheatre = (theatre: Theatre) => {
    setSelectedTheatre(theatre);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteTheatre = () => {
    if (selectedTheatre) {
      setTheatres(theatres.filter((t) => t.id !== selectedTheatre.id));
      toast.success(`Theatre "${selectedTheatre.name}" deleted successfully`);
      setDeleteDialogOpen(false);
    }
  };
  
  const handleToggleStatus = (theatre: Theatre) => {
    const newStatus = theatre.status === "Active" ? "Inactive" : "Active";
    const updatedTheatres = theatres.map((t) => 
      t.id === theatre.id ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } as Theatre : t
    );
    
    setTheatres(updatedTheatres);
    toast.success(`Theatre "${theatre.name}" ${newStatus === "Active" ? "activated" : "deactivated"} successfully`);
  };
  
  const columns: Column<Theatre>[] = [
    {
      header: "Theatre Name",
      accessor: "name" as keyof Theatre
    },
    {
      header: "Display Name",
      accessor: "displayName" as keyof Theatre
    },
    {
      header: "Chain Name",
      accessor: "chainName" as keyof Theatre
    },
    {
      header: "Company",
      accessor: "companyName" as keyof Theatre
    },
    {
      header: "Location",
      accessor: "address" as keyof Theatre,
      cell: (row: Theatre) => {
        const addressParts = row.address.split(',').map(part => part.trim());
        const location = addressParts.length >= 3 
          ? `${addressParts[addressParts.length - 3]}, ${addressParts[addressParts.length - 2]}, ${addressParts[addressParts.length - 1]}`
          : row.address;
        
        return (
          <span className="truncate max-w-[200px] block" title={row.address}>
            {location}
          </span>
        );
      }
    },
    {
      header: "Status",
      accessor: "status" as keyof Theatre,
      cell: (row: Theatre) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.status === "Active" 
            ? "bg-green-100 text-green-800" 
            : row.status === "Inactive" 
              ? "bg-yellow-100 text-yellow-800" 
              : "bg-red-100 text-red-800"
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: "Ad Integrators",
      accessor: "adIntegrators" as keyof Theatre,
      cell: (row: Theatre) => {
        const adIntegrators = ["Screenvision", "NCM", "Spotlight Cinema"];
        
        return (
          <div className="space-y-1">
            {adIntegrators.length > 0 ? (
              <div className="flex flex-col gap-1">
                {adIntegrators.map((integrator, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {integrator}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground text-xs">None</span>
            )}
          </div>
        );
      }
    },
    {
      header: "WireTAP",
      accessor: "wireTap" as keyof Theatre,
      cell: (row: Theatre) => {
        const wireTapSerials = ["WT8273891", "WT9264719"];
        
        return (
          <div className="space-y-1">
            {wireTapSerials.length > 0 ? (
              <div className="flex flex-col gap-1">
                {wireTapSerials.map((serial, i) => (
                  <span key={i} className="text-xs font-mono">
                    {serial}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground text-xs">None</span>
            )}
          </div>
        );
      }
    },
    {
      header: "Screens",
      accessor: "screenCount" as keyof Theatre,
      cell: (row: Theatre) => (
        <div className="flex items-center">
          <Film className="h-4 w-4 mr-1 text-muted-foreground" />
          <span>{row.screenCount}</span>
        </div>
      )
    },
    {
      header: "Last Updated",
      accessor: "updatedAt" as keyof Theatre,
      cell: (row: Theatre) => (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
          <span className="text-sm">
            {new Date(row.updatedAt).toLocaleDateString()}
          </span>
        </div>
      )
    },
    {
      header: "Updated By",
      accessor: "updatedBy" as keyof Theatre,
      cell: (row: Theatre) => (
        <div className="flex items-center">
          <User className="h-4 w-4 mr-1 text-muted-foreground" />
          <span className="text-sm">
            {row.id ? "John Doe" : "Unknown"}
          </span>
        </div>
      )
    }
  ];
  
  const enhancedColumns: Column<Theatre>[] = useMemo(() => {
    return columns.map(column => {
      if (column.header === "Status") {
        return {
          ...column,
          filterable: true,
          filterOptions: ["Active", "Inactive", "Closed"]
        };
      }
      
      if (column.header === "Chain Name") {
        return {
          ...column,
          filterable: true,
          filterOptions: (data: Theatre[]) => {
            // Get unique chain names
            const chainNames = new Set(data.map(theatre => theatre.chainName));
            return Array.from(chainNames);
          }
        };
      }
      
      if (column.header === "Company") {
        return {
          ...column,
          filterable: true,
          filterOptions: (data: Theatre[]) => {
            // Get unique company names
            const companyNames = new Set(data.map(theatre => theatre.companyName));
            return Array.from(companyNames);
          }
        };
      }
      
      return {
        ...column,
        sortable: true // Make all columns sortable
      };
    });
  }, [columns]);
  
  const getActionsForTheatre = (theatre: Theatre) => {
    const baseActions = [
      {
        label: "View Details",
        icon: <Eye className="h-4 w-4" />,
        onClick: handleViewTheatre
      },
      {
        label: "View Logs",
        icon: <Activity className="h-4 w-4" />,
        onClick: handleViewLogs
      },
      {
        label: "Edit",
        icon: <Edit className="h-4 w-4" />,
        onClick: handleEditTheatre
      },
    ];

    if (theatre.status === "Active") {
      return [
        ...baseActions,
        {
          label: "Deactivate",
          icon: <ToggleLeft className="h-4 w-4" />,
          onClick: handleToggleStatus
        }
      ];
    } else {
      return [
        ...baseActions,
        {
          label: "Activate",
          icon: <ToggleRight className="h-4 w-4" />,
          onClick: handleToggleStatus
        },
        {
          label: "Delete",
          icon: <Trash2 className="h-4 w-4" />,
          onClick: handleDeleteTheatre
        }
      ];
    }
  };
  
  const handlePaginationChange = (page: number, pageSize: number) => {
    setPaginationState(prev => ({
      ...prev,
      page,
      pageSize
    }));
  };
  
  const handleSearchChange = (searchTerm: string) => {
    setPaginationState(prev => ({
      ...prev,
      searchTerm,
      page: 1 // Reset to first page on new search
    }));
  };
  
  const handleSortChange = (sortColumn: keyof Theatre | null, sortDirection: "asc" | "desc" | null) => {
    setPaginationState(prev => ({
      ...prev,
      sortColumn: sortColumn as string,
      sortDirection,
      page: 1 // Reset to first page on sort change
    }));
  };
  
  const handleFilterChange = (filters: any[]) => {
    setPaginationState(prev => ({
      ...prev,
      filters,
      page: 1 // Reset to first page on filter change
    }));
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Theatres</h1>
          <p className="text-muted-foreground mt-1">
            Manage all theatres in the CinemasDB system
          </p>
        </div>
        <Button onClick={handleCreateTheatre}>
          <Plus className="h-4 w-4 mr-2" /> Add Theatre
        </Button>
      </div>
      
      <DataTable
        data={filteredTheatres}
        columns={enhancedColumns}
        searchPlaceholder="Search theatres by name, chain, company, location..."
        actions={(row) => getActionsForTheatre(row)}
        onRowClick={handleViewTheatre}
        serverSide={true}
        totalCount={totalTheatres}
        onPaginationChange={handlePaginationChange}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
        pageSize={10}
      />
      
      {/* Dialogs */}
      <AddTheatreDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSave={handleSaveTheatre}
      />
      
      <ViewTheatreDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        theatre={viewingTheatre}
      />
      
      <TheatreDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        theatre={editingTheatre}
        onSave={handleSaveTheatre}
      />

      <TheatreLogsDialog
        open={logsDialogOpen}
        onOpenChange={setLogsDialogOpen}
        theatre={selectedTheatre}
      />

      <DeleteTheatreDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        theatre={selectedTheatre}
        onConfirmDelete={confirmDeleteTheatre}
      />
    </motion.div>
  );
};

export default Theatres;
