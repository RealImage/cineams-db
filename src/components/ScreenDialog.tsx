
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Screen, ScreenOperator, ScreenDevice } from "@/types";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

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
      theatreId,
      number: "",
      name: "",
      uuid: crypto.randomUUID(),
      operators: [],
      autoScreenUpdateLock: false,
      flmManagementLock: false,
      multiThumbprintKdmScreen: false,
      status: "Active",
      wheelchairAccessibility: false,
      motionSeats: false,
      devices: [],
    }
  );
  
  const [operators, setOperators] = useState<ScreenOperator[]>(
    screen?.operators || []
  );
  
  const [newOperator, setNewOperator] = useState<ScreenOperator>({
    name: "",
    email: "",
    phone: "",
  });
  
  const [devices, setDevices] = useState<ScreenDevice[]>(
    screen?.devices || []
  );
  
  const [newDevice, setNewDevice] = useState<ScreenDevice>({
    id: crypto.randomUUID(),
    manufacturer: "",
    model: "",
    serialNumber: "",
  });
  
  // Update screen number placeholder based on selection
  useEffect(() => {
    if (!isEditing && formData.number) {
      setFormData((prev) => ({
        ...prev,
        name: `Audi ${formData.number}`,
      }));
    }
  }, [formData.number, isEditing]);
  
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
  
  const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      dimensions: {
        ...(prev.dimensions || {}),
        [name]: value ? parseFloat(value) : undefined,
      },
    }));
  };
  
  const handleProjectionChange = (name: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      projection: {
        ...(prev.projection || {}),
        [name]: value,
      },
    }));
  };
  
  const handleSoundChange = (name: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      sound: {
        ...(prev.sound || {}),
        [name]: value,
      },
    }));
  };
  
  // Handle operators
  const handleOperatorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewOperator((prev) => ({ ...prev, [name]: value }));
  };
  
  const addOperator = () => {
    if (!newOperator.name || !newOperator.email) {
      toast.error("Operator name and email are required");
      return;
    }
    
    setOperators([...operators, { ...newOperator }]);
    setNewOperator({ name: "", email: "", phone: "" });
  };
  
  const removeOperator = (index: number) => {
    setOperators(operators.filter((_, i) => i !== index));
  };
  
  // Handle devices
  const handleDeviceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewDevice((prev) => ({ ...prev, [name]: value }));
  };
  
  const addDevice = () => {
    if (!newDevice.manufacturer || !newDevice.model || !newDevice.serialNumber) {
      toast.error("All device fields are required");
      return;
    }
    
    setDevices([...devices, { ...newDevice, id: crypto.randomUUID() }]);
    setNewDevice({
      id: crypto.randomUUID(),
      manufacturer: "",
      model: "",
      serialNumber: "",
    });
  };
  
  const removeDevice = (index: number) => {
    setDevices(devices.filter((_, i) => i !== index));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.number || !formData.name) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Include operators and devices in the screen data
    const screenData: Partial<Screen> = {
      ...formData,
      operators,
      devices,
    };
    
    onSave(screenData);
    onOpenChange(false);
    
    toast.success(
      isEditing 
        ? `Screen "${formData.name}" updated successfully` 
        : `Screen "${formData.name}" created successfully`
    );
  };
  
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
              <TabsTrigger value="metadata">Screen Metadata</TabsTrigger>
              <TabsTrigger value="projection">Projection & Sound</TabsTrigger>
              <TabsTrigger value="devices">Screen Devices</TabsTrigger>
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
                    placeholder="e.g. 1"
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
                    placeholder="e.g. Audi 1"
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
                    placeholder="External identifier"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Screen Operators</Label>
                
                {operators.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {operators.map((operator, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 border rounded-md">
                        <div className="flex-1">
                          <p className="font-medium">{operator.name}</p>
                          <p className="text-sm text-muted-foreground">{operator.email}</p>
                          {operator.phone && <p className="text-sm text-muted-foreground">{operator.phone}</p>}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOperator(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Name"
                    name="name"
                    value={newOperator.name}
                    onChange={handleOperatorChange}
                  />
                  <Input
                    placeholder="Email"
                    name="email"
                    type="email"
                    value={newOperator.email}
                    onChange={handleOperatorChange}
                  />
                  <Input
                    placeholder="Phone (optional)"
                    name="phone"
                    value={newOperator.phone || ""}
                    onChange={handleOperatorChange}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOperator}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Operator
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoScreenUpdateLock"
                    checked={formData.autoScreenUpdateLock}
                    onCheckedChange={(checked) => handleSwitchChange("autoScreenUpdateLock", checked)}
                  />
                  <Label htmlFor="autoScreenUpdateLock">Auto Screen Update Lock</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="flmManagementLock"
                    checked={formData.flmManagementLock}
                    onCheckedChange={(checked) => handleSwitchChange("flmManagementLock", checked)}
                  />
                  <Label htmlFor="flmManagementLock">FLM Management Lock</Label>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="multiThumbprintKdmScreen"
                  checked={formData.multiThumbprintKdmScreen}
                  onCheckedChange={(checked) => handleSwitchChange("multiThumbprintKdmScreen", checked)}
                />
                <Label htmlFor="multiThumbprintKdmScreen">Multi Thumbprint KDM Screen</Label>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seatingCapacity">Seating Capacity</Label>
                  <Input
                    id="seatingCapacity"
                    name="seatingCapacity"
                    type="number"
                    value={formData.seatingCapacity || ""}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      seatingCapacity: e.target.value ? parseInt(e.target.value) : undefined
                    }))}
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
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="wheelchairAccessibility"
                    checked={formData.wheelchairAccessibility}
                    onCheckedChange={(checked) => handleSwitchChange("wheelchairAccessibility", checked)}
                  />
                  <Label htmlFor="wheelchairAccessibility">Wheelchair Accessibility</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="motionSeats"
                    checked={formData.motionSeats}
                    onCheckedChange={(checked) => handleSwitchChange("motionSeats", checked)}
                  />
                  <Label htmlFor="motionSeats">Motion Seats</Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Auditorium Dimensions</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="auditoriumWidth" className="text-xs">Width (m)</Label>
                    <Input
                      id="auditoriumWidth"
                      name="auditoriumWidth"
                      type="number"
                      step="0.1"
                      value={formData.dimensions?.auditoriumWidth || ""}
                      onChange={handleDimensionChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="auditoriumHeight" className="text-xs">Height (m)</Label>
                    <Input
                      id="auditoriumHeight"
                      name="auditoriumHeight"
                      type="number"
                      step="0.1"
                      value={formData.dimensions?.auditoriumHeight || ""}
                      onChange={handleDimensionChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="auditoriumDepth" className="text-xs">Depth (m)</Label>
                    <Input
                      id="auditoriumDepth"
                      name="auditoriumDepth"
                      type="number"
                      step="0.1"
                      value={formData.dimensions?.auditoriumDepth || ""}
                      onChange={handleDimensionChange}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Screen Dimensions</Label>
                <div className="grid grid-cols-4 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="screenWidth" className="text-xs">Width (m)</Label>
                    <Input
                      id="screenWidth"
                      name="screenWidth"
                      type="number"
                      step="0.1"
                      value={formData.dimensions?.screenWidth || ""}
                      onChange={handleDimensionChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="screenHeight" className="text-xs">Height (m)</Label>
                    <Input
                      id="screenHeight"
                      name="screenHeight"
                      type="number"
                      step="0.1"
                      value={formData.dimensions?.screenHeight || ""}
                      onChange={handleDimensionChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="throwDistance" className="text-xs">Throw Distance (m)</Label>
                    <Input
                      id="throwDistance"
                      name="throwDistance"
                      type="number"
                      step="0.1"
                      value={formData.dimensions?.throwDistance || ""}
                      onChange={handleDimensionChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="gain" className="text-xs">Gain</Label>
                    <Input
                      id="gain"
                      name="gain"
                      type="number"
                      step="0.1"
                      value={formData.dimensions?.gain || ""}
                      onChange={handleDimensionChange}
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ipAddress">IP Address</Label>
                  <Input
                    id="ipAddress"
                    name="ipAddress"
                    value={formData.ipAddress || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subnet">Subnet Mask</Label>
                  <Input
                    id="subnet"
                    name="subnet"
                    value={formData.subnet || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gateway">Gateway</Label>
                <Input
                  id="gateway"
                  name="gateway"
                  value={formData.gateway || ""}
                  onChange={handleChange}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="projection" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectionType">Projection Type</Label>
                  <Select
                    value={formData.projection?.type || ""}
                    onValueChange={(value) => handleProjectionChange("type", value)}
                  >
                    <SelectTrigger id="projectionType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Digital 2D">Digital 2D</SelectItem>
                      <SelectItem value="Digital 2D/3D">Digital 2D/3D</SelectItem>
                      <SelectItem value="Laser">Laser</SelectItem>
                      <SelectItem value="LED">LED</SelectItem>
                      <SelectItem value="IMAX">IMAX</SelectItem>
                      <SelectItem value="IMAX with Laser">IMAX with Laser</SelectItem>
                      <SelectItem value="35mm">35mm Film</SelectItem>
                      <SelectItem value="70mm">70mm Film</SelectItem>
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
                      <SelectItem value="Sony">Sony</SelectItem>
                      <SelectItem value="NEC">NEC</SelectItem>
                      <SelectItem value="IMAX">IMAX</SelectItem>
                      <SelectItem value="Samsung">Samsung</SelectItem>
                      <SelectItem value="LG">LG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="masking"
                  checked={formData.projection?.masking || false}
                  onCheckedChange={(checked) => handleProjectionChange("masking", checked)}
                />
                <Label htmlFor="masking">Screen Masking Available</Label>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="soundProcessor">Sound Processor</Label>
                  <Select
                    value={formData.sound?.processor || ""}
                    onValueChange={(value) => handleSoundChange("processor", value)}
                  >
                    <SelectTrigger id="soundProcessor">
                      <SelectValue placeholder="Select processor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dolby CP750">Dolby CP750</SelectItem>
                      <SelectItem value="Dolby CP850">Dolby CP850</SelectItem>
                      <SelectItem value="Dolby Atmos">Dolby Atmos</SelectItem>
                      <SelectItem value="QSC Q-SYS">QSC Q-SYS</SelectItem>
                      <SelectItem value="USL JSD-100">USL JSD-100</SelectItem>
                      <SelectItem value="DTS-X">DTS-X</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="speakers">Speakers</Label>
                  <Input
                    id="speakers"
                    name="speakers"
                    value={formData.sound?.speakers || ""}
                    onChange={(e) => handleSoundChange("speakers", e.target.value)}
                    placeholder="e.g. JBL, Klipsch, etc."
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Sound Mixes Supported</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="dolbyStereo"
                      checked={(formData.sound?.soundMixes || []).includes("Dolby Stereo")}
                      onCheckedChange={(checked) => {
                        const soundMixes = formData.sound?.soundMixes || [];
                        const updated = checked 
                          ? [...soundMixes, "Dolby Stereo"]
                          : soundMixes.filter(mix => mix !== "Dolby Stereo");
                        handleSoundChange("soundMixes", updated);
                      }}
                    />
                    <Label htmlFor="dolbyStereo">Dolby Stereo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="dolbyDigital"
                      checked={(formData.sound?.soundMixes || []).includes("Dolby Digital")}
                      onCheckedChange={(checked) => {
                        const soundMixes = formData.sound?.soundMixes || [];
                        const updated = checked 
                          ? [...soundMixes, "Dolby Digital"]
                          : soundMixes.filter(mix => mix !== "Dolby Digital");
                        handleSoundChange("soundMixes", updated);
                      }}
                    />
                    <Label htmlFor="dolbyDigital">Dolby Digital</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="dolbySurround71"
                      checked={(formData.sound?.soundMixes || []).includes("7.1 Surround")}
                      onCheckedChange={(checked) => {
                        const soundMixes = formData.sound?.soundMixes || [];
                        const updated = checked 
                          ? [...soundMixes, "7.1 Surround"]
                          : soundMixes.filter(mix => mix !== "7.1 Surround");
                        handleSoundChange("soundMixes", updated);
                      }}
                    />
                    <Label htmlFor="dolbySurround71">7.1 Surround</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="dolbySurround51"
                      checked={(formData.sound?.soundMixes || []).includes("5.1 Surround")}
                      onCheckedChange={(checked) => {
                        const soundMixes = formData.sound?.soundMixes || [];
                        const updated = checked 
                          ? [...soundMixes, "5.1 Surround"]
                          : soundMixes.filter(mix => mix !== "5.1 Surround");
                        handleSoundChange("soundMixes", updated);
                      }}
                    />
                    <Label htmlFor="dolbySurround51">5.1 Surround</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="dolbyAtmos"
                      checked={(formData.sound?.soundMixes || []).includes("Dolby Atmos")}
                      onCheckedChange={(checked) => {
                        const soundMixes = formData.sound?.soundMixes || [];
                        const updated = checked 
                          ? [...soundMixes, "Dolby Atmos"]
                          : soundMixes.filter(mix => mix !== "Dolby Atmos");
                        handleSoundChange("soundMixes", updated);
                      }}
                    />
                    <Label htmlFor="dolbyAtmos">Dolby Atmos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="dtsX"
                      checked={(formData.sound?.soundMixes || []).includes("DTS-X")}
                      onCheckedChange={(checked) => {
                        const soundMixes = formData.sound?.soundMixes || [];
                        const updated = checked 
                          ? [...soundMixes, "DTS-X"]
                          : soundMixes.filter(mix => mix !== "DTS-X");
                        handleSoundChange("soundMixes", updated);
                      }}
                    />
                    <Label htmlFor="dtsX">DTS-X</Label>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="iabSupported"
                  checked={formData.sound?.iabSupported || false}
                  onCheckedChange={(checked) => handleSoundChange("iabSupported", checked)}
                />
                <Label htmlFor="iabSupported">IAB Supported</Label>
              </div>
            </TabsContent>
            
            <TabsContent value="devices" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Screen Devices</Label>
                
                {devices.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {devices.map((device, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 border rounded-md">
                        <div className="flex-1">
                          <p className="font-medium">{device.manufacturer} {device.model}</p>
                          <p className="text-sm text-muted-foreground">S/N: {device.serialNumber}</p>
                          {device.softwareVersion && (
                            <p className="text-xs text-muted-foreground">
                              Software: {device.softwareVersion}
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDevice(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Manufacturer"
                    name="manufacturer"
                    value={newDevice.manufacturer}
                    onChange={handleDeviceChange}
                  />
                  <Input
                    placeholder="Model"
                    name="model"
                    value={newDevice.model}
                    onChange={handleDeviceChange}
                  />
                  <Input
                    placeholder="Serial Number"
                    name="serialNumber"
                    value={newDevice.serialNumber}
                    onChange={handleDeviceChange}
                  />
                </div>
                <Input
                  placeholder="Software Version (optional)"
                  name="softwareVersion"
                  value={newDevice.softwareVersion || ""}
                  onChange={handleDeviceChange}
                  className="mt-2"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDevice}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Device
                </Button>
              </div>
            </TabsContent>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Update Screen" : "Create Screen"}
              </Button>
            </DialogFooter>
          </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  );
};
