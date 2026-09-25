import { useState } from "react";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QueryState } from "@/components/ui/query-state";
import { MaskedValue } from "@/components/masked-value";
import { useTheatreWtf } from "@/hooks/api/theatres";
import { revealCredentialValue } from "@/hooks/api/credentials";
import { revealAgentConfigValue } from "@/hooks/api/agentConfigs";
import { contentTypeLabel } from "@/data/contentTypes";
import { deviceCredentialsPath } from "@/data/credentialsManagerData";
import { agentConfigurationsPath, entitlementLabel, formatConfigValue } from "@/data/agentConfigData";
import type { WtfAgent, WtfData, WtfScreenDevice } from "@/data/wtfData";
import type { DeliveryTimeSlot } from "@/types";

interface Props {
  theatreId: string | null;
  theatreName?: string;
  onOpenChange: (open: boolean) => void;
}

const SECTIONS = [
  "theatre", "isp", "content", "kdm", "screens", "devices", "agents",
] as const;

const Empty = ({ children }: { children: React.ReactNode }) => <p className="text-sm text-muted-foreground">{children}</p>;

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-[10rem_1fr] gap-3 py-1 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <div>{children || <span className="text-muted-foreground">—</span>}</div>
  </div>
);

const Tags = ({ items }: { items: string[] }) =>
  items.length ? (
    <div className="flex flex-wrap gap-1">{items.map((x) => <Badge key={x} variant="secondary" className="font-normal">{x}</Badge>)}</div>
  ) : null;

const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const Slots = ({ slots, empty }: { slots: DeliveryTimeSlot[]; empty: string }) =>
  slots.length === 0 ? (
    <Empty>{empty}</Empty>
  ) : (
    <ul className="space-y-0.5 text-sm">
      {[...slots].sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day) || a.startTime.localeCompare(b.startTime)).map((s) => (
        <li key={s.id} className="grid grid-cols-[7rem_1fr]"><span>{s.day}</span><span className="tabular-nums">{s.startTime}–{s.endTime}</span></li>
      ))}
    </ul>
  );

const scopeLabel = (scope: string, ref: string) => (scope === "global" ? (ref === "Global" ? "Global" : `Global · ${ref}`) : `${scope[0].toUpperCase()}${scope.slice(1)} · ${ref}`);

