import { useState } from "react";
import { DataTable, Column } from "@/components/ui/data-table";
import { CompanyClaim, companyClaimsData } from "@/data/companyClaimsData";
import { ClaimDetailSheet } from "@/components/company-claims/ClaimDetailSheet";
import { formatDate } from "@/lib/dateUtils";

const columns: Column<CompanyClaim>[] = [
  { header: "Company", accessor: "company", sortable: true },
  { header: "Location", accessor: "location", sortable: true },
  { header: "Company Type", accessor: "companyType", sortable: true, filterable: true },
  { header: "Chain Claims", accessor: "chainClaims", sortable: true },
  { header: "Theatre Claims", accessor: "theatreClaims", sortable: true },
  {
    header: "Last Claimed On",
    accessor: "lastClaimedOn",
    sortable: true,
    cell: (row) => formatDate(row.lastClaimedOn),
  },
];

const CompanyClaims = () => {
  const [selectedClaim, setSelectedClaim] = useState<CompanyClaim | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleRowClick = (row: CompanyClaim) => {
    setSelectedClaim(row);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Review and manage pending company claims.
      </p>
      <DataTable
        data={companyClaimsData}
        columns={columns}
        searchable
        searchPlaceholder="Search claims..."
        onRowClick={handleRowClick}
        pageSize={10}
      />
      <ClaimDetailSheet
        claim={selectedClaim}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
};

export default CompanyClaims;
