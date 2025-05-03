
import React from "react";
import { Film, Calendar, User } from "lucide-react";
import { Column, Theatre } from "@/types";
import { Badge } from "@/components/ui/badge";

export const useTheatreColumns = (): Column<Theatre>[] => {
  const columns: Column<Theatre>[] = [
    {
      header: "Theatre Name",
      accessor: "name" as keyof Theatre
    },
    {
      header: "Display Name",
      accessor: "displayName" as keyof Theatre
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
      cell: (row: Theatre) => {
        const addressParts = row.address.split(',').map(part => part.trim());
        const location = addressParts.length >= 3 
          ? `${addressParts[addressParts.length - 3]}, ${addressParts[addressParts.length - 2]}, ${addressParts[addressParts.length - 1]}`
          : row.address;
        
        return (
          <span className="truncate max-w-[200px] block" title={row.address}>
            {location}
          </span>
        );
      }
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
      header: "Ad Integrators",
      accessor: "adIntegrators" as keyof Theatre,
      cell: (row: Theatre) => {
        const adIntegrators = ["Screenvision", "NCM", "Spotlight Cinema"];
        
        return (
          <div className="space-y-1">
            {adIntegrators.length > 0 ? (
              <div className="flex flex-col gap-1">
                {adIntegrators.map((integrator, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {integrator}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground text-xs">None</span>
            )}
          </div>
        );
      }
    },
    {
      header: "WireTAP",
      accessor: "wireTap" as keyof Theatre,
      cell: (row: Theatre) => {
        const wireTapSerials = ["WT8273891", "WT9264719"];
        
        return (
          <div className="space-y-1">
            {wireTapSerials.length > 0 ? (
              <div className="flex flex-col gap-1">
                {wireTapSerials.map((serial, i) => (
                  <span key={i} className="text-xs font-mono">
                    {serial}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground text-xs">None</span>
            )}
          </div>
        );
      }
    },
    {
      header: "Screens",
      accessor: "screenCount" as keyof Theatre,
      cell: (row: Theatre) => (
        <div className="flex items-center">
          <Film className="h-4 w-4 mr-1 text-muted-foreground" />
          <span>{row.screenCount}</span>
        </div>
      )
    },
    {
      header: "Last Updated",
      accessor: "updatedAt" as keyof Theatre,
      cell: (row: Theatre) => (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
          <span className="text-sm">
            {new Date(row.updatedAt).toLocaleDateString()}
          </span>
        </div>
      )
    },
    {
      header: "Updated By",
      accessor: "updatedBy" as keyof Theatre,
      cell: (row: Theatre) => (
        <div className="flex items-center">
          <User className="h-4 w-4 mr-1 text-muted-foreground" />
          <span className="text-sm">
            {row.id ? "John Doe" : "Unknown"}
          </span>
        </div>
      )
    }
  ];
  
  return columns;
};

export const useEnhancedColumns = (columns: Column<Theatre>[]) => {
  return React.useMemo(() => {
    return columns.map(column => {
      if (column.header === "Status") {
        return {
          ...column,
          filterable: true,
          filterOptions: ["Active", "Inactive", "Closed"]
        };
      }
      
      if (column.header === "Chain Name") {
        return {
          ...column,
          filterable: true,
          filterOptions: (data: Theatre[]) => {
            // Get unique chain names
            const chainNames = new Set(data.map(theatre => theatre.chainName));
            return Array.from(chainNames);
          }
        };
      }
      
      if (column.header === "Company") {
        return {
          ...column,
          filterable: true,
          filterOptions: (data: Theatre[]) => {
            // Get unique company names
            const companyNames = new Set(data.map(theatre => theatre.companyName));
            return Array.from(companyNames);
          }
        };
      }
      
      return {
        ...column,
        sortable: true // Make all columns sortable
      };
    });
  }, [columns]);
};
