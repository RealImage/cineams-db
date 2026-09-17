import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { icountTheatres } from "@/data/icountData";
import IcountTheatreEditor from "@/components/icount/IcountTheatreEditor";

const EditIcountTheatre = () => {
  const { id } = useParams();
  const theatre = useMemo(() => icountTheatres.find((t) => t.id === id), [id]);

  if (!theatre) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link to="/qube-appliances/icount-cameras"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link>
        </Button>
        <p className="text-muted-foreground">Theatre not found.</p>
      </div>
    );
  }

  return (
    <IcountTheatreEditor
      heading="Edit iCount Cameras Theatre"
      theatreName={theatre.theatreName}
      theatreId={theatre.theatreId}
      location={`${theatre.city}, ${theatre.state}, ${theatre.country}`}
      latitude={theatre.latitude}
      longitude={theatre.longitude}
      initialScreens={theatre.screens.map((s) => ({ ...s, cameras: s.cameras.map((c) => ({ ...c })) }))}
      successMessage={`${theatre.theatreName} updated`}
    />
  );
};

export default EditIcountTheatre;
