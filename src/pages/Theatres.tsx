
import { useState } from "react";
import { motion } from "framer-motion";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye, Calendar, User, Tag, Film } from "lucide-react";
import { theatres as mockTheatres } from "@/data/mockData";
import { Screen, Theatre } from "@/types";
import { TheatreDialog } from "@/components/TheatreDialog";
import { AddTheatreDialog } from "@/components/AddTheatreDialog";
import { ViewTheatreDialog } from "@/components/ViewTheatreDialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const Theatres = () => {
  const [theatres, setTheatres] = useState<Theatre[]>(mockTheatres);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTheatre, setEditingTheatre] = useState<Theatre | undefined>(undefined);
  const [viewingTheatre, setViewingTheatre] = useState<Theatre | undefined>(undefined);
  
  const handleCreateTheatre = () => {
    setEditingTheatre(undefined);
    setAddDialogOpen(true);
  };
  
  const handleEditTheatre = (theatre: Theatre) => {
    setEditingTheatre(theatre);
    setDialogOpen(true);
  };
  
  const handleViewTheatre = (theatre: Theatre) => {
    setViewingTheatre(theatre);
    setViewDialogOpen(true);
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
    setTheatres(theatres.filter((t) => t.id !== theatre.id));
    toast.success(`Theatre "${theatre.name}" deleted successfully`);
  };
  
  const handleViewDetails = (theatre: Theatre) => {
    toast.info(`Viewing details for: ${theatre.name}`);
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
  
  const actions = [
    {
      label: "View Details",
      icon: <Eye className="h-4 w-4" />,
      onClick: handleViewTheatre
    },
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEditTheatre
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDeleteTheatre
    }
  ];
  
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
        data={theatres}
        columns={columns}
        searchPlaceholder="Search theatres..."
        actions={actions}
        onRowClick={handleViewTheatre}
      />
      
      {/* Replace the old TheatreDialog with our new dialogs */}
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
    </motion.div>
  );
};

export default Theatres;
