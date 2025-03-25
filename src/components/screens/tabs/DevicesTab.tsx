
import { Label } from "@/components/ui/label";
import { Screen, ScreenDevice } from "@/types";
import { DevicesList } from "../components/DevicesList";

interface DevicesTabProps {
  formData: Partial<Screen>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Screen>>>;
}

export const DevicesTab = ({
  formData,
  setFormData,
}: DevicesTabProps) => {
  const handleDeviceChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const updatedDevices = [...(prev.devices || [])];
      
      if (!updatedDevices[index]) {
        updatedDevices[index] = {
          id: crypto.randomUUID(),
          manufacturer: "",
          model: "",
          serialNumber: "",
          certificateStatus: "Valid",
          certificateLockStatus: "Unlocked",
          softwareVersion: ""
        };
      }
      
      updatedDevices[index] = { ...updatedDevices[index], [field]: value };
      return { ...prev, devices: updatedDevices };
    });
  };
  
  const handleAddDevice = () => {
    setFormData((prev) => ({
      ...prev,
      devices: [
        ...(prev.devices || []),
        {
          id: crypto.randomUUID(),
          manufacturer: "",
          model: "",
          serialNumber: "",
          certificateStatus: "Valid",
          certificateLockStatus: "Unlocked",
          softwareVersion: ""
        }
      ]
    }));
  };
  
  const handleRemoveDevice = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      devices: (prev.devices || []).filter((_, i) => i !== index)
    }));
  };
  
  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-2">
        <Label>Devices</Label>
        <DevicesList 
          devices={formData.devices || []}
          onDeviceChange={handleDeviceChange}
          onAddDevice={handleAddDevice}
          onRemoveDevice={handleRemoveDevice}
        />
      </div>
    </div>
  );
};
