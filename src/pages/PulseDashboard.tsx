
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { Monitor, Eye, EyeOff, Thermometer, Projector, Building2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// Mock data for monitored theatres
const monitoredTheatres = [
  { id: 1, name: "AMC Empire 25", city: "New York", country: "USA", screens: 25, environment: 20, projection: 18 },
  { id: 2, name: "Odeon Leicester Square", city: "London", country: "UK", screens: 14, environment: 12, projection: 14 },
  { id: 3, name: "PVR Phoenix", city: "Mumbai", country: "India", screens: 11, environment: 11, projection: 9 },
  { id: 4, name: "CGV Yongsan", city: "Seoul", country: "South Korea", screens: 18, environment: 15, projection: 16 },
  { id: 5, name: "Cinépolis Diana", city: "Mexico City", country: "Mexico", screens: 16, environment: 10, projection: 12 },
  { id: 6, name: "Village Cinemas Crown", city: "Melbourne", country: "Australia", screens: 12, environment: 8, projection: 10 },
  { id: 7, name: "Pathé Schouwburgplein", city: "Rotterdam", country: "Netherlands", screens: 7, environment: 7, projection: 5 },
];

const totalScreens = monitoredTheatres.reduce((sum, t) => sum + t.screens, 0);
const envMonitored = monitoredTheatres.reduce((sum, t) => sum + t.environment, 0);
const projMonitored = monitoredTheatres.reduce((sum, t) => sum + t.projection, 0);
const noMonitoring = totalScreens - Math.max(envMonitored, projMonitored);

// Mock histogram data for environment monitoring scores (percentage 1-100)
const envHistogramData = [
  { range: "1-10", count: 3 },
  { range: "11-20", count: 5 },
  { range: "21-30", count: 8 },
  { range: "31-40", count: 12 },
  { range: "41-50", count: 15 },
  { range: "51-60", count: 18 },
  { range: "61-70", count: 22 },
  { range: "71-80", count: 14 },
  { range: "81-90", count: 10 },
  { range: "91-100", count: 6 },
];

const projHistogramData = [
  { range: "1-10", count: 2 },
  { range: "11-20", count: 4 },
  { range: "21-30", count: 7 },
  { range: "31-40", count: 10 },
  { range: "41-50", count: 13 },
  { range: "51-60", count: 20 },
  { range: "61-70", count: 19 },
  { range: "71-80", count: 16 },
  { range: "81-90", count: 8 },
  { range: "91-100", count: 5 },
];

const envChartConfig = {
  count: { label: "Screens", color: "hsl(var(--primary))" },
};

const projChartConfig = {
  count: { label: "Screens", color: "hsl(210 80% 60%)" },
};

export default function PulseDashboard() {
  return (
    <div className="flex flex-col gap-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Theatres Monitored"
          value={monitoredTheatres.length}
          icon={<Building2 className="h-5 w-5" />}
        />
        <StatCard
          title="Screens Monitored"
          value={totalScreens}
          icon={<Monitor className="h-5 w-5" />}
        />
        <StatCard
          title="Environment Monitoring"
          value={envMonitored}
          icon={<Thermometer className="h-5 w-5" />}
        />
        <StatCard
          title="Projection Monitoring"
          value={projMonitored}
          icon={<Projector className="h-5 w-5" />}
        />
        <StatCard
          title="No Monitoring"
          value={noMonitoring}
          icon={<EyeOff className="h-5 w-5" />}
        />
      </div>

      {/* Theatres Table */}
      <DashboardCard title="Monitored Theatres">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Theatre</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Country</TableHead>
              <TableHead className="text-center">Screens</TableHead>
              <TableHead className="text-center">Environment</TableHead>
              <TableHead className="text-center">Projection</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monitoredTheatres.map((theatre) => (
              <TableRow key={theatre.id}>
                <TableCell className="font-medium">{theatre.name}</TableCell>
                <TableCell>{theatre.city}</TableCell>
                <TableCell>{theatre.country}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary">{theatre.screens}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    {theatre.environment}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="border-accent-foreground/30 text-accent-foreground">
                    {theatre.projection}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DashboardCard>

      {/* Environment Monitoring Histogram */}
      <DashboardCard title="Environment Monitoring Distribution" description="Number of screens by environment monitoring score range">
        <ChartContainer config={envChartConfig} className="h-[300px] w-full">
          <BarChart data={envHistogramData} margin={{ top: 10, right: 20, bottom: 40, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="range"
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
              label={{ value: "Score Range", position: "insideBottom", offset: -20, className: "fill-muted-foreground text-xs" }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
              label={{ value: "Screens", angle: -90, position: "insideLeft", offset: -5, className: "fill-muted-foreground text-xs" }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </DashboardCard>

      {/* Projection Monitoring Histogram */}
      <DashboardCard title="Projection Monitoring Distribution" description="Number of screens by projection monitoring score range">
        <ChartContainer config={projChartConfig} className="h-[300px] w-full">
          <BarChart data={projHistogramData} margin={{ top: 10, right: 20, bottom: 40, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="range"
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
              label={{ value: "Score Range", position: "insideBottom", offset: -20, className: "fill-muted-foreground text-xs" }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
              label={{ value: "Screens", angle: -90, position: "insideLeft", offset: -5, className: "fill-muted-foreground text-xs" }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="hsl(210 80% 60%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </DashboardCard>
    </div>
  );
}
