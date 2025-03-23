
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Screen, ScreenDevice } from "@/types";
import { toast } from "sonner";

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
      theatreId: theatreId,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );
  
  const [newOperator, setNewOperator] = useState({ name: "", email: "", phone: "" });
  const [newDevice, setNewDevice] = useState<Partial<ScreenDevice>>({ 
    id: crypto.randomUUID(),
    manufacturer: "", 
    model: "", 
    serialNumber: "" 
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };
  
  const handleDeviceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewDevice((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleOperatorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewOperator((prev) => ({ ...prev, [name]: value }));
  };
  
  const addOperator = () => {
    if (!newOperator.name || !newOperator.email) {
      toast.error("Operator name and email are required");
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      operators: [...(prev.operators || []), { ...newOperator }]
    }));
    
    setNewOperator({ name: "", email: "", phone: "" });
  };
  
  const removeOperator = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      operators: prev.operators?.filter((_, i) => i !== index)
    }));
  };
  
  const addDevice = () => {
    if (!newDevice.manufacturer || !newDevice.model || !newDevice.serialNumber) {
      toast.error("Manufacturer, model and serial number are required");
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      devices: [...(prev.devices || []), { 
        id: crypto.randomUUID(),
        manufacturer: newDevice.manufacturer || "",
        model: newDevice.model || "",
        serialNumber: newDevice.serialNumber || ""
      }]
    }));
    
    setNewDevice({ 
      id: crypto.randomUUID(),
      manufacturer: "", 
      model: "", 
      serialNumber: "" 
    });
  };
  
  const removeDevice = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      devices: prev.devices?.filter((device) => device.id !== id)
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
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
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
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
              <TabsTrigger value="devices">Devices & Networking</TabsTrigger>
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
              
              {/* Screen Operators */}
              <div className="space-y-2">
                <Label>Screen Operators</Label>
                <div className="bg-muted/30 p-4 rounded-md space-y-4">
                  {formData.operators && formData.operators.length > 0 ? (
                    <div className="space-y-2">
                      {formData.operators.map((operator, index) => (
                        <div key={index} className="flex items-center justify-between bg-background p-2 rounded-md">
                          <div>
                            <div className="font-medium">{operator.name}</div>
                            <div className="text-sm text-muted-foreground">{operator.email}{operator.phone ? ` • ${operator.phone}` : ""}</div>
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeOperator(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-2 text-muted-foreground">
                      No operators added
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
                      value={newOperator.phone}
                      onChange={handleOperatorChange}
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={addOperator}
                  >
                    Add Operator
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="autoScreenUpdateLock" 
                    checked={formData.autoScreenUpdateLock}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange("autoScreenUpdateLock", checked as boolean)
                    }
                  />
                  <Label htmlFor="autoScreenUpdateLock">Auto Screen Update Lock</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="flmManagementLock" 
                    checked={formData.flmManagementLock}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange("flmManagementLock", checked as boolean)
                    }
                  />
                  <Label htmlFor="flmManagementLock">FLM Management Lock</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="multiThumbprintKdmScreen" 
                    checked={formData.multiThumbprintKdmScreen}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange("multiThumbprintKdmScreen", checked as boolean)
                    }
                  />
                  <Label htmlFor="multiThumbprintKdmScreen">Multi Thumbprint KDM Screen</Label>
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
                    <Input
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
                    onChange={handleChange}
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
              
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="wheelchairAccessibility" 
                    checked={formData.wheelchairAccessibility}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange("wheelchairAccessibility", checked as boolean)
                    }
                  />
                  <Label htmlFor="wheelchairAccessibility">Wheelchair Accessibility</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="motionSeats" 
                    checked={formData.motionSeats}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange("motionSeats", checked as boolean)
                    }
                  />
                  <Label htmlFor="motionSeats">Motion Seats</Label>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Auditorium & Screen Dimensions</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="auditoriumWidth">Auditorium Width (m)</Label>
                    <Input
                      id="auditoriumWidth"
                      name="dimensions.auditoriumWidth"
                      type="number"
                      value={formData.dimensions?.auditoriumWidth || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        dimensions: { ...(prev.dimensions || {}), auditoriumWidth: parseFloat(e.target.value) }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="auditoriumHeight">Auditorium Height (m)</Label>
                    <Input
                      id="auditoriumHeight"
                      name="dimensions.auditoriumHeight"
                      type="number"
                      value={formData.dimensions?.auditoriumHeight || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        dimensions: { ...(prev.dimensions || {}), auditoriumHeight: parseFloat(e.target.value) }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="auditoriumDepth">Auditorium Depth (m)</Label>
                    <Input
                      id="auditoriumDepth"
                      name="dimensions.auditoriumDepth"
                      type="number"
                      value={formData.dimensions?.auditoriumDepth || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        dimensions: { ...(prev.dimensions || {}), auditoriumDepth: parseFloat(e.target.value) }
                      }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="screenWidth">Screen Width (m)</Label>
                    <Input
                      id="screenWidth"
                      name="dimensions.screenWidth"
                      type="number"
                      value={formData.dimensions?.screenWidth || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        dimensions: { ...(prev.dimensions || {}), screenWidth: parseFloat(e.target.value) }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="screenHeight">Screen Height (m)</Label>
                    <Input
                      id="screenHeight"
                      name="dimensions.screenHeight"
                      type="number" 
                      value={formData.dimensions?.screenHeight || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        dimensions: { ...(prev.dimensions || {}), screenHeight: parseFloat(e.target.value) }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="throwDistance">Throw Distance (m)</Label>
                    <Input
                      id="throwDistance"
                      name="dimensions.throwDistance"
                      type="number"
                      value={formData.dimensions?.throwDistance || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        dimensions: { ...(prev.dimensions || {}), throwDistance: parseFloat(e.target.value) }
                      }))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Projection System</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectionType">Projection Type</Label>
                    <Input
                      id="projectionType"
                      name="projection.type"
                      value={formData.projection?.type || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        projection: { ...(prev.projection || {}), type: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectionManufacturer">Manufacturer</Label>
                    <Input
                      id="projectionManufacturer"
                      name="projection.manufacturer"
                      value={formData.projection?.manufacturer || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        projection: { ...(prev.projection || {}), manufacturer: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="space-y-2 flex items-center">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="projectionMasking" 
                        checked={formData.projection?.masking || false}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          projection: { ...(prev.projection || {}), masking: checked as boolean }
                        }))}
                      />
                      <Label htmlFor="projectionMasking">Masking</Label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Sound System</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="soundProcessor">Sound Processor</Label>
                    <Input
                      id="soundProcessor"
                      name="sound.processor"
                      value={formData.sound?.processor || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        sound: { ...(prev.sound || {}), processor: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="soundSpeakers">Speakers</Label>
                    <Input
                      id="soundSpeakers"
                      name="sound.speakers"
                      value={formData.sound?.speakers || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        sound: { ...(prev.sound || {}), speakers: e.target.value }
                      }))}
                    />
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <Label htmlFor="soundMixes">Sound Mixes (comma separated)</Label>
                  <Input
                    id="soundMixes"
                    name="sound.soundMixes"
                    value={formData.sound?.soundMixes?.join(", ") || ""}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      sound: { 
                        ...(prev.sound || {}), 
                        soundMixes: e.target.value.split(",").map(mix => mix.trim())
                      }
                    }))}
                    placeholder="e.g. Dolby Atmos, DTS:X, 7.1"
                  />
                </div>
                
                <div className="mt-4 flex items-center space-x-2">
                  <Checkbox 
                    id="iabSupported" 
                    checked={formData.sound?.iabSupported || false}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      sound: { ...(prev.sound || {}), iabSupported: checked as boolean }
                    }))}
                  />
                  <Label htmlFor="iabSupported">IAB Support</Label>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="devices" className="mt-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="gateway">Gateway</Label>
                  <Input
                    id="gateway"
                    name="gateway"
                    value={formData.gateway || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              {/* Devices List */}
              <div className="space-y-2 mt-4">
                <Label>Screen Devices</Label>
                <div className="bg-muted/30 p-4 rounded-md space-y-4">
                  {formData.devices && formData.devices.length > 0 ? (
                    <div className="space-y-2">
                      {formData.devices.map((device) => (
                        <div key={device.id} className="flex items-center justify-between bg-background p-2 rounded-md">
                          <div>
                            <div className="font-medium">{device.manufacturer} {device.model}</div>
                            <div className="text-sm text-muted-foreground">S/N: {device.serialNumber}</div>
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeDevice(device.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-2 text-muted-foreground">
                      No devices added
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
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={addDevice}
                  >
                    Add Device
                  </Button>
                </div>
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
