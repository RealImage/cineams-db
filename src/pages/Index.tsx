
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Building2, Film, HardDrive, User2, Building, ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { mockDashboardStats } from "@/data/mockData";
import { Theatre } from "@/types";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const Dashboard = () => {
  const [stats, setStats] = useState(mockDashboardStats);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const recentTheatreColumns = [
    {
      header: "Theatre Name",
      accessor: "name",
    },
    {
      header: "Chain",
      accessor: "chainName",
    },
    {
      header: "Location",
      accessor: "address",
      cell: (row: Theatre) => (
        <span className="truncate max-w-[200px] block">
          {row.address}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
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
      ),
    },
    {
      header: "Screens",
      accessor: "screenCount",
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Export
            </Button>
            <Button size="sm">Refresh Data</Button>
          </div>
        </div>
        
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          animate="show"
        >
          <StatCard 
            title="Total Theatres" 
            value={stats.totalTheatres} 
            previousValue={stats.totalTheatres - 12}
            icon={<Building2 className="h-12 w-12" />}
            description="Last 30 days"
          />
          <StatCard 
            title="Total Screens" 
            value={stats.totalScreens} 
            previousValue={stats.totalScreens - 48}
            icon={<Film className="h-12 w-12" />}
            description="Last 30 days"
          />
          <StatCard 
            title="Total Companies" 
            value={stats.totalCompanies} 
            previousValue={stats.totalCompanies - 3}
            icon={<Building className="h-12 w-12" />}
            description="Last 30 days"
          />
          <StatCard 
            title="Total Devices" 
            value={stats.totalDevices} 
            previousValue={stats.totalDevices - 137}
            icon={<HardDrive className="h-12 w-12" />}
            description="Last 30 days"
          />
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardCard title="Theatres by Status">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.theatresByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {stats.theatresByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} Theatres`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </DashboardCard>
          
          <DashboardCard title="Theatres by Type">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={stats.theatresByType}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} Theatres`, 'Count']} />
                <Bar dataKey="count" fill="#0088FE" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </DashboardCard>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardCard title="Recently Added Theatres">
            <DataTable
              data={stats.recentlyAddedTheatres}
              columns={recentTheatreColumns}
              searchable={false}
              onRowClick={(row) => console.log("Clicked row:", row)}
            />
            <div className="mt-4 flex justify-end">
              <Button size="sm" variant="outline" className="flex items-center gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </DashboardCard>
          
          <DashboardCard title="Recently Updated Theatres">
            <DataTable
              data={stats.recentlyUpdatedTheatres}
              columns={recentTheatreColumns}
              searchable={false}
              onRowClick={(row) => console.log("Clicked row:", row)}
            />
            <div className="mt-4 flex justify-end">
              <Button size="sm" variant="outline" className="flex items-center gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </DashboardCard>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
