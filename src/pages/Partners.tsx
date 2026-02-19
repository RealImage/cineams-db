import { useState } from "react";
import { DataTable, Column } from "@/components/ui/data-table";
import { PartnerRequest, partnersData } from "@/data/partnersData";
import { PartnerDetailSheet } from "@/components/partners/PartnerDetailSheet";
import { formatDate } from "@/lib/dateUtils";

const columns: Column<PartnerRequest>[] = [
  { header: "Company", accessor: "company", sortable: true },
  { header: "Location", accessor: "location", sortable: true },
  { header: "Requested By", accessor: "requestedBy", sortable: true },
  {
    header: "Request Created On",
    accessor: "requestCreatedOn",
    sortable: true,
    cell: (row) => formatDate(row.requestCreatedOn),
  },
];

const Partners = () => {
  const [selectedPartner, setSelectedPartner] = useState<PartnerRequest | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleRowClick = (row: PartnerRequest) => {
    setSelectedPartner(row);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Review and manage pending partner requests.
      </p>
      <DataTable
        data={partnersData}
        columns={columns}
        searchable
        searchPlaceholder="Search partners..."
        onRowClick={handleRowClick}
        pageSize={10}
      />
      <PartnerDetailSheet
        partner={selectedPartner}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
};

export default Partners;
