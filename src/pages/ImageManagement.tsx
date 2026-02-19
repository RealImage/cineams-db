import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Column, SortConfig, Filter, Action } from "@/components/ui/data-table/types";
import { Plus, Settings, FileText, Star, StarOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AddVersionDialog } from "@/components/fleet/AddVersionDialog";
import { ViewImageLogsDialog } from "@/components/fleet/ViewImageLogsDialog";
import { formatDate } from "@/lib/dateUtils";
export interface ImageItem {
  id: string;
  provider: string;
  agentOsName: string;
  latestVersion: string;
  updatedOn: string;
  updatedBy: string;
  defaultInstall?: boolean;
}

// Mock data based on user requirements
const mockImageData: ImageItem[] = [
  { id: "1", provider: "Appliance OS", agentOsName: "WireOS", latestVersion: "v4.1.9", updatedOn: "2024-01-10", updatedBy: "System", defaultInstall: true },
  { id: "2", provider: "Appliance OS", agentOsName: "QWA-OS", latestVersion: "v3.14.21", updatedOn: "2024-01-08", updatedBy: "Admin" },
  { id: "3", provider: "Appliance OS", agentOsName: "PartnerOS", latestVersion: "v3.12.14", updatedOn: "2024-01-05", updatedBy: "System" },
  { id: "4", provider: "iCount", agentOsName: "iCount", latestVersion: "v2.5.17", updatedOn: "2024-01-12", updatedBy: "John Doe" },
  { id: "5", provider: "Qlog", agentOsName: "Qlog Agent", latestVersion: "v1.3.2", updatedOn: "2024-01-09", updatedBy: "Jane Smith" },
  { id: "6", provider: "Qube Wire", agentOsName: "Kadet (Agent Zero)", latestVersion: "v1.1.3", updatedOn: "2024-01-11", updatedBy: "Mike Johnson", defaultInstall: true },
  { id: "7", provider: "Qube Wire", agentOsName: "Agent Redux", latestVersion: "v4.2.6", updatedOn: "2024-01-13", updatedBy: "System" },
  { id: "8", provider: "Qube Wire", agentOsName: "Manifest Agent", latestVersion: "v4.0.0", updatedOn: "2024-01-07", updatedBy: "Admin" },
  { id: "9", provider: "Qube Wire", agentOsName: "Content Ingest Agent", latestVersion: "v1.2.3", updatedOn: "2024-01-06", updatedBy: "Sarah Wilson" },
  { id: "10", provider: "Qube Wire", agentOsName: "KDM Agent", latestVersion: "v4.5.6", updatedOn: "2024-01-14", updatedBy: "System" },
  { id: "11", provider: "Qube Wire", agentOsName: "Inventory Agent", latestVersion: "v1.2.3", updatedOn: "2024-01-04", updatedBy: "John Doe" },
  { id: "12", provider: "Qube Wire", agentOsName: "TDL Agent", latestVersion: "v0.12", updatedOn: "2024-01-03", updatedBy: "Admin" },
  { id: "13", provider: "Qube Wire", agentOsName: "Configuration Agent", latestVersion: "v0.8", updatedOn: "2024-01-02", updatedBy: "Jane Smith" },
  { id: "14", provider: "Qube Wire", agentOsName: "Live Wire", latestVersion: "v1.0.0", updatedOn: "2024-01-01", updatedBy: "System" },
  { id: "15", provider: "Scheduler", agentOsName: "Scheduler Agent", latestVersion: "v1.10.1", updatedOn: "2024-01-15", updatedBy: "Mike Johnson" },
  { id: "16", provider: "Scheduler", agentOsName: "Content Agent", latestVersion: "v2", updatedOn: "2024-01-10", updatedBy: "Admin" },
  { id: "17", provider: "Scheduler", agentOsName: "AgentQS", latestVersion: "v2.1", updatedOn: "2024-01-09", updatedBy: "System" },
  { id: "18", provider: "Slate", agentOsName: "AgentQ", latestVersion: "v6.9.56", updatedOn: "2024-01-08", updatedBy: "Sarah Wilson" },
];

