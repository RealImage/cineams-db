
import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus, Building } from "lucide-react";
import { chains as mockChains } from "@/data/mockData";
import { Chain } from "@/types";

const Chains = () => {
  const [chains, setChains] = useState<Chain[]>(mockChains);
  
  const columns = [
    {
      header: "Chain Name",
      accessor: "name"
    },
    {
      header: "Company",
      accessor: "companyName"
    },
    {
      header: "Theatres Count",
      accessor: "theatreCount"
    },
    {
      header: "Status",
      accessor: "status",
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
      header: "Created Date",
      accessor: "createdAt",
      cell: (row: Chain) => new Date(row.createdAt).toLocaleDateString()
    }
  ];
  
  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Theatre Chains</h1>
            <p className="text-muted-foreground mt-1">
              Manage all theatre chains in the CinemasDB system
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Add Chain
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Total Chains", count: chains.length, icon: <Building className="h-5 w-5" /> },
            { title: "Active Chains", count: chains.filter(c => c.status === "Active").length, icon: <Building className="h-5 w-5" /> },
            { title: "Total Theatres", count: chains.reduce((acc, chain) => acc + chain.theatreCount, 0), icon: <Building className="h-5 w-5" /> }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <div className="bg-primary/10 rounded-full p-2 text-primary">
                  {stat.icon}
                </div>
              </div>
              <h3 className="text-3xl font-bold mt-2">{stat.count.toLocaleString()}</h3>
            </motion.div>
          ))}
        </div>
        
        <DataTable
          data={chains}
          columns={columns}
          searchPlaceholder="Search chains..."
        />
      </motion.div>
    </Layout>
  );
};

export default Chains;
