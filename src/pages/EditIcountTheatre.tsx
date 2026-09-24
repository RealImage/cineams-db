import { useParams } from "react-router-dom";
import { QueryState } from "@/components/ui/query-state";
import { useIcountTheatre, useUpdateIcountTheatre } from "@/hooks/api/icount";
import IcountTheatreEditor from "@/components/icount/IcountTheatreEditor";

const EditIcountTheatre = () => {
  const { id } = useParams();
  const theatreQuery = useIcountTheatre(id);
  const update = useUpdateIcountTheatre();

  return (
    <QueryState query={theatreQuery} label="theatre">
      {(theatre) => (
        <IcountTheatreEditor
          key={theatre.id}
          heading="Edit iCount Cameras Theatre"
          theatreName={theatre.theatreName}
          theatreId={theatre.theatreId}
          location={`${theatre.city}, ${theatre.state}, ${theatre.country}`}
          latitude={theatre.latitude}
          longitude={theatre.longitude}
          initialScreens={theatre.screens.map((s) => ({ ...s, cameras: s.cameras.map((c) => ({ ...c })) }))}
          successMessage={`${theatre.theatreName} updated`}
          onSave={(input) => update.mutateAsync({ id: theatre.id, ...input })}
          saving={update.isPending}
        />
      )}
    </QueryState>
  );
};

export default EditIcountTheatre;
