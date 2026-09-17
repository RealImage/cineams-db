import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { icountLookupTheatres, IcountScreen, makeEmptyCamera } from "@/data/icountData";
import IcountTheatreEditor from "@/components/icount/IcountTheatreEditor";

const AddIcountTheatre = () => {
  const { lookupId } = useParams();
  const theatre = useMemo(() => icountLookupTheatres.find((t) => t.id === lookupId), [lookupId]);

  const screens = useMemo<IcountScreen[]>(() => {
    if (!theatre) return [];
    return Array.from({ length: theatre.totalScreens }, (_, i) => {
      const screenId = `SCR-${theatre.theatreId}-${i + 1}`;
      return { screenId, screenName: `Screen ${i + 1}`, hasCameras: false, cameras: [makeEmptyCamera(1, screenId)] };
    });
  }, [theatre]);

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
      heading="Add Theatre to iCount Cameras"
      theatreName={theatre.theatreName}
      theatreId={theatre.theatreId}
      location={`${theatre.city}, ${theatre.state}, ${theatre.country}`}
      latitude={theatre.latitude}
      longitude={theatre.longitude}
      initialScreens={screens}
      successMessage={`${theatre.theatreName} added to iCount Cameras`}
    />
  );
};

export default AddIcountTheatre;