const ImageManagement = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  
  // Dialog states
  const [addVersionOpen, setAddVersionOpen] = useState(false);
  const [viewLogsOpen, setViewLogsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Sort state
  const [sortConfig, setSortConfig] = useState<SortConfig<ImageItem>>({ key: null, direction: null });

  // Filter state
  const [filters, setFilters] = useState<Filter<ImageItem>[]>([]);

  const columns: Column<ImageItem>[] = [
    {
      accessor: "provider",
      header: "Provider",
      sortable: true,
      filterable: true,
      filterOptions: ["Appliance OS", "iCount", "Qlog", "Qube Wire", "Scheduler", "Slate"],
    },
    {
      accessor: "agentOsName",
      header: "Agent / OS Name",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span>{row.agentOsName}</span>
          {row.defaultInstall && (
            <Badge variant="outline" className="text-xs border-amber-500 text-amber-600 bg-amber-50 gap-1">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              Default Install
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessor: "latestVersion",
      header: "Latest Version",
      sortable: true,
    },
    {
      accessor: "updatedOn",
      header: "Updated On",
      sortable: true,
      cell: (row) => formatDate(row.updatedOn),
    },
    {
      accessor: "updatedBy",
      header: "Updated By",
      sortable: true,
    },
  ];

  const handleToggleDefaultInstall = (image: ImageItem) => {
    const updated = mockImageData.map(i => 
      i.id === image.id ? { ...i, defaultInstall: !i.defaultInstall } : i
    );
    // Update the source array in place for persistence across fetches
    mockImageData.splice(0, mockImageData.length, ...updated);
    fetchData();
    if (image.defaultInstall) {
      toast.success(`"${image.agentOsName}" unmarked as Default Install on New WireTAP.`);
    } else {
      toast.success(`"${image.agentOsName}" marked as Default Install on New WireTAP.`);
    }
  };

  const getActionsForImage = (image: ImageItem): Action<ImageItem>[] => {
    return [
      {
        label: image.defaultInstall ? "Unmark as Default Install" : "Mark as Default Install",
        icon: image.defaultInstall ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />,
        onClick: (row) => handleToggleDefaultInstall(row),
      },
      {
        label: "Add Version",
        icon: <Plus className="h-4 w-4" />,
        onClick: (row) => {
          setSelectedImage(row);
          setAddVersionOpen(true);
        },
      },
      {
        label: "Manage Versions",
        icon: <Settings className="h-4 w-4" />,
        onClick: (row) => {
          navigate(`/fleet-management/images/${row.id}/versions`);
        },
      },
      {
        label: "View Logs",
        icon: <FileText className="h-4 w-4" />,
        onClick: (row) => {
          setSelectedImage(row);
          setViewLogsOpen(true);
        },
      },
    ];
  };

  // Simulate data fetching with server-side operations
  const fetchData = useCallback(() => {
    let filteredData = [...mockImageData];

    // Apply search - only on Agent / OS Name as per requirements
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filteredData = filteredData.filter(
        (image) => image.agentOsName.toLowerCase().includes(search)
      );
    }

    // Apply filters
    filters.forEach((filter) => {
      const values = filter.value;
      if (values && (Array.isArray(values) ? values.length > 0 : values)) {
        filteredData = filteredData.filter((image) => {
          const imageValue = String(image[filter.column as keyof ImageItem]);
          if (Array.isArray(values)) {
            return values.includes(imageValue);
          }
          return imageValue === values;
        });
      }
    });

    // Apply sorting
    if (sortConfig.key && sortConfig.direction) {
      filteredData.sort((a, b) => {
        const aVal = a[sortConfig.key as keyof ImageItem];
        const bVal = b[sortConfig.key as keyof ImageItem];
        
        if (aVal === undefined || bVal === undefined) return 0;
        
        const comparison = String(aVal).localeCompare(String(bVal));
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    setTotalCount(filteredData.length);

    // Apply pagination
    const start = (currentPage - 1) * pageSize;
    const paginatedData = filteredData.slice(start, start + pageSize);

    setImages(paginatedData);
  }, [currentPage, pageSize, searchTerm, sortConfig, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePaginationChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
    setCurrentPage(1);
  };

  const handleSortChange = (sortKey: keyof ImageItem | null, direction: 'asc' | 'desc' | null) => {
    setSortConfig({ key: sortKey, direction });
  };

  const handleFilterChange = (newFilters: Filter<ImageItem>[]) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleAddVersion = (versionData: any) => {
    console.log("New version added:", versionData);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Manage agent and OS images and versions
      </p>

      <DataTable
        data={images}
        columns={columns}
        searchable
        searchPlaceholder="Search by Agent / OS Name..."
        actions={getActionsForImage}
        serverSide
        totalCount={totalCount}
        pageSize={pageSize}
        onPaginationChange={handlePaginationChange}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
      />

      <AddVersionDialog
        open={addVersionOpen}
        onOpenChange={setAddVersionOpen}
        image={selectedImage}
        onSubmit={handleAddVersion}
      />

      <ViewImageLogsDialog
        open={viewLogsOpen}
        onOpenChange={setViewLogsOpen}
        image={selectedImage}
      />
    </div>
  );
};

export default ImageManagement;
