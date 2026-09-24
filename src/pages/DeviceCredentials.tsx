import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTime } from "@/lib/dateUtils";
import {
  CREDENTIALS_MANAGER_PATH,
  CredentialDeviceInput,
  CredentialDeviceWithStatus,
  ScopedCredential,
  credentialScopes,
} from "@/data/credentialsManagerData";
import { ApiError } from "@/lib/api";
import { QueryState } from "@/components/ui/query-state";
import {
  useCredentialDevice,
  useDeviceCredentials,
  useUpdateCredentialDevice,
} from "@/hooks/api/credentials";
import { DciBadge, DefaultCredentialsBadge } from "@/components/credentials-manager/badges";
import { DeviceModelDialog } from "@/components/credentials-manager/DeviceModelDialog";
import { CredentialFieldsList, RoleBadges } from "@/components/credentials-manager/device-fields";
import { ScopedCredentialsTab } from "@/components/credentials-manager/ScopedCredentialsTab";

const Field = ({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) => (
  <div className={`space-y-1 ${className ?? ""}`}>
    <p className="text-xs text-muted-foreground">{label}</p>
    <div className="text-sm font-medium">{value || "—"}</div>
  </div>
);

const DeviceNotFound = () => (
  <div className="space-y-4">
    <Button variant="ghost" asChild>
      <Link to={CREDENTIALS_MANAGER_PATH}><ArrowLeft className="h-4 w-4 mr-2" />Back</Link>
    </Button>
    <p className="text-muted-foreground">Device not found.</p>
  </div>
);

const DeviceCredentials = () => {
  const { id } = useParams();
  const deviceQuery = useCredentialDevice(id);
  const credentialsQuery = useDeviceCredentials(id);

  if (!id || (deviceQuery.error instanceof ApiError && deviceQuery.error.status === 404)) return <DeviceNotFound />;

  return (
    <QueryState query={deviceQuery} label="device">
      {(device) => <DeviceCredentialsView device={device} credentialsQuery={credentialsQuery} />}
    </QueryState>
  );
};

const DeviceCredentialsView = ({
  device,
  credentialsQuery,
}: {
  device: CredentialDeviceWithStatus;
  credentialsQuery: ReturnType<typeof useDeviceCredentials>;
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const updateDevice = useUpdateCredentialDevice();

  const handleSaveDevice = (patch: CredentialDeviceInput) =>
    updateDevice.mutateAsync({ id: device.id, patch }).then(
      (d) => { toast.success(`Updated ${d.brand} ${d.model}`); },
      (err: Error) => { toast.error(`Could not update ${device.brand} ${device.model}: ${err.message}`); throw err; },
    );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to={CREDENTIALS_MANAGER_PATH} aria-label="Back to Credentials Manager"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h2 className="text-lg font-semibold">{device.brand} {device.model}</h2>
          <p className="text-sm text-muted-foreground">{device.type}</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base">Device Details</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4 mr-2" /> Edit device
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
          <Field label="Brand" value={device.brand} />
          <Field label="Model" value={device.model} />
          <Field label="Role" value={device.primaryRole && <RoleBadges roles={[device.primaryRole]} />} />
          <Field label="Type" value={device.type} />
          <Field label="Roles From Certificates" value={device.certificateRoles.length > 0 && <RoleBadges roles={device.certificateRoles} />} />
          <Field label="Additional Roles" value={device.additionalRoles.length > 0 && <RoleBadges roles={device.additionalRoles} variant="product" />} />
          <Field label="DCI Compliant" value={<DciBadge value={device.dci} />} />
          <Field label="Serial Numbers" value={device.serialNumberRequired ? "Expected" : "Not expected"} />
          <Field label="Default Credentials" value={<DefaultCredentialsBadge available={device.hasDefaultCredentials} />} />
          <Field label="Credentials Format" className="col-span-2" value={<CredentialFieldsList fields={device.credentialFields} />} />
          <Field label="Updated By" value={device.updatedBy} />
          <Field label="Updated At" value={formatDateTime(device.updatedAt)} />
          <Field
            label="Translations"
            className="col-span-2 md:col-span-3"
            value={device.translations.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {device.translations.map((t) => <Badge key={t} variant="outline" className="font-normal">{t}</Badge>)}
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Credentials</CardTitle>
        </CardHeader>
        <CardContent>
          <QueryState query={credentialsQuery} label="credentials">
            {(deviceCredentials) => <CredentialTabs device={device} deviceCredentials={deviceCredentials} />}
          </QueryState>
        </CardContent>
      </Card>

      <DeviceModelDialog
        device={device}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={handleSaveDevice}
        saving={updateDevice.isPending}
      />
    </div>
  );
};

const CredentialTabs = ({
  device,
  deviceCredentials,
}: {
  device: CredentialDeviceWithStatus;
  deviceCredentials: ScopedCredential[];
}) => (
  <Tabs defaultValue="global">
    <TabsList className="flex-wrap h-auto">
      {credentialScopes.map((s) => {
        const count = deviceCredentials.filter((c) => c.scope === s.id).length;
        return (
          <TabsTrigger key={s.id} value={s.id} className="gap-2">
            {s.label}
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{count}</Badge>
          </TabsTrigger>
        );
      })}
    </TabsList>
    {credentialScopes.map((s) => (
      <TabsContent key={s.id} value={s.id} className="mt-4">
        <ScopedCredentialsTab
          device={device}
          scope={s.id}
          credentials={deviceCredentials.filter((c) => c.scope === s.id)}
        />
      </TabsContent>
    ))}
  </Tabs>
);

export default DeviceCredentials;
