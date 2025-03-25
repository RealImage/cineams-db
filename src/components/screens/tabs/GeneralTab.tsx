
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Screen } from "@/types";
import { domainsList } from "../constants";

interface GeneralTabProps {
  formData: Partial<Screen>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Screen>>>;
  thirdPartyDomain: string;
  setThirdPartyDomain: React.Dispatch<React.SetStateAction<string>>;
  thirdPartyValue: string;
  setThirdPartyValue: React.Dispatch<React.SetStateAction<string>>;
}

export const GeneralTab = ({
  formData,
  setFormData,
  thirdPartyDomain,
  setThirdPartyDomain,
  thirdPartyValue,
  setThirdPartyValue,
}: GeneralTabProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="number">Screen Number</Label>
          <Input
            id="number"
            name="number"
            value={formData.number || ""}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Screen Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="uuid">UUID</Label>
          <Input
            id="uuid"
            name="uuid"
            value={formData.uuid || ""}
            onChange={handleChange}
            disabled
          />
        </div>
        <div className="space-y-2">
          <Label>Third-Party ID</Label>
          <div className="flex space-x-2">
            <Select
              value={thirdPartyDomain}
              onValueChange={(value) => setThirdPartyDomain(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Domain" />
              </SelectTrigger>
              <SelectContent>
                {domainsList.map((domain) => (
                  <SelectItem key={domain} value={domain}>
                    {domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="text"
              placeholder="Enter Value"
              value={thirdPartyValue}
              onChange={(e) => setThirdPartyValue(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status || ""}
          onValueChange={(value) => handleSelectChange("status", value)}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
            <SelectItem value="Deleted">Deleted</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
