
import { useState } from "react";
import { 
  Wifi, 
  Calendar, 
  DollarSign, 
  Info, 
  Plug, 
  Database,
  Settings
} from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ConnectivitySpecsFormProps {
  formData: any;
  onChange: (data: any) => void;
}

const daysOfWeek = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

const networkInterfaces = ["enp3so", "enp4so", "eth0", "eth1", "wlan0"];
const connectivityTypes = ["Mobile Broadband", "Fixed Broadband", "5G", "4G"];
const ispCompanies = ["AT&T", "Verizon", "T-Mobile", "Comcast", "Spectrum", "Cox", "CenturyLink", "Other"];
const ispEquipmentModels = ["Model A", "Model B", "Model C", "Custom"];
const ispThirdPartyHandlers = ["Handler A", "Handler B", "Handler C", "None"];
const billingTypes = ["Prepaid", "Postpaid"];
const billingCycles = ["Monthly", "Quarterly", "Annually"];
const ipTypes = ["DHCP", "Static"];

const ConnectivitySpecsForm = ({ formData, onChange }: ConnectivitySpecsFormProps) => {
  const [selectedDays, setSelectedDays] = useState<string[]>(formData.restrictionDays || []);

  const handleDayToggle = (day: string) => {
    const newSelectedDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    
    setSelectedDays(newSelectedDays);
    onChange({ restrictionDays: newSelectedDays });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="downloadRestrictions" 
            checked={formData.downloadRestrictions}
            onCheckedChange={(checked) => onChange({ downloadRestrictions: !!checked })}
          />
          <Label htmlFor="downloadRestrictions" className="cursor-pointer">Download Restrictions</Label>
        </div>
        
        {formData.downloadRestrictions && (
          <div className="border p-4 rounded-md space-y-4 ml-6">
            <div className="space-y-2">
              <Label>Days of the Week</Label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map(day => (
                  <div
                    key={day}
                    className={cn(
                      "flex items-center justify-center px-3 py-1 rounded-md text-sm cursor-pointer border transition-colors",
                      selectedDays.includes(day)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={() => handleDayToggle(day)}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="restrictionTimeStart">Start Time</Label>
                <Input 
                  id="restrictionTimeStart" 
                  type="time"
                  value={formData.restrictionTimeStart}
                  onChange={(e) => onChange({ restrictionTimeStart: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="restrictionTimeEnd">End Time</Label>
                <Input 
                  id="restrictionTimeEnd" 
                  type="time"
                  value={formData.restrictionTimeEnd}
                  onChange={(e) => onChange({ restrictionTimeEnd: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="theatreNetworkInterface">Theatre Network Interface</Label>
          <Select 
            value={formData.theatreNetworkInterface} 
            onValueChange={(value) => onChange({ theatreNetworkInterface: value })}
          >
            <SelectTrigger className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <SelectValue placeholder="Select network interface" />
            </SelectTrigger>
            <SelectContent>
              {networkInterfaces.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="connectivityType">Connectivity Type</Label>
          <Select 
            value={formData.connectivityType} 
            onValueChange={(value) => onChange({ connectivityType: value })}
          >
            <SelectTrigger className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              <SelectValue placeholder="Select connectivity type" />
            </SelectTrigger>
            <SelectContent>
              {connectivityTypes.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="theatreBandwidth">Theatre Bandwidth</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input 
                id="theatreBandwidth" 
                type="number"
                min="0"
                value={formData.theatreBandwidth}
                onChange={(e) => onChange({ theatreBandwidth: e.target.value })}
                placeholder="Enter bandwidth"
              />
            </div>
            <Select 
              value={formData.theatreBandwidthUnit} 
              onValueChange={(value) => onChange({ theatreBandwidthUnit: value })}
            >
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MBPS">Mbps</SelectItem>
                <SelectItem value="GBPS">Gbps</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="proposedBandwidth">Proposed Bandwidth</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input 
                id="proposedBandwidth" 
                type="number"
                min="0"
                value={formData.proposedBandwidth}
                onChange={(e) => onChange({ proposedBandwidth: e.target.value })}
                placeholder="Enter proposed bandwidth"
              />
            </div>
            <Select 
              value={formData.proposedBandwidthUnit} 
              onValueChange={(value) => onChange({ proposedBandwidthUnit: value })}
            >
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MBPS">Mbps</SelectItem>
                <SelectItem value="GBPS">Gbps</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">ISP Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="ispCompany">ISP Company</Label>
            <Select 
              value={formData.ispCompany} 
              onValueChange={(value) => onChange({ ispCompany: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ISP company" />
              </SelectTrigger>
              <SelectContent>
                {ispCompanies.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="internetInstallationDate">Internet Installation Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="internetInstallationDate"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.internetInstallationDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {formData.internetInstallationDate ? 
                    format(formData.internetInstallationDate, "PPP") : 
                    <span>Pick a date</span>
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={formData.internetInstallationDate}
                  onSelect={(date) => onChange({ internetInstallationDate: date })}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pricePerGB">Price per GB (USD)</Label>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              <Input 
                id="pricePerGB" 
                type="number"
                min="0"
                step="0.01"
                value={formData.pricePerGB}
                onChange={(e) => onChange({ pricePerGB: e.target.value })}
                placeholder="Enter price per GB"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ispEquipmentModel">ISP Equipment Model</Label>
            <Select 
              value={formData.ispEquipmentModel} 
              onValueChange={(value) => onChange({ ispEquipmentModel: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select equipment model" />
              </SelectTrigger>
              <SelectContent>
                {ispEquipmentModels.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ispThirdPartyHandler">ISP Third-Party Handler</Label>
            <Select 
              value={formData.ispThirdPartyHandler} 
              onValueChange={(value) => onChange({ ispThirdPartyHandler: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select third-party handler" />
              </SelectTrigger>
              <SelectContent>
                {ispThirdPartyHandlers.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ispCharges">ISP Charges (USD)</Label>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              <Input 
                id="ispCharges" 
                type="number"
                min="0"
                step="0.01"
                value={formData.ispCharges}
                onChange={(e) => onChange({ ispCharges: e.target.value })}
                placeholder="Enter ISP charges"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="monthlyFUPLimit">Monthly FUP Limit (GB)</Label>
            <div className="flex items-center">
              <Database className="h-4 w-4 mr-2" />
              <Input 
                id="monthlyFUPLimit" 
                type="number"
                min="0"
                value={formData.monthlyFUPLimit}
                onChange={(e) => onChange({ monthlyFUPLimit: e.target.value })}
                placeholder="Enter monthly limit"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Billing Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="ispPaymentResponsibility">ISP Payment Responsibility</Label>
            <Input 
              id="ispPaymentResponsibility" 
              value={formData.ispPaymentResponsibility}
              onChange={(e) => onChange({ ispPaymentResponsibility: e.target.value })}
              placeholder="Enter payment responsibility"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="billingType">Billing Type</Label>
            <Select 
              value={formData.billingType} 
              onValueChange={(value) => onChange({ billingType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select billing type" />
              </SelectTrigger>
              <SelectContent>
                {billingTypes.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="billingCycle">Billing Cycle</Label>
            <Select 
              value={formData.billingCycle} 
              onValueChange={(value) => onChange({ billingCycle: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select billing cycle" />
              </SelectTrigger>
              <SelectContent>
                {billingCycles.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="billingDate">Billing Date</Label>
            <Select 
              value={formData.billingDate} 
              onValueChange={(value) => onChange({ billingDate: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select billing date" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {Array.from({ length: 31 }, (_, i) => (i + 1).toString()).map(day => (
                  <SelectItem key={day} value={day}>{day}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="planStartDate">Plan Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="planStartDate"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.planStartDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {formData.planStartDate ? 
                    format(formData.planStartDate, "PPP") : 
                    <span>Pick a date</span>
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={formData.planStartDate}
                  onSelect={(date) => onChange({ planStartDate: date })}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">IP Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="internetIPType">Internet IP Type</Label>
            <Select 
              value={formData.internetIPType} 
              onValueChange={(value) => onChange({ internetIPType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select IP type" />
              </SelectTrigger>
              <SelectContent>
                {ipTypes.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ingestIPType">Ingest IP Type</Label>
            <Select 
              value={formData.ingestIPType} 
              onValueChange={(value) => onChange({ ingestIPType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select IP type" />
              </SelectTrigger>
              <SelectContent>
                {ipTypes.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {formData.ingestIPType === "Static" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="ingestIPAddress">Ingest IP Address</Label>
                <Input 
                  id="ingestIPAddress" 
                  value={formData.ingestIPAddress}
                  onChange={(e) => onChange({ ingestIPAddress: e.target.value })}
                  placeholder="Enter IP address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ingestIPMask">Ingest IP Mask</Label>
                <Input 
                  id="ingestIPMask" 
                  value={formData.ingestIPMask}
                  onChange={(e) => onChange({ ingestIPMask: e.target.value })}
                  placeholder="Enter IP mask"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ingestIPGateway">Ingest IP Gateway</Label>
                <Input 
                  id="ingestIPGateway" 
                  value={formData.ingestIPGateway}
                  onChange={(e) => onChange({ ingestIPGateway: e.target.value })}
                  placeholder="Enter IP gateway"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectivitySpecsForm;
