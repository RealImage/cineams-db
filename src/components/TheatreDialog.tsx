import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { ScreenDialog } from "./ScreenDialog";
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
  Wifi
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
      // Content delivery defaults
      deliveryTimeSlots: [],
      deliveryAddress: { useTheatreAddress: true },
      deliveryInstructions: "",
      dcpPhysicalDeliveryMethods: [],
      dcpNetworkDeliveryMethods: [],
      dcpModemDeliveryMethods: [],
      dcpDeliveryContacts: [],
      sendEmailsForDCPDelivery: false,
      dcpContentTypesForEmail: [],
      // Key delivery defaults
      keyDeliveryContacts: [],
      kdmDeliveryEmailsInFLMX: "useDropbox",
      // Ingest settings defaults
      autoIngestOfContentEnabled: false,
      autoIngestContentTypes: [],
      qcnTheatreIPAddressRange: ""
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
  
  // WireTAP Device management
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

  // Delivery Time Slots
  const handleAddDeliveryTimeSlot = () => {
    const newTimeSlot: DeliveryTimeSlot = {
      id: crypto.randomUUID(),
      day: "Monday",
      startTime: "09:00",
      endTime: "17:00"
    };

    setFormData(prev => ({
      ...prev,
      deliveryTimeSlots: [...(prev.deliveryTimeSlots || []), newTimeSlot]
    }));
  };

  const handleDeleteDeliveryTimeSlot = (slotId: string) => {
    setFormData(prev => ({
      ...prev,
      deliveryTimeSlots: (prev.deliveryTimeSlots || []).filter(slot => slot.id !== slotId)
    }));
  };

  const handleDeliveryTimeSlotChange = (slotId: string, field: keyof DeliveryTimeSlot, value: any) => {
    setFormData(prev => ({
      ...prev,
      deliveryTimeSlots: (prev.deliveryTimeSlots || []).map(slot => 
        slot.id === slotId ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const handleCopyToAllDays = (slotId: string) => {
    const sourceSlot = formData.deliveryTimeSlots?.find(slot => slot.id === slotId);
    if (!sourceSlot) return;

    const weekdays: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'> = [
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
    ];

    // Filter out existing slots
    const existingDays = formData.deliveryTimeSlots?.map(slot => slot.day) || [];
    const daysToAdd = weekdays.filter(day => !existingDays.includes(day));

    // Create new slots for missing days
    const newSlots = daysToAdd.map(day => ({
      id: crypto.randomUUID(),
      day,
      startTime: sourceSlot.startTime,
      endTime: sourceSlot.endTime
    }));

    setFormData(prev => ({
      ...prev,
      deliveryTimeSlots: [...(prev.deliveryTimeSlots || []), ...newSlots]
    }));

    toast.success("Time slots copied to all days");
  };

  // Delivery Address
  const handleDeliveryAddressChange = (field: keyof DeliveryAddress, value: any) => {
    setFormData(prev => ({
      ...prev,
      deliveryAddress: {
        ...(prev.deliveryAddress || { useTheatreAddress: true }),
        [field]: value
      }
    }));
  };

  // DCP Physical Delivery Methods
  const handleAddPhysicalDeliveryMethod = () => {
    const newMethod: DCPPhysicalDeliveryMethod = {
      id: crypto.randomUUID(),
      mediaType: "",
      details: ""
    };

    setFormData(prev => ({
      ...prev,
      dcpPhysicalDeliveryMethods: [...(prev.dcpPhysicalDeliveryMethods || []), newMethod]
    }));
  };

  const handleDeletePhysicalDeliveryMethod = (methodId: string) => {
    setFormData(prev => ({
      ...prev,
      dcpPhysicalDeliveryMethods: (prev.dcpPhysicalDeliveryMethods || []).filter(method => method.id !== methodId)
    }));
  };

  const handlePhysicalDeliveryMethodChange = (methodId: string, field: keyof DCPPhysicalDeliveryMethod, value: string) => {
    setFormData(prev => ({
      ...prev,
      dcpPhysicalDeliveryMethods: (prev.dcpPhysicalDeliveryMethods || []).map(method => 
        method.id === methodId ? { ...method, [field]: value } : method
      )
    }));
  };

  // DCP Network Delivery Methods
  const handleAddNetworkDeliveryMethod = () => {
    const newMethod: DCPNetworkDeliveryMethod = {
      id: crypto.randomUUID(),
      networkURL: ""
    };

    setFormData(prev => ({
      ...prev,
      dcpNetworkDeliveryMethods: [...(prev.dcpNetworkDeliveryMethods || []), newMethod]
    }));
  };

  const handleDeleteNetworkDeliveryMethod = (methodId: string) => {
    setFormData(prev => ({
      ...prev,
      dcpNetworkDeliveryMethods: (prev.dcpNetworkDeliveryMethods || []).filter(method => method.id !== methodId)
    }));
  };

  const handleNetworkDeliveryMethodChange = (methodId: string, field: keyof DCPNetworkDeliveryMethod, value: string) => {
    setFormData(prev => ({
      ...prev,
      dcpNetworkDeliveryMethods: (prev.dcpNetworkDeliveryMethods || []).map(method => 
        method.id === methodId ? { ...method, [field]: value } : method
      )
    }));
  };

  // DCP Modem Delivery Methods
  const handleAddModemDeliveryMethod = () => {
    const newMethod: DCPModemDeliveryMethod = {
      id: crypto.randomUUID(),
      modemPhoneNumber: ""
    };

    setFormData(prev => ({
      ...prev,
      dcpModemDeliveryMethods: [...(prev.dcpModemDeliveryMethods || []), newMethod]
    }));
  };

  const handleDeleteModemDeliveryMethod = (methodId: string) => {
    setFormData(prev => ({
      ...prev,
      dcpModemDeliveryMethods: (prev.dcpModemDeliveryMethods || []).filter(method => method.id !== methodId)
    }));
  };

  const handleModemDeliveryMethodChange = (methodId: string, field: keyof DCPModemDeliveryMethod, value: string) => {
    setFormData(prev => ({
      ...prev,
      dcpModemDeliveryMethods: (prev.dcpModemDeliveryMethods || []).map(method => 
        method.id === methodId ? { ...method, [field]: value } : method
      )
    }));
  };

  // DCP Delivery Contacts
  const handleAddDCPDeliveryContact = () => {
    const newContact: Contact = {
      id: crypto.randomUUID(),
      name: "",
      email: ""
    };

    setFormData(prev => ({
      ...prev,
      dcpDeliveryContacts: [...(prev.dcpDeliveryContacts || []), newContact]
    }));
  };

  const handleDeleteDCPDeliveryContact = (contactId: string) => {
    setFormData(prev => ({
      ...prev,
      dcpDeliveryContacts: (prev.dcpDeliveryContacts || []).filter(contact => contact.id !== contactId)
    }));
  };

  const handleDCPDeliveryContactChange = (contactId: string, field: keyof Contact, value: string) => {
    setFormData(prev => ({
      ...prev,
      dcpDeliveryContacts: (prev.dcpDeliveryContacts || []).map(contact => 
        contact.id === contactId ? { ...contact, [field]: value } : contact
      )
    }));
  };

  // DCP Content Types for Email
  const contentTypeOptions = [
    { id: "FTR", label: "Feature" },
    { id: "TLR", label: "Trailer" },
    { id: "ADV", label: "Advertisement" },
    { id: "PSA", label: "Public Service Announcement" },
    { id: "POL", label: "Policy Trailer" },
    { id: "SHR", label: "Short" },
    { id: "TSR", label: "Teaser" },
    { id: "RTG", label: "Rating Tag" },
    { id: "PRE", label: "Pre-show" },
    { id: "INT", label: "Intermission" },
    { id: "PLY", label: "Policy" },
    { id: "EXT", label: "Extras" },
    { id: "SNP", label: "Snippet" },
    { id: "VAR", label: "Various" }
  ];

  const handleContentTypeChange = (contentType: string) => {
    setFormData(prev => {
      const currentTypes = prev.dcpContentTypesForEmail || [];
      const updatedTypes = currentTypes.includes(contentType)
        ? currentTypes.filter(type => type !== contentType)
        : [...currentTypes, contentType];
      
      return {
        ...prev,
        dcpContentTypesForEmail: updatedTypes
      };
    });
  };

  // Key Delivery Contacts
  const handleAddKeyDeliveryContact = () => {
    const newContact: Contact = {
      id: crypto.randomUUID(),
      name: "",
      email: ""
    };

    setFormData(prev => ({
      ...prev,
      keyDeliveryContacts: [...(prev.keyDeliveryContacts || []), newContact]
    }));
  };

  const handleDeleteKeyDeliveryContact = (contactId: string) => {
    setFormData(prev => ({
      ...prev,
      keyDeliveryContacts: (prev.keyDeliveryContacts || []).filter(contact => contact.id !== contactId)
    }));
  };

  const handleKeyDeliveryContactChange = (contactId: string, field: keyof Contact, value: string) => {
    setFormData(prev => ({
      ...prev,
      keyDeliveryContacts: (prev.keyDeliveryContacts || []).map(contact => 
        contact.id === contactId ? { ...contact, [field]: value } : contact
      )
    }));
  };

  // Auto Ingest Content Types
  const handleAutoIngestContentTypeChange = (contentType: string) => {
    setFormData(prev => {
      const currentTypes = prev.autoIngestContentTypes || [];
      const updatedTypes = currentTypes.includes(contentType)
        ? currentTypes.filter(type => type !== contentType)
        : [...currentTypes, contentType];
      
      return {
        ...prev,
        autoIngestContentTypes: updatedTypes
      };
    });
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
            
            {/* General Information Tab */}
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
            
            {/* Location & Systems Tab */}
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
