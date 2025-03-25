import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Screen, ScreenDevice } from "@/types";
import { Plus, Trash2, User, Monitor, Volume2, Box, ArrowDownToLine, AlertCircle, Network, Layers, Server } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface ScreenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theatreId: string;
  screen?: Screen;
  onSave: (screen: Partial<Screen>) => void;
}

// Lists for dropdowns
const domainsList = ["FLMX", "RDC", "TMS", "AAM", "CNCL"];
const deviceManufacturersList = ["Christie", "Dolby", "Barco", "NEC", "Sony", "GDC", "Doremi", "QSC", "USL", "Other"];
const deviceModelsList = {
  Christie: ["CP2215", "CP2220", "CP4220", "CP4230"],
  Dolby: ["IMS1000", "IMS2000", "IMS3000", "CP750", "CP850"],
  Barco: ["Series 2", "Series 4", "ACS-2048", "XDC", "ICMP"],
  NEC: ["NC900C", "NC1200C", "NC2000C", "NC3200S"],
  Sony: ["SRX-R320", "SRX-R515P", "SRX-R815P"],
  GDC: ["SR-1000", "SX-3000", "SX-4000"],
  Doremi: ["IMS1000", "IMS2000", "ShowVault"],
  QSC: ["DCP-100", "DCP-300", "DCS-300"],
  USL: ["JSD-60", "JSD-100"],
  Other: ["Custom"],
};
const deviceRolesList = ["SM", "LD", "PR", "OBAE", "PLY", "PRC", "REALD", "ATMOS"];
const tempClosureReasonsList = ["Renovation", "Maintenance", "Natural Disaster", "Fire", "Flood", "COVID-19", "Other"];

