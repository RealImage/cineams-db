
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { ScreenDevice } from "@/types";
import { Plus, Trash2 } from "lucide-react";
import { deviceManufacturersList, deviceModelsList } from "../constants";

interface DevicesListProps {
  devices: ScreenDevice[];
  onDeviceChange: (index: number, field: string, value: string) => void;
  onAddDevice: () => void;
  onRemoveDevice: (index: number) => void;
}

export const DevicesList = ({
  devices,
  onDeviceChange,
  onAddDevice,
  onRemoveDevice,
}: DevicesListProps) => {
  return (
    <div className="space-y-2">
      {devices && devices.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Manufacturer</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.map((device, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Combobox
                    aria-label="Manufacturer"
                    value={device.manufacturer}
                    onChange={(value) => onDeviceChange(index, "manufacturer", value ?? "")}
                    options={deviceManufacturersList.map((manufacturer) => ({ value: manufacturer, label: manufacturer }))}
                    placeholder="Select Manufacturer"
                  />
                </TableCell>
                <TableCell>
                  <Combobox
                    aria-label="Model"
                    value={device.model}
                    onChange={(value) => onDeviceChange(index, "model", value ?? "")}
                    options={(device.manufacturer && deviceModelsList[device.manufacturer as keyof typeof deviceModelsList] || []).map((model) => ({ value: model, label: model }))}
                    placeholder="Select Model"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={device.serialNumber}
                    onChange={(e) => onDeviceChange(index, "serialNumber", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveDevice(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-muted-foreground">No devices have been added yet</p>
      )}
      <Button type="button" variant="outline" size="sm" onClick={onAddDevice}>
        <Plus className="h-4 w-4 mr-2" /> Add Device
      </Button>
    </div>
  );
};
