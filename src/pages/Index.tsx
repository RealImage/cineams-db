import { useNavigate } from "react-router-dom";
import { Building2, Users, Film, Monitor, ClipboardCheck, AlertTriangle } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { WireTAPMonitoringWidget } from "@/components/dashboard/WireTAPMonitoringWidget";
import { Button } from "@/components/ui/button";
import { Theatre } from "@/types";
import { formatDate } from "@/lib/dateUtils";
import { useDashboardStats } from "@/hooks/api/theatres";
import { useApprovalsSummary } from "@/hooks/api/approvals";

const sum = (items: { count: number }[] | undefined) => (items ?? []).reduce((n, i) => n + i.count, 0);

const TheatreList = ({ theatres, dateOf, empty }: { theatres: Theatre[]; dateOf: (t: Theatre) => string; empty: string }) => {
  const navigate = useNavigate();
  if (theatres.length === 0) return <div className="text-sm text-muted-foreground">{empty}</div>;
  return (
    <div className="divide-y divide-border">
      {theatres.map((t) => (
        <button
          key={t.id}
          type="button"
          className="flex w-full items-center justify-between gap-3 py-2 text-left hover:bg-muted/50 rounded-md px-2"
          onClick={() => navigate(`/theatre/${t.id}/edit`)}
        >
          <span>
            <span className="block text-sm font-medium">{t.name}</span>
            <span className="block text-xs text-muted-foreground">
              {[t.chainName, [t.city, t.country].filter(Boolean).join(", ")].filter(Boolean).join(" · ")}
            </span>
          </span>
          <span className="text-xs text-muted-foreground">{formatDate(dateOf(t))}</span>
        </button>
      ))}
    </div>
  );
};

export default function Index() {
  const navigate = useNavigate();
  const statsQuery = useDashboardStats();
  const summaryQuery = useApprovalsSummary();
  const stats = statsQuery.data;
  const loading = statsQuery.isPending;

  if (statsQuery.isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center" role="alert">
        <p className="flex items-center gap-2 text-sm text-red-500">
          <AlertTriangle className="h-4 w-4" /> Could not load dashboard: {statsQuery.error.message}
        </p>
        <Button variant="outline" onClick={() => statsQuery.refetch()}>Retry</Button>
      </div>
    );
  }

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div onClick={() => navigate("/approvals-conflicts")} className="cursor-pointer">
          <StatCard
            title="Approvals Pending"
            value={summaryQuery.data ? sum(summaryQuery.data.approvals) : 0}
            icon={<ClipboardCheck className="h-4 w-4" />}
          />
        </div>
        <div onClick={() => navigate("/approvals-conflicts")} className="cursor-pointer">
          <StatCard
            title="Conflicts Pending"
            value={summaryQuery.data ? sum(summaryQuery.data.conflicts) : 0}
            icon={<AlertTriangle className="h-4 w-4" />}
          />
        </div>
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
        <TheatreList theatres={stats.recentlyAddedTheatres} dateOf={(t) => t.createdAt} empty="No theatres added recently." />
      </DashboardCard>
      
      <DashboardCard title="Recently Updated Theatres">
        <TheatreList theatres={stats.recentlyUpdatedTheatres} dateOf={(t) => t.updatedAt} empty="No theatres updated recently." />
      </DashboardCard>
    </div>
  );
}
