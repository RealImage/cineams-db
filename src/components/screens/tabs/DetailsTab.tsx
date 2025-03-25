
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Screen } from "@/types";
import { OperatorsList } from "../components/OperatorsList";

interface DetailsTabProps {
  formData: Partial<Screen>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Screen>>>;
}

export const DetailsTab = ({
  formData,
  setFormData,
}: DetailsTabProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleNumberChange = (name: string, value: number | undefined) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };
  
  const handleOperatorChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const updatedOperators = [...(prev.operators || [])];
      updatedOperators[index] = { ...updatedOperators[index], [field]: value };
      return { ...prev, operators: updatedOperators };
    });
  };
  
  const handleAddOperator = () => {
    setFormData((prev) => ({
      ...prev,
      operators: [...(prev.operators || []), { name: "", email: "", phone: "" }]
    }));
  };
  
  const handleRemoveOperator = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      operators: (prev.operators || []).filter((_, i) => i !== index)
    }));
  };
  
  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="seatingCapacity">Seating Capacity</Label>
          <Input
            id="seatingCapacity"
            name="seatingCapacity"
            type="number"
            value={formData.seatingCapacity || ""}
            onChange={(e) => handleNumberChange("seatingCapacity", e.target.value ? parseInt(e.target.value) : undefined)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="coolingType">Cooling Type</Label>
          <Input
            id="coolingType"
            name="coolingType"
            value={formData.coolingType || ""}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="wheelchairAccessibility"
            checked={formData.wheelchairAccessibility || false}
            onCheckedChange={(checked) => handleSwitchChange("wheelchairAccessibility", !!checked)}
          />
          <Label htmlFor="wheelchairAccessibility">Wheelchair Accessibility</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="motionSeats"
            checked={formData.motionSeats || false}
            onCheckedChange={(checked) => handleSwitchChange("motionSeats", !!checked)}
          />
          <Label htmlFor="motionSeats">Motion Seats</Label>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Operators</Label>
        <OperatorsList 
          operators={formData.operators || []}
          onOperatorChange={handleOperatorChange}
          onAddOperator={handleAddOperator}
          onRemoveOperator={handleRemoveOperator}
        />
      </div>
    </div>
  );
};
