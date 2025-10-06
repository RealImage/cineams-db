
import { useState } from "react";
import { HardDrive, Database, Smartphone, Info, MoreVertical, Eye, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import EditAgentConfigDialog from "./EditAgentConfigDialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface HardwareSpecsFormProps {
  formData: any;
  onChange: (data: any) => void;
}

const storageOptions = ["512 GB", "1 TB", "2 TB", "3 TB", "4 TB", "8 TB"];

const softwareAgents = [
  { id: 1, provider: "Qube Wire", agentName: "Kadet (Agent Zero)", version: "", updatedOn: "" },
  { id: 2, provider: "Qube Wire", agentName: "Agent Redux", version: "", updatedOn: "" },
  { id: 3, provider: "Qube Wire", agentName: "Manifest Agent", version: "", updatedOn: "" },
  { id: 4, provider: "Qube Wire", agentName: "Content Ingest Agent", version: "", updatedOn: "" },
  { id: 5, provider: "Qube Wire", agentName: "KDM Agent", version: "", updatedOn: "" },
  { id: 6, provider: "Qube Wire", agentName: "Inventory Agent", version: "", updatedOn: "" },
  { id: 7, provider: "Qube Wire", agentName: "TDL Agent", version: "", updatedOn: "" },
  { id: 8, provider: "Qube Wire", agentName: "Configuration Agent", version: "", updatedOn: "" },
  { id: 9, provider: "Qube Wire", agentName: "Live Wire", version: "", updatedOn: "" },
  { id: 10, provider: "iCount", agentName: "iCount", version: "", updatedOn: "" },
  { id: 11, provider: "Slate", agentName: "AgentQ", version: "", updatedOn: "" },
  { id: 12, provider: "Qlog", agentName: "Qlog Agent", version: "", updatedOn: "" },
  { id: 13, provider: "Scheduler", agentName: "Scheduler Agent", version: "", updatedOn: "" },
  { id: 14, provider: "Scheduler", agentName: "Content Agent", version: "", updatedOn: "" },
  { id: 15, provider: "Scheduler", agentName: "AgentQS", version: "", updatedOn: "" },
];

const HardwareSpecsForm = ({ formData, onChange }: HardwareSpecsFormProps) => {
  const [selectedAgent, setSelectedAgent] = useState<typeof softwareAgents[0] | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

  const handleEditConfig = (agent: typeof softwareAgents[0]) => {
    setSelectedAgent(agent);
    setIsConfigDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <EditAgentConfigDialog
        agent={selectedAgent}
        open={isConfigDialogOpen}
        onOpenChange={setIsConfigDialogOpen}
      />
      {/* Section 1: Hardware Specifications */}
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Hardware Specifications
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Configure the hardware specifications for this WireTAP device
          </p>
        </div>

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
          <h4 className="text-md font-medium mb-4">Mobile Connectivity Details</h4>
          
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

      {/* Section 2: Software & Agent Specifications */}
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Database className="h-5 w-5" />
            Software & Agent Specifications
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage software agents installed on this device
          </p>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Provider</TableHead>
                <TableHead className="font-semibold">Agent Name</TableHead>
                <TableHead className="font-semibold">Version</TableHead>
                <TableHead className="font-semibold">Updated On</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {softwareAgents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell className="font-medium">{agent.provider}</TableCell>
                  <TableCell>{agent.agentName}</TableCell>
                  <TableCell className="text-muted-foreground">{agent.version || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{agent.updatedOn || "—"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Configuration
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditConfig(agent)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Configuration
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default HardwareSpecsForm;
