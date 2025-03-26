
import { HardDrive, Database, Smartphone, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HardwareSpecsFormProps {
  formData: any;
  onChange: (data: any) => void;
}

const storageOptions = ["512 GB", "1 TB", "2 TB", "3 TB", "4 TB", "8 TB"];

const HardwareSpecsForm = ({ formData, onChange }: HardwareSpecsFormProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Label htmlFor="storage">WireTAP Storage</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select the storage capacity for this WireTAP device</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select 
            value={formData.storage} 
            onValueChange={(value) => onChange({ storage: value })}
          >
            <SelectTrigger className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              <SelectValue placeholder="Select storage capacity" />
            </SelectTrigger>
            <SelectContent>
              {storageOptions.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Label htmlFor="ramSize">RAM Size</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enter the RAM size with units</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2">
              <Database className="h-4 w-4" />
              <Input 
                id="ramSize" 
                type="number"
                min="0"
                step="0.5"
                value={formData.ramSize}
                onChange={(e) => onChange({ ramSize: e.target.value })}
                placeholder="Enter RAM size"
              />
            </div>
            <Select 
              value={formData.ramUnit} 
              onValueChange={(value) => onChange({ ramUnit: value })}
            >
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GB">GB</SelectItem>
                <SelectItem value="TB">TB</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Mobile Connectivity Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label htmlFor="mobileNumber">Mobile Number / MSISDN</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mobile Subscriber ISDN Number</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center">
              <Smartphone className="h-4 w-4 mr-2" />
              <Input 
                id="mobileNumber" 
                value={formData.mobileNumber}
                onChange={(e) => onChange({ mobileNumber: e.target.value })}
                placeholder="Enter mobile number"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label htmlFor="simNumber">SIM Number / ICCID</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Integrated Circuit Card Identifier</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center">
              <Smartphone className="h-4 w-4 mr-2" />
              <Input 
                id="simNumber" 
                value={formData.simNumber}
                onChange={(e) => onChange({ simNumber: e.target.value })}
                placeholder="Enter SIM card number"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HardwareSpecsForm;
