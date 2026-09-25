import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MaskedValue, copyText } from "@/components/masked-value";
import { CredentialFieldDef, ScopedCredential } from "@/data/credentialsManagerData";
import { revealCredentialValue } from "@/hooks/api/credentials";

const revealer = (credential: ScopedCredential, field: CredentialFieldDef) => () =>
  revealCredentialValue(credential.deviceId, credential.id, field.key);

/** The server also reports a value as masked while it's still encrypted, whatever the field says. */
const isMasked = (credential: ScopedCredential, field: CredentialFieldDef) =>
  field.masked || credential.maskedKeys.includes(field.key);
const hasValue = (credential: ScopedCredential, field: CredentialFieldDef) =>
  isMasked(credential, field) ? credential.maskedKeys.includes(field.key) : !!credential.values[field.key];

/** Table cell: masked values stay hidden until their eye icon is clicked. */
export const CredentialCell = ({ field, credential }: { field: CredentialFieldDef; credential: ScopedCredential }) => {
  if (!hasValue(credential, field)) return <span className="text-muted-foreground">—</span>;
  if (isMasked(credential, field)) return <MaskedValue key={credential.updatedAt} label={field.name} reveal={revealer(credential, field)} />;
  return <code className="text-sm">{credential.values[field.key]}</code>;
};

const ValueRow = ({ field, credential }: { field: CredentialFieldDef; credential: ScopedCredential }) => {
  const label = field.name;
  const value = credential.values[field.key];
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      {!hasValue(credential, field) ? (
        <p className="text-sm text-muted-foreground">—</p>
      ) : isMasked(credential, field) ? (
        // Keyed by updatedAt so a revealed value is dropped once the stored one changes
        <MaskedValue key={credential.updatedAt} label={field.name} reveal={revealer(credential, field)} copyable />
      ) : (
        <div className="flex items-center gap-1">
          <code className="text-sm">{value}</code>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyText(value, label)} aria-label={`Copy ${label}`} title={`Copy ${label}`}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export const CredentialValues = ({ credential, fields }: { credential: ScopedCredential; fields: readonly CredentialFieldDef[] }) => (
  <div className="grid grid-cols-2 gap-3">
    {fields.map((f) => <ValueRow key={f.key} field={f} credential={credential} />)}
  </div>
);