export const ScreenDialog = ({
  open,
  onOpenChange,
  theatreId,
  screen,
  onSave,
}: ScreenDialogProps) => {
  const isEditing = !!screen;
  
  const [formData, setFormData] = useState<Partial<Screen>>(
    screen || {
      id: crypto.randomUUID(),
      theatreId,
      number: "",
      name: "",
      uuid: crypto.randomUUID(),
      operators: [{ name: "", email: "", phone: "" }],
      autoScreenUpdateLock: false,
      flmManagementLock: false,
      multiThumbprintKdmScreen: false,
      status: "Active",
      seatingCapacity: undefined,
      coolingType: undefined,
      wheelchairAccessibility: false,
      motionSeats: false,
      dimensions: {
        auditoriumWidth: undefined,
        auditoriumHeight: undefined,
        auditoriumDepth: undefined,
        screenWidth: undefined,
        screenHeight: undefined,
        throwDistance: undefined,
        gain: undefined
      },
      projection: {
        type: undefined,
        manufacturer: undefined,
        masking: false
      },
      sound: {
        processor: undefined,
        speakers: undefined,
        soundMixes: [],
        iabSupported: false
      },
      devices: [],
      ipAddresses: [],
      suites: [],
      temporaryClosures: []
    }
  );
  
  // State for third party ID domain
  const [thirdPartyDomain, setThirdPartyDomain] = useState<string>(
    screen?.thirdPartyId ? screen.thirdPartyId.split(':')[0] : ""
  );
  
  // State for third party ID value
  const [thirdPartyValue, setThirdPartyValue] = useState<string>(
    screen?.thirdPartyId ? screen.thirdPartyId.split(':')[1] || "" : ""
  );
  
  // State for temporary closure
  const [tempClosureStartDate, setTempClosureStartDate] = useState<Date | undefined>(undefined);
  const [tempClosureEndDate, setTempClosureEndDate] = useState<Date | undefined>(undefined);
  const [tempClosureReason, setTempClosureReason] = useState<string>("");
  const [tempClosureNotes, setTempClosureNotes] = useState<string>("");
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };
  
  const handleNumberChange = (name: string, value: string) => {
    const numberValue = value === '' ? undefined : parseInt(value, 10);
    
    const nameParts = name.split('.');
    if (nameParts.length === 1) {
      setFormData((prev) => {
        return { ...prev, [name]: numberValue };
      });
    } else if (nameParts.length === 2) {
      const [parent, child] = nameParts;
      setFormData((prev) => {
        const newData = { ...prev };
        // Fix the typing issue by using proper type assertion
        if (!newData[parent as keyof Screen]) {
          (newData as any)[parent] = {};
        }
        const parentObj = (newData as any)[parent];
        parentObj[child] = numberValue;
        return newData;
      });
    }
  };
  
  const handleOperatorChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const operators = [...(prev.operators || [])];
      operators[index] = { ...operators[index], [field]: value };
      return { ...prev, operators };
    });
  };
  
  const handleAddOperator = () => {
    setFormData((prev) => ({
      ...prev,
      operators: [...(prev.operators || []), { name: "", email: "", phone: "" }]
    }));
  };
  
  const handleRemoveOperator = (index: number) => {
    setFormData((prev) => {
      const operators = [...(prev.operators || [])];
      operators.splice(index, 1);
      return { ...prev, operators };
    });
  };
  
  // Handle IP Address management
  const handleAddIPAddress = () => {
    setFormData((prev) => ({
      ...prev,
      ipAddresses: [...(prev.ipAddresses || []), { address: "", subnet: "", gateway: "" }]
    }));
  };
  
  const handleRemoveIPAddress = (index: number) => {
    setFormData((prev) => {
      const ipAddresses = [...(prev.ipAddresses || [])];
      ipAddresses.splice(index, 1);
      return { ...prev, ipAddresses };
    });
  };
  
  const handleIPAddressChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const ipAddresses = [...(prev.ipAddresses || [])];
      ipAddresses[index] = { ...ipAddresses[index], [field]: value };
      return { ...prev, ipAddresses };
    });
  };
  
  // Handle device management
  const handleAddDevice = () => {
    const newDevice: ScreenDevice = {
      id: crypto.randomUUID(),
      manufacturer: "",
      model: "",
      serialNumber: "",
      role: undefined,
      certificateStatus: "Valid",
      certificateLockStatus: "Unlocked",
      softwareVersion: ""
    };
    
    setFormData((prev) => ({
      ...prev,
      devices: [...(prev.devices || []), newDevice]
    }));
  };
  
  const handleRemoveDevice = (deviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      devices: (prev.devices || []).filter(device => device.id !== deviceId)
    }));
  };
  
  const handleDeviceChange = (deviceId: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      devices: (prev.devices || []).map(device => 
        device.id === deviceId 
          ? { ...device, [field]: value } 
          : device
      )
    }));
  };
  
  // Handle Suite management
  const handleAddSuite = () => {
    setFormData((prev) => ({
      ...prev,
      suites: [...(prev.suites || []), {
        id: crypto.randomUUID(),
        name: `Suite ${(prev.suites || []).length + 1}`,
        devices: [],
        ipAddresses: [],
        status: "Invalid"
      }]
    }));
  };
  
  const handleRemoveSuite = (suiteId: string) => {
    setFormData((prev) => ({
      ...prev,
      suites: (prev.suites || []).filter(suite => suite.id !== suiteId)
    }));
  };
  
  const handleSoundMixChange = (mix: string) => {
    setFormData((prev) => {
      const currentMixes = prev.sound?.soundMixes || [];
      const updatedMixes = currentMixes.includes(mix)
        ? currentMixes.filter(m => m !== mix)
        : [...currentMixes, mix];
      
      return {
        ...prev,
        sound: {
          ...(prev.sound || {}),
          soundMixes: updatedMixes
        }
      };
    });
  };
  
  const handleDimensionChange = (field: string, value: string) => {
    const numberValue = value === '' ? undefined : parseFloat(value);
    
    setFormData((prev) => ({
      ...prev,
      dimensions: {
        ...(prev.dimensions || {}),
        [field]: numberValue
      }
    }));
  };
  
  const handleProjectionChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      projection: {
        ...(prev.projection || {}),
        [field]: value
      }
    }));
  };
  
  const handleSoundChange = (field: string, value: string | boolean) => {
    if (field === 'soundMixes') return; // Handled separately
    
    setFormData((prev) => ({
      ...prev,
      sound: {
        ...(prev.sound || {}),
        [field]: value
      }
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.number || !formData.name) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Combine third party domain and value
    const updatedFormData = {
      ...formData,
      thirdPartyId: thirdPartyDomain && thirdPartyValue 
        ? `${thirdPartyDomain}:${thirdPartyValue}` 
        : undefined
    };
    
    onSave(updatedFormData);
    onOpenChange(false);
    
    toast.success(
      isEditing 
        ? `Screen "${formData.name}" updated successfully` 
        : `Screen "${formData.name}" created successfully`
    );
  };
  
  const handleAddTempClosure = () => {
    if (!tempClosureStartDate || !tempClosureReason) {
      toast.error("Please select at least a start date and reason for temporary closure");
      return;
    }
    
    const newTempClosure = {
      id: crypto.randomUUID(),
      startDate: tempClosureStartDate.toISOString(),
      endDate: tempClosureEndDate?.toISOString(),
      reason: tempClosureReason,
      notes: tempClosureNotes,
      active: true
    };
    
    setFormData((prev) => ({
      ...prev,
      temporaryClosures: [...(prev.temporaryClosures || []), newTempClosure]
    }));
    
    // Reset form
    setTempClosureStartDate(undefined);
    setTempClosureEndDate(undefined);
    setTempClosureReason("");
    setTempClosureNotes("");
    
    toast.success("Temporary closure added");
  };
  
  const handleRemoveTempClosure = (closureId: string) => {
    setFormData((prev) => ({
      ...prev,
      temporaryClosures: (prev.temporaryClosures || []).filter(closure => closure.id !== closureId)
    }));
    
    toast.success("Temporary closure removed");
  };
  
  const getSuiteStatus = (suite: any) => {
    // Check if there's at least one device with SM role
    const hasSMRole = (suite.devices || []).some((deviceId: string) => {
      const device = (formData.devices || []).find(d => d.id === deviceId);
      return device && device.role === "SM";
    });
    
    return hasSMRole ? "Valid" : "Invalid";
  };
  
  const soundMixOptions = [
    { id: "5.1", label: "5.1 Surround Sound" },
    { id: "7.1", label: "7.1 Surround Sound" },
    { id: "atmos", label: "Dolby Atmos" },
    { id: "auro", label: "Auro 3D" },
    { id: "dtsx", label: "DTS:X" },
    { id: "imax", label: "IMAX Enhanced" }
  ];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Screen" : "Create New Screen"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the details of an existing screen" 
              : "Enter the details to create a new screen"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="general">General Information</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
              <TabsTrigger value="projection">Projection & Sound</TabsTrigger>
              <TabsTrigger value="devices">Devices</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="number">Screen Number *</Label>
                  <Input
                    id="number"
                    name="number"
                    value={formData.number}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Screen Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="uuid">UUID</Label>
                  <Input
                    id="uuid"
                    name="uuid"
                    value={formData.uuid}
                    onChange={handleChange}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thirdPartyId">Third-Party ID</Label>
                  <div className="flex space-x-2">
                    <Select
                      value={thirdPartyDomain}
                      onValueChange={setThirdPartyDomain}
                    >
                      <SelectTrigger className="w-1/3">
                        <SelectValue placeholder="Domain" />
                      </SelectTrigger>
                      <SelectContent>
                        {domainsList.map(domain => (
                          <SelectItem key={domain} value={domain}>
                            {domain}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      className="w-2/3"
                      value={thirdPartyValue}
                      onChange={(e) => setThirdPartyValue(e.target.value)}
                      placeholder="ID value"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Screen Operators</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddOperator}>
                    <Plus className="h-4 w-4 mr-1" /> Add Operator
                  </Button>
                </div>
                
                {formData.operators && formData.operators.map((operator, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center mt-2">
                    <div className="col-span-4">
                      <Input
                        placeholder="Name"
                        value={operator.name}
                        onChange={(e) => handleOperatorChange(index, "name", e.target.value)}
                      />
                    </div>
                    <div className="col-span-4">
                      <Input
                        placeholder="Email"
                        type="email"
                        value={operator.email}
                        onChange={(e) => handleOperatorChange(index, "email", e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        placeholder="Phone"
                        value={operator.phone || ""}
                        onChange={(e) => handleOperatorChange(index, "phone", e.target.value)}
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveOperator(index)}
                        disabled={formData.operators?.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="autoScreenUpdateLock">Auto Screen Update Lock</Label>
                    <Switch 
                      id="autoScreenUpdateLock"
                      checked={formData.autoScreenUpdateLock || false}
                      onCheckedChange={(checked) => handleSwitchChange("autoScreenUpdateLock", checked)}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="flmManagementLock">FLM Management Lock</Label>
                    <Switch 
                      id="flmManagementLock"
                      checked={formData.flmManagementLock || false}
                      onCheckedChange={(checked) => handleSwitchChange("flmManagementLock", checked)}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="multiThumbprintKdmScreen">Multi Thumbprint KDM Screen</Label>
                    <Switch 
                      id="multiThumbprintKdmScreen"
                      checked={formData.multiThumbprintKdmScreen || false}
                      onCheckedChange={(checked) => handleSwitchChange("multiThumbprintKdmScreen", checked)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Screen Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange("status", value as "Active" | "Inactive" | "Deleted")}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Deleted">Deleted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.status !== "Active" && (
                  <div className="space-y-2">
                    <Label htmlFor="closureNotes">Closure Notes</Label>
                    <Textarea
                      id="closureNotes"
                      name="closureNotes"
                      value={formData.closureNotes || ""}
                      onChange={handleChange}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="metadata" className="mt-4 space-y-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-medium">Accessibility & Seating</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seatingCapacity">Seating Capacity</Label>
                  <Input
                    id="seatingCapacity"
                    type="number"
                    value={formData.seatingCapacity || ""}
                    onChange={(e) => handleNumberChange("seatingCapacity", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coolingType">Cooling Type</Label>
                  <Select
                    value={formData.coolingType || ""}
                    onValueChange={(value) => handleSelectChange("coolingType", value)}
                  >
                    <SelectTrigger id="coolingType">
                      <SelectValue placeholder="Select cooling type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Central AC">Central AC</SelectItem>
                      <SelectItem value="Split AC">Split AC</SelectItem>
                      <SelectItem value="Natural Ventilation">Natural Ventilation</SelectItem>
                      <SelectItem value="None">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="wheelchairAccessibility">Wheelchair Accessibility</Label>
                  <Switch 
                    id="wheelchairAccessibility"
                    checked={formData.wheelchairAccessibility || false}
                    onCheckedChange={(checked) => handleSwitchChange("wheelchairAccessibility", checked)}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="motionSeats">Motion Seats</Label>
                  <Switch 
                    id="motionSeats"
                    checked={formData.motionSeats || false}
                    onCheckedChange={(checked) => handleSwitchChange("motionSeats", checked)}
                  />
                </div>
              </div>
              
              {/* Temporary Closure Details Section */}
              <div className="mt-8 border-t pt-6">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Temporary Closure Details</h3>
                </div>
                
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tempClosureReason">Closure Reason</Label>
                      <Select
                        value={tempClosureReason}
                        onValueChange={setTempClosureReason}
                      >
                        <SelectTrigger id="tempClosureReason">
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent>
                          {tempClosureReasonsList.map(reason => (
                            <SelectItem key={reason} value={reason}>
                              {reason}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tempClosureNotes">Closure Notes</Label>
                      <Textarea
                        id="tempClosureNotes"
                        value={tempClosureNotes}
                        onChange={(e) => setTempClosureNotes(e.target.value)}
                        className="h-[80px] resize-none"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !tempClosureStartDate && "text-muted-foreground"
                            )}
                          >
                            {tempClosureStartDate ? format(tempClosureStartDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={tempClosureStartDate}
                            onSelect={setTempClosureStartDate}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !tempClosureEndDate && "text-muted-foreground"
                            )}
                          >
                            {tempClosureEndDate ? format(tempClosureEndDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={tempClosureEndDate}
                            onSelect={setTempClosureEndDate}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                            disabled={(date) => 
                              tempClosureStartDate 
                                ? date < tempClosureStartDate 
                                : false
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      onClick={handleAddTempClosure}
                      disabled={!tempClosureStartDate || !tempClosureReason}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Temporary Closure
                    </Button>
                  </div>
                </div>
                
                {/* List of active temporary closures */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Active Temporary Closures</h4>
                  {formData.temporaryClosures && formData.temporaryClosures.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Reason</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Notes</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.temporaryClosures.map((closure) => (
                            <TableRow key={closure.id}>
                              <TableCell>{closure.reason}</TableCell>
                              <TableCell>{format(new Date(closure.startDate), "PP")}</TableCell>
                              <TableCell>
                                {closure.endDate ? format(new Date(closure.endDate), "PP") : "Not specified"}
                              </TableCell>
                              <TableCell className="truncate max-w-[200px]" title={closure.notes}>
                                {closure.notes || "No notes"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveTempClosure(closure.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center p-4 border rounded-md text-muted-foreground">
                      No active temporary closures
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-6">
                <Box className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-medium">Auditorium & Screen Dimensions</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="auditoriumWidth">Auditorium Width (m)</Label>
                  <Input
                    id="auditoriumWidth"
                    type="number"
                    step="0.01"
                    value={formData.dimensions?.auditoriumWidth || ""}
                    onChange={(e) => handleDimensionChange("auditoriumWidth", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auditoriumHeight">Auditorium Height (m)</Label>
                  <Input
                    id="auditoriumHeight"
                    type="number"
                    step="0.01"
                    value={formData.dimensions?.auditoriumHeight || ""}
                    onChange={(e) => handleDimensionChange("auditoriumHeight", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="auditoriumDepth">Auditorium Depth (m)</Label>
                  <Input
                    id="auditoriumDepth"
                    type="number"
                    step="0.01"
                    value={formData.dimensions?.auditoriumDepth || ""}
                    onChange={(e) => handleDimensionChange("auditoriumDepth", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="screenWidth">Screen Width (m)</Label>
                  <Input
                    id="screenWidth"
                    type="number"
                    step="0.01"
                    value={formData.dimensions?.screenWidth || ""}
                    onChange={(e) => handleDimensionChange("screenWidth", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="screenHeight">Screen Height (m)</Label>
                  <Input
                    id="screenHeight"
                    type="number"
                    step="0.01"
                    value={formData.dimensions?.screenHeight || ""}
                    onChange={(e) => handleDimensionChange("screenHeight", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="throwDistance">Throw Distance (m)</Label>
                  <Input
                    id="throwDistance"
                    type="number"
                    step="0.01"
                    value={formData.dimensions?.throwDistance || ""}
                    onChange={(e) => handleDimensionChange("throwDistance", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gain">Screen Gain</Label>
                  <Input
                    id="gain"
                    type="number"
                    step="0.1"
                    value={formData.dimensions?.gain || ""}
                    onChange={(e) => handleDimensionChange("gain", e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="projection" className="mt-4 space-y-4">
              <div className="flex items-center space-x-2">
                <Monitor className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-medium">Projection System</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectionType">Projection Type</Label>
                  <Select
                    value={formData.projection?.type || ""}
                    onValueChange={(value) => handleProjectionChange("type", value)}
                  >
                    <SelectTrigger id="projectionType">
                      <SelectValue placeholder="Select projection type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Digital 2K">Digital 2K</SelectItem>
                      <SelectItem value="Digital 4K">Digital
