
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { Theatre, Screen } from "@/types";
import { theatres as mockTheatres } from "@/data/mockData";
import { TheatreDialog } from "@/components/TheatreDialog";

const EditTheatre = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [theatre, setTheatre] = useState<Theatre | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(true);
  
  useEffect(() => {
    // In a real app, we would fetch the theatre from an API
    const foundTheatre = mockTheatres.find((t) => t.id === id);
    
    if (foundTheatre) {
      // Make sure we're working with a deep copy to avoid modifying the mock data directly
      setTheatre(JSON.parse(JSON.stringify(foundTheatre)));
    } else {
      toast.error("Theatre not found");
      navigate("/theatres");
    }
  }, [id, navigate]);
  
  const handleSave = (theatreData: Partial<Theatre>) => {
    // In a real app, we would send this to an API
    toast.success(`Theatre "${theatreData.name}" updated successfully`);
    setDialogOpen(false);
    navigate("/theatres");
  };
  
  const handleBackToList = () => {
    navigate("/theatres");
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleBackToList}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-muted-foreground">Back to Theatres</span>
        </div>
      </div>
      
      {theatre && (
        <TheatreDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          theatre={theatre}
          onSave={handleSave}
          isFullPage={true}
        />
      )}
    </motion.div>
  );
};

export default EditTheatre;
