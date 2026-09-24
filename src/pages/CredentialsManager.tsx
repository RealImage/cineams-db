import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, KeyRound, Pencil, Search, SquarePen, X } from "lucide-react";
import { toast } from "sonner";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FilterButton, FilterDrawer, FilterGroup, useFilterDraft } from "@/components/ui/filter-drawer";
import { formatDateTime } from "@/lib/dateUtils";
import {
  CredentialDevice,
  dciOptions,
  deviceTypes,
  hasDefaultCredentials,
} from "@/data/credentialsManagerData";
import { credentialsStore, deviceCredentialsPath, useCredentialsStore } from "@/data/credentialsStore";
import { CredentialDeviceSheet } from "@/components/credentials-manager/CredentialDeviceSheet";
import { EditCredentialDeviceDialog } from "@/components/credentials-manager/EditCredentialDeviceDialog";
import { DefaultCredentialsDialog } from "@/components/credentials-manager/DefaultCredentialsDialog";
import { DciBadge, DefaultCredentialsBadge } from "@/components/credentials-manager/badges";

const ALL = "all";
const MAX_TRANSLATIONS_SHOWN = 2;

type Filters = { brand: string; type: string; dci: string; credentials: string };
const emptyFilters: Filters = { brand: ALL, type: ALL, dci: ALL, credentials: ALL };

