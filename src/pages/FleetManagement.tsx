import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit, XCircle, Activity } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AddTaskDialog } from "@/components/fleet/AddTaskDialog";

export interface FleetTask {
  id: string;
  taskId: string;
  taskType: "WireOS Update" | "Agent Update" | "PartnerOS Update" | "Others";
  triggerDate: string;
  triggerTimezone: string;
  description: string;
  targetAppliances: number;
  status: "Pending" | "In Progress" | "Completed" | "Failed" | "Cancelled";
  updatedOn: string;
  updatedBy: string;
}

// Mock data
const mockTasks: FleetTask[] = [
  {
    id: "1",
    taskId: "TK4821",
    taskType: "WireOS Update",
    triggerDate: "2024-03-15T10:30:00",
    triggerTimezone: "PST",
    description: "Critical security patch for WireOS v3.2.1 addressing vulnerability CVE-2024-1234",
    targetAppliances: 156,
    status: "Completed",
    updatedOn: "2024-03-15T14:22:00",
    updatedBy: "John Smith"
  },
  {
    id: "2",
    taskId: "TK5932",
    taskType: "Agent Update",
    triggerDate: "2024-03-18T08:00:00",
    triggerTimezone: "EST",
    description: "Update monitoring agent to version 2.5.0 with improved telemetry",
    targetAppliances: 89,
    status: "In Progress",
    updatedOn: "2024-03-18T08:15:00",
    updatedBy: "Sarah Johnson"
  },
  {
    id: "3",
    taskId: "TK6104",
    taskType: "PartnerOS Update",
    triggerDate: "2024-03-20T14:00:00",
    triggerTimezone: "CST",
    description: "Partner OS firmware upgrade for enhanced DCP playback performance",
    targetAppliances: 42,
    status: "Pending",
    updatedOn: "2024-03-17T09:30:00",
    updatedBy: "Mike Chen"
  },
  {
    id: "4",
    taskId: "TK7291",
    taskType: "Others",
    triggerDate: "2024-03-12T16:45:00",
    triggerTimezone: "GMT",
    description: "Configuration sync for network settings across all appliances",
    targetAppliances: 234,
    status: "Failed",
    updatedOn: "2024-03-12T18:30:00",
    updatedBy: "Emma Wilson"
  },
  {
    id: "5",
    taskId: "TK8403",
    taskType: "WireOS Update",
    triggerDate: "2024-03-14T11:00:00",
    triggerTimezone: "PST",
    description: "Rollback WireOS to stable version due to compatibility issues",
    targetAppliances: 78,
    status: "Cancelled",
    updatedOn: "2024-03-14T10:45:00",
    updatedBy: "David Lee"
  },
];

const getStatusBadgeVariant = (status: FleetTask["status"]) => {
  switch (status) {
    case "Completed":
      return "default";
    case "In Progress":
      return "secondary";
    case "Pending":
      return "outline";
    case "Failed":
      return "destructive";
    case "Cancelled":
      return "outline";
    default:
      return "outline";
  }
};

const getStatusColor = (status: FleetTask["status"]) => {
  switch (status) {
    case "Completed":
      return "bg-green-500/10 text-green-600 border-green-500/20";
    case "In Progress":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "Pending":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    case "Failed":
      return "bg-red-500/10 text-red-600 border-red-500/20";
    case "Cancelled":
      return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    default:
      return "";
  }
};

