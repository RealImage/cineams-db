import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CredentialDevice,
  CredentialFormatId,
  DciCompliance,
  DeviceType,
  credentialFormats,
  dciOptions,
  deviceTypes,
} from "@/data/credentialsManagerData";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  device: CredentialDevice | null;
  onSave: (patch: Partial<CredentialDevice>) => void;
}

type Form = {
  brand: string;
  model: string;
  roles: string;
  type: DeviceType;
  dci: DciCompliance;
  credentialFormat: CredentialFormatId;
  translations: string;
};

const toList = (s: string) => Array.from(new Set(s.split(",").map((x) => x.trim()).filter(Boolean)));

export const EditCredentialDeviceDialog = ({ open, onOpenChange, device, onSave }: Props) => {
  const [form, setForm] = useState<Form | null>(null);

  useEffect(() => {
    setForm(device && {
      brand: device.brand,
      model: device.model,
      roles: device.roles.join(", "),
      type: device.type,
      dci: device.dci,
      credentialFormat: device.credentialFormat,
      translations: device.translations.join(", "),
    });
  }, [device, open]);

  if (!form) return null;

  const upd = (patch: Partial<Form>) => setForm((f) => (f ? { ...f, ...patch } : f));
  const canSave = form.brand.trim() !== "" && form.model.trim() !== "";

  const handleSave = () => {
    onSave({
      brand: form.brand.trim(),
      model: form.model.trim(),
      roles: toList(form.roles.toUpperCase()),
      type: form.type,
      dci: form.dci,
      credentialFormat: form.credentialFormat,
      translations: toList(form.translations),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit device — {device?.brand} {device?.model}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="cm-brand" className="text-xs">Brand</Label>
            <Input id="cm-brand" value={form.brand} onChange={(e) => upd({ brand: e.target.value })} placeholder="e.g. Barco" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cm-model" className="text-xs">Model</Label>
            <Input id="cm-model" value={form.model} onChange={(e) => upd({ model: e.target.value })} placeholder="e.g. ICMP" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Type</Label>
            <Select value={form.type} onValueChange={(v: DeviceType) => upd({ type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {deviceTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">DCI Compliant</Label>
            <Select value={form.dci} onValueChange={(v: DciCompliance) => upd({ dci: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {dciOptions.map((d) => <SelectItem key={d} value={d}>{d === "NA" ? "NA" : d === "true" ? "True" : "False"}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Credentials Format</Label>
            <Select value={form.credentialFormat} onValueChange={(v: CredentialFormatId) => upd({ credentialFormat: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {credentialFormats.map((f) => <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {device && form.credentialFormat !== device.credentialFormat && (
              <p className="text-xs text-muted-foreground">Existing credentials keep their values; new fields will be blank until edited.</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="cm-roles" className="text-xs">Roles</Label>
            <Input id="cm-roles" value={form.roles} onChange={(e) => upd({ roles: e.target.value })} placeholder="Comma-separated, e.g. SM, PR" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="cm-translations" className="text-xs">Translations</Label>
            <Textarea
              id="cm-translations"
              rows={3}
              value={form.translations}
              onChange={(e) => upd({ translations: e.target.value })}
              placeholder="Comma-separated alternate names, e.g. ICMP-X, ICMP X"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!canSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
