import { useState } from "react";
import { Copy, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CredentialFieldDef, ScopedCredential } from "@/data/credentialsManagerData";
import { revealCredentialValue } from "@/hooks/api/credentials";

export const MASK = "••••••••";

const copyText = (value: string, what: string) =>
  navigator.clipboard?.writeText(value).then(
    () => toast.success(`${what} copied`),
    () => toast.error(`Could not copy ${what.toLowerCase()}`),
  );

/**
 * A masked value: shown as •••• until the eye is clicked, which fetches it
 * from the server. Hiding it again drops the plain value.
 */
const MaskedValue = ({ credential, field, copyable = false }: { credential: ScopedCredential; field: CredentialFieldDef; copyable?: boolean }) => {
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const label = field.name;

  const fetchValue = () => {
    setLoading(true);
    return revealCredentialValue(credential.deviceId, credential.id, field.key)
      .catch((err: Error) => {
        toast.error(`Could not show ${label.toLowerCase()}: ${err.message}`);
        throw err;
      })
      .finally(() => setLoading(false));
  };

  // Buttons sit inside clickable table rows; don't open the row
  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value !== null) setValue(null);
    else fetchValue().then(setValue, () => undefined);
  };
  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    (value !== null ? Promise.resolve(value) : fetchValue()).then((v) => copyText(v, label), () => undefined);
  };

  return (
    <div className="flex items-center gap-1">
      <code className="text-sm">{value ?? MASK}</code>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={toggle}
        disabled={loading}
        aria-label={value !== null ? `Hide ${label}` : `Show ${label}`}
        title={value !== null ? `Hide ${label}` : `Show ${label}`}
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : value !== null ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </Button>
      {copyable && (
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={copy} disabled={loading} aria-label={`Copy ${label}`} title={`Copy ${label}`}>
          <Copy className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
};

const hasValue = (credential: ScopedCredential, field: CredentialFieldDef) =>
  field.masked ? credential.maskedKeys.includes(field.key) : !!credential.values[field.key];

/** Table cell: masked values stay hidden until their eye icon is clicked. */
export const CredentialCell = ({ field, credential }: { field: CredentialFieldDef; credential: ScopedCredential }) => {
  if (!hasValue(credential, field)) return <span className="text-muted-foreground">—</span>;
  if (field.masked) return <MaskedValue credential={credential} field={field} />;
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
      ) : field.masked ? (
        <MaskedValue credential={credential} field={field} copyable />
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
