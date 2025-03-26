
import { useState } from "react";
import { Calendar, Check, X, Info, Building2 } from "lucide-react";
import { format } from "date-fns";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BasicDetailsFormProps {
  formData: any;
  onChange: (data: any) => void;
}

const applianceTypes = [
  "WireTAP", 
  "WireTAP Lite", 
  "WireTAP Air", 
  "WireTAP Air BB v2", 
  "Brazil Dell WireOS",
  "WireTAP WireOS",
  "WireTAP Air BB V2",
  "Test Appliances"
];

// Mock theatre data for the theatre search functionality
const theatres = [
  { id: "th-001", name: "Grand Avenue Cinema" },
  { id: "th-002", name: "Michigan Avenue Cineplex" },
  { id: "th-003", name: "Broadway Cinema" },
  { id: "th-004", name: "Ocean Drive Theatre" },
  { id: "th-005", name: "Pike Place Screens" },
  { id: "th-006", name: "Peachtree Cinema" },
];

const BasicDetailsForm = ({ formData, onChange }: BasicDetailsFormProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showTheatreSearch, setShowTheatreSearch] = useState(false);

  const filteredTheatres = theatres.filter(theatre => 
    theatre.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTheatreSelect = (theatre: typeof theatres[0]) => {
    onChange({
      theatreId: theatre.id,
      theatreName: theatre.name
    });
    setShowTheatreSearch(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="hardwareSerialNumber">Hardware Serial Number *</Label>
          <Input 
            id="hardwareSerialNumber" 
            value={formData.hardwareSerialNumber}
            onChange={(e) => onChange({ hardwareSerialNumber: e.target.value })}
            placeholder="Enter hardware serial number"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="applicationSerialNumber">Application Serial Number *</Label>
          <Input 
            id="applicationSerialNumber" 
            value={formData.applicationSerialNumber}
            onChange={(e) => onChange({ applicationSerialNumber: e.target.value })}
            placeholder="Enter application serial number"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="hostName">Host Name / Node ID</Label>
          <Input 
            id="hostName" 
            value={formData.hostName}
            onChange={(e) => onChange({ hostName: e.target.value })}
            placeholder="Enter host name or node ID"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="applianceType">Appliance Type</Label>
          <Select 
            value={formData.applianceType} 
            onValueChange={(value) => onChange({ applianceType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select appliance type" />
            </SelectTrigger>
            <SelectContent>
              {applianceTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Mapping Details</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mappingStatus">Mapping Status</Label>
            <Select 
              value={formData.mappingStatus} 
              onValueChange={(value) => onChange({ mappingStatus: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select mapping status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {formData.mappingStatus === "Yes" && (
            <div className="space-y-2">
              <Label htmlFor="theatre">Theatre</Label>
              <div className="relative">
                <div className="flex gap-2">
                  <Input 
                    value={formData.theatreName} 
                    onClick={() => setShowTheatreSearch(true)}
                    readOnly
                    placeholder="Search and select a theatre"
                    className="cursor-pointer"
                  />
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowTheatreSearch(!showTheatreSearch)}
                  >
                    <Building2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {showTheatreSearch && (
                  <div className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-lg">
                    <div className="p-2">
                      <Input 
                        placeholder="Search theatres..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <ul className="max-h-60 overflow-auto">
                      {filteredTheatres.length > 0 ? (
                        filteredTheatres.map(theatre => (
                          <li 
                            key={theatre.id}
                            className="px-4 py-2 hover:bg-accent cursor-pointer"
                            onClick={() => handleTheatreSelect(theatre)}
                          >
                            {theatre.name}
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-2 text-muted-foreground">No theatres found</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {formData.mappingStatus === "No" && (
            <div className="space-y-2">
              <Label htmlFor="noMappingReason">Reason for No Mapping</Label>
              <Textarea 
                id="noMappingReason" 
                value={formData.noMappingReason}
                onChange={(e) => onChange({ noMappingReason: e.target.value })}
                placeholder="Explain why this device is not being mapped"
                rows={3}
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Pull Out Status</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="pullOutStatus" 
              checked={formData.pullOutStatus}
              onCheckedChange={(checked) => onChange({ pullOutStatus: !!checked })}
            />
            <Label htmlFor="pullOutStatus" className="cursor-pointer">Device is pulled out</Label>
          </div>
          
          {formData.pullOutStatus && (
            <>
              <div className="space-y-2">
                <Label htmlFor="pullOutDate">Pull Out Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.pullOutDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.pullOutDate ? format(formData.pullOutDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.pullOutDate}
                      onSelect={(date) => onChange({ pullOutDate: date })}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pullOutReason">Pull Out Reason</Label>
                <Textarea 
                  id="pullOutReason" 
                  value={formData.pullOutReason}
                  onChange={(e) => onChange({ pullOutReason: e.target.value })}
                  placeholder="Explain why this device was pulled out"
                  rows={3}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicDetailsForm;
