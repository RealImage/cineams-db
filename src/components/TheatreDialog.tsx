import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Screen, Theatre, WireTAPDevice } from "@/types";
import { DataTable, Column } from "@/components/ui/data-table";
import { ScreenDialog } from "./ScreenDialog";
import { Plus, Edit, Trash2, MapPin, Building, Bike, Car, Monitor, Server, Ticket, Cable, Network } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TheatreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theatre?: Theatre;
  onSave: (theatre: Partial<Theatre>) => void;
  isFullPage?: boolean;
}

export const TheatreDialog = ({
  open,
  onOpenChange,
  theatre,
  onSave,
  isFullPage = false,
}: TheatreDialogProps) => {
  const isEditing = !!theatre;
  
  const [formData, setFormData] = useState<Partial<Theatre>>(
    theatre || {
      name: "",
      displayName: "",
      uuid: crypto.randomUUID(),
      chainId: "",
      chainName: "",
      companyId: "",
      companyName: "",
      listing: "Listed",
      type: "Multiplex",
      address: "",
      status: "Active",
      screenCount: 0,
      locationType: "Information Not Available",
      bikeParkingAvailable: false,
      carParkingAvailable: false,
      theatreManagementSystem: "Information Not Available",
      ticketingSystem: "Information Not Available",
      wireTAPDevices: [],
    }
  );
  
  const [screens, setScreens] = useState<Screen[]>(
    theatre?.screens || []
  );

  const [wireDevices, setWireDevices] = useState<WireTAPDevice[]>(
    theatre?.wireTAPDevices || []
  );
  
  const [screenDialogOpen, setScreenDialogOpen] = useState(false);
  const [editingScreen, setEditingScreen] = useState<Screen | undefined>(undefined);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setFormData((prev) => ({ ...prev, [name]: numberValue }));
  };
  
  // Screen management
  const handleCreateScreen = () => {
    if (!formData.id) {
      toast.error("Please save the theatre first before adding screens");
      return;
    }
    setEditingScreen(undefined);
    setScreenDialogOpen(true);
  };
  
  const handleEditScreen = (screen: Screen) => {
    setEditingScreen(screen);
    setScreenDialogOpen(true);
  };
  
  const handleDeleteScreen = (screen: Screen) => {
    setScreens(screens.filter((s) => s.id !== screen.id));
    toast.success(`Screen "${screen.name}" deleted successfully`);
    
    // Update screen count
    setFormData(prev => ({
      ...prev,
      screenCount: (prev.screenCount || 0) - 1
    }));
  };
  
  const handleSaveScreen = (screenData: Partial<Screen>) => {
    if (editingScreen) {
      // Update existing screen
      setScreens(screens.map((s) => 
        s.id === editingScreen.id ? { ...s, ...screenData, updatedAt: new Date().toISOString() } as Screen : s
      ));
    } else {
      // Create new screen
      const newScreen = {
        ...screenData,
        theatreId: formData.id as string,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Screen;
      
      setScreens([...screens, newScreen]);
      
      // Update screen count
      setFormData(prev => ({
        ...prev,
        screenCount: (prev.screenCount || 0) + 1
      }));
    }
  };
  
  const screenColumns: Column<Screen>[] = [
    {
      header: "Number",
      accessor: "number" as keyof Screen
    },
    {
      header: "Name",
      accessor: "name" as keyof Screen
    },
    {
      header: "Status",
      accessor: "status" as keyof Screen,
      cell: (row: Screen) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.status === "Active" 
            ? "bg-green-100 text-green-800" 
            : row.status === "Inactive" 
              ? "bg-yellow-100 text-yellow-800" 
              : "bg-red-100 text-red-800"
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: "Devices",
      accessor: "devices" as keyof Screen,
      cell: (row: Screen) => row.devices?.length || 0
    }
  ];
  
  const screenActions = [
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEditScreen
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDeleteScreen
    }
  ];
  
  const handleAddWireTAPDevice = () => {
    const newDevice: WireTAPDevice = {
      id: crypto.randomUUID(),
      serialNumber: "",
      mappingStatus: "Unmapped",
      theatreId: formData.id,
      theatreName: formData.name,
      status: "Active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setWireDevices([...wireDevices, newDevice]);
  };
  
  const handleDeleteWireTAPDevice = (deviceId: string) => {
    setWireDevices(wireDevices.filter(device => device.id !== deviceId));
    toast.success("Device removed successfully");
  };
  
  const handleWireTAPDeviceChange = (deviceId: string, field: keyof WireTAPDevice, value: any) => {
    setWireDevices(wireDevices.map(device => 
      device.id === deviceId 
        ? { ...device, [field]: value, updatedAt: new Date().toISOString() } 
        : device
    ));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.displayName || !formData.address) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Include screens and WireTAP devices in the theatre data
    const theatreData = {
      ...formData,
      screens: screens,
      wireTAPDevices: wireDevices,
    };
    
    onSave(theatreData);
    onOpenChange(false);
    
    toast.success(
      isEditing 
        ? `Theatre "${formData.name}" updated successfully` 
        : `Theatre "${formData.name}" created successfully`
    );
  };
  
  // Conditional rendering based on isFullPage
  const renderDialogContent = () => {
    return (
      <div className={isFullPage ? "container mx-auto max-w-5xl py-6" : ""}>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="general">General Information</TabsTrigger>
              <TabsTrigger value="location">Location & Systems</TabsTrigger>
              <TabsTrigger value="delivery">Content & Key Delivery</TabsTrigger>
              <TabsTrigger value="screens">Screen Management</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Theatre Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name *</Label>
                  <Input
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="alternateNames">Alternate Names (comma separated)</Label>
                <Input
                  id="alternateNames"
                  name="alternateNames"
                  value={formData.alternateNames?.join(", ") || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    alternateNames: e.target.value.split(",").map(name => name.trim()).filter(name => name)
                  }))}
                  placeholder="e.g. CCM, Metropolis Cinema"
                />
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
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chainId">Theatre Chain</Label>
                  <Select
                    value={formData.chainId}
                    onValueChange={(value) => handleSelectChange("chainId", value)}
                  >
                    <SelectTrigger id="chainId">
                      <SelectValue placeholder="Select chain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Cinema City International</SelectItem>
                      <SelectItem value="2">Regal Cinemas</SelectItem>
                      <SelectItem value="3">AMC Theatres</SelectItem>
                      <SelectItem value="4">Landmark Theatres</SelectItem>
                      <SelectItem value="5">Alamo Drafthouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyId">Theatre Company</Label>
                  <Select
                    value={formData.companyId}
                    onValueChange={(value) => handleSelectChange("companyId", value)}
                  >
                    <SelectTrigger id="companyId">
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Global Entertainment Holdings</SelectItem>
                      <SelectItem value="2">Cineworld Group</SelectItem>
                      <SelectItem value="3">AMC Entertainment</SelectItem>
                      <SelectItem value="4">Cohen Media Group</SelectItem>
                      <SelectItem value="5">Alamo Drafthouse Cinema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="listing">Theatre Listing</Label>
                  <Select
                    value={formData.listing}
                    onValueChange={(value) => handleSelectChange("listing", value as "Listed" | "Private")}
                  >
                    <SelectTrigger id="listing">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Listed">Listed</SelectItem>
                      <SelectItem value="Private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Theatre Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleSelectChange("type", value)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Multiplex">Multiplex</SelectItem>
                      <SelectItem value="Single Screen">Single Screen</SelectItem>
                      <SelectItem value="IMAX Multiplex">IMAX Multiplex</SelectItem>
                      <SelectItem value="Arthouse">Arthouse</SelectItem>
                      <SelectItem value="Dine-in Multiplex">Dine-in Multiplex</SelectItem>
                      <SelectItem value="Premium Multiplex">Premium Multiplex</SelectItem>
                      <SelectItem value="Drive-in">Drive-in</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="0.000001"
                    value={formData.latitude || ""}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      latitude: e.target.value ? parseFloat(e.target.value) : undefined
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="0.000001"
                    value={formData.longitude || ""}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      longitude: e.target.value ? parseFloat(e.target.value) : undefined
                    }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact</Label>
                  <Input
                    id="contact"
                    name="contact"
                    value={formData.contact || ""}
                    onChange={handleChange}
                  />
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
                    <Label htmlFor="closureDetails">Closure Details</Label>
                    <Input
                      id="closureDetails"
                      name="closureDetails"
                      value={formData.closureDetails || ""}
                      onChange={handleChange}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="location" className="mt-4">
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Location Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="locationType">Location Type</Label>
                      <Select
                        value={formData.locationType}
                        onValueChange={(value) => handleSelectChange("locationType", value)}
                      >
                        <SelectTrigger id="locationType">
                          <SelectValue placeholder="Select location type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Information Not Available">Information Not Available</SelectItem>
                          <SelectItem value="Mall">Mall</SelectItem>
                          <SelectItem value="Standalone">Standalone</SelectItem>
                          <SelectItem value="Office">Office</SelectItem>
                          <SelectItem value="Home">Home</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Car className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Parking Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Bike className="h-5 w-5 text-muted-foreground" />
                      <Label htmlFor="bikeParkingAvailable">Bike Parking Available</Label>
                    </div>
                    <Switch 
                      id="bikeParkingAvailable"
                      checked={formData.bikeParkingAvailable || false}
                      onCheckedChange={(checked) => handleSwitchChange("bikeParkingAvailable", checked)}
                    />
                  </div>
                  
                  {formData.bikeParkingAvailable && (
                    <div className="space-y-2">
                      <Label htmlFor="bikeParkingCapacity">Bike Parking Capacity</Label>
                      <Input
                        id="bikeParkingCapacity"
                        type="number"
                        value={formData.bikeParkingCapacity || ""}
                        onChange={(e) => handleNumberChange("bikeParkingCapacity", e.target.value)}
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Car className="h-5 w-5 text-muted-foreground" />
                      <Label htmlFor="carParkingAvailable">Car Parking Available</Label>
                    </div>
                    <Switch 
                      id="carParkingAvailable"
                      checked={formData.carParkingAvailable || false}
                      onCheckedChange={(checked) => handleSwitchChange("carParkingAvailable", checked)}
                    />
                  </div>
                  
                  {formData.carParkingAvailable && (
                    <div className="space-y-2">
                      <Label htmlFor="carParkingCapacity">Car Parking Capacity</Label>
                      <Input
                        id="carParkingCapacity"
                        type="number"
                        value={formData.carParkingCapacity || ""}
                        onChange={(e) => handleNumberChange("carParkingCapacity", e.target.value)}
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Server className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Theatre Systems</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="theatreManagementSystem">Theatre Management System (TMS)</Label>
                      <Select
                        value={formData.theatreManagementSystem}
                        onValueChange={(value) => handleSelectChange("theatreManagementSystem", value)}
                      >
                        <SelectTrigger id="theatreManagementSystem">
                          <SelectValue placeholder="Select TMS" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Information Not Available">Information Not Available</SelectItem>
                          <SelectItem value="Arts Alliance Media">Arts Alliance Media</SelectItem>
                          <SelectItem value="CinemaNext">CinemaNext</SelectItem>
                          <SelectItem value="GDC TMS">GDC TMS</SelectItem>
                          <SelectItem value="Qube TMS">Qube TMS</SelectItem>
                          <SelectItem value="Dolby TMS">Dolby TMS</SelectItem>
                          <SelectItem value="Sony TMS">Sony TMS</SelectItem>
                          <SelectItem value="Others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ticketingSystem">Ticketing System</Label>
                      <Select
                        value={formData.ticketingSystem}
                        onValueChange={(value) => handleSelectChange("ticketingSystem", value)}
                      >
                        <SelectTrigger id="ticketingSystem">
                          <SelectValue placeholder="Select ticketing system" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Information Not Available">Information Not Available</SelectItem>
                          <SelectItem value="Vista">Vista</SelectItem>
                          <SelectItem value="TicketNew">TicketNew</SelectItem>
                          <SelectItem value="QuickTickets">QuickTickets</SelectItem>
                          <SelectItem value="iCirena">iCirena</SelectItem>
                          <SelectItem value="CineSync">CineSync</SelectItem>
                          <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                          <SelectItem value="Others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Cable className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">WireTAP Devices</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Manage the WireTAP devices installed in this theatre
                    </p>
                    <Button type="button" onClick={handleAddWireTAPDevice} size="sm">
                      <Plus className="h-4 w-4 mr-1" /> Add Device
                    </Button>
                  </div>
                  
                  {wireDevices.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Serial Number</TableHead>
                            <TableHead>Mapping Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Last Updated</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {wireDevices.map((device) => (
                            <TableRow key={device.id}>
                              <TableCell>
                                <Input 
                                  value={device.serialNumber} 
                                  onChange={(e) => handleWireTAPDeviceChange(device.id, "serialNumber", e.target.value)} 
                                  className="h-8"
                                />
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={device.status}
                                  onValueChange={(value) => handleWireTAPDeviceChange(device.id, "status", value)}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Removed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {new Date(device.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {new Date(device.updatedAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteWireTAPDevice(device.id)}
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
                      <p className="text-muted-foreground mb-4">No WireTAP devices have been added yet</p>
                      <Button type="button" onClick={handleAddWireTAPDevice} variant="outline">
                        <Plus className="h-4 w-4 mr-2" /> Add Device
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="delivery" className="mt-4">
              <div className="text-center py-10 text-muted-foreground">
                Content & Key Delivery details will be available in a future update
              </div>
            </TabsContent>
            
            <TabsContent value="screens" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Screens ({screens.length})</h3>
                <Button type="button" onClick={handleCreateScreen} size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Screen
                </Button>
              </div>
              
              {screens.length > 0 ? (
                <DataTable
                  data={screens}
                  columns={screenColumns}
                  actions={screenActions}
                  searchPlaceholder="Search screens..."
                />
              ) : (
                <div className="border rounded-md p-8 text-center">
                  <p className="text-muted-foreground mb-4">No screens have been added yet</p>
                  <Button type="button" onClick={handleCreateScreen} variant="outline">
                    <Plus className="h-4 w-4 mr-2" /> Add Screen
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <DialogFooter className="mt-6">
              {!isFullPage && (
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
              )}
              <Button type="submit">
                {isEditing ? "Update Theatre" : "Create Theatre"}
              </Button>
            </DialogFooter>
          </Tabs>
        </form>
      </div>
    );
  };
  
  // If full page mode, return content directly
  if (isFullPage) {
    return renderDialogContent();
  }
  
  // Otherwise wrap in Dialog
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Theatre" : "Create New Theatre"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Update the details of an existing theatre" 
                : "Enter the details to create a new theatre"}
            </DialogDescription>
          </DialogHeader>
          
          {renderDialogContent()}
        </DialogContent>
      </Dialog>
      
      <ScreenDialog
        open={screenDialogOpen}
        onOpenChange={setScreenDialogOpen}
        theatreId={formData.id || "temp"}
        screen={editingScreen}
        onSave={handleSaveScreen}
      />
    </>
  );
};

