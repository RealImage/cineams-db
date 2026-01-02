import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { Column, SortConfig, Filter, Action } from "@/components/ui/data-table/types";
import { Plus, Eye, Edit, XCircle, ArrowRight } from "lucide-react";
import { AddTaskDialog } from "@/components/fleet/AddTaskDialog";
import { useNavigate } from "react-router-dom";

export interface FleetTask {
  id: string;
  taskId: string;
  taskType: "WireOS Update" | "Agent Update" | "Agent Deactivate" | "PartnerOS Update" | "Others";
  triggerDate: string;
  triggerTimezone: string;
  description: string;
  createdBy: string;
  createdOn: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled" | "Failed";
  targetVersion?: string;
  affectedDevices?: number;
}

// Mock data for fleet tasks
const mockFleetTasks: FleetTask[] = [
  {
    id: "1",
    taskId: "FT-001",
    taskType: "WireOS Update",
    triggerDate: "2024-01-15 10:00",
    triggerTimezone: "UTC",
    description: "Update WireOS to v4.2.0 for all devices in Region A",
    createdBy: "John Doe",
    createdOn: "2024-01-10",
    status: "Scheduled",
    targetVersion: "v4.2.0",
    affectedDevices: 45,
  },
  {
    id: "2",
    taskId: "FT-002",
    taskType: "Agent Update",
    triggerDate: "2024-01-12 14:30",
    triggerTimezone: "EST",
    description: "Update Manifest Agent to v4.1.0",
    createdBy: "Jane Smith",
    createdOn: "2024-01-08",
    status: "In Progress",
    targetVersion: "v4.1.0",
    affectedDevices: 120,
  },
  {
    id: "3",
    taskId: "FT-003",
    taskType: "PartnerOS Update",
    triggerDate: "2024-01-20 08:00",
    triggerTimezone: "PST",
    description: "Upgrade PartnerOS to latest version",
    createdBy: "Mike Johnson",
    createdOn: "2024-01-11",
    status: "Scheduled",
    targetVersion: "v3.13.0",
    affectedDevices: 30,
  },
  {
    id: "4",
    taskId: "FT-004",
    taskType: "Others",
    triggerDate: "2024-01-05 16:00",
    triggerTimezone: "UTC",
    description: "Restart all devices in Theatre Group B",
    createdBy: "Sarah Wilson",
    createdOn: "2024-01-03",
    status: "Completed",
    affectedDevices: 25,
  },
  {
    id: "5",
    taskId: "FT-005",
    taskType: "WireOS Update",
    triggerDate: "2024-01-08 11:00",
    triggerTimezone: "CST",
    description: "Emergency security patch for WireOS",
    createdBy: "John Doe",
    createdOn: "2024-01-07",
    status: "Failed",
    targetVersion: "v4.1.5-patch",
    affectedDevices: 15,
  },
  {
    id: "6",
    taskId: "FT-006",
    taskType: "Agent Update",
    triggerDate: "2024-01-18 09:00",
    triggerTimezone: "UTC",
    description: "Update KDM Agent across all regions",
    createdBy: "Jane Smith",
    createdOn: "2024-01-12",
    status: "Cancelled",
    targetVersion: "v4.6.0",
    affectedDevices: 200,
  },
];

const getStatusColor = (status: FleetTask["status"]): string => {
  switch (status) {
    case "Completed":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "In Progress":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "Failed":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "Cancelled":
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    case "Scheduled":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    default:
      return "";
  }
};

