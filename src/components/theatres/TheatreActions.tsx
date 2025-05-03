
import { Edit, Trash2, Eye, Activity, ToggleLeft, ToggleRight } from "lucide-react";
import { Theatre } from "@/types";
import { toast } from "sonner";

type TheatreActionsProps = {
  theatre: Theatre;
  onViewDetails: (theatre: Theatre) => void;
  onViewLogs: (theatre: Theatre) => void;
  onEdit: (theatre: Theatre) => void;
  onDelete: (theatre: Theatre) => void;
  onToggleStatus: (theatre: Theatre) => void;
};

export const getTheatreActions = ({
  theatre,
  onViewDetails,
  onViewLogs,
  onEdit,
  onDelete,
  onToggleStatus
}: TheatreActionsProps) => {
  const baseActions = [
    {
      label: "View Details",
      icon: <Eye className="h-4 w-4" />,
      onClick: () => onViewDetails(theatre)
    },
    {
      label: "View Logs",
      icon: <Activity className="h-4 w-4" />,
      onClick: () => onViewLogs(theatre)
    },
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: () => onEdit(theatre)
    },
  ];

  if (theatre.status === "Active") {
    return [
      ...baseActions,
      {
        label: "Deactivate",
        icon: <ToggleLeft className="h-4 w-4" />,
        onClick: () => onToggleStatus(theatre)
      }
    ];
  } else {
    return [
      ...baseActions,
      {
        label: "Activate",
        icon: <ToggleRight className="h-4 w-4" />,
        onClick: () => onToggleStatus(theatre)
      },
      {
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: () => onDelete(theatre)
      }
    ];
  }
};

export const useTheatreActions = () => {
  const handleEditTheatre = (theatre: Theatre) => {
    const editUrl = `/theatre/${theatre.id}/edit`;
    window.open(editUrl, '_blank');
  };
  
  const handleToggleStatus = (theatre: Theatre) => {
    const newStatus = theatre.status === "Active" ? "Inactive" : "Active";
    toast.success(`Theatre "${theatre.name}" ${newStatus === "Active" ? "activated" : "deactivated"} successfully`);
    return newStatus;
  };
  
  return {
    handleEditTheatre,
    handleToggleStatus
  };
};
