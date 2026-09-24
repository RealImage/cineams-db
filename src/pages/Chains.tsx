
import { useState } from "react";
import { motion } from "framer-motion";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { chains as mockChains } from "@/data/mockData";
import { Chain } from "@/types";
import { toast } from "sonner";
import { formatDate } from "@/lib/dateUtils";

/** Distinct values of a field, for a column's filter options. */
const optionsFor = (key: keyof Chain) => (rows: Chain[]) =>
  Array.from(new Set(rows.map((r) => String(r[key])))).sort((a, b) => a.localeCompare(b));

const Chains = () => {
  const [chains, setChains] = useState<Chain[]>(mockChains);
  
  const handleCreateChain = () => {
    toast.info("Chain creation will be implemented in a future update");
  };
  
  const handleEditChain = (chain: Chain) => {
    toast.info(`Editing chain: ${chain.name}`);
  };
  
  const handleDeleteChain = (chain: Chain) => {
    setChains(chains.filter((c) => c.id !== chain.id));
    toast.success(`Chain "${chain.name}" deleted successfully`);
  };
  
  const columns: Column<Chain>[] = [
    {
      header: "Chain Name",
      accessor: "name" as keyof Chain,
      sortable: true,
    },
    {
      header: "Company",
      accessor: "companyName" as keyof Chain,
      sortable: true,
      filterable: true,
      filterOptions: optionsFor("companyName"),
    },
    {
      header: "Theatre Count",
      accessor: "theatreCount" as keyof Chain,
      sortable: true,
    },
    {
      header: "Status",
      accessor: "status" as keyof Chain,
      filterable: true,
      filterOptions: optionsFor("status"),
      cell: (row: Chain) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.status === "Active" 
            ? "bg-green-100 text-green-800" 
            : "bg-yellow-100 text-yellow-800"
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: "Last Updated",
      accessor: "updatedAt" as keyof Chain,
      sortable: true,
      filterable: true,
      filterType: "dateRange",
      cell: (row: Chain) => formatDate(row.updatedAt)
    }
  ];
  
  const actions = [
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEditChain
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDeleteChain
    }
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Manage theatre chains and their associated theatres
        </p>
        <Button onClick={handleCreateChain}>
          <Plus className="h-4 w-4 mr-2" /> Add Chain
        </Button>
      </div>
      
      <DataTable
        data={chains}
        columns={columns}
        searchPlaceholder="Search chains..."
        actions={actions}
      />
    </motion.div>
  );
};

export default Chains;