/** The credentials that apply to one device, with where they come from. */
const DeviceCredentials = ({ device }: { device: WtfScreenDevice }) => {
  const c = device.credentials;
  if (!c) {
    return device.deviceModelId ? (
      <Link to={deviceCredentialsPath(device.deviceModelId)} className="text-sm text-primary underline-offset-2 hover:underline">None — add in Credentials Manager</Link>
    ) : (
      <span className="text-sm text-muted-foreground">Model not in Credentials Manager</span>
    );
  }
  return (
    <div className="space-y-1">
      {c.fields.map((f) => (
        <div key={f.key} className="flex items-center gap-1 text-sm">
          <span className="text-muted-foreground">{f.name}:</span>
          {c.maskedKeys.includes(f.key) ? (
            <MaskedValue key={`${c.credentialId}:${c.updatedAt}`} label={f.name} reveal={() => revealCredentialValue(c.deviceModelId, c.credentialId, f.key)} />
          ) : c.values[f.key] ? (
            <code>{c.values[f.key]}</code>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      ))}
      <Badge variant="outline" className="font-normal">{scopeLabel(c.scope, c.ref)}</Badge>
    </div>
  );
};

/** The configuration that applies to this theatre, one line per field with its source. */
const AgentConfiguration = ({ agent }: { agent: WtfAgent }) => {
  if (agent.configuration.length === 0) return <span className="text-sm text-muted-foreground">No configurations</span>;
  // One source badge for the lot when every value comes from the same row
  const sources = new Set(agent.configuration.map((c) => (c.source ? scopeLabel(c.source, c.sourceRef ?? "") : "")));
  const shared = sources.size === 1 ? [...sources][0] : null;
  return (
    <div className="space-y-1">
      {agent.configuration.map((c) => (
        <div key={c.field.key} className="flex flex-wrap items-center gap-1 text-sm">
          <span className="text-muted-foreground">{c.field.name}:</span>
          {c.masked && c.configId ? (
            <MaskedValue key={`${c.configId}:${c.updatedAt}`} label={c.field.name} reveal={() => revealAgentConfigValue(agent.imageId, c.configId!, c.field.key)} format={(v) => formatConfigValue(c.field, v)} />
          ) : c.value !== null ? (
            <code>{formatConfigValue(c.field, c.value)}</code>
          ) : (
            <span className="text-muted-foreground">Not set</span>
          )}
          {c.source && !shared && <Badge variant="outline" className="font-normal">{scopeLabel(c.source, c.sourceRef ?? "")}</Badge>}
        </div>
      ))}
      {shared && <Badge variant="outline" className="font-normal">{shared}</Badge>}
    </div>
  );
};

const restrictionDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

const WtfSections = ({ data }: { data: WtfData }) => {
  const [open, setOpen] = useState<string[]>(["theatre"]);
  const t = data.theatre;
  const count = (n: number) => <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">{n}</Badge>;

  return (
    <>
      <div className="flex justify-end gap-2 pb-2">
        <Button variant="ghost" size="sm" onClick={() => setOpen([...SECTIONS])}>Expand all</Button>
        <Button variant="ghost" size="sm" onClick={() => setOpen([])}>Collapse all</Button>
      </div>
      <Accordion type="multiple" value={open} onValueChange={setOpen} className="rounded-lg border px-4">
        <AccordionItem value="theatre">
          <AccordionTrigger>Theatre Meta Data</AccordionTrigger>
          <AccordionContent>
            <Row label="Name">{t.name}</Row>
            <Row label="Alternate names"><Tags items={t.alternateNames} /></Row>
            <Row label="Location">{[t.city, t.state, t.country].filter(Boolean).join(", ")}</Row>
            <Row label="Chain name">{t.chainName}</Row>
            <Row label="ID"><code>cinemadb.io: {t.uuid || t.id}</code></Row>
            <Row label="TMS">{t.tms}</Row>
            <Row label="Ticketing system">{t.ticketingSystem}</Row>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="isp">
          <AccordionTrigger>Theatre ISP Management</AccordionTrigger>
          <AccordionContent>
            <p className="pb-2 text-xs font-medium">Bandwidth restrictions</p>
            {data.isp.enabled && data.isp.restrictions ? (
              <ul className="space-y-0.5 text-sm">
                {restrictionDays.map((d) => {
                  const r = data.isp.restrictions?.[d];
                  return (
                    <li key={d} className="grid grid-cols-[7rem_1fr]">
                      <span className="capitalize">{d}</span>
                      <span className="tabular-nums">{r?.startTime && r?.endTime ? `${r.startTime}–${r.endTime}` : "No restriction"}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <Empty>No bandwidth restrictions.</Empty>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="content">
          <AccordionTrigger>Content Auto Ingestion</AccordionTrigger>
          <AccordionContent className="space-y-3">
            {data.contentAutoIngestion.enabled ? (
              <>
                <Row label="Content types"><Tags items={data.contentAutoIngestion.contentTypes.map((id) => `${contentTypeLabel(id)} (${id})`)} /></Row>
                <Row label="Time slots"><Slots slots={data.contentAutoIngestion.timeSlots} empty="Any time" /></Row>
              </>
            ) : (
              <Empty>Auto-ingestion of content is off.</Empty>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="kdm">
          <AccordionTrigger>KDM Auto Ingestion</AccordionTrigger>
          <AccordionContent>
            <Row label="Time slots"><Slots slots={data.kdmAutoIngestion.timeSlots} empty="Any time" /></Row>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="screens">
          <AccordionTrigger><span>Screen Meta Data{count(data.screens.length)}</span></AccordionTrigger>
          <AccordionContent>
            {data.screens.length === 0 ? <Empty>No screens.</Empty> : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Screen Name</TableHead>
                      <TableHead>No.</TableHead>
                      <TableHead>Seats</TableHead>
                      <TableHead>Projection Type</TableHead>
                      <TableHead>Projection Experience</TableHead>
                      <TableHead>Audio Experience</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.screens.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>{s.number}</TableCell>
                        <TableCell className="tabular-nums">{s.seatCount ?? "—"}</TableCell>
                        <TableCell>{s.projectionType ?? "—"}</TableCell>
                        <TableCell><Tags items={s.projectionExperiences} /></TableCell>
                        <TableCell><Tags items={s.audioExperiences} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="devices">
          <AccordionTrigger><span>Screen Devices{count(data.screenDevices.length)}</span></AccordionTrigger>
          <AccordionContent>
            {data.screenDevices.length === 0 ? <Empty>No screen devices.</Empty> : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Screen Name</TableHead>
                      <TableHead>No.</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Credentials</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.screenDevices.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.screenName}</TableCell>
                        <TableCell>{d.screenNumber}</TableCell>
                        <TableCell>{d.brand}</TableCell>
                        <TableCell>{d.model}</TableCell>
                        <TableCell>{d.role || "—"}</TableCell>
                        <TableCell><DeviceCredentials device={d} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="agents" className="border-b-0">
          <AccordionTrigger><span>Agents & Agent Config{count(data.agents.length)}</span></AccordionTrigger>
          <AccordionContent>
            {data.agents.length === 0 ? <Empty>No agents are installed on this theatre's appliances.</Empty> : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent Name</TableHead>
                      <TableHead>Agent Entitlements</TableHead>
                      <TableHead>Agent Configuration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.agents.map((a) => (
                      <TableRow key={a.imageId}>
                        <TableCell>
                          <Link to={agentConfigurationsPath(a.imageId)} className="font-medium text-primary underline-offset-2 hover:underline">{a.name}</Link>
                          {a.versions.length > 0 && <p className="text-xs text-muted-foreground">{a.versions.join(", ")}</p>}
                        </TableCell>
                        <TableCell><Tags items={a.entitlements.map(entitlementLabel)} /></TableCell>
                        <TableCell><AgentConfiguration agent={a} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
};

/** View WTF ("What's This Facility"): everything configured for a theatre, in one right-side panel. */
export const WtfSheet = ({ theatreId, theatreName, onOpenChange }: Props) => {
  const query = useTheatreWtf(theatreId ?? undefined);
  return (
    <Sheet open={!!theatreId} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-3xl">
        <SheetHeader className="pb-2">
          <SheetTitle>WTF — {query.data?.theatre.name ?? theatreName ?? "Theatre"}</SheetTitle>
          <SheetDescription>What's This Facility: the theatre's setup at a glance.</SheetDescription>
        </SheetHeader>
        <QueryState query={query} label="theatre summary">
          {(data) => <WtfSections key={data.theatre.id} data={data} />}
        </QueryState>
      </SheetContent>
    </Sheet>
  );
};
