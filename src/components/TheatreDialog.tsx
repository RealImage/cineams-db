
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Screen, 
  Theatre, 
  WireTAPDevice, 
  DeliveryTimeSlot,
  DCPPhysicalDeliveryMethod,
  DCPNetworkDeliveryMethod,
  DCPModemDeliveryMethod,
  Contact,
  DeliveryAddress
} from "@/types";
import { DataTable, Column } from "@/components/ui/data-table";
import { ScreenDialog } from "@/components/screens/ScreenDialog";
import { 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Building, 
  Bike, 
  Car, 
  Monitor, 
  Server, 
  Ticket, 
  Cable, 
  Network,
  Clock,
  Truck,
  FileText,
  Globe,
  Phone,
  Mail,
  Key,
  Upload,
  Wifi,
  Save
} from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  
  // Initialize with proper types to match DeliveryAddress in the type definition
  const [formData, setFormData] = useState<Partial<Theatre>>(
    theatre ? JSON.parse(JSON.stringify(theatre)) : {
      name: "",
      displayName: "",
      alternateNames: [],
      uuid: crypto.randomUUID(),
      chainId: "",
      chainName: "",
      companyId: "",
      companyName: "",
      listing: "Listed",
      type: "",
      address: "",
      status: "Active",
      screenCount: 0,
      locationType: "",
      bikeParkingAvailable: false,
      bikeParkingCapacity: 0,
      carParkingAvailable: false,
      carParkingCapacity: 0,
      theatreManagementSystem: "",
      ticketingSystem: "",
      deliveryTimeSlots: [],
      // Fix: Ensure useTheatreAddress is required
      deliveryAddress: { 
        useTheatreAddress: true,
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: ""
      },
      dcpPhysicalDeliveryMethods: [],
      dcpNetworkDeliveryMethods: [],
      dcpModemDeliveryMethods: [],
      dcpDeliveryContacts: [],
      sendEmailsForDCPDelivery: false,
      dcpContentTypesForEmail: [],
      keyDeliveryContacts: [],
      kdmDeliveryEmailsInFLMX: "useDropbox",
      autoIngestOfContentEnabled: false,
      autoIngestContentTypes: [],
      qcnTheatreIPAddressRange: "",
    }
  );
  
  const [screens, setScreens] = useState<Screen[]>(theatre?.screens || []);
  const [screenDialogOpen, setScreenDialogOpen] = useState(false);
  const [editingScreen, setEditingScreen] = useState<Screen | undefined>(undefined);
  
  useEffect(() => {
    if (theatre) {
      setFormData(JSON.parse(JSON.stringify(theatre)));
      setScreens(theatre.screens || []);
    }
  }, [theatre]);
  
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
  
  // Fix: Ensure DeliveryAddress has all required properties with proper types
  const handleDeliveryAddressChange = (field: keyof DeliveryAddress, value: string | boolean) => {
    setFormData((prev) => {
      // Make sure we have a valid delivery address object with all required fields
      const currentAddress = prev.deliveryAddress || { 
        useTheatreAddress: true,
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: ""
      };
      
      return {
        ...prev,
        deliveryAddress: {
          ...currentAddress,
          [field]: value
        }
      };
    });
  };
  
  // Delivery Time Slots
  const handleAddDeliveryTimeSlot = () => {
    const newSlot: DeliveryTimeSlot = {
      id: crypto.randomUUID(),
      day: "Monday",
      startTime: "09:00",
      endTime: "17:00",
    };
    setFormData((prev) => ({
      ...prev,
      deliveryTimeSlots: [...(prev.deliveryTimeSlots || []), newSlot],
    }));
  };
  
  const handleDeleteDeliveryTimeSlot = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      deliveryTimeSlots: (prev.deliveryTimeSlots || []).filter((slot) => slot.id !== id),
    }));
  };
  
  const handleDeliveryTimeSlotChange = (id: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      deliveryTimeSlots: (prev.deliveryTimeSlots || []).map((slot) =>
        slot.id === id ? { ...slot, [field]: value } : slot
      ),
    }));
  };
  
  const handleCopyToAllDays = (slotId: string) => {
    const slotToCopy = formData.deliveryTimeSlots?.find(slot => slot.id === slotId);
    
    if (slotToCopy) {
      const updatedTimeSlots = (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const).map(day => ({
        ...slotToCopy,
        id: crypto.randomUUID(),
        day: day,
      }));
      
      setFormData(prev => ({
        ...prev,
        deliveryTimeSlots: updatedTimeSlots,
      }));
    }
  };
  
  // DCP Physical Delivery Methods
  const handleAddPhysicalDeliveryMethod = () => {
    const newMethod: DCPPhysicalDeliveryMethod = {
      id: crypto.randomUUID(),
      mediaType: "",
      details: "",
    };
    setFormData((prev) => ({
      ...prev,
      dcpPhysicalDeliveryMethods: [...(prev.dcpPhysicalDeliveryMethods || []), newMethod],
    }));
  };
  
  const handleDeletePhysicalDeliveryMethod = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      dcpPhysicalDeliveryMethods: (prev.dcpPhysicalDeliveryMethods || []).filter((method) => method.id !== id),
    }));
  };
  
  const handlePhysicalDeliveryMethodChange = (id: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      dcpPhysicalDeliveryMethods: (prev.dcpPhysicalDeliveryMethods || []).map((method) =>
        method.id === id ? { ...method, [field]: value } : method
      ),
    }));
  };
  
  // DCP Network Delivery Methods
  const handleAddNetworkDeliveryMethod = () => {
    const newMethod: DCPNetworkDeliveryMethod = {
      id: crypto.randomUUID(),
      networkURL: "",
    };
    setFormData((prev) => ({
      ...prev,
      dcpNetworkDeliveryMethods: [...(prev.dcpNetworkDeliveryMethods || []), newMethod],
    }));
  };
  
  const handleDeleteNetworkDeliveryMethod = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      dcpNetworkDeliveryMethods: (prev.dcpNetworkDeliveryMethods || []).filter((method) => method.id !== id),
    }));
  };
  
  const handleNetworkDeliveryMethodChange = (id: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      dcpNetworkDeliveryMethods: (prev.dcpNetworkDeliveryMethods || []).map((method) =>
        method.id === id ? { ...method, [field]: value } : method
      ),
    }));
  };
  
  // DCP Modem Delivery Methods
  const handleAddModemDeliveryMethod = () => {
    const newMethod: DCPModemDeliveryMethod = {
      id: crypto.randomUUID(),
      modemPhoneNumber: "",
    };
    setFormData((prev) => ({
      ...prev,
      dcpModemDeliveryMethods: [...(prev.dcpModemDeliveryMethods || []), newMethod],
    }));
  };
  
  const handleDeleteModemDeliveryMethod = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      dcpModemDeliveryMethods: (prev.dcpModemDeliveryMethods || []).filter((method) => method.id !== id),
    }));
  };
  
  const handleModemDeliveryMethodChange = (id: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      dcpModemDeliveryMethods: (prev.dcpModemDeliveryMethods || []).map((method) =>
        method.id === id ? { ...method, [field]: value } : method
      ),
    }));
  };
  
  // DCP Delivery Contacts
  const handleAddDCPDeliveryContact = () => {
    const newContact: Contact = {
      id: crypto.randomUUID(),
      email: "",
    };
    setFormData((prev) => ({
      ...prev,
      dcpDeliveryContacts: [...(prev.dcpDeliveryContacts || []), newContact],
    }));
  };
  
  const handleDeleteDCPDeliveryContact = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      dcpDeliveryContacts: (prev.dcpDeliveryContacts || []).filter((contact) => contact.id !== id),
    }));
  };
  
  const handleDCPDeliveryContactChange = (id: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      dcpDeliveryContacts: (prev.dcpDeliveryContacts || []).map((contact) =>
        contact.id === id ? { ...contact, [field]: value } : contact
      ),
    }));
  };
  
  // Key Delivery Contacts
  const handleAddKeyDeliveryContact = () => {
    const newContact: Contact = {
      id: crypto.randomUUID(),
      email: "",
    };
    setFormData((prev) => ({
      ...prev,
      keyDeliveryContacts: [...(prev.keyDeliveryContacts || []), newContact],
    }));
  };
  
  const handleDeleteKeyDeliveryContact = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      keyDeliveryContacts: (prev.keyDeliveryContacts || []).filter((contact) => contact.id !== id),
    }));
  };
  
  const handleKeyDeliveryContactChange = (id: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      keyDeliveryContacts: (prev.keyDeliveryContacts || []).map((contact) =>
        contact.id === id ? { ...contact, [field]: value } : contact
      ),
    }));
  };
  
  // Content Type
  const handleContentTypeChange = (contentType: string) => {
    setFormData((prev) => {
      const currentTypes = prev.dcpContentTypesForEmail || [];
      const updatedTypes = currentTypes.includes(contentType)
        ? currentTypes.filter((type) => type !== contentType)
        : [...currentTypes, contentType];
      
      return { ...prev, dcpContentTypesForEmail: updatedTypes };
    });
  };
  
  const handleAutoIngestContentTypeChange = (contentType: string) => {
    setFormData((prev) => {
      const currentTypes = prev.autoIngestContentTypes || [];
      const updatedTypes = currentTypes.includes(contentType)
        ? currentTypes.filter((type) => type !== contentType)
        : [...currentTypes, contentType];
      
      return { ...prev, autoIngestContentTypes: updatedTypes };
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
    
    toast.success(
      isEditing 
        ? `Theatre "${formData.name}" updated successfully` 
        : `Theatre "${formData.name}" created successfully`
    );
  };
  
  // Screen Management
  const handleCreateScreen = () => {
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
  };
  
  const handleSaveScreen = (screenData: Partial<Screen>) => {
    if (editingScreen) {
      setScreens(
        screens.map((s) => 
          s.id === editingScreen.id ? { ...s, ...screenData } as Screen : s
        )
      );
    } else {
      const newScreen: Screen = {
        id: crypto.randomUUID(),
        theatreId: formData.id || "",
        ...screenData,
      } as Screen;
      
      setScreens([newScreen, ...screens]);
    }
    
    setScreenDialogOpen(false);
  };
  
  const screenColumns: Column<Screen>[] = [
    {
      header: "Screen Number",
      accessor: "number" as keyof Screen
    },
    {
      header: "Screen Name",
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
  
  const contentTypeOptions = [
    { id: "FTR", label: "Feature" },
    { id: "TLR", label: "Trailer" },
    { id: "ADV", label: "Advertisement" },
    { id: "SHT", label: "Short" },
    { id: "MTC", label: "Movie Teaser" },
    { id: "NWS", label: "Newsreel" },
    { id: "DOC", label: "Documentary" },
    { id: "ANM", label: "Animated Film" },
    { id: "MSC", label: "Music Video" },
    { id: "SPV", label: "Special Venue" },
    { id: "EDU", label: "Educational Film" },
    { id: "ISR", label: "Intermission Reel" },
    { id: "OTH", label: "Other" },
    { id: "UNK", label: "Unknown" }
  ];
  
  // Define the renderDialogContent function before using it
  const renderDialogContent = () => {
    return (
      <div className={isFullPage ? "container mx-auto max-w-5xl py-6" : ""}>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="general">General Information</TabsTrigger>
              <TabsTrigger value="location">Location & Systems</TabsTrigger>
              <TabsTrigger value="integration">Integration Details</TabsTrigger>
              <TabsTrigger value="delivery">Content & Key Delivery</TabsTrigger>
              <TabsTrigger value="screens">Screen Management</TabsTrigger>
            </TabsList>
            
            {/* General Information Tab */}
            <TabsContent value="general" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Theatre Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    name="displayName"
                    value={formData.displayName || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="alternateNames">Alternate Names</Label>
                <Input
                  id="alternateNames"
                  name="alternateNames"
                  value={formData.alternateNames?.join(", ") || ""}
                  onChange={handleChange}
                  placeholder="Comma-separated names"
                />
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
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chainId">Chain ID</Label>
                  <Input
                    id="chainId"
                    name="chainId"
                    value={formData.chainId || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chainName">Chain Name</Label>
                  <Input
                    id="chainName"
                    name="chainName"
                    value={formData.chainName || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyId">Company ID</Label>
                  <Input
                    id="companyId"
                    name="companyId"
                    value={formData.companyId || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="listing">Listing</Label>
                  <Select
                    value={formData.listing || ""}
                    onValueChange={(value) => handleSelectChange("listing", value)}
                  >
                    <SelectTrigger id="listing">
                      <SelectValue placeholder="Select listing type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Listed">Listed</SelectItem>
                      <SelectItem value="Private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    name="type"
                    value={formData.type || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* Location & Systems Tab */}
            <TabsContent value="location" className="mt-4">
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Location Information</h3>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address || ""}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      type="number"
                      value={formData.latitude || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      name="longitude"
                      type="number"
                      value={formData.longitude || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate || ""}
                      onChange={handleChange}
                    />
                  </div>
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
                
                {formData.status !== "Active" && (
                  <div className="space-y-2">
                    <Label htmlFor="closureDetails">Closure Details</Label>
                    <Textarea
                      id="closureDetails"
                      name="closureDetails"
                      value={formData.closureDetails || ""}
                      onChange={handleChange}
                    />
                  </div>
                )}
                
                <div className="flex items-center space-x-2 pt-4 border-t">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Additional Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="screenCount">Screen Count</Label>
                    <Input
                      id="screenCount"
                      name="screenCount"
                      type="number"
                      value={formData.screenCount || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="locationType">Location Type</Label>
                    <Input
                      id="locationType"
                      name="locationType"
                      value={formData.locationType || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Bike className="h-4 w-4" />
                    <Label htmlFor="bikeParkingAvailable">Bike Parking Available</Label>
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
                        name="bikeParkingCapacity"
                        type="number"
                        value={formData.bikeParkingCapacity || ""}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Car className="h-4 w-4" />
                    <Label htmlFor="carParkingAvailable">Car Parking Available</Label>
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
                        name="carParkingCapacity"
                        type="number"
                        value={formData.carParkingCapacity || ""}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 pt-4 border-t">
                  <Monitor className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">System Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="theatreManagementSystem">Theatre Management System</Label>
                    <Input
                      id="theatreManagementSystem"
                      name="theatreManagementSystem"
                      value={formData.theatreManagementSystem || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ticketingSystem">Ticketing System</Label>
                    <Input
                      id="ticketingSystem"
                      name="ticketingSystem"
                      value={formData.ticketingSystem || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Integration Details Tab */}
            <TabsContent value="integration" className="mt-4">
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Network className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Integration Details</h3>
                </div>
                
                <div className="space-y-4">
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
              </div>
            </TabsContent>
            
            {/* Content & Key Delivery Tab */}
            <TabsContent value="delivery" className="mt-4">
              <div className="space-y-6">
                {/* PART 1: CONTENT DELIVERY */}
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Content Delivery</h3>
                </div>
                
                {/* Delivery Time Slots */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Delivery Time Slots</Label>
                    <Button 
                      type="button" 
                      onClick={handleAddDeliveryTimeSlot} 
                      size="sm" 
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Time Slot
                    </Button>
                  </div>
                  
                  {formData.deliveryTimeSlots && formData.deliveryTimeSlots.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Day</TableHead>
                            <TableHead>Start Time</TableHead>
                            <TableHead>End Time</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.deliveryTimeSlots.map((slot) => (
                            <TableRow key={slot.id}>
                              <TableCell>
                                <Select
                                  value={slot.day}
                                  onValueChange={(value) => handleDeliveryTimeSlotChange(
                                    slot.id, 
                                    "day", 
                                    value
                                  )}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select day" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Monday">Monday</SelectItem>
                                    <SelectItem value="Tuesday">Tuesday</SelectItem>
                                    <SelectItem value="Wednesday">Wednesday</SelectItem>
                                    <SelectItem value="Thursday">Thursday</SelectItem>
                                    <SelectItem value="Friday">Friday</SelectItem>
                                    <SelectItem value="Saturday">Saturday</SelectItem>
                                    <SelectItem value="Sunday">Sunday</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input 
                                  type="time" 
                                  value={slot.startTime} 
                                  onChange={(e) => handleDeliveryTimeSlotChange(slot.id, "startTime", e.target.value)} 
                                />
                              </TableCell>
                              <TableCell>
                                <Input 
                                  type="time" 
                                  value={slot.endTime} 
                                  onChange={(e) => handleDeliveryTimeSlotChange(slot.id, "endTime", e.target.value)} 
                                />
                              </TableCell>
                              <TableCell className="flex items-center space-x-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleCopyToAllDays(slot.id)}
                                  title="Copy to all days"
                                >
                                  <Clock className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteDeliveryTimeSlot(slot.id)}
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
                      <p className="text-muted-foreground mb-4">No delivery time slots have been added yet</p>
                      <Button 
                        type="button" 
                        onClick={handleAddDeliveryTimeSlot} 
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Time Slot
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Delivery Address */}
                <div className="space-y-4">
                  <Label>Delivery Address</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="useTheatreAddress"
                      checked={formData.deliveryAddress?.useTheatreAddress || false}
                      onCheckedChange={(checked) => handleDeliveryAddressChange("useTheatreAddress", checked)}
                    />
                    <Label htmlFor="useTheatreAddress">Use Theatre Address</Label>
                  </div>
                  
                  {!formData.deliveryAddress?.useTheatreAddress && (
                    <div className="space-y-4 mt-2">
                      <div className="space-y-2">
                        <Label htmlFor="deliveryAddress">Address</Label>
                        <Input
                          id="deliveryAddress"
                          value={formData.deliveryAddress?.address || ""}
                          onChange={(e) => handleDeliveryAddressChange("address", e.target.value)}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="deliveryCity">City</Label>
                          <Input
                            id="deliveryCity"
                            value={formData.deliveryAddress?.city || ""}
                            onChange={(e) => handleDeliveryAddressChange("city", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="deliveryState">State</Label>
                          <Input
                            id="deliveryState"
                            value={formData.deliveryAddress?.state || ""}
                            onChange={(e) => handleDeliveryAddressChange("state", e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="deliveryPostalCode">Postal Code</Label>
                          <Input
                            id="deliveryPostalCode"
                            value={formData.deliveryAddress?.postalCode || ""}
                            onChange={(e) => handleDeliveryAddressChange("postalCode", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="deliveryCountry">Country</Label>
                          <Input
                            id="deliveryCountry"
                            value={formData.deliveryAddress?.country || ""}
                            onChange={(e) => handleDeliveryAddressChange("country", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Delivery Instructions */}
                <div className="space-y-2">
                  <Label htmlFor="deliveryInstructions">Delivery Instructions / Notes</Label>
                  <Textarea
                    id="deliveryInstructions"
                    name="deliveryInstructions"
                    value={formData.deliveryInstructions || ""}
                    onChange={handleChange}
                    placeholder="Add any special instructions for delivery"
                  />
                </div>
                
                {/* DCP Physical Delivery Methods */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>DCP Physical Delivery Methods</Label>
                    <Button 
                      type="button" 
                      onClick={handleAddPhysicalDeliveryMethod} 
                      size="sm" 
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Method
                    </Button>
                  </div>
                  
                  {formData.dcpPhysicalDeliveryMethods && formData.dcpPhysicalDeliveryMethods.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Media Type</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.dcpPhysicalDeliveryMethods.map((method) => (
                            <TableRow key={method.id}>
                              <TableCell>
                                <Input 
                                  value={method.mediaType || ""} 
                                  onChange={(e) => handlePhysicalDeliveryMethodChange(method.id, "mediaType", e.target.value)} 
                                  placeholder="e.g. Hard Drive, USB"
                                />
                              </TableCell>
                              <TableCell>
                                <Input 
                                  value={method.details || ""} 
                                  onChange={(e) => handlePhysicalDeliveryMethodChange(method.id, "details", e.target.value)} 
                                  placeholder="Additional details"
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeletePhysicalDeliveryMethod(method.id)}
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
                    <div className="border rounded-md p-4 text-center">
                      <p className="text-muted-foreground mb-4">No physical delivery methods have been added yet</p>
                      <Button 
                        type="button" 
                        onClick={handleAddPhysicalDeliveryMethod} 
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Method
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* DCP Network Delivery Methods */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>DCP Network Delivery Methods</Label>
                    <Button 
                      type="button" 
                      onClick={handleAddNetworkDeliveryMethod} 
                      size="sm" 
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Method
                    </Button>
                  </div>
                  
                  {formData.dcpNetworkDeliveryMethods && formData.dcpNetworkDeliveryMethods.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Network URL</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.dcpNetworkDeliveryMethods.map((method) => (
                            <TableRow key={method.id}>
                              <TableCell>
                                <Input 
                                  value={method.networkURL || ""} 
                                  onChange={(e) => handleNetworkDeliveryMethodChange(method.id, "networkURL", e.target.value)} 
                                  placeholder="Enter network URL"
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteNetworkDeliveryMethod(method.id)}
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
                    <div className="border rounded-md p-4 text-center">
                      <p className="text-muted-foreground mb-4">No network delivery methods have been added yet</p>
                      <Button 
                        type="button" 
                        onClick={handleAddNetworkDeliveryMethod} 
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Method
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* DCP Modem Delivery Methods */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>DCP Modem Delivery Methods</Label>
                    <Button 
                      type="button" 
                      onClick={handleAddModemDeliveryMethod} 
                      size="sm" 
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Method
                    </Button>
                  </div>
                  
                  {formData.dcpModemDeliveryMethods && formData.dcpModemDeliveryMethods.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Modem Phone Number</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.dcpModemDeliveryMethods.map((method) => (
                            <TableRow key={method.id}>
                              <TableCell>
                                <Input 
                                  value={method.modemPhoneNumber || ""} 
                                  onChange={(e) => handleModemDeliveryMethodChange(method.id, "modemPhoneNumber", e.target.value)} 
                                  placeholder="Enter modem phone number"
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteModemDeliveryMethod(method.id)}
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
                    <div className="border rounded-md p-4 text-center">
                      <p className="text-muted-foreground mb-4">No modem delivery methods have been added yet</p>
                      <Button 
                        type="button" 
                        onClick={handleAddModemDeliveryMethod} 
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Method
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* DCP Delivery Contacts */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>DCP Delivery Contacts</Label>
                    <Button 
                      type="button" 
                      onClick={handleAddDCPDeliveryContact} 
                      size="sm" 
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Contact
                    </Button>
                  </div>
                  
                  {formData.dcpDeliveryContacts && formData.dcpDeliveryContacts.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name (Optional)</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.dcpDeliveryContacts.map((contact) => (
                            <TableRow key={contact.id}>
                              <TableCell>
                                <Input 
                                  value={contact.name || ""} 
                                  onChange={(e) => handleDCPDeliveryContactChange(contact.id, "name", e.target.value)} 
                                  placeholder="Contact name"
                                />
                              </TableCell>
                              <TableCell>
                                <Input 
                                  value={contact.email || ""} 
                                  onChange={(e) => handleDCPDeliveryContactChange(contact.id, "email", e.target.value)} 
                                  placeholder="Email address"
                                  type="email"
                                  required
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteDCPDeliveryContact(contact.id)}
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
                    <div className="border rounded-md p-4 text-center">
                      <p className="text-muted-foreground mb-4">No DCP delivery contacts have been added yet</p>
                      <Button 
                        type="button" 
                        onClick={handleAddDCPDeliveryContact} 
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Contact
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Send Emails for DCP Delivery */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sendEmailsForDCPDelivery"
                      checked={formData.sendEmailsForDCPDelivery || false}
                      onCheckedChange={(checked) => handleSwitchChange("sendEmailsForDCPDelivery", checked)}
                    />
                    <Label htmlFor="sendEmailsForDCPDelivery">Send Emails for DCP Delivery</Label>
                  </div>
                </div>
                
                {/* DCP Content Type for Email */}
                {formData.sendEmailsForDCPDelivery && (
                  <div className="space-y-2">
                    <Label>Send Emails for DCP Content Type</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {contentTypeOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`content-type-${option.id}`}
                            checked={(formData.dcpContentTypesForEmail || []).includes(option.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleContentTypeChange(option.id);
                              } else {
                                handleContentTypeChange(option.id);
                              }
                            }}
                          />
                          <Label htmlFor={`content-type-${option.id}`} className="text-sm">
                            {option.label} ({option.id})
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* PART 2: KEY DELIVERY */}
                <div className="flex items-center space-x-2 pt-6 border-t mt-6">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Key Delivery</h3>
                </div>
                
                {/* Key Delivery Contacts */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Key Delivery Contacts</Label>
                    <Button 
                      type="button" 
                      onClick={handleAddKeyDeliveryContact} 
                      size="sm" 
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Contact
                    </Button>
                  </div>
                  
                  {formData.keyDeliveryContacts && formData.keyDeliveryContacts.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name (Optional)</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.keyDeliveryContacts.map((contact) => (
                            <TableRow key={contact.id}>
                              <TableCell>
                                <Input 
                                  value={contact.name || ""} 
                                  onChange={(e) => handleKeyDeliveryContactChange(contact.id, "name", e.target.value)} 
                                  placeholder="Contact name"
                                />
                              </TableCell>
                              <TableCell>
                                <Input 
                                  value={contact.email || ""} 
                                  onChange={(e) => handleKeyDeliveryContactChange(contact.id, "email", e.target.value)} 
                                  placeholder="Email address"
                                  type="email"
                                  required
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteKeyDeliveryContact(contact.id)}
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
                    <div className="border rounded-md p-4 text-center">
                      <p className="text-muted-foreground mb-4">No key delivery contacts have been added yet</p>
                      <Button 
                        type="button" 
                        onClick={handleAddKeyDeliveryContact} 
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Contact
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* KDM Delivery Emails in FLM-X */}
                <div className="space-y-4">
                  <Label>KDM Delivery Emails in FLM-X</Label>
                  <RadioGroup 
                    value={formData.kdmDeliveryEmailsInFLMX || "useDropbox"}
                    onValueChange={(value) => handleSelectChange("kdmDeliveryEmailsInFLMX", value)}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="useDropbox" id="kdm-dropbox" />
                      <Label htmlFor="kdm-dropbox">Use dropbox@qubewire.com</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="useKeyDeliveryContacts" id="kdm-contacts" />
                      <Label htmlFor="kdm-contacts">Use above emails from Key Delivery Contacts</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* PART 3: INGEST SETTINGS */}
                <div className="flex items-center space-x-2 pt-6 border-t mt-6">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Ingest Settings</h3>
                </div>
                
                {/* Auto Ingest of Content */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="autoIngestOfContentEnabled"
                      checked={formData.autoIngestOfContentEnabled || false}
                      onCheckedChange={(checked) => handleSwitchChange("autoIngestOfContentEnabled", checked)}
                    />
                    <Label htmlFor="autoIngestOfContentEnabled">Auto Ingest of Content Enabled</Label>
                  </div>
                </div>
                
                {/* Auto Ingest Content Types */}
                {formData.autoIngestOfContentEnabled && (
                  <div className="space-y-2">
                    <Label>Select Content Type enabled for auto Ingest</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {contentTypeOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`autoingest-content-type-${option.id}`}
                            checked={(formData.autoIngestContentTypes || []).includes(option.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleAutoIngestContentTypeChange(option.id);
                              } else {
                                handleAutoIngestContentTypeChange(option.id);
                              }
                            }}
                          />
                          <Label htmlFor={`autoingest-content-type-${option.id}`} className="text-sm">
                            {option.label} ({option.id})
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* QCN Theatre IP Address Range */}
                <div className="space-y-2">
                  <Label htmlFor="qcnTheatreIPAddressRange">QCN Theatre IP Address Range</Label>
                  <Input
                    id="qcnTheatreIPAddressRange"
                    name="qcnTheatreIPAddressRange"
                    value={formData.qcnTheatreIPAddressRange || ""}
                    onChange={handleChange}
                    placeholder="e.g. 192.168.0.0/24"
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* Screen Management Tab */}
            <TabsContent value="screens" className="mt-4">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium">Screens</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage screens associated with this theatre
                    </p>
                  </div>
                  <Button onClick={handleCreateScreen} type="button">
                    <Plus className="h-4 w-4 mr-2" /> Add Screen
                  </Button>
                </div>
                
                {screens.length > 0 ? (
                  <DataTable
                    data={screens}
                    columns={screenColumns}
                    searchPlaceholder="Search screens..."
                    actions={screenActions}
                  />
                ) : (
                  <div className="border rounded-md p-8 text-center">
                    <p className="text-muted-foreground mb-4">No screens have been added yet</p>
                    <Button onClick={handleCreateScreen} type="button">
                      <Plus className="h-4 w-4 mr-2" /> Add Screen
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Update Theatre" : "Create Theatre"}
            </Button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <>
      {isFullPage ? (
        renderDialogContent()
      ) : (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>{isEditing ? `Edit ${formData.name}` : 'Add New Theatre'}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Update the details of an existing theatre' : 'Enter the details to create a new theatre'}
              </DialogDescription>
            </DialogHeader>
            {renderDialogContent()}
          </DialogContent>
        </Dialog>
      )}
      
      <ScreenDialog
        open={screenDialogOpen}
        onOpenChange={setScreenDialogOpen}
        theatreId={formData.id || ""}
        screen={editingScreen}
        onSave={handleSaveScreen}
      />
    </>
  );
};
