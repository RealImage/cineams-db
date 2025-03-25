
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Screen } from "@/types";

interface ProjectionTabProps {
  formData: Partial<Screen>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Screen>>>;
}

export const ProjectionTab = ({
  formData,
  setFormData,
}: ProjectionTabProps) => {
  const handleProjectionChange = (field: string, value: string | boolean | undefined) => {
    setFormData((prev) => ({
      ...prev,
      projection: {
        ...(prev.projection || {}),
        [field]: value
      }
    }));
  };
  
  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="projectionType">Projection Type</Label>
          <Input
            id="projectionType"
            name="type"
            value={formData.projection?.type || ""}
            onChange={(e) => handleProjectionChange("type", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="projectionManufacturer">Projection Manufacturer</Label>
          <Input
            id="projectionManufacturer"
            name="manufacturer"
            value={formData.projection?.manufacturer || ""}
            onChange={(e) => handleProjectionChange("manufacturer", e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="masking"
          checked={formData.projection?.masking || false}
          onCheckedChange={(checked) => handleProjectionChange("masking", !!checked)}
        />
        <Label htmlFor="masking">Masking</Label>
      </div>
    </div>
  );
};
