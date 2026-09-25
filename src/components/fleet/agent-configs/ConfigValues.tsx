import { Copy, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaskedValue, copyText } from "@/components/masked-value";
import {
  AgentConfiguration,
  ConfigFieldDef,
  configValueTypeLabels,
  entitlementGroups,
  formatConfigValue,
} from "@/data/agentConfigData";
import { revealAgentConfigValue } from "@/hooks/api/agentConfigs";

/** The server also reports a value as masked while it's still encrypted, whatever the field says. */
const isMasked = (row: AgentConfiguration, field: ConfigFieldDef) => field.masked || row.maskedKeys.includes(field.key);
const hasValue = (row: AgentConfiguration, field: ConfigFieldDef) =>
  isMasked(row, field) ? row.maskedKeys.includes(field.key) : !!row.values[field.key];

const masked = (row: AgentConfiguration, field: ConfigFieldDef, copyable = false) => (
  <MaskedValue
    // Reset to masked whenever the row is saved again
    key={row.updatedAt}
    label={field.name}
    reveal={() => revealAgentConfigValue(row.imageId, row.id, field.key)}
    format={(v) => formatConfigValue(field, v)}
    copyable={copyable}
  />
);

/** Table cell: masked values stay hidden until their eye icon is clicked. */
export const ConfigCell = ({ row, field }: { row: AgentConfiguration; field: ConfigFieldDef }) => {
  if (!hasValue(row, field)) return <span className="text-muted-foreground">—</span>;
  if (isMasked(row, field)) return masked(row, field);
  return <code className="text-sm">{formatConfigValue(field, row.values[field.key])}</code>;
};

export const ConfigValuesGrid = ({ row, fields }: { row: AgentConfiguration; fields: readonly ConfigFieldDef[] }) => (
  <div className="grid grid-cols-2 gap-3">
    {fields.map((f) => (
      <div key={f.key} className="space-y-1">
        <p className="text-xs text-muted-foreground">{f.name}</p>
        {!hasValue(row, f) ? (
          <p className="text-sm text-muted-foreground">—</p>
        ) : isMasked(row, f) ? (
          masked(row, f, true)
        ) : (
          <div className="flex items-center gap-1">
            <code className="text-sm">{formatConfigValue(f, row.values[f.key])}</code>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyText(row.values[f.key], f.name)} aria-label={`Copy ${f.name}`} title={`Copy ${f.name}`}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    ))}
  </div>
);

/** The configurations format: each field with its value type, and a lock when it's masked. */
export const ConfigFieldsList = ({ fields }: { fields: readonly ConfigFieldDef[] }) =>
  fields.length === 0 ? (
    <span className="text-sm font-normal text-muted-foreground">No configurations</span>
  ) : (
    <div className="flex flex-wrap gap-1">
      {fields.map((f) => (
        <Badge key={f.key} variant="outline" className="gap-1 font-normal">
          {f.masked && <Lock className="h-3 w-3 text-muted-foreground" aria-label="Masked" />}
          {f.name}
          <span className="text-muted-foreground">{configValueTypeLabels[f.valueType]}</span>
        </Badge>
      ))}
    </div>
  );

/** Entitlements grouped by level, e.g. "Theatre: Theatre Meta Data". */
export const EntitlementsList = ({ ids }: { ids: readonly string[] }) => (
  <div className="space-y-1">
    {entitlementGroups.map((g) => {
      const held = g.entitlements.filter((e) => ids.includes(e.id));
      if (held.length === 0) return null;
      return (
        <div key={g.level} className="flex flex-wrap items-center gap-1">
          <span className="text-xs font-normal text-muted-foreground">{g.label}:</span>
          {held.map((e) => <Badge key={e.id} variant="secondary" className="font-normal">{e.label}</Badge>)}
        </div>
      );
    })}
  </div>
);
