import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Edit, Trash2, FileCheck, Filter, Search, Upload, Archive } from "lucide-react";
import { tdlDevices as mockDevices } from "@/data/mockData";
import { TDLDevice } from "@/types";
import { toast } from "sonner";
import { formatDate } from "@/lib/dateUtils";
import { TDLFilterPanel, TDLFilterBadges, TDLFilters } from "@/components/tdl/TDLFilterPanel";

const TDLDevices = () => {
  const [devices, setDevices] = useState<TDLDevice[]>(mockDevices);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<TDLFilters>({});
  const [filterOpen, setFilterOpen] = useState(false);

  const handleCreateDevice = () => {
    toast.info("Device creation will be implemented in a future update");
  };

  const handleUploadCertificate = (device: TDLDevice) => {
    toast.info(`Upload certificate for: ${device.manufacturer} ${device.model} (${device.serialNumber})`);
  };

  const handleEditDevice = (device: TDLDevice) => {
    toast.info(`Editing device: ${device.manufacturer} ${device.model} (${device.serialNumber})`);
  };

  const handleRetireDevice = (device: TDLDevice) => {
    toast.info(`Retiring device: ${device.manufacturer} ${device.model} (${device.serialNumber})`);
  };

  // Custom search: Model, Serial Number, Public Key Thumbprint, Issuer Thumbprint
  const searchFiltered = useMemo(() => {
    if (!searchTerm) return devices;
    const term = searchTerm.toLowerCase();
    return devices.filter(
      (d) =>
        d.model.toLowerCase().includes(term) ||
        d.serialNumber.toLowerCase().includes(term) ||
        d.publicKeyThumbprint.toLowerCase().includes(term) ||
        d.issuerThumbprint.toLowerCase().includes(term)
    );
  }, [devices, searchTerm]);

  // Apply filters
  const filteredDevices = useMemo(() => {
    let result = searchFiltered;

    if (filters.manufacturer) {
      result = result.filter((d) => d.manufacturer === filters.manufacturer);
    }
    if (filters.deviceRole) {
      result = result.filter((d) => d.deviceRole === filters.deviceRole);
    }
    if (filters.certificateAutoSync !== undefined) {
      const syncVal = filters.certificateAutoSync === "true";
      result = result.filter((d) => d.certificateAutoSync === syncVal);
    }
    if (filters.source) {
      result = result.filter((d) => d.source === filters.source);
    }
    if (filters.retired !== undefined) {
      const retiredVal = filters.retired === "true";
      result = result.filter((d) => d.retired === retiredVal);
    }
    if (filters.validTillFrom) {
      result = result.filter((d) => new Date(d.validTill) >= filters.validTillFrom!);
    }
    if (filters.validTillTo) {
      result = result.filter((d) => new Date(d.validTill) <= filters.validTillTo!);
    }
    if (filters.updatedFrom) {
      result = result.filter((d) => new Date(d.updatedOn) >= filters.updatedFrom!);
    }
    if (filters.updatedTo) {
      result = result.filter((d) => new Date(d.updatedOn) <= filters.updatedTo!);
    }

    return result;
  }, [searchFiltered, filters]);

  const { activeCount, filterContent, removeFilter, formatFilterValue, clearAll } = TDLFilterPanel({
    devices,
    filters,
    onFiltersChange: setFilters,
  });

  const columns: Column<TDLDevice>[] = [
    { header: "Manufacturer / Make", accessor: "manufacturer" as keyof TDLDevice },
    { header: "Model", accessor: "model" as keyof TDLDevice },
    { header: "Serial Number", accessor: "serialNumber" as keyof TDLDevice },
    { header: "Software Version", accessor: "softwareVersion" as keyof TDLDevice },
    { header: "Device Role", accessor: "deviceRole" as keyof TDLDevice },
    {
      header: "Certificate Auto-Sync",
      accessor: "certificateAutoSync" as keyof TDLDevice,
      cell: (row: TDLDevice) => (
        <span className={row.certificateAutoSync ? "text-green-600" : "text-muted-foreground"}>
          {row.certificateAutoSync ? "Yes" : "No"}
        </span>
      ),
    },
    {
      header: "Valid Till",
      accessor: "validTill" as keyof TDLDevice,
      cell: (row: TDLDevice) => {
        const isExpired = new Date(row.validTill) < new Date();
        return <span className={isExpired ? "text-destructive" : ""}>{formatDate(row.validTill)}</span>;
      },
    },
    { header: "Public Key Thumbprint", accessor: "publicKeyThumbprint" as keyof TDLDevice },
    { header: "Issuer Thumbprint", accessor: "issuerThumbprint" as keyof TDLDevice },
    { header: "Source", accessor: "source" as keyof TDLDevice },
    {
      header: "Retired?",
      accessor: "retired" as keyof TDLDevice,
      cell: (row: TDLDevice) => (
        <span className={row.retired ? "text-destructive font-medium" : "text-muted-foreground"}>
          {row.retired ? "Yes" : "No"}
        </span>
      ),
    },
    { header: "Updated By", accessor: "updatedBy" as keyof TDLDevice },
    {
      header: "Updated On",
      accessor: "updatedOn" as keyof TDLDevice,
      cell: (row: TDLDevice) => formatDate(row.updatedOn),
    },
  ];

  const actions = [
    {
      label: "Upload Certificate",
      icon: <Upload className="h-4 w-4" />,
      onClick: handleUploadCertificate,
    },
    {
      label: "Edit Device",
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEditDevice,
    },
    {
      label: "Retire Device",
      icon: <Archive className="h-4 w-4" />,
      onClick: handleRetireDevice,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Manage Trusted Device List (TDL) devices across all theatres
        </p>
        <Button onClick={handleCreateDevice}>
          <Plus className="h-4 w-4 mr-2" /> Add Device
        </Button>
      </div>

      {/* Search + Filter trigger */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Model, Serial Number, Public Key or Issuer Thumbprint..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" /> Filters
              {activeCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-medium">
                  {activeCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[340px] sm:w-[380px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter Devices</SheetTitle>
            </SheetHeader>
            {filterContent}
          </SheetContent>
        </Sheet>
      </div>

      {/* Applied filter badges */}
      <TDLFilterBadges
        filters={filters}
        onRemove={removeFilter}
        onClearAll={clearAll}
        formatValue={formatFilterValue}
      />

      <DataTable
        data={filteredDevices}
        columns={columns}
        searchable={false}
        actions={actions}
      />
    </motion.div>
  );
};

export default TDLDevices;
