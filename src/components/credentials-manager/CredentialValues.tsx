import { useState } from "react";
import { Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CredentialFieldDef, ScopedCredential, isSecretField } from "@/data/credentialsManagerData";

const MASK = "••••••••";

const copy = (value: string, what: string) => {
  navigator.clipboard?.writeText(value).then(
    () => toast.success(`${what} copied`),
    () => toast.error(`Could not copy ${what.toLowerCase()}`),
  );
};

/** Table cell: secrets are always masked; open the view dialog to reveal. */
export const CredentialCell = ({ field, value }: { field: CredentialFieldDef; value?: string }) => {
  if (!value) return <span className="text-muted-foreground">—</span>;
  return <code className="text-sm">{isSecretField(field) ? MASK : value}</code>;
};

const ValueRow = ({ field, value }: { field: CredentialFieldDef; value?: string }) => {
  const secret = isSecretField(field);
  const [revealed, setRevealed] = useState(false);
  const label = field.name;
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      {value ? (
        <div className="flex items-center gap-1">
          <code className="text-sm">{secret && !revealed ? MASK : value}</code>
          {secret && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setRevealed((r) => !r)} aria-label={revealed ? `Hide ${label}` : `Show ${label}`}>
              {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copy(value, label)} aria-label={`Copy ${label}`}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">—</p>
      )}
    </div>
  );
};

export const CredentialValues = ({ credential, fields }: { credential: ScopedCredential; fields: readonly CredentialFieldDef[] }) => (
  <div className="grid grid-cols-2 gap-3">
    {fields.map((f) => <ValueRow key={f.key} field={f} value={credential.values[f.key]} />)}
  </div>
);
