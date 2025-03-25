import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Screen, ScreenDevice } from "@/types";
import { Plus, Trash2, User, Monitor, Volume2, Box, ArrowDownToLine } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

interface ScreenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theatreId: string;
  screen?: Screen;
  onSave: (screen: Partial<Screen>) => void;
}

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
      devices: []
    }
  );
  
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
  
  const handleAddDevice = () => {
    const newDevice: ScreenDevice = {
      id: crypto.randomUUID(),
      manufacturer: "",
      model: "",
      serialNumber: ""
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
  
  const handleDeviceChange = (deviceId: string, field: keyof ScreenDevice, value: string) => {
    setFormData((prev) => ({
      ...prev,
      devices: (prev.devices || []).map(device => 
        device.id === deviceId 
          ? { ...device, [field]: value } 
          : device
      )
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
    
    onSave(formData);
    onOpenChange(false);
    
    toast.success(
      isEditing 
        ? `Screen "${formData.name}" updated successfully` 
        : `Screen "${formData.name}" created successfully`
    );
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
                  <Input
                    id="thirdPartyId"
                    name="thirdPartyId"
                    value={formData.thirdPartyId || ""}
                    onChange={handleChange}
                  />
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
                  <Label htmlFor="status">Status</Label>
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
                      <SelectItem value="Digital 4K">Digital 4K</SelectItem>
                      <SelectItem value="IMAX Digital">IMAX Digital</SelectItem>
                      <SelectItem value="IMAX Laser">IMAX Laser</SelectItem>
                      <SelectItem value="Dolby Cinema">Dolby Cinema</SelectItem>
                      <SelectItem value="35mm Film">35mm Film</SelectItem>
                      <SelectItem value="70mm Film">70mm Film</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectionManufacturer">Manufacturer</Label>
                  <Select
                    value={formData.projection?.manufacturer || ""}
                    onValueChange={(value) => handleProjectionChange("manufacturer", value)}
                  >
                    <SelectTrigger id="projectionManufacturer">
                      <SelectValue placeholder="Select manufacturer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Christie">Christie</SelectItem>
                      <SelectItem value="Barco">Barco</SelectItem>
                      <SelectItem value="NEC">NEC</SelectItem>
                      <SelectItem value="Sony">Sony</SelectItem>
                      <SelectItem value="IMAX">IMAX</SelectItem>
                      <SelectItem value="Dolby">Dolby</SelectItem>
                      <SelectItem value="JVC">JVC</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="masking">Screen Masking Available</Label>
                  <Switch 
                    id="masking"
                    checked={formData.projection?.masking || false}
                    onCheckedChange={(checked) => handleProjectionChange("masking", checked)}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-6">
                <Volume2 className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-medium">Sound System</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="soundProcessor">Sound Processor</Label>
                  <Select
                    value={formData.sound?.processor || ""}
                    onValueChange={(value) => handleSoundChange("processor", value)}
                  >
                    <SelectTrigger id="soundProcessor">
                      <SelectValue placeholder="Select sound processor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dolby CP650">Dolby CP650</SelectItem>
                      <SelectItem value="Dolby CP750">Dolby CP750</SelectItem>
                      <SelectItem value="Dolby CP850">Dolby CP850</SelectItem>
                      <SelectItem value="Dolby Atmos">Dolby Atmos</SelectItem>
                      <SelectItem value="DTS">DTS</SelectItem>
                      <SelectItem value="SDDS">SDDS</SelectItem>
                      <SelectItem value="Datasat">Datasat</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="speakers">Speakers</Label>
                  <Select
                    value={formData.sound?.speakers || ""}
                    onValueChange={(value) => handleSoundChange("speakers", value)}
                  >
                    <SelectTrigger id="speakers">
                      <SelectValue placeholder="Select speakers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JBL">JBL</SelectItem>
                      <SelectItem value="Klipsch">Klipsch</SelectItem>
                      <SelectItem value="QSC">QSC</SelectItem>
                      <SelectItem value="Meyer Sound">Meyer Sound</SelectItem>
                      <SelectItem value="Bose">Bose</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Sound Mixes Supported</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {soundMixOptions.map(option => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`soundMix-${option.id}`}
                        checked={(formData.sound?.soundMixes || []).includes(option.id)}
                        onChange={() => handleSoundMixChange(option.id)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor={`soundMix-${option.id}`} className="text-sm font-normal">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="iabSupported">IAB Supported</Label>
                  <Switch 
                    id="iabSupported"
                    checked={formData.sound?.iabSupported || false}
                    onCheckedChange={(checked) => handleSoundChange("iabSupported", checked)}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="devices" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Screen Devices</h3>
                <Button type="button" onClick={handleAddDevice} size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Device
                </Button>
              </div>
              
              {formData.devices && formData.devices.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Device Manufacturer</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Serial Number</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.devices.map((device) => (
                        <TableRow key={device.id}>
                          <TableCell>
                            <Input 
                              value={device.manufacturer} 
                              onChange={(e) => handleDeviceChange(device.id, "manufacturer", e.target.value)} 
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={device.model} 
                              onChange={(e) => handleDeviceChange(device.id, "model", e.target.value)} 
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={device.serialNumber} 
                              onChange={(e) => handleDeviceChange(device.id, "serialNumber", e.target.value)} 
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveDevice(device.id)}
                              className="h-8 w-8"
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
                <div className="border rounded-md p-8 text-center">
                  <p className="text-muted-foreground mb-4">No devices have been added yet</p>
                  <Button type="button" onClick={handleAddDevice} variant="outline">
                    <Plus className="h-4 w-4 mr-2" /> Add Device
                  </Button>
                </div>
              )}
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
