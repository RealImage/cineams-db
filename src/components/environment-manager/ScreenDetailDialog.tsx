
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine, ReferenceArea, ResponsiveContainer } from "recharts";
import { generateScreenTimeSeries, TIME_RANGES, type TimeRange, type TimeSeriesPoint } from "@/data/environmentTimeSeriesData";
import type { EnvironmentScreenRecord } from "@/data/environmentManagerData";

interface ScreenDetailDialogProps {
  screen: EnvironmentScreenRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const chartConfig = {
  normal: { label: "Normal", color: "hsl(var(--foreground))" },
  breach: { label: "Breach", color: "hsl(var(--destructive))" },
};

function splitSegments(data: TimeSeriesPoint[]) {
  return data.map((pt, i, arr) => {
    const next = i < arr.length - 1 ? arr[i + 1] : null;
    const isTransitionToNormal = pt.isBreach && next && !next.isBreach;
    const isTransitionToBreach = !pt.isBreach && next && next.isBreach;
    return {
      dateLabel: pt.dateLabel,
      timestamp: pt.timestamp,
      isOnPeriod: pt.isOnPeriod,
      normalValue: !pt.isBreach || isTransitionToNormal ? pt.value : undefined,
      breachValue: pt.isBreach || isTransitionToBreach ? pt.value : undefined,
    };
  });
}

function getOnPeriodAreas(data: TimeSeriesPoint[]) {
  const areas: { start: string; end: string }[] = [];
  let inOn = false;
  let start = "";
  for (const pt of data) {
    if (pt.isOnPeriod && !inOn) { start = pt.dateLabel; inOn = true; }
    if (!pt.isOnPeriod && inOn) { areas.push({ start, end: pt.dateLabel }); inOn = false; }
  }
  if (inOn && data.length > 0) areas.push({ start, end: data[data.length - 1].dateLabel });
  return areas;
}

interface MetricChartProps {
  title: string;
  data: TimeSeriesPoint[];
  onUpper: number;
  onLower: number;
  offUpper: number;
  offLower: number;
  unit: string;
}

const MetricChart = ({ title, data, onUpper, onLower, offUpper, offLower, unit }: MetricChartProps) => {
  const chartData = useMemo(() => splitSegments(data), [data]);
  const onAreas = useMemo(() => getOnPeriodAreas(data), [data]);

  const allThresholds = [onUpper, onLower, offUpper, offLower];
  const minVal = Math.min(...data.map(d => d.value), ...allThresholds) - 3;
  const maxVal = Math.max(...data.map(d => d.value), ...allThresholds) + 3;

  const tickInterval = Math.max(1, Math.floor(chartData.length / 8));

  return (
    <div className="rounded-lg border bg-card p-4">
      <h4 className="text-sm font-medium mb-3">{title}</h4>
      <ChartContainer config={chartConfig} className="h-[200px] w-full">
        <LineChart data={chartData} margin={{ top: 5, right: 30, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.5} />

          {onAreas.map((area, i) => (
            <ReferenceArea
              key={`on-${i}`}
              x1={area.start}
              x2={area.end}
              fill="hsl(142 76% 36% / 0.08)"
              strokeOpacity={0}
            />
          ))}

          {/* ON state thresholds - green dotted */}
          <ReferenceLine y={onUpper} stroke="hsl(142 76% 36%)" strokeDasharray="6 4" strokeWidth={1.5} />
          <ReferenceLine y={onLower} stroke="hsl(142 76% 36%)" strokeDasharray="6 4" strokeWidth={1.5} />

          {/* OFF state thresholds - blue dotted */}
          <ReferenceLine y={offUpper} stroke="hsl(217 91% 60%)" strokeDasharray="6 4" strokeWidth={1.5} />
          <ReferenceLine y={offLower} stroke="hsl(217 91% 60%)" strokeDasharray="6 4" strokeWidth={1.5} />

          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 10 }}
            className="fill-muted-foreground"
            interval={tickInterval}
            angle={0}
          />
          <YAxis
            domain={[Math.floor(minVal), Math.ceil(maxVal)]}
            tick={{ fontSize: 10 }}
            className="fill-muted-foreground"
            width={40}
          />
          <ChartTooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const pt = payload[0]?.payload;
              const val = pt?.normalValue ?? pt?.breachValue;
              return (
                <div className="rounded-md border bg-background px-3 py-2 shadow-md text-xs">
                  <p className="text-muted-foreground">{pt?.dateLabel}</p>
                  <p className="font-medium">{title}: {val} {unit}</p>
                </div>
              );
            }}
          />
          <Line type="monotone" dataKey="normalValue" stroke="hsl(var(--foreground))" strokeWidth={1.5} dot={false} connectNulls={false} />
          <Line type="monotone" dataKey="breachValue" stroke="hsl(var(--destructive))" strokeWidth={2.5} dot={false} connectNulls={false} />
        </LineChart>
      </ChartContainer>
      {/* Threshold labels */}
      <div className="flex justify-end gap-6 text-[10px] text-muted-foreground mt-1">
        <span className="text-green-600">ON: {onUpper}–{onLower} {unit}</span>
        <span className="text-blue-500">OFF: {offUpper}–{offLower} {unit}</span>
      </div>
    </div>
  );
};

export const ScreenDetailDialog = ({ screen, open, onOpenChange }: ScreenDetailDialogProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("5D");

  const timeSeries = useMemo(() => {
    if (!screen) return null;
    return generateScreenTimeSeries(screen.id, timeRange);
  }, [screen, timeRange]);

  if (!screen || !timeSeries) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{screen.screenName} — {screen.theatreName}</DialogTitle>
        </DialogHeader>

        {/* Time Range & Export */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {TIME_RANGES.map((r) => (
              <Button
                key={r}
                variant={timeRange === r ? "default" : "outline"}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => setTimeRange(r)}
              >
                {r}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
              <FileDown className="h-3.5 w-3.5" /> PDF
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
              <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
            </Button>
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-4">
          <MetricChart
            title="Temperature (°C)"
            data={timeSeries.temperature}
            onUpper={timeSeries.thresholds.temperature.onUpper}
            onLower={timeSeries.thresholds.temperature.onLower}
            offUpper={timeSeries.thresholds.temperature.offUpper}
            offLower={timeSeries.thresholds.temperature.offLower}
            unit="°C"
          />
          <MetricChart
            title="Humidity (%)"
            data={timeSeries.humidity}
            onUpper={timeSeries.thresholds.humidity.onUpper}
            onLower={timeSeries.thresholds.humidity.onLower}
            offUpper={timeSeries.thresholds.humidity.offUpper}
            offLower={timeSeries.thresholds.humidity.offLower}
            unit="%"
          />
          <MetricChart
            title="Dust (µg/m³)"
            data={timeSeries.dust}
            onUpper={timeSeries.thresholds.dust.onUpper}
            onLower={timeSeries.thresholds.dust.onLower}
            offUpper={timeSeries.thresholds.dust.offUpper}
            offLower={timeSeries.thresholds.dust.offLower}
            unit="µg/m³"
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 rounded-sm bg-green-100 border border-green-200" /> ON Period
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 rounded-sm bg-background border" /> OFF Period
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-foreground" /> Normal
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-destructive" /> Breach
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="16" height="2"><line x1="0" y1="1" x2="16" y2="1" stroke="hsl(142 76% 36%)" strokeWidth="2" strokeDasharray="4 2" /></svg>
            ON Threshold
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="16" height="2"><line x1="0" y1="1" x2="16" y2="1" stroke="hsl(217 91% 60%)" strokeWidth="2" strokeDasharray="4 2" /></svg>
            OFF Threshold
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
