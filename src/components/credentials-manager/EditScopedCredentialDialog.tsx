import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import {
  CredentialDevice,
  CredentialValues,
  CredentialScope,
  GLOBAL_REF,
  ScopedCredential,
  countryOptions,
  credentialScopes,
  describeCredentialFields,
  isNumericValue,
  isSecretField,
} from "@/data/credentialsManagerData";
import { useCredentialRefOptions } from "@/hooks/api/credentials";

export type CredentialDraft = Omit<ScopedCredential, "id" | "updatedBy" | "updatedAt"> & { id?: string };

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  device: CredentialDevice;
  scope: CredentialScope;
  /** Existing row to edit; null to add a new one. */
  credential: ScopedCredential | null;
  /** Refs already used in this scope, to prevent duplicates. */
  takenRefs: string[];
  /** Resolves when saved (the dialog then closes); rejects to keep it open. */
  onSave: (draft: CredentialDraft) => Promise<unknown>;
  saving?: boolean;
}

const globalRefOptions = [GLOBAL_REF, ...countryOptions];

export const EditScopedCredentialDialog = ({ open, onOpenChange, device, scope, credential, takenRefs, onSave, saving = false }: Props) => {
  const needsRefOptions = scope === "chain" || scope === "theatre";
  const refOptionsQuery = useCredentialRefOptions(open && needsRefOptions);
  const [ref, setRef] = useState("");
  const [location, setLocation] = useState("");
  const [values, setValues] = useState<CredentialValues>({});

  useEffect(() => {
    if (!open) return;
    setRef(credential?.ref ?? "");
    setLocation(credential?.location ?? "");
    setValues(credential?.values ?? {});
  }, [open, credential]);

  const scopeInfo = credentialScopes.find((s) => s.id === scope)!;
  const fields = device.credentialFields;
  const loadedOptions =
    scope === "global" ? globalRefOptions
    : scope === "chain" ? refOptionsQuery.data?.chains
    : scope === "theatre" ? refOptionsQuery.data?.theatres
    : undefined;
  // Keep the row's current ref selectable even if it's no longer in the list.
  const options = loadedOptions && credential?.ref && !loadedOptions.includes(credential.ref)
    ? [credential.ref, ...loadedOptions]
    : loadedOptions;
  const optionsLoading = needsRefOptions && !loadedOptions;
  const trimmedRef = ref.trim();
  const duplicate = trimmedRef !== "" && trimmedRef !== credential?.ref && takenRefs.includes(trimmedRef);
  const valueError = (f: (typeof fields)[number]) => {
    const v = (values[f.key] ?? "").trim();
    if (!v) return null; // blank: Save stays disabled, no message needed
    return f.valueType === "numeric" && !isNumericValue(v) ? `${f.name} must be a number` : null;
  };
  const canSave =
    trimmedRef !== "" && !duplicate && !saving && fields.length > 0 &&
    fields.every((f) => (values[f.key] ?? "").trim() !== "" && !valueError(f));

  const handleSave = () => {
    onSave({
      id: credential?.id,
      deviceId: device.id,
      scope,
      ref: trimmedRef,
      location: scope === "device" ? location.trim() || undefined : undefined,
      values: Object.fromEntries(fields.map((f) => [f.key, values[f.key]!.trim()])),
    }).then(() => onOpenChange(false), () => {});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{credential ? "Edit" : "Add"} {scopeInfo.label.replace(" Credentials", "").toLowerCase()} credentials</DialogTitle>
          <DialogDescription>
            {device.brand} {device.model} · {describeCredentialFields(device.credentialFields)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-2">
          <div className="space-y-1">
            <Label className="text-xs">{scopeInfo.refLabel}</Label>
            {options || optionsLoading ? (
              <Combobox
                value={ref || null}
                onChange={(v) => setRef(v ?? "")}
                loading={optionsLoading && !refOptionsQuery.isError}
                disabled={refOptionsQuery.isError}
                placeholder={refOptionsQuery.isError ? `Could not load ${scopeInfo.refLabel.toLowerCase()} list` : `Select ${scopeInfo.refLabel.toLowerCase()}`}
                searchPlaceholder={`Search ${scopeInfo.refLabel.toLowerCase()}s`}
                aria-label={scopeInfo.refLabel}
                options={(options ?? []).map((o) => ({
                  value: o,
                  label: o,
                  disabled: o !== credential?.ref && takenRefs.includes(o),
                  description: o !== credential?.ref && takenRefs.includes(o) ? "Already added" : undefined,
                }))}
              />
            ) : (
              <Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="e.g. ICMP-12345" />
            )}
            {duplicate && <p className="text-xs text-destructive">Credentials for {trimmedRef} already exist.</p>}
          </div>
          {scope === "device" && (
            <div className="space-y-1">
              <Label className="text-xs">Installed At</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Optional, e.g. AMC Lincoln Square · Audi 3" />
            </div>
          )}
          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground">
              This device model has no credentials format yet. Add credential fields to the device model first.
            </p>
          )}
          {fields.map((f) => (
            <div key={f.key} className="space-y-1">
              <Label htmlFor={`cred-${f.key}`} className="text-xs">
                {f.name}
                {f.valueType === "numeric" && <span className="font-normal text-muted-foreground"> (numeric)</span>}
              </Label>
              <Input
                id={`cred-${f.key}`}
                type={isSecretField(f) ? "password" : "text"}
                inputMode={f.valueType === "numeric" ? "decimal" : undefined}
                autoComplete={isSecretField(f) ? "new-password" : "off"}
                value={values[f.key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                aria-invalid={!!valueError(f)}
              />
              {valueError(f) && <p className="text-xs text-red-500">{valueError(f)}</p>}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!canSave}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
