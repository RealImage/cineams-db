
import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { DataTable, Column } from "@/components/ui/data-table";
import { 
  Building2,
  Film,
  Monitor,
  Building,
  Users,
  BarChart3,
  ThumbsUp,
  Clock,
} from "lucide-react";
import { Theatre } from "@/types";
import { mockDashboardStats, theatres } from "@/data/mockData";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Color constants
const COLORS = ["#4f46e5", "#0891b2", "#7c3aed", "#059669", "#c026d3", "#d97706"];
const STATUS_COLORS = {
  Active: "#16a34a",
  Inactive: "#ca8a04",
  Deleted: "#dc2626"
};

const Index = () => {
  const [dashboardStats] = useState(mockDashboardStats);
  
  const pieChartData = dashboardStats.theatresByType.map(item => ({
    name: item.type,
    value: item.count
  }));
  
  const barChartData = dashboardStats.theatresByStatus.map(item => ({
    name: item.status,
    value: item.count,
    color: STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] || "#94a3b8"
  }));
  
  const recentTheatreColumns: Column<Theatre>[] = [
    {
      header: "Theatre Name",
      accessor: "name" as keyof Theatre
    },
    {
      header: "Chain",
      accessor: "chainName" as keyof Theatre
    },
    {
      header: "Location",
      accessor: "address" as keyof Theatre,
      cell: (row: Theatre) => (
        <span className="truncate max-w-[200px] block">
          {row.address}
        </span>
      )
    },
    {
      header: "Added On",
      accessor: "createdAt" as keyof Theatre,
      cell: (row: Theatre) => new Date(row.createdAt).toLocaleDateString()
    }
  ];
  
  const updatedTheatreColumns: Column<Theatre>[] = [
    {
      header: "Theatre Name",
      accessor: "name" as keyof Theatre
    },
    {
      header: "Chain",
      accessor: "chainName" as keyof Theatre
    },
    {
      header: "Location",
      accessor: "address" as keyof Theatre,
      cell: (row: Theatre) => (
        <span className="truncate max-w-[200px] block">
          {row.address}
        </span>
      )
    },
    {
      header: "Updated On",
      accessor: "updatedAt" as keyof Theatre,
      cell: (row: Theatre) => new Date(row.updatedAt).toLocaleDateString()
    }
  ];
  
  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your cinema database
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Theatres"
            value={dashboardStats.totalTheatres}
            icon={<Building2 />}
            trend={+5}
            trendText="from last month"
          />
          <StatCard 
            title="Screens"
            value={dashboardStats.totalScreens}
            icon={<Film />}
            trend={+12}
            trendText="from last month"
          />
          <StatCard 
            title="Devices"
            value={dashboardStats.totalDevices}
            icon={<Monitor />}
            trend={+24}
            trendText="from last month"
          />
          <StatCard 
            title="Companies"
            value={dashboardStats.totalCompanies}
            icon={<Building />}
            trend={+2}
            trendText="from last month"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <DashboardCard
            title="Theatre Types"
            description="Distribution of theatres by type"
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} Theatres`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </DashboardCard>
          
          <DashboardCard
            title="Theatre Status"
            description="Count of theatres by status"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={barChartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} Theatres`, 'Count']} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {barChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </DashboardCard>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <DashboardCard
            title="Recently Added Theatres"
            description="Theatres added in the past 30 days"
          >
            <DataTable
              data={dashboardStats.recentlyAddedTheatres}
              columns={recentTheatreColumns}
              searchable={false}
            />
          </DashboardCard>
          
          <DashboardCard
            title="Recently Updated Theatres"
            description="Theatres updated in the past 30 days"
          >
            <DataTable
              data={dashboardStats.recentlyUpdatedTheatres}
              columns={updatedTheatreColumns}
              searchable={false}
            />
          </DashboardCard>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Index;
