import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Filter, RotateCcw } from "lucide-react";
import { WireTAPDevice } from "@/types/wireTAP";

export interface DeviceFilters {
  location?: string;
  activationStatus?: string;
  mappingStatus?: string;
  vpnStatus?: string;
  wireTapApplianceType?: string;
  pullOutStatus?: string;
}

interface DeviceFiltersProps {
  devices: WireTAPDevice[];
  onFiltersChange: (filters: DeviceFilters) => void;
  filters: DeviceFilters;
}

export const DeviceFiltersComponent = ({ devices, onFiltersChange, filters }: DeviceFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);
  
  // Extract unique values for filter options
  const getUniqueLocations = () => {
    const locations = new Set<string>();
    devices.forEach(device => {
      const address = device.theatreAddress;
      if (address) {
        // Extract city, state, and country from address
        const parts = address.split(', ');
        parts.forEach(part => locations.add(part.trim()));
      }
    });
    return Array.from(locations).sort();
  };

  const getUniqueValues = (field: keyof WireTAPDevice) => {
    const values = new Set<string>();
    devices.forEach(device => {
      const value = device[field];
      if (value && typeof value === 'string') {
        values.add(value);
      }
    });
    return Array.from(values).sort();
  };

  const handleFilterChange = (key: keyof DeviceFilters, value: string | undefined) => {
    const newFilters = { ...filters };
    if (value && value !== "all") {
      newFilters[key] = value;
    } else {
      delete newFilters[key];
    }
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const getActiveFilterCount = () => {
    return Object.keys(filters).length;
  };

  const removeFilter = (key: keyof DeviceFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  return (
    <div className="space-y-4">
      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => (
            <Badge key={key} variant="secondary" className="flex items-center gap-1">
              <span className="text-xs">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {value}
              </span>
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => removeFilter(key as keyof DeviceFilters)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Filter Controls */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter WireTAP Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Theatre Location Filter */}
              <div className="space-y-2">
                <Label htmlFor="location">Theatre Location</Label>
                <Input
                  id="location"
                  placeholder="Enter city, state, or country..."
                  value={filters.location || ""}
                  onChange={(e) => handleFilterChange("location", e.target.value || undefined)}
                />
              </div>

              {/* Activation Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="activation-status">Activation Status</Label>
                <Select
                  value={filters.activationStatus || "all"}
                  onValueChange={(value) => handleFilterChange("activationStatus", value)}
                >
                  <SelectTrigger id="activation-status">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {getUniqueValues('activationStatus').map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mapping Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="mapping-status">Mapping Status</Label>
                <Select
                  value={filters.mappingStatus || "all"}
                  onValueChange={(value) => handleFilterChange("mappingStatus", value)}
                >
                  <SelectTrigger id="mapping-status">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {getUniqueValues('mappingStatus').map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* VPN Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="vpn-status">VPN Status</Label>
                <Select
                  value={filters.vpnStatus || "all"}
                  onValueChange={(value) => handleFilterChange("vpnStatus", value)}
                >
                  <SelectTrigger id="vpn-status">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {getUniqueValues('vpnStatus').map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* WireTAP Appliance Type Filter */}
              <div className="space-y-2">
                <Label htmlFor="appliance-type">WireTAP Appliance Type</Label>
                <Select
                  value={filters.wireTapApplianceType || "all"}
                  onValueChange={(value) => handleFilterChange("wireTapApplianceType", value)}
                >
                  <SelectTrigger id="appliance-type">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {getUniqueValues('wireTapApplianceType').map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pull-Out Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="pullout-status">Pull-Out Status</Label>
                <Select
                  value={filters.pullOutStatus || "all"}
                  onValueChange={(value) => handleFilterChange("pullOutStatus", value)}
                >
                  <SelectTrigger id="pullout-status">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {getUniqueValues('pullOutStatus').map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};