import { useParams } from "react-router-dom";
import { QueryState } from "@/components/ui/query-state";
import { useAddIcountTheatre, useIcountLookupTheatre } from "@/hooks/api/icount";
import IcountTheatreEditor from "@/components/icount/IcountTheatreEditor";

const AddIcountTheatre = () => {
  const { lookupId } = useParams();
  const theatreQuery = useIcountLookupTheatre(lookupId);
  const add = useAddIcountTheatre();

  return (
    <QueryState query={theatreQuery} label="theatre">
      {(theatre) => (
        <IcountTheatreEditor
          key={theatre.id}
          heading="Add Theatre to iCount Cameras"
          theatreName={theatre.theatreName}
          theatreId={theatre.theatreId}
          location={`${theatre.city}, ${theatre.state}, ${theatre.country}`}
          latitude={theatre.latitude}
          longitude={theatre.longitude}
          initialScreens={theatre.screens}
          successMessage={`${theatre.theatreName} added to iCount Cameras`}
          onSave={(input) => add.mutateAsync({ theatreId: theatre.id, ...input })}
          saving={add.isPending}
        />
      )}
    </QueryState>
  );
};

export default AddIcountTheatre;
