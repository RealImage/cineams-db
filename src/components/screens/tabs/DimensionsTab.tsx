
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Screen } from "@/types";

interface DimensionsTabProps {
  formData: Partial<Screen>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Screen>>>;
}

export const DimensionsTab = ({
  formData,
  setFormData,
}: DimensionsTabProps) => {
  const handleDimensionChange = (field: string, value: number | undefined) => {
    setFormData((prev) => ({
      ...prev,
      dimensions: {
        ...(prev.dimensions || {}),
        [field]: value
      }
    }));
  };
  
  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="auditoriumWidth">Auditorium Width (m)</Label>
          <Input
            id="auditoriumWidth"
            name="auditoriumWidth"
            type="number"
            value={formData.dimensions?.auditoriumWidth || ""}
            onChange={(e) => handleDimensionChange("auditoriumWidth", e.target.value ? parseFloat(e.target.value) : undefined)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="auditoriumHeight">Auditorium Height (m)</Label>
          <Input
            id="auditoriumHeight"
            name="auditoriumHeight"
            type="number"
            value={formData.dimensions?.auditoriumHeight || ""}
            onChange={(e) => handleDimensionChange("auditoriumHeight", e.target.value ? parseFloat(e.target.value) : undefined)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="auditoriumDepth">Auditorium Depth (m)</Label>
          <Input
            id="auditoriumDepth"
            name="auditoriumDepth"
            type="number"
            value={formData.dimensions?.auditoriumDepth || ""}
            onChange={(e) => handleDimensionChange("auditoriumDepth", e.target.value ? parseFloat(e.target.value) : undefined)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="screenWidth">Screen Width (m)</Label>
          <Input
            id="screenWidth"
            name="screenWidth"
            type="number"
            value={formData.dimensions?.screenWidth || ""}
            onChange={(e) => handleDimensionChange("screenWidth", e.target.value ? parseFloat(e.target.value) : undefined)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="screenHeight">Screen Height (m)</Label>
          <Input
            id="screenHeight"
            name="screenHeight"
            type="number"
            value={formData.dimensions?.screenHeight || ""}
            onChange={(e) => handleDimensionChange("screenHeight", e.target.value ? parseFloat(e.target.value) : undefined)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="throwDistance">Throw Distance (m)</Label>
          <Input
            id="throwDistance"
            name="throwDistance"
            type="number"
            value={formData.dimensions?.throwDistance || ""}
            onChange={(e) => handleDimensionChange("throwDistance", e.target.value ? parseFloat(e.target.value) : undefined)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="gain">Gain</Label>
        <Input
          id="gain"
          name="gain"
          type="number"
          value={formData.dimensions?.gain || ""}
          onChange={(e) => handleDimensionChange("gain", e.target.value ? parseFloat(e.target.value) : undefined)}
        />
      </div>
    </div>
  );
};
