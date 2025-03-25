import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Screen, ScreenDevice, Suite } from "@/types";
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
  
  const [thirdPartyDomain, setThirdPartyDomain] = useState<string>(
    screen?.thirdPartyId ? screen.thirdPartyId.split(':')[0] : ""
  );
  
  const [thirdPartyValue, setThirdPartyValue] = useState<string>(
    screen?.thirdPartyId ? screen.thirdPartyId.split(':')[1] || "" : ""
  );
  
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
  
  const handleNumberChange = (name: string, value: number | undefined) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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
  
  const handleIPAddressChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const updatedIPAddresses = [...(prev.ipAddresses || [])];
      
      if (!updatedIPAddresses[index]) {
        updatedIPAddresses[index] = {
          address: "",
          subnet: "",
          gateway: ""
        };
      }
      
      updatedIPAddresses[index] = { ...updatedIPAddresses[index], [field]: value };
      return { ...prev, ipAddresses: updatedIPAddresses };
    });
  };
  
  const handleAddIPAddress = () => {
    setFormData((prev) => ({
      ...prev,
      ipAddresses: [
        ...(prev.ipAddresses || []),
        {
          address: "",
          subnet: "",
          gateway: ""
        }
      ]
    }));
  };
  
  const handleRemoveIPAddress = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ipAddresses: (prev.ipAddresses || []).filter((_, i) => i !== index)
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
          soundMixes: updatedMixes,
          processor: prev.sound?.processor,
          speakers: prev.sound?.speakers,
          iabSupported: prev.sound?.iabSupported || false
        }
      };
    });
  };
  
  const handleDimensionChange = (field: string, value: number | undefined) => {
    setFormData((prev) => ({
      ...prev,
      dimensions: {
        ...(prev.dimensions || {}),
        [field]: value
      }
    }));
  };
  
  const handleProjectionChange = (field: string, value: string | boolean | undefined) => {
    setFormData((prev) => ({
      ...prev,
      projection: {
        ...(prev.projection || {}),
        [field]: value
      }
    }));
  };
  
  const handleSoundChange = (field: string, value: string | boolean | undefined) => {
    setFormData((prev) => ({
      ...prev,
      sound: {
        ...(prev.sound || {}),
        [field]: value
      }
    }));
  };
  
  const handleAddSuite = () => {
    setFormData((prev) => {
      const newSuite: Suite = {
        id: crypto.randomUUID(),
        name: `Suite ${(prev.suites || []).length + 1}`,
        devices: [],
        ipAddresses: [],
        status: "Invalid"
      };
      
      return {
        ...prev,
        suites: [...(prev.suites || []), newSuite]
      };
    });
  };
  
  const handleRemoveSuite = (suiteId: string) => {
    setFormData((prev) => ({
      ...prev,
      suites: (prev.suites || []).filter(suite => suite.id !== suiteId)
    }));
  };
  
  const handleAddDeviceToSuite = (suiteId: string, deviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      suites: (prev.suites || []).map(suite =>
        suite.id === suiteId
          ? { ...suite, devices: [...suite.devices, deviceId] }
          : suite
      )
    }));
  };
  
  const handleRemoveDeviceFromSuite = (suiteId: string, deviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      suites: (prev.suites || []).map(suite =>
        suite.id === suiteId
          ? { ...suite, devices: suite.devices.filter(id => id !== deviceId) }
          : suite
      )
    }));
  };
  
  const handleAddIPAddressToSuite = (suiteId: string, ipAddressIndex: number) => {
    setFormData((prev) => {
      const ipAddress = prev.ipAddresses?.[ipAddressIndex];
      
      if (!ipAddress) {
        toast.error("IP Address not found");
        return prev;
      }
      
      return {
        ...prev,
        suites: (prev.suites || []).map(suite =>
          suite.id === suiteId
            ? { ...suite, ipAddresses: [...suite.ipAddresses, ipAddressIndex] }
            : suite
        )
      };
    });
  };
  
  const handleRemoveIPAddressFromSuite = (suiteId: string, ipAddressIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      suites: (prev.suites || []).map(suite =>
        suite.id === suiteId
          ? { ...suite, ipAddresses: suite.ipAddresses.filter(index => index !== ipAddressIndex) }
          : suite
      )
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.number || !formData.name) {
      toast.error("Please fill in all required fields");
      return;
    }
    
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
      toast.error("Please fill in all required fields for temporary closure");
      return;
    }
    
    const newClosure = {
      id: crypto.randomUUID(),
      startDate: tempClosureStartDate.toISOString(),
      endDate: tempClosureEndDate?.toISOString(),
      reason: tempClosureReason,
      notes: tempClosureNotes,
      active: true
    };
    
    setFormData((prev) => ({
      ...prev,
      temporaryClosures: [...(prev.temporaryClosures || []), newClosure]
    }));
    
    setTempClosureStartDate(undefined);
    setTempClosureEndDate(undefined);
    setTempClosureReason("");
    setTempClosureNotes("");
  };
  
  const handleRemoveTempClosure = (closureId: string) => {
    setFormData((prev) => ({
      ...prev,
      temporaryClosures: (prev.temporaryClosures || []).filter(closure => closure.id !== closureId)
    }));
  };
  
  const getSuiteStatus = (suite: Suite): "Valid" | "Invalid" => {
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
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
              <TabsTrigger value="projection">Projection</TabsTrigger>
              <TabsTrigger value="sound">Sound</TabsTrigger>
              <TabsTrigger value="devices">Devices</TabsTrigger>
              <TabsTrigger value="suites">Suites</TabsTrigger>
              <TabsTrigger value="closures">Temporary Closures</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="mt-4 space-y-4">
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
            </TabsContent>
            
            <TabsContent value="details" className="mt-4 space-y-4">
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
                {formData.operators && formData.operators.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.operators.map((operator, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Input
                              type="text"
                              value={operator.name}
                              onChange={(e) => handleOperatorChange(index, "name", e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="email"
                              value={operator.email}
                              onChange={(e) => handleOperatorChange(index, "email", e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="tel"
                              value={operator.phone || ""}
                              onChange={(e) => handleOperatorChange(index, "phone", e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveOperator(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">No operators have been added yet</p>
                )}
                <Button type="button" variant="outline" size="sm" onClick={handleAddOperator}>
                  <Plus className="h-4 w-4 mr-2" /> Add Operator
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="dimensions" className="mt-4 space-y-4">
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
            </TabsContent>
            
            <TabsContent value="projection" className="mt-4 space-y-4">
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
            </TabsContent>
            
            <TabsContent value="sound" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="soundProcessor">Sound Processor</Label>
                  <Input
                    id="soundProcessor"
                    name="processor"
                    value={formData.sound?.processor || ""}
                    onChange={(e) => handleSoundChange("processor", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="soundSpeakers">Speakers</Label>
                  <Input
                    id="soundSpeakers"
                    name="speakers"
                    value={formData.sound?.speakers || ""}
                    onChange={(e) => handleSoundChange("speakers", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Sound Mixes</Label>
                <div className="flex flex-wrap gap-2">
                  {soundMixOptions.map((mix) => (
                    <div key={mix.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sound-mix-${mix.id}`}
                        checked={(formData.sound?.soundMixes || []).includes(mix.id)}
                        onCheckedChange={(checked) => handleSoundMixChange(mix.id)}
                      />
                      <Label htmlFor={`sound-mix-${mix.id}`} className="text-sm">
                        {mix.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="iabSupported"
                  checked={formData.sound?.iabSupported || false}
                  onCheckedChange={(checked) => handleSoundChange("iabSupported", !!checked)}
                />
                <Label htmlFor="iabSupported">IAB Supported</Label>
              </div>
            </TabsContent>
            
            <TabsContent value="devices" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Devices</Label>
                {formData.devices && formData.devices.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Manufacturer</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Serial Number</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.devices.map((device, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Select
                              value={device.manufacturer}
                              onValueChange={(value) => handleDeviceChange(index, "manufacturer", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Manufacturer" />
                              </SelectTrigger>
                              <SelectContent>
                                {deviceManufacturersList.map((manufacturer) => (
                                  <SelectItem key={manufacturer} value={manufacturer}>
                                    {manufacturer}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={device.model}
                              onValueChange={(value) => handleDeviceChange(index, "model", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Model" />
                              </SelectTrigger>
                              <SelectContent>
                                {(device.manufacturer && deviceModelsList[device.manufacturer as keyof typeof deviceModelsList] || []).map((model) => (
                                  <SelectItem key={model} value={model}>
                                    {model}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="text"
                              value={device.serialNumber}
                              onChange={(e) => handleDeviceChange(index, "serialNumber", e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveDevice(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">No devices have been added yet</p>
                )}
                <Button type="button" variant="outline" size="sm" onClick={handleAddDevice}>
                  <Plus className="h-4 w-4 mr-2" /> Add Device
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="suites" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Suites</Label>
                {formData.suites && formData.suites.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Devices</TableHead>
                        <TableHead>IP Addresses</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.suites.map((suite) => (
                        <TableRow key={suite.id}>
                          <TableCell>{suite.name}</TableCell>
                          <TableCell>
                            {suite.devices.length > 0 ? (
                              <div className="flex flex-col space-y-1">
                                {suite.devices.map(deviceId => {
                                  const device = formData.devices?.find(d => d.id === deviceId);
                                  return device ? (
                                    <div key={deviceId} className="flex items-center justify-between">
                                      <span className="text-xs">{device.manufacturer} {device.model}</span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => handleRemoveDeviceFromSuite(suite.id, deviceId)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">No devices</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {suite.ipAddresses.length > 0 ? (
                              <div className="flex flex-col space-y-1">
                                {suite.ipAddresses.map(ipIndex => {
                                  const ip = formData.ipAddresses?.[ipIndex];
                                  return ip ? (
                                    <div key={ipIndex} className="flex items-center justify-between">
                                      <span className="text-xs">{ip.address}</span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => handleRemoveIPAddressFromSuite(suite.id, ipIndex)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">No IP addresses</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              getSuiteStatus(suite) === "Valid" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-red-100 text-red-800"
                            }`}>
                              {getSuiteStatus(suite)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveSuite(suite.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">No suites have been added yet</p>
                )}
                <Button type="button" variant="outline" size="sm" onClick={handleAddSuite}>
                  <Plus className="h-4 w-4 mr-2" /> Add Suite
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="closures" className="mt-4 space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          {tempClosureStartDate ? (
                            format(tempClosureStartDate, "PPP")
                          ) : (
                            <span className="text-muted-foreground">Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={tempClosureStartDate}
                          onSelect={setTempClosureStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>End Date (Optional)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          {tempClosureEndDate ? (
                            format(tempClosureEndDate, "PPP")
                          ) : (
                            <span className="text-muted-foreground">Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={tempClosureEndDate}
                          onSelect={setTempClosureEndDate}
                          initialFocus
                          disabled={(date) => 
                            tempClosureStartDate ? date < tempClosureStartDate : false
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tempClosureReason">Reason</Label>
                  <Select
                    value={tempClosureReason}
                    onValueChange={setTempClosureReason}
                  >
                    <SelectTrigger id="tempClosureReason">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {tempClosureReasonsList.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tempClosureNotes">Notes (Optional)</Label>
                  <Textarea
                    id="tempClosureNotes"
                    value={tempClosureNotes}
                    onChange={(e) => setTempClosureNotes(e.target.value)}
                    placeholder="Additional details about the closure"
                  />
                </div>
                
                <Button 
                  type="button" 
                  onClick={handleAddTempClosure}
                  disabled={!tempClosureStartDate || !tempClosureReason}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Temporary Closure
                </Button>
                
                {formData.temporaryClosures && formData.temporaryClosures.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.temporaryClosures.map((closure) => (
                        <TableRow key={closure.id}>
                          <TableCell>
                            {format(new Date(closure.startDate), "PPP")}
                          </TableCell>
                          <TableCell>
                            {closure.endDate 
                              ? format(new Date(closure.endDate), "PPP")
                              : <span className="text-muted-foreground text-xs">Ongoing</span>
                            }
                          </TableCell>
                          <TableCell>{closure.reason}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              closure.active 
                                ? "bg-yellow-100 text-yellow-800" 
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {closure.active ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
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
                ) : (
                  <p className="text-muted-foreground">No temporary closures have been added yet</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Update Screen" : "Create Screen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