const FleetManagement = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<FleetTask[]>(mockTasks);
  const [filteredTasks, setFilteredTasks] = useState<FleetTask[]>([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [loading, setLoading] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [paginationState, setPaginationState] = useState({
    page: 1,
    pageSize: 50,
    searchTerm: "",
    sortColumn: null as keyof FleetTask | null,
    sortDirection: null as "asc" | "desc" | null,
    filters: [] as any[]
  });

  const columns: Column<FleetTask>[] = useMemo(() => [
    {
      accessor: "taskId",
      header: "Task ID",
      sortable: true,
      filterable: true,
    },
    {
      accessor: "taskType",
      header: "Task Type",
      sortable: true,
      filterable: true,
      filterOptions: ["WireOS Update", "Agent Update", "PartnerOS Update", "Others"],
    },
    {
      accessor: "triggerDate",
      header: "Trigger Date",
      sortable: true,
      filterable: true,
      filterType: "dateRange" as const,
      cell: (row) => {
        const date = new Date(row.triggerDate);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ${row.triggerTimezone}`;
      },
    },
    {
      accessor: "description",
      header: "Description",
      cell: (row) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="truncate max-w-[200px] block cursor-help">
              {row.description.length > 40 ? `${row.description.substring(0, 40)}...` : row.description}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[300px]">
            <p>{row.description}</p>
          </TooltipContent>
        </Tooltip>
      ),
    },
    {
      accessor: "targetAppliances",
      header: "Target Appliances",
      sortable: true,
      cell: (row) => <span className="font-medium">{row.targetAppliances}</span>,
    },
    {
      accessor: "status",
      header: "Status",
      sortable: true,
      filterable: true,
      filterOptions: ["Pending", "In Progress", "Completed", "Failed", "Cancelled"],
      cell: (row) => (
        <Badge variant="outline" className={getStatusColor(row.status)}>
          {row.status}
        </Badge>
      ),
    },
    {
      accessor: "updatedOn",
      header: "Updated On",
      sortable: true,
      cell: (row) => {
        const date = new Date(row.updatedOn);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      },
    },
    {
      accessor: "updatedBy",
      header: "Updated By",
      sortable: true,
    },
  ], []);

  const getActionsForTask = (task: FleetTask) => {
    const actions = [
      {
        label: "View Task",
        icon: <Eye className="h-4 w-4" />,
        onClick: () => console.log("View task", task.taskId),
      },
      {
        label: "Edit Task",
        icon: <Edit className="h-4 w-4" />,
        onClick: () => {
          const triggerDate = new Date(task.triggerDate);
          navigate("/fleet-management/task/new", {
            state: {
              taskType: task.taskType,
              triggerDate: triggerDate.toISOString().split('T')[0],
              triggerTime: triggerDate.toTimeString().slice(0, 5),
              timezone: task.triggerTimezone,
              description: task.description,
              taskId: task.taskId,
              isEditing: true,
            }
          });
        },
      },
    ];

    if (task.status === "Pending") {
      actions.push({
        label: "Cancel Task",
        icon: <XCircle className="h-4 w-4" />,
        onClick: () => console.log("Cancel task", task.taskId),
      });
    }

    if (task.status === "In Progress") {
      actions.push({
        label: "Cancel Task",
        icon: <XCircle className="h-4 w-4" />,
        onClick: () => console.log("Cancel task", task.taskId),
      });
    }

    if (["In Progress", "Cancelled", "Completed", "Failed"].includes(task.status)) {
      actions.push({
        label: "Track Progress",
        icon: <Activity className="h-4 w-4" />,
        onClick: () => console.log("Track progress", task.taskId),
      });
    }

    return actions;
  };

  const fetchData = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      let filtered = [...tasks];

      // Search
      if (paginationState.searchTerm) {
        const search = paginationState.searchTerm.toLowerCase();
        filtered = filtered.filter(task =>
          task.taskId.toLowerCase().includes(search) ||
          task.taskType.toLowerCase().includes(search) ||
          task.description.toLowerCase().includes(search) ||
          task.updatedBy.toLowerCase().includes(search)
        );
      }

      // Filters
      if (paginationState.filters.length > 0) {
        paginationState.filters.forEach(filter => {
          if (filter.value) {
            filtered = filtered.filter(task => {
              const taskValue = task[filter.column as keyof FleetTask];
              if (Array.isArray(filter.value)) {
                return filter.value.includes(taskValue);
              }
              return taskValue === filter.value;
            });
          }
        });
      }

      // Sort
      if (paginationState.sortColumn && paginationState.sortDirection) {
        filtered.sort((a, b) => {
          const aVal = a[paginationState.sortColumn!];
          const bVal = b[paginationState.sortColumn!];
          if (aVal < bVal) return paginationState.sortDirection === "asc" ? -1 : 1;
          if (aVal > bVal) return paginationState.sortDirection === "asc" ? 1 : -1;
          return 0;
        });
      }

      setTotalTasks(filtered.length);

      // Pagination
      const start = (paginationState.page - 1) * paginationState.pageSize;
      const end = start + paginationState.pageSize;
      setFilteredTasks(filtered.slice(start, end));
      setLoading(false);
    }, 300);
  }, [tasks, paginationState]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPaginationState(prev => ({ ...prev, page, pageSize }));
  };

  const handleSearchChange = (searchTerm: string) => {
    setPaginationState(prev => ({ ...prev, searchTerm, page: 1 }));
  };

  const handleSortChange = (sortColumn: keyof FleetTask | null, sortDirection: "asc" | "desc" | null) => {
    setPaginationState(prev => ({ ...prev, sortColumn, sortDirection, page: 1 }));
  };

  const handleFilterChange = (filters: any[]) => {
    setPaginationState(prev => ({ ...prev, filters, page: 1 }));
  };

  const handleAddTask = (newTask: Omit<FleetTask, "id">) => {
    const task: FleetTask = {
      ...newTask,
      id: String(tasks.length + 1),
    };
    setTasks(prev => [task, ...prev]);
    setAddTaskOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fleet Management</h1>
          <p className="text-muted-foreground">Manage and monitor tasks across your appliance fleet</p>
        </div>
        <Button onClick={() => setAddTaskOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <DataTable
        data={filteredTasks}
        columns={columns}
        serverSide={true}
        totalCount={totalTasks}
        pageSize={paginationState.pageSize}
        onPaginationChange={handlePaginationChange}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
        actions={getActionsForTask}
        searchPlaceholder="Search tasks..."
      />

      <AddTaskDialog
        open={addTaskOpen}
        onOpenChange={setAddTaskOpen}
        onAddTask={handleAddTask}
      />
    </div>
  );
};

export default FleetManagement;