const TaskManagement = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<FleetTask[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [addTaskOpen, setAddTaskOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Sort state
  const [sortConfig, setSortConfig] = useState<SortConfig<FleetTask>>({ key: null, direction: null });

  // Filter state
  const [filters, setFilters] = useState<Filter<FleetTask>[]>([]);

  const columns: Column<FleetTask>[] = [
    {
      accessor: "taskId",
      header: "Task ID",
      sortable: true,
    },
    {
      accessor: "taskType",
      header: "Task Type",
      sortable: true,
      filterable: true,
      filterOptions: ["WireOS Update", "Agent Update", "Agent Deactivate", "PartnerOS Update", "Others"],
    },
    {
      accessor: "triggerDate",
      header: "Trigger Date/Time",
      sortable: true,
      cell: (row) => (
        <span>
          {row.triggerDate} ({row.triggerTimezone})
        </span>
      ),
    },
    {
      accessor: "description",
      header: "Description",
      cell: (row) => (
        <span className="max-w-[300px] truncate block" title={row.description}>
          {row.description}
        </span>
      ),
    },
    {
      accessor: "createdBy",
      header: "Created By",
      sortable: true,
    },
    {
      accessor: "createdOn",
      header: "Created On",
      sortable: true,
    },
    {
      accessor: "status",
      header: "Status",
      sortable: true,
      filterable: true,
      filterOptions: ["Scheduled", "In Progress", "Completed", "Cancelled", "Failed"],
      cell: (row) => (
        <Badge className={getStatusColor(row.status)} variant="outline">
          {row.status}
        </Badge>
      ),
    },
  ];

  const getActionsForTask = (task: FleetTask): Action<FleetTask>[] => {
    const actions: Action<FleetTask>[] = [
      {
        label: "View",
        icon: <Eye className="h-4 w-4" />,
        onClick: (row) => console.log("View task:", row.taskId),
      },
      {
        label: "Edit",
        icon: <Edit className="h-4 w-4" />,
        onClick: (row) => navigate(`/fleet-management/task/${row.id}/edit`),
      },
    ];

    if (task.status === "Scheduled") {
      actions.push({
        label: "Cancel",
        icon: <XCircle className="h-4 w-4" />,
        onClick: (row) => console.log("Cancel task:", row.taskId),
      });
    }

    if (task.status === "In Progress") {
      actions.push({
        label: "Track Progress",
        icon: <ArrowRight className="h-4 w-4" />,
        onClick: (row) => console.log("Track progress:", row.taskId),
      });
    }

    return actions;
  };

  // Simulate data fetching with server-side operations
  const fetchData = useCallback(() => {
    let filteredData = [...mockFleetTasks];

    // Apply search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filteredData = filteredData.filter(
        (task) =>
          task.taskId.toLowerCase().includes(search) ||
          task.description.toLowerCase().includes(search) ||
          task.createdBy.toLowerCase().includes(search)
      );
    }

    // Apply filters
    filters.forEach((filter) => {
      const values = filter.value;
      if (values && (Array.isArray(values) ? values.length > 0 : values)) {
        filteredData = filteredData.filter((task) => {
          const taskValue = String(task[filter.column as keyof FleetTask]);
          if (Array.isArray(values)) {
            return values.includes(taskValue);
          }
          return taskValue === values;
        });
      }
    });

    // Apply sorting
    if (sortConfig.key && sortConfig.direction) {
      filteredData.sort((a, b) => {
        const aVal = a[sortConfig.key as keyof FleetTask];
        const bVal = b[sortConfig.key as keyof FleetTask];
        
        if (aVal === undefined || bVal === undefined) return 0;
        
        const comparison = String(aVal).localeCompare(String(bVal));
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    setTotalCount(filteredData.length);

    // Apply pagination
    const start = (currentPage - 1) * pageSize;
    const paginatedData = filteredData.slice(start, start + pageSize);

    setTasks(paginatedData);
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

  const handleSortChange = (sortKey: keyof FleetTask | null, direction: 'asc' | 'desc' | null) => {
    setSortConfig({ key: sortKey, direction });
  };

  const handleFilterChange = (newFilters: Filter<FleetTask>[]) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleAddTask = (taskData: Omit<FleetTask, "id">) => {
    console.log("New task created:", taskData);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor fleet update tasks
          </p>
        </div>
        <Button onClick={() => setAddTaskOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      <DataTable
        data={tasks}
        columns={columns}
        searchable
        searchPlaceholder="Search by Task ID, Description, or Created By..."
        actions={getActionsForTask}
        serverSide
        totalCount={totalCount}
        pageSize={pageSize}
        onPaginationChange={handlePaginationChange}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
      />

      <AddTaskDialog
        open={addTaskOpen}
        onOpenChange={setAddTaskOpen}
        onAddTask={handleAddTask}
      />
    </div>
  );
};

export default TaskManagement;
