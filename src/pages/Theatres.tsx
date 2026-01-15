
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { theatres as mockTheatres } from "@/data/mockData";
import { Theatre } from "@/types";
import { TheatreDialog } from "@/components/TheatreDialog";
import { AddTheatreDialog } from "@/components/AddTheatreDialog";
import { ViewTheatreDialog } from "@/components/ViewTheatreDialog";
import { TheatreLogsDialog } from "@/components/TheatreLogsDialog";
import { DeleteTheatreDialog } from "@/components/DeleteTheatreDialog";
import { TheatreTable } from "@/components/theatres/TheatreTable";
import { useTheatres } from "@/components/theatres/useTheatres";
import { toast } from "sonner";

const Theatres = () => {
  const { theatres, handleSaveTheatre, handleDeleteTheatre, handleToggleStatus } = useTheatres(mockTheatres);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Selected theatre states
  const [editingTheatre, setEditingTheatre] = useState<Theatre | undefined>(undefined);
  const [viewingTheatre, setViewingTheatre] = useState<Theatre | undefined>(undefined);
  const [selectedTheatre, setSelectedTheatre] = useState<Theatre | undefined>(undefined);
  
  const handleCreateTheatre = () => {
    setEditingTheatre(undefined);
    setAddDialogOpen(true);
  };
  
  const handleViewTheatre = (theatre: Theatre) => {
    setViewingTheatre(theatre);
    setViewDialogOpen(true);
  };
  
  const handleViewLogs = (theatre: Theatre) => {
    setSelectedTheatre(theatre);
    setLogsDialogOpen(true);
  };
  
  const handleToggleTheatreStatus = (theatre: Theatre) => {
    const newStatus = handleToggleStatus(theatre);
    toast.success(`Theatre "${theatre.name}" ${newStatus === "Active" ? "activated" : "deactivated"} successfully`);
  };
  
  const handleDeleteTheatreClick = (theatre: Theatre) => {
    setSelectedTheatre(theatre);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteTheatre = () => {
    if (selectedTheatre) {
      handleDeleteTheatre(selectedTheatre.id);
      toast.success(`Theatre "${selectedTheatre.name}" deleted successfully`);
      setDeleteDialogOpen(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Manage all theatres in the CinemasDB system
        </p>
        <Button onClick={handleCreateTheatre}>
          <Plus className="h-4 w-4 mr-2" /> Add Theatre
        </Button>
      </div>
      
      <TheatreTable
        theatres={theatres}
        onViewTheatre={handleViewTheatre}
        onViewLogs={handleViewLogs}
        onToggleStatus={handleToggleTheatreStatus}
        onDelete={handleDeleteTheatreClick}
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