const CredentialsManager = () => {
  const navigate = useNavigate();
  const { devices, credentials } = useCredentialsStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [draft, setDraft] = useFilterDraft(filters, filterOpen);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [credentialsOpen, setCredentialsOpen] = useState(false);

  const selected = devices.find((d) => d.id === selectedId) ?? null;
  const devicesWithDefaults = useMemo(
    () => new Set(devices.filter((d) => hasDefaultCredentials(d.id, credentials)).map((d) => d.id)),
    [devices, credentials],
  );
  const brands = useMemo(() => Array.from(new Set(devices.map((d) => d.brand))).sort(), [devices]);

  const filteredDevices = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return devices.filter((d) => {
      if (term) {
        const haystack = [d.brand, d.model, ...d.translations, ...d.roles].join(" ").toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (filters.brand !== ALL && d.brand !== filters.brand) return false;
      if (filters.type !== ALL && d.type !== filters.type) return false;
      if (filters.dci !== ALL && d.dci !== filters.dci) return false;
      if (filters.credentials !== ALL && String(devicesWithDefaults.has(d.id)) !== filters.credentials) return false;
      return true;
    });
  }, [devices, devicesWithDefaults, searchTerm, filters]);

  const activeFilterCount = Object.values(filters).filter((v) => v !== ALL).length;
  const filterLabels: Record<keyof Filters, string> = { brand: "Brand", type: "Type", dci: "DCI", credentials: "Default credentials" };
  const filterValueLabel = (key: keyof Filters, value: string) =>
    key === "credentials" ? (value === "true" ? "Available" : "Missing") : key === "dci" && value !== "NA" ? (value === "true" ? "True" : "False") : value;

  const openDetails = (d: CredentialDevice) => { setSelectedId(d.id); setDetailsOpen(true); };
  const openEdit = (d: CredentialDevice) => { setSelectedId(d.id); setDetailsOpen(false); setEditOpen(true); };
  const openCredentials = (d: CredentialDevice) => { setSelectedId(d.id); setDetailsOpen(false); setCredentialsOpen(true); };
  const manageCredentials = (d: CredentialDevice) => navigate(deviceCredentialsPath(d.id));

  const handleSaveDevice = (patch: Partial<CredentialDevice>) => {
    if (!selected) return;
    credentialsStore.updateDevice(selected.id, patch);
    toast.success(`Updated ${patch.brand ?? selected.brand} ${patch.model ?? selected.model}`);
  };

  const columns: Column<CredentialDevice>[] = [
    { header: "Brand", accessor: "brand", sortable: true },
    { header: "Model", accessor: "model", sortable: true, cell: (row) => <span className="font-medium">{row.model}</span> },
    {
      header: "Roles",
      accessor: (row) => row.roles.join(", "),
      cell: (row) =>
        row.roles.length ? (
          <div className="flex flex-wrap gap-1">
            {row.roles.map((r) => <Badge key={r} variant="secondary" className="font-normal">{r}</Badge>)}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    { header: "Type", accessor: "type", sortable: true },
    { header: "DCI", accessor: "dci", cell: (row) => <DciBadge value={row.dci} /> },
    {
      header: "Translations",
      accessor: (row) => row.translations.join(", "),
      cell: (row) => {
        if (row.translations.length === 0) return <span className="text-muted-foreground">—</span>;
        const shown = row.translations.slice(0, MAX_TRANSLATIONS_SHOWN).join(", ");
        const rest = row.translations.length - MAX_TRANSLATIONS_SHOWN;
        if (rest <= 0) return <span className="text-sm">{shown}</span>;
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm cursor-default">
                {shown} <span className="text-muted-foreground">+{rest} more</span>
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">{row.translations.join(", ")}</TooltipContent>
          </Tooltip>
        );
      },
    },
    {
      header: "Default Credentials",
      accessor: (row) => (devicesWithDefaults.has(row.id) ? "Available" : "Missing"),
      cell: (row) => <DefaultCredentialsBadge available={devicesWithDefaults.has(row.id)} />,
    },
    { header: "Updated By", accessor: "updatedBy", sortable: true, cell: (row) => row.updatedBy || <span className="text-muted-foreground">—</span> },
    { header: "Updated At", accessor: "updatedAt", sortable: true, cell: (row) => <span className="whitespace-nowrap">{formatDateTime(row.updatedAt)}</span> },
  ];

  const actions = [
    { label: "View device details", icon: <Eye className="h-4 w-4" />, onClick: openDetails },
    { label: "Edit device details", icon: <Pencil className="h-4 w-4" />, onClick: openEdit },
    { label: "View device credentials", icon: <KeyRound className="h-4 w-4" />, onClick: openCredentials },
    { label: "Edit device credentials", icon: <SquarePen className="h-4 w-4" />, onClick: manageCredentials },
  ];

  const filterSelect = (key: keyof Filters, placeholder: string, options: { value: string; label: string }[]) => (
    <Select value={draft[key]} onValueChange={(v) => setDraft((f) => ({ ...f, [key]: v }))}>
      <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{placeholder}</SelectItem>
        {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <p className="text-muted-foreground">
        Manage device models, their alternate names and factory default credentials
      </p>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by brand, model, role or translation"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <FilterButton count={activeFilterCount} onClick={() => setFilterOpen(true)} />
      </div>

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {(Object.keys(filters) as (keyof Filters)[]).filter((k) => filters[k] !== ALL).map((k) => (
            <Badge key={k} variant="product" className="gap-1 pr-1">
              {filterLabels[k]}: {filterValueLabel(k, filters[k])}
              <button type="button" aria-label={`Remove ${filterLabels[k]} filter`} onClick={() => setFilters((f) => ({ ...f, [k]: ALL }))} className="rounded-sm hover:bg-black/10">
                <X className="h-3.5 w-3.5" />
              </button>
            </Badge>
          ))}
          <Button variant="link" size="sm" onClick={() => setFilters(emptyFilters)}>Clear all</Button>
        </div>
      )}

      <FilterDrawer
        open={filterOpen}
        onOpenChange={setFilterOpen}
        onApply={() => setFilters(draft)}
        onClear={() => { setDraft(emptyFilters); setFilters(emptyFilters); }}
      >
        <FilterGroup title="Brand">
          {filterSelect("brand", "All brands", brands.map((b) => ({ value: b, label: b })))}
        </FilterGroup>
        <FilterGroup title="Type">
          {filterSelect("type", "All types", deviceTypes.map((t) => ({ value: t, label: t })))}
        </FilterGroup>
        <FilterGroup title="DCI compliant">
          {filterSelect("dci", "Any", dciOptions.map((d) => ({ value: d, label: d === "NA" ? "NA" : d === "true" ? "True" : "False" })))}
        </FilterGroup>
        <FilterGroup title="Default credentials">
          {filterSelect("credentials", "Any", [
            { value: "true", label: "Available" },
            { value: "false", label: "Missing" },
          ])}
        </FilterGroup>
      </FilterDrawer>

      <p className="text-sm text-muted-foreground">
        Showing {filteredDevices.length} of {devices.length} devices
      </p>

      <DataTable
        data={filteredDevices}
        columns={columns}
        searchable={false}
        actions={actions}
        onRowClick={openDetails}
      />

      <CredentialDeviceSheet
        device={selected}
        hasDefaults={selected ? devicesWithDefaults.has(selected.id) : false}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onEdit={openEdit}
        onViewCredentials={openCredentials}
      />
      <EditCredentialDeviceDialog
        device={selected}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={handleSaveDevice}
      />
      <DefaultCredentialsDialog
        device={selected}
        credentials={selected ? credentials.filter((c) => c.deviceId === selected.id) : []}
        open={credentialsOpen}
        onOpenChange={setCredentialsOpen}
        onManage={manageCredentials}
      />
    </motion.div>
  );
};

export default CredentialsManager;
