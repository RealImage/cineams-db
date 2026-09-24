import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Theatre } from "@/types";
import { TheatreDialog } from "@/components/TheatreDialog";
import { QueryState } from "@/components/ui/query-state";
import { useTheatre, useUpdateTheatre } from "@/hooks/api/theatres";
import { ApiError } from "@/lib/api";

const EditTheatre = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theatreQuery = useTheatre(id);
  const updateTheatre = useUpdateTheatre();
  const theatre = theatreQuery.data;

  useEffect(() => {
    if (theatreQuery.error instanceof ApiError && theatreQuery.error.status === 404) {
      toast.error("Theatre not found");
      navigate("/theatres");
    }
  }, [theatreQuery.error, navigate]);

  const handleSave = async (theatreData: Partial<Theatre>) => {
    if (!id) return;
    try {
      await updateTheatre.mutateAsync({ ...theatreData, id });
    } catch (err) {
      toast.error(`Could not save theatre: ${(err as Error).message}`);
      throw err;
    }
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
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {theatre ? `Edit ${theatre.name}` : 'Edit Theatre'}
            </h1>
            <p className="text-muted-foreground mt-1">
              Update theatre details and configuration
            </p>
          </div>
        </div>
      </div>

      <QueryState query={theatreQuery} label="theatre">
        {(loaded) => (
          <TheatreDialog
            key={loaded.id}
            open={true}
            onOpenChange={(open) => !open && navigate("/theatres")}
            theatre={loaded}
            onSave={handleSave}
            isFullPage={true}
          />
        )}
      </QueryState>
    </motion.div>
  );
};

export default EditTheatre;
