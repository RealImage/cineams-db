
import { useEffect, useState } from "react";
import { Building2, Users, Film, Monitor } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { WireTAPMonitoringWidget } from "@/components/dashboard/WireTAPMonitoringWidget";
import { DashboardStats } from "@/types";

export default function Index() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalTheatres: 1245,
        activeTheatres: 1156,
        totalScreens: 5678,
        totalDevices: 9876,
        totalCompanies: 245,
        totalChains: 89,
        recentlyAddedTheatres: [],
        recentlyUpdatedTheatres: [],
        theatresByStatus: [
          { status: "Active", count: 1156 },
          { status: "Inactive", count: 76 },
          { status: "Deleted", count: 13 },
        ],
        theatresByType: [
          { type: "Multiplex", count: 856 },
          { type: "Single Screen", count: 234 },
          { type: "Drive-in", count: 34 },
          { type: "IMAX", count: 121 },
        ],
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-card rounded-lg border border-border animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="h-80 bg-card rounded-lg border border-border animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="h-80 bg-card rounded-lg border border-border animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Theatres"
          value={stats.totalTheatres}
          icon={<Building2 className="h-4 w-4" />}
          // Removing trend and trendText props
        />
        
        <StatCard
          title="Screens"
          value={stats.totalScreens}
          icon={<Film className="h-4 w-4" />}
          // Removing trend and trendText props
        />
        
        <StatCard
          title="Devices"
          value={stats.totalDevices}
          icon={<Monitor className="h-4 w-4" />}
          // Removing trend and trendText props
        />
        
        <StatCard
          title="Companies"
          value={stats.totalCompanies}
          icon={<Users className="h-4 w-4" />}
          // Removing trend and trendText props
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard title="Theatres by Status">
          <div className="space-y-8">
            {stats.theatresByStatus.map((item) => (
              <div key={item.status} className="flex items-center">
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium leading-none">
                    {item.status}
                  </p>
                  <div className="overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${Math.round(
                          (item.count / stats.totalTheatres) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium">{item.count}</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
        
        <DashboardCard title="Theatres by Type">
          <div className="space-y-8">
            {stats.theatresByType.map((item) => (
              <div key={item.type} className="flex items-center">
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium leading-none">
                    {item.type}
                  </p>
                  <div className="overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${Math.round(
                          (item.count / stats.totalTheatres) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium">{item.count}</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
      
      {/* Add the WireTAP monitoring widget here */}
      <WireTAPMonitoringWidget />
      
      <DashboardCard title="Recently Added Theatres">
        <div className="text-sm text-muted-foreground">
          No theatres added recently.
        </div>
      </DashboardCard>
      
      <DashboardCard title="Recently Updated Theatres">
        <div className="text-sm text-muted-foreground">
          No theatres updated recently.
        </div>
      </DashboardCard>
    </div>
  );
}
