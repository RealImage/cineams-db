
import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { theatres as mockTheatres } from "@/data/mockData";
import { Theatre } from "@/types";
import { TheatreDialog } from "@/components/TheatreDialog";
import { toast } from "sonner";

const Theatres = () => {
  const [theatres, setTheatres] = useState<Theatre[]>(mockTheatres);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTheatre, setEditingTheatre] = useState<Theatre | undefined>(undefined);
  
  const handleCreateTheatre = () => {
    setEditingTheatre(undefined);
    setDialogOpen(true);
  };
  
  const handleEditTheatre = (theatre: Theatre) => {
    setEditingTheatre(theatre);
    setDialogOpen(true);
  };
  
  const handleSaveTheatre = (theatreData: Partial<Theatre>) => {
    if (editingTheatre) {
      // Update existing theatre
      setTheatres(
        theatres.map((t) => 
          t.id === editingTheatre.id ? { ...t, ...theatreData, updatedAt: new Date().toISOString() } : t
        )
      );
    } else {
      // Create new theatre
      const newTheatre: Theatre = {
        id: `${theatres.length + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...theatreData,
      } as Theatre;
      
      setTheatres([newTheatre, ...theatres]);
    }
  };
  
  const handleDeleteTheatre = (theatre: Theatre) => {
    // In a real app, you might want to show a confirmation dialog
    setTheatres(theatres.filter((t) => t.id !== theatre.id));
    toast.success(`Theatre "${theatre.name}" deleted successfully`);
  };
  
  const columns: Column<Theatre>[] = [
    {
      header: "Theatre Name",
      accessor: "name" as keyof Theatre
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
      cell: (row: Theatre) => (
        <span className="truncate max-w-[200px] block">
          {row.address}
        </span>
      )
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
      header: "Screens",
      accessor: "screenCount" as keyof Theatre
    }
  ];
  
  const actions = [
    {
      label: "View Details",
      icon: <Eye className="h-4 w-4" />,
      onClick: (theatre: Theatre) => console.log("View theatre:", theatre)
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
    <Layout>
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
          onRowClick={(theatre) => console.log("Row clicked:", theatre)}
        />
      </motion.div>
      
      <TheatreDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        theatre={editingTheatre}
        onSave={handleSaveTheatre}
      />
    </Layout>
  );
};

export default Theatres;
