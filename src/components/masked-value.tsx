import { useState } from "react";
import { Copy, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const MASK = "••••••••";

export const copyText = (value: string, what: string) =>
  navigator.clipboard?.writeText(value).then(
    () => toast.success(`${what} copied`),
    () => toast.error(`Could not copy ${what.toLowerCase()}`),
  );

/**
 * A masked value: shown as •••• until the eye is clicked, which fetches it
 * from the server with `reveal`. Hiding it again drops the plain value.
 * Key it by the record's updatedAt so a revealed value resets on change.
 */
export const MaskedValue = ({
  label,
  reveal,
  format = (v) => v,
  copyable = false,
}: {
  label: string;
  reveal: () => Promise<string>;
  format?: (value: string) => string;
  copyable?: boolean;
}) => {
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchValue = () => {
    setLoading(true);
    return reveal()
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
      <code className="text-sm">{value !== null ? format(value) : MASK}</code>
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
