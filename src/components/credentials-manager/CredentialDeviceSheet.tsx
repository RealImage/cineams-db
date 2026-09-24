import { KeyRound, Pencil } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDateTime } from "@/lib/dateUtils";
import { CredentialDevice } from "@/data/credentialsManagerData";
import { CredentialFieldsList, RoleBadges } from "./device-fields";
import { DciBadge, DefaultCredentialsBadge } from "./badges";

interface Props {
  device: CredentialDevice | null;
  hasDefaults: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (device: CredentialDevice) => void;
  onViewCredentials: (device: CredentialDevice) => void;
}

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="space-y-1">
    <p className="text-xs text-muted-foreground">{label}</p>
    <div className="text-sm font-medium">{value || "—"}</div>
  </div>
);

export const CredentialDeviceSheet = ({ device, hasDefaults, open, onOpenChange, onEdit, onViewCredentials }: Props) => {
  if (!device) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col">
        <SheetHeader className="px-5 py-4 border-b">
          <SheetTitle className="flex items-center justify-between gap-2 pr-8">
            <span className="truncate">{device.brand} {device.model}</span>
            <span className="text-xs font-normal text-muted-foreground">{device.type}</span>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-5 space-y-6">
            <section className="space-y-3">
              <h3 className="text-sm font-semibold">Device Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Brand" value={device.brand} />
                <Field label="Model" value={device.model} />
                <Field label="Type" value={device.type} />
                <Field label="DCI Compliant" value={<DciBadge value={device.dci} />} />
                <Field label="Role" value={device.primaryRole && <RoleBadges roles={[device.primaryRole]} />} />
                <Field label="Serial Numbers" value={device.serialNumberRequired ? "Expected" : "Not expected"} />
                <Field label="Roles From Certificates" value={device.certificateRoles.length > 0 && <RoleBadges roles={device.certificateRoles} />} />
                <Field label="Additional Roles" value={device.additionalRoles.length > 0 && <RoleBadges roles={device.additionalRoles} variant="product" />} />
                <Field label="Default Credentials" value={<DefaultCredentialsBadge available={hasDefaults} />} />
                <div className="col-span-2">
                  <Field label="Credentials Format" value={<CredentialFieldsList fields={device.credentialFields} />} />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Translations</h3>
                <Badge variant="secondary">{device.translations.length}</Badge>
              </div>
              {device.translations.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No alternate names.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {device.translations.map((t) => <Badge key={t} variant="outline" className="font-normal">{t}</Badge>)}
                </div>
              )}
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold">Audit</h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Updated By" value={device.updatedBy} />
                <Field label="Updated At" value={formatDateTime(device.updatedAt)} />
              </div>
            </section>
          </div>
        </ScrollArea>

        <SheetFooter className="px-5 py-3 border-t gap-2">
          <Button variant="outline" onClick={() => onViewCredentials(device)}>
            <KeyRound className="h-4 w-4 mr-2" />
            View credentials
          </Button>
          <Button onClick={() => onEdit(device)}>
            <Pencil className="h-4 w-4 mr-2" /> Edit device
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
